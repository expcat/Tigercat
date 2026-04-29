import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useControlledState } from '../hooks/useControlledState'
import {
  classNames,
  getRichTextContainerClasses,
  getToolbarButtonClasses,
  getEditorAreaClasses,
  richTextToolbarClasses,
  richTextPlaceholderClasses,
  defaultToolbar,
  isInlineFormat,
  findHotkeyMatch,
  isContentEmpty,
  parseHeight,
  builtinRichTextEngine,
  type RichTextEditorMode,
  type ToolbarButton,
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
  /** Toolbar buttons configuration */
  toolbar?: ToolbarButton[]
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
  mode: _mode = 'html',
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
  const [currentContent, setInternalValue, isControlled] = useControlledState(value, defaultValue)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const toolbarButtons = toolbar ?? defaultToolbar
  const empty = isContentEmpty(currentContent)

  // Stable refs to keep engine callbacks fresh without recreating the
  // engine each render.
  const onChangeRef = useRef(onChange)
  const setInternalValueRef = useRef(setInternalValue)
  const isControlledRef = useRef(isControlled)
  useEffect(() => {
    onChangeRef.current = onChange
    setInternalValueRef.current = setInternalValue
    isControlledRef.current = isControlled
  }, [onChange, setInternalValue, isControlled])

  // Mount engine once (per engine identity) on the host element.
  useEffect(() => {
    if (!editorRef.current) return
    const factory = engine ?? builtinRichTextEngine
    const instance = factory.create({
      element: editorRef.current,
      initialValue: isControlled ? value! : defaultValue,
      readOnly,
      disabled,
      placeholder,
      toolbar: toolbarButtons,
      notifyChange(html) {
        if (!isControlledRef.current) setInternalValueRef.current(html)
        onChangeRef.current?.(html)
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

  // Toolbar action
  const execAction = useCallback(
    (actionName: string) => {
      if (readOnly || disabled) return
      engineRef.current?.exec(actionName)
    },
    [readOnly, disabled]
  )

  // Keyboard handler
  const handleKeydown = useCallback(
    (e: React.KeyboardEvent) => {
      const match = findHotkeyMatch(toolbarButtons, e.nativeEvent)
      if (match) {
        e.preventDefault()
        execAction(match)
      }
    },
    [toolbarButtons, execAction]
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
        {toolbarButtons.map((btn) => (
          <button
            key={btn.name}
            type="button"
            className={getToolbarButtonClasses(activeFormats.has(btn.name))}
            title={btn.tooltip ?? btn.label}
            aria-label={btn.label}
            aria-pressed={isInlineFormat(btn.name) ? activeFormats.has(btn.name) : undefined}
            disabled={disabled || readOnly}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execAction(btn.name)}>
            {btn.label}
          </button>
        ))}
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
