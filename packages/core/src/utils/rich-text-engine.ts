/**
 * Rich Text Editor Engine (PR-17)
 *
 * Opt-in pluggable engine API for {@link RichTextEditor}. Wraps the
 * lifecycle of the underlying editing surface so userland code can swap
 * in Quill / TipTap / ProseMirror / contenteditable variants without
 * modifying the framework component.
 *
 * The component owns the host element and the toolbar UI. The engine
 * receives the host element via {@link RichTextEngineMountContext} and
 * must return an {@link RichTextEngineInstance} that exposes a small
 * imperative surface (set value / get value / exec action / report
 * active formats / destroy).
 *
 * Active-format tracking is engine-driven: the engine calls
 * `ctx.notifyActiveFormats(set)` whenever the selection changes; the
 * component re-renders the toolbar pressed state from the latest set.
 *
 * The default engine ({@link createBuiltinRichTextEngine}) wraps the
 * existing `contenteditable` + `document.execCommand` implementation so
 * that the engine path is exercised symmetrically and removing the prop
 * keeps current behaviour 1:1.
 */
import {
  defaultToolbar,
  mapToolbarAction,
  sanitizeHtml,
  isValidUrl
} from './rich-text-editor-utils'
import type { ToolbarButton } from '../types/rich-text-editor'

export interface RichTextEngineMountContext {
  /** Host element the engine should mount into. */
  element: HTMLElement
  /** Initial HTML content (already sanitised by the component). */
  initialValue: string
  /** Whether the editor is read-only at mount time. */
  readOnly: boolean
  /** Whether the editor is disabled at mount time. */
  disabled: boolean
  /** Placeholder text the engine may render natively (optional). */
  placeholder?: string
  /** Toolbar definition the component will display. */
  toolbar: ToolbarButton[]
  /** Called by the engine whenever content changes. */
  notifyChange(html: string): void
  /** Called by the engine when active inline formats may have changed. */
  notifyActiveFormats(active: Set<string>): void
}

export interface RichTextEngineInstance {
  /** Replace editor content (already sanitised). */
  setValue(html: string): void
  /** Read current sanitised HTML. */
  getValue(): string
  /** Execute a toolbar action by name. */
  exec(action: string): void
  /** Trigger an active-format query (selection change handler hook). */
  refreshActiveFormats(): void
  /** Update read-only state without remount. */
  setReadOnly(readOnly: boolean, disabled: boolean): void
  /** Tear down listeners and detach DOM artefacts. */
  destroy(): void
}

export interface RichTextEngine {
  /** Optional identifier used by tests / devtools. */
  name?: string
  create(ctx: RichTextEngineMountContext): RichTextEngineInstance
}

/**
 * Default engine — preserves the legacy `contenteditable` +
 * `document.execCommand` behaviour. Extracted so the framework
 * components can share one implementation and so tests can verify the
 * engine contract without a real DOM editor library.
 */
export function createBuiltinRichTextEngine(): RichTextEngine {
  return {
    name: 'builtin',
    create(ctx) {
      const { element } = ctx
      let readOnly = ctx.readOnly
      let disabled = ctx.disabled
      element.contentEditable = String(!(readOnly || disabled))

      const initial = sanitizeHtml(ctx.initialValue)
      if (initial) element.innerHTML = initial

      const handleInput = () => {
        const html = element.innerHTML
        const sanitized = sanitizeHtml(html)
        ctx.notifyChange(sanitized)
      }

      const refreshActiveFormats = () => {
        if (typeof document === 'undefined') return
        const next = new Set<string>()
        if (typeof document.queryCommandState !== 'function') {
          ctx.notifyActiveFormats(next)
          return
        }
        if (document.queryCommandState('bold')) next.add('bold')
        if (document.queryCommandState('italic')) next.add('italic')
        if (document.queryCommandState('underline')) next.add('underline')
        if (document.queryCommandState('strikeThrough')) next.add('strikethrough')
        if (document.queryCommandState('insertUnorderedList')) next.add('bulletList')
        if (document.queryCommandState('insertOrderedList')) next.add('orderedList')
        ctx.notifyActiveFormats(next)
      }

      element.addEventListener('input', handleInput)

      let selectionHandler: (() => void) | null = null
      if (typeof document !== 'undefined') {
        selectionHandler = refreshActiveFormats
        document.addEventListener('selectionchange', selectionHandler)
      }

      const exec = (actionName: string) => {
        if (readOnly || disabled) return
        element.focus()

        const mapping = mapToolbarAction(actionName)
        if (mapping) {
          document.execCommand(mapping.command, false, mapping.argument)
          handleInput()
          refreshActiveFormats()
          return
        }

        if (actionName === 'codeBlock') {
          document.execCommand('formatBlock', false, 'PRE')
          handleInput()
          return
        }
        if (actionName === 'link') {
          const url = typeof window !== 'undefined' ? window.prompt('Enter URL:') : null
          if (url && isValidUrl(url)) {
            document.execCommand('createLink', false, url)
            handleInput()
          }
          return
        }
        if (actionName === 'image') {
          const url = typeof window !== 'undefined' ? window.prompt('Enter image URL:') : null
          if (url && isValidUrl(url)) {
            document.execCommand('insertImage', false, url)
            handleInput()
          }
        }
      }

      return {
        setValue(html) {
          const sanitized = sanitizeHtml(html)
          if (element.innerHTML !== sanitized) element.innerHTML = sanitized
        },
        getValue() {
          return sanitizeHtml(element.innerHTML)
        },
        exec,
        refreshActiveFormats,
        setReadOnly(nextReadOnly, nextDisabled) {
          readOnly = nextReadOnly
          disabled = nextDisabled
          element.contentEditable = String(!(readOnly || disabled))
        },
        destroy() {
          element.removeEventListener('input', handleInput)
          if (selectionHandler && typeof document !== 'undefined') {
            document.removeEventListener('selectionchange', selectionHandler)
          }
        }
      }
    }
  }
}

/** Singleton instance used as the default factory. */
export const builtinRichTextEngine: RichTextEngine = createBuiltinRichTextEngine()

/** Re-exported for convenience so engine authors can default the toolbar. */
export { defaultToolbar }
