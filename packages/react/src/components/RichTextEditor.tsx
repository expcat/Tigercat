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
  mapToolbarAction,
  isInlineFormat,
  findHotkeyMatch,
  sanitizeHtml,
  isContentEmpty,
  parseHeight,
  isValidUrl,
  type RichTextEditorMode,
  type ToolbarButton
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
  ...restProps
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [currentContent, setInternalValue, isControlled] = useControlledState(value, defaultValue)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const toolbarButtons = toolbar ?? defaultToolbar
  const empty = isContentEmpty(currentContent)

  // Sync controlled value to editor
  useEffect(() => {
    if (isControlled && editorRef.current) {
      const sanitized = sanitizeHtml(value!)
      if (editorRef.current.innerHTML !== sanitized) {
        editorRef.current.innerHTML = sanitized
      }
    }
  }, [value, isControlled])

  // Initialize editor content on mount
  useEffect(() => {
    if (editorRef.current) {
      const initial = sanitizeHtml(isControlled ? value! : defaultValue)
      if (initial) {
        editorRef.current.innerHTML = initial
      }
    }
  }, [])

  // Active format detection
  const updateActiveFormats = useCallback(() => {
    if (typeof document === 'undefined') return
    const next = new Set<string>()
    if (document.queryCommandState('bold')) next.add('bold')
    if (document.queryCommandState('italic')) next.add('italic')
    if (document.queryCommandState('underline')) next.add('underline')
    if (document.queryCommandState('strikeThrough')) next.add('strikethrough')
    if (document.queryCommandState('insertUnorderedList')) next.add('bulletList')
    if (document.queryCommandState('insertOrderedList')) next.add('orderedList')
    setActiveFormats(next)
  }, [])

  // Listen for selection changes
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.addEventListener('selectionchange', updateActiveFormats)
    return () => {
      document.removeEventListener('selectionchange', updateActiveFormats)
    }
  }, [updateActiveFormats])

  // Input handler
  const handleInput = useCallback(() => {
    if (!editorRef.current) return
    const html = editorRef.current.innerHTML
    const sanitized = sanitizeHtml(html)
    if (!isControlled) {
      setInternalValue(sanitized)
    }
    onChange?.(sanitized)
  }, [isControlled, onChange])

  // Toolbar action
  const execAction = useCallback(
    (actionName: string) => {
      if (readOnly || disabled) return
      editorRef.current?.focus()

      const mapping = mapToolbarAction(actionName)
      if (mapping) {
        document.execCommand(mapping.command, false, mapping.argument)
        handleInput()
        updateActiveFormats()
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
    },
    [readOnly, disabled, handleInput, updateActiveFormats]
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
          contentEditable={!(readOnly || disabled)}
          role="textbox"
          aria-multiline={true}
          aria-readonly={readOnly || undefined}
          aria-disabled={disabled || undefined}
          aria-placeholder={placeholder}
          data-placeholder={placeholder}
          onInput={handleInput}
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
