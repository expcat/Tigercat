import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useControlledState } from '../hooks/useControlledState'
import {
  classNames,
  getRichTextContainerClasses,
  getToolbarButtonClasses,
  getEditorAreaClasses,
  richTextToolbarClasses,
  richTextToolbarSeparatorClasses,
  richTextPlaceholderClasses,
  defaultToolbar,
  isInlineFormat,
  findHotkeyMatch,
  isContentEmpty,
  parseHeight,
  builtinRichTextEngine,
  isToolbarSeparator,
  type RichTextEditorMode,
  type ToolbarButton,
  type ToolbarItem,
  type RichTextEngine,
  type RichTextEngineInstance
} from '@expcat/tigercat-core'

export interface RichTextEditorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** Current HTML content (controlled) */
  value?: string
  /** Default content (uncontrolled) */
  defaultValue?: string
  /** Placeholder text */
  placeholder?: string
  /** Editing mode */
  mode?: RichTextEditorMode
  /** Toolbar items configuration (buttons and separators) */
  toolbar?: ToolbarItem[]
  /** Editor height */
  height?: number | string
  /** Read-only mode */
  readOnly?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Content change callback */
  onChange?: (html: string) => void
  /**
   * Optional pluggable editor engine (PR-17). Defaults to the
   * built-in `contenteditable` + `document.execCommand` engine. Pass a
   * custom engine to swap in Quill / TipTap / ProseMirror without
   * touching this component.
   */
  engine?: RichTextEngine
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  defaultValue = '',
  placeholder,
  mode = 'html',
  toolbar,
  height = 300,
  readOnly = false,
  disabled = false,
  onChange,
  className,
  engine,
  ...restProps
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<RichTextEngineInstance | null>(null)
  const [currentContent, setContent] = useControlledState(value, defaultValue, onChange)
  const isControlled = value !== undefined
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const toolbarItems = toolbar ?? defaultToolbar
  const empty = isContentEmpty(currentContent)

  // Mount engine once (per engine identity) on the host element.
  useEffect(() => {
    if (!editorRef.current) return
    const factory = engine ?? builtinRichTextEngine
    const instance = factory.create({
      element: editorRef.current,
      initialValue: isControlled ? value! : defaultValue,
      mode,
      readOnly,
      disabled,
      placeholder,
      toolbar: toolbarItems,
      notifyChange(html) {
        setContent(html)
      },
      notifyActiveFormats(next) {
        setActiveFormats(next)
      }
    })
    engineRef.current = instance
    return () => {
      instance.destroy()
      engineRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine])

  // Sync controlled value to engine
  useEffect(() => {
    if (isControlled && engineRef.current && value !== undefined) {
      engineRef.current.setValue(value)
    }
  }, [value, isControlled])

  // Sync readOnly/disabled changes
  useEffect(() => {
    engineRef.current?.setReadOnly(readOnly, disabled)
  }, [readOnly, disabled])

  // Toolbar action for a specific button (supports custom action)
  const execButtonAction = useCallback(
    (btn: ToolbarButton) => {
      if (readOnly || disabled) return
      if (btn.action && editorRef.current) {
        btn.action(editorRef.current)
        return
      }
      engineRef.current?.exec(btn.name)
    },
    [readOnly, disabled]
  )

  // Keyboard handler
  const handleKeydown = useCallback(
    (e: React.KeyboardEvent) => {
      const match = findHotkeyMatch(toolbarItems, e.nativeEvent)
      if (match) {
        e.preventDefault()
        execButtonAction(match)
      }
    },
    [toolbarItems, execButtonAction]
  )

  const containerClasses = useMemo(
    () => classNames(getRichTextContainerClasses(disabled, className)),
    [disabled, className]
  )

  const editorAreaClasses = useMemo(() => getEditorAreaClasses(readOnly), [readOnly])

  const containerStyle: React.CSSProperties | undefined = useMemo(() => {
    const ht = parseHeight(height)
    if (!ht) return undefined
    return { height: ht }
  }, [height])

  return (
    <div className={containerClasses} style={containerStyle} {...restProps}>
      {/* Toolbar */}
      <div className={richTextToolbarClasses} role="toolbar" aria-label="Text formatting">
        {toolbarItems.map((item, idx) => {
          if (isToolbarSeparator(item)) {
            return (
              <div
                key={`sep-${idx}`}
                className={richTextToolbarSeparatorClasses}
                role="separator"
                aria-orientation="vertical"
              />
            )
          }
          const btn = item
          return (
            <button
              key={btn.name}
              type="button"
              className={getToolbarButtonClasses(activeFormats.has(btn.name))}
              title={btn.tooltip ?? btn.label}
              aria-label={btn.label}
              aria-pressed={isInlineFormat(btn.name) ? activeFormats.has(btn.name) : undefined}
              disabled={disabled || readOnly}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execButtonAction(btn)}>
              {btn.icon ? <span dangerouslySetInnerHTML={{ __html: btn.icon }} /> : btn.label}
            </button>
          )
        })}
      </div>

      {/* Editor wrapper */}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={editorRef}
          className={editorAreaClasses}
          role="textbox"
          aria-multiline={true}
          aria-readonly={readOnly || undefined}
          aria-disabled={disabled || undefined}
          aria-placeholder={placeholder}
          data-placeholder={placeholder}
          onKeyDown={handleKeydown}
          suppressContentEditableWarning
        />
        {empty && placeholder && (
          <div
            className={`${richTextPlaceholderClasses} absolute top-0 left-0 p-4 pointer-events-none text-sm`}
            aria-hidden={true}>
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
}

export default RichTextEditor
