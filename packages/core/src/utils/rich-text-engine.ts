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
  isValidUrl,
  getToolbarButtons,
  richTextModeToHtml,
  richTextHtmlToMode,
  sanitizeHtml
} from './rich-text-editor-utils'
import { isBrowser } from './env'
import type { RichTextEditorMode, ToolbarItem } from '../types/rich-text-editor'

function canUseExecCommand(): boolean {
  return isBrowser() && typeof document.execCommand === 'function'
}

function insertSanitizedHtml(html: string): boolean {
  if (!canUseExecCommand()) return false
  return document.execCommand('insertHTML', false, sanitizeHtml(html))
}

function clipboardHtml(event: ClipboardEvent | DragEvent): string {
  const data = 'clipboardData' in event ? event.clipboardData : event.dataTransfer
  if (!data) return ''
  const html = data.getData('text/html')
  if (html) return html
  const text = data.getData('text/plain')
  return text
    ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
    : ''
}

export interface RichTextEngineMountContext {
  /** Host element the engine should mount into. */
  element: HTMLElement
  /** Initial HTML content (already sanitised by the component). */
  initialValue: string
  /** Public value mode used by this editor instance. */
  mode?: RichTextEditorMode
  /** Whether the editor is read-only at mount time. */
  readOnly: boolean
  /** Whether the editor is disabled at mount time. */
  disabled: boolean
  /** Placeholder text the engine may render natively (optional). */
  placeholder?: string
  /** Toolbar definition the component will display. */
  toolbar: ToolbarItem[]
  /** Called by the engine whenever content changes. */
  notifyChange(html: string): void
  /** Called by the engine when active inline formats may have changed. */
  notifyActiveFormats(active: Set<string>): void
  /**
   * Optional URL prompt for link / image actions. Built-in engine never
   * calls `window.prompt`. Return `null` to cancel.
   */
  requestUrl?(kind: 'link' | 'image'): string | null
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
  /** Switch public value mode without remounting. */
  setMode(mode: RichTextEditorMode): void
  /** Replace the toolbar table used by `exec` (custom actions). */
  setToolbar(toolbar: ToolbarItem[]): void
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
function execFormatBlock(tag: string): boolean {
  if (!canUseExecCommand()) return false
  const names = [`<${tag}>`, tag, tag.toUpperCase()]
  for (const argument of names) {
    if (document.execCommand('formatBlock', false, argument)) return true
  }
  return false
}

function blockFormatsFromSelection(host: HTMLElement): Set<string> {
  const next = new Set<string>()
  if (!isBrowser()) return next
  const selection = document.getSelection()
  const anchor = selection?.anchorNode
  if (!anchor || !host.contains(anchor)) return next
  let node: Node | null = anchor
  while (node && node !== host) {
    if (node instanceof HTMLElement) {
      const tag = node.tagName.toLowerCase()
      if (tag === 'h1') next.add('heading1')
      else if (tag === 'h2') next.add('heading2')
      else if (tag === 'h3') next.add('heading3')
      else if (tag === 'blockquote') next.add('blockquote')
      else if (tag === 'pre') next.add('codeBlock')
    }
    node = node.parentNode
  }
  return next
}

export function createBuiltinRichTextEngine(): RichTextEngine {
  return {
    name: 'builtin',
    create(ctx) {
      const { element } = ctx
      let mode = ctx.mode ?? 'html'
      let toolbar = ctx.toolbar
      let readOnly = ctx.readOnly
      let disabled = ctx.disabled
      element.contentEditable = String(!(readOnly || disabled))

      const initial = richTextModeToHtml(ctx.initialValue, mode)
      if (initial) element.innerHTML = initial

      const handleInput = () => {
        ctx.notifyChange(richTextHtmlToMode(sanitizeHtml(element.innerHTML), mode))
      }

      const refreshActiveFormats = () => {
        if (!isBrowser()) return
        const next = blockFormatsFromSelection(element)
        if (typeof document.queryCommandState === 'function') {
          if (document.queryCommandState('bold')) next.add('bold')
          if (document.queryCommandState('italic')) next.add('italic')
          if (document.queryCommandState('underline')) next.add('underline')
          if (document.queryCommandState('strikeThrough')) next.add('strikethrough')
          if (document.queryCommandState('insertUnorderedList')) next.add('bulletList')
          if (document.queryCommandState('insertOrderedList')) next.add('orderedList')
        }
        ctx.notifyActiveFormats(next)
      }

      const handlePaste = (event: Event) => {
        if (readOnly || disabled) return
        const pasteEvent = event as ClipboardEvent
        const html = clipboardHtml(pasteEvent)
        if (!html) return
        pasteEvent.preventDefault()
        insertSanitizedHtml(html)
        handleInput()
        refreshActiveFormats()
      }

      const handleDrop = (event: Event) => {
        if (readOnly || disabled) return
        const dragEvent = event as DragEvent
        const html = clipboardHtml(dragEvent)
        if (!html) return
        dragEvent.preventDefault()
        insertSanitizedHtml(html)
        handleInput()
        refreshActiveFormats()
      }

      const handleBeforeInput = (event: Event) => {
        if (readOnly || disabled) return
        const inputEvent = event as InputEvent
        if (
          inputEvent.inputType !== 'insertFromPaste' &&
          inputEvent.inputType !== 'insertFromDrop' &&
          inputEvent.inputType !== 'insertHTML'
        ) {
          return
        }
        const data =
          inputEvent.dataTransfer?.getData('text/html') ||
          inputEvent.dataTransfer?.getData('text/plain') ||
          inputEvent.data ||
          ''
        if (!data) return
        inputEvent.preventDefault()
        insertSanitizedHtml(data)
        handleInput()
        refreshActiveFormats()
      }

      element.addEventListener('input', handleInput)
      element.addEventListener('paste', handlePaste)
      element.addEventListener('drop', handleDrop)
      element.addEventListener('beforeinput', handleBeforeInput)

      let selectionHandler: (() => void) | null = null
      if (isBrowser()) {
        selectionHandler = () => {
          const selection = document.getSelection()
          if (!selection?.anchorNode || !element.contains(selection.anchorNode)) return
          refreshActiveFormats()
        }
        document.addEventListener('selectionchange', selectionHandler)
      }

      const exec = (actionName: string) => {
        if (readOnly || disabled) return
        if (typeof element.focus === 'function') element.focus()

        const buttons = getToolbarButtons(toolbar)
        const btn = buttons.find((b) => b.name === actionName)
        if (btn?.action) {
          btn.action(element)
          handleInput()
          refreshActiveFormats()
          return
        }

        const mapping = mapToolbarAction(actionName)
        if (mapping) {
          if (!canUseExecCommand()) return
          if (mapping.command === 'formatBlock' && mapping.argument) {
            execFormatBlock(mapping.argument.replace(/[<>]/g, '').toLowerCase())
          } else {
            document.execCommand(mapping.command, false, mapping.argument)
          }
          handleInput()
          refreshActiveFormats()
          return
        }

        if (actionName === 'codeBlock') {
          execFormatBlock('pre')
          handleInput()
          refreshActiveFormats()
          return
        }
        if (actionName === 'link') {
          if (!canUseExecCommand()) return
          const url = ctx.requestUrl?.('link') ?? null
          if (url && isValidUrl(url)) {
            document.execCommand('createLink', false, url)
            handleInput()
          }
          return
        }
        if (actionName === 'image') {
          if (!canUseExecCommand()) return
          const url = ctx.requestUrl?.('image') ?? null
          if (url && isValidUrl(url)) {
            document.execCommand('insertImage', false, url)
            handleInput()
          }
        }
      }

      return {
        setValue(html) {
          const sanitized = richTextModeToHtml(html, mode)
          if (element.innerHTML !== sanitized) element.innerHTML = sanitized
        },
        getValue() {
          return richTextHtmlToMode(element.innerHTML, mode)
        },
        exec,
        refreshActiveFormats,
        setReadOnly(nextReadOnly, nextDisabled) {
          readOnly = nextReadOnly
          disabled = nextDisabled
          element.contentEditable = String(!(readOnly || disabled))
        },
        setMode(nextMode) {
          if (mode === nextMode) return
          const html = element.innerHTML
          mode = nextMode
          ctx.notifyChange(richTextHtmlToMode(html, mode))
        },
        setToolbar(nextToolbar) {
          toolbar = nextToolbar
        },
        destroy() {
          element.removeEventListener('input', handleInput)
          element.removeEventListener('paste', handlePaste)
          element.removeEventListener('drop', handleDrop)
          element.removeEventListener('beforeinput', handleBeforeInput)
          if (selectionHandler && isBrowser()) {
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
