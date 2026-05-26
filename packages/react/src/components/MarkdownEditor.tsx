import React, { useCallback, useMemo, useRef } from 'react'
import { useControlledState } from '../hooks/useControlledState'
import {
  applyMarkdownToolbarAction,
  classNames,
  defaultMarkdownToolbar,
  findMarkdownHotkeyMatch,
  getMarkdownBodyClasses,
  getMarkdownContainerClasses,
  getMarkdownToolbarButtonClasses,
  isMarkdownToolbarSeparator,
  markdownEditorEmptyPreviewClasses,
  markdownEditorPreviewClasses,
  markdownEditorSplitDividerClasses,
  markdownEditorTextareaClasses,
  markdownEditorToolbarClasses,
  markdownEditorToolbarGroupClasses,
  markdownEditorToolbarSeparatorClasses,
  markdownModeLabels,
  parseMarkdownHeight,
  renderMarkdownToHtml,
  type MarkdownEditorMode,
  type MarkdownEditorProps as CoreMarkdownEditorProps,
  type MarkdownInsertResult,
  type MarkdownToolbarButton,
  type MarkdownToolbarItem
} from '@expcat/tigercat-core'

const modes: MarkdownEditorMode[] = ['edit', 'split', 'preview']

function scheduleSelectionRestore(textarea: HTMLTextAreaElement, result: MarkdownInsertResult) {
  const schedule =
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (callback: FrameRequestCallback) => window.setTimeout(callback, 0)
  schedule(() => {
    textarea.selectionStart = result.selectionStart
    textarea.selectionEnd = result.selectionEnd
    textarea.focus()
  })
}

export interface MarkdownEditorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  value?: string
  defaultValue?: string
  placeholder?: string
  mode?: MarkdownEditorMode
  defaultMode?: MarkdownEditorMode
  toolbar?: MarkdownToolbarItem[] | false
  showModeSwitch?: boolean
  height?: number | string
  readOnly?: boolean
  disabled?: boolean
  renderer?: CoreMarkdownEditorProps['renderer']
  onChange?: (markdown: string) => void
  onModeChange?: (mode: MarkdownEditorMode) => void
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  defaultValue = '',
  placeholder,
  mode,
  defaultMode = 'split',
  toolbar,
  showModeSwitch = true,
  height = 360,
  readOnly = false,
  disabled = false,
  renderer,
  onChange,
  onModeChange,
  className,
  style,
  ...restProps
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [currentValue, setInternalValue, isValueControlled] = useControlledState(
    value,
    defaultValue
  )
  const [currentMode, setInternalMode, isModeControlled] = useControlledState(mode, defaultMode)
  const toolbarItems = useMemo(
    () => (toolbar === false ? [] : (toolbar ?? defaultMarkdownToolbar)),
    [toolbar]
  )

  const previewHtml = useMemo(
    () => renderMarkdownToHtml(currentValue, renderer),
    [currentValue, renderer]
  )

  const containerStyle = useMemo<React.CSSProperties>(() => {
    const parsedHeight = parseMarkdownHeight(height)
    return { ...(parsedHeight ? { height: parsedHeight } : {}), ...style }
  }, [height, style])

  const commitValue = useCallback(
    (nextValue: string) => {
      if (!isValueControlled) setInternalValue(nextValue)
      onChange?.(nextValue)
    },
    [isValueControlled, onChange, setInternalValue]
  )

  const commitMode = useCallback(
    (nextMode: MarkdownEditorMode) => {
      if (!isModeControlled) setInternalMode(nextMode)
      onModeChange?.(nextMode)
    },
    [isModeControlled, onModeChange, setInternalMode]
  )

  const applyToolbarButton = useCallback(
    (button: MarkdownToolbarButton) => {
      if (readOnly || disabled) return
      const textarea = textareaRef.current
      const selection = {
        value: currentValue,
        selectionStart: textarea?.selectionStart ?? currentValue.length,
        selectionEnd: textarea?.selectionEnd ?? currentValue.length
      }
      const result = applyMarkdownToolbarAction(button, selection)
      commitValue(result.value)
      if (textarea) scheduleSelectionRestore(textarea, result)
    },
    [commitValue, currentValue, disabled, readOnly]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Tab') {
        event.preventDefault()
        const textarea = event.currentTarget
        const before = textarea.value.slice(0, textarea.selectionStart)
        const after = textarea.value.slice(textarea.selectionEnd)
        const result = {
          value: `${before}  ${after}`,
          selectionStart: textarea.selectionStart + 2,
          selectionEnd: textarea.selectionStart + 2
        }
        commitValue(result.value)
        scheduleSelectionRestore(textarea, result)
        return
      }

      const match = findMarkdownHotkeyMatch(toolbarItems, event.nativeEvent)
      if (match) {
        event.preventDefault()
        applyToolbarButton(match)
      }
    },
    [applyToolbarButton, commitValue, toolbarItems]
  )

  const showFormattingToolbar = toolbar !== false
  const showTopbar = showFormattingToolbar || showModeSwitch
  const showEditor = currentMode === 'edit' || currentMode === 'split'
  const showPreview = currentMode === 'preview' || currentMode === 'split'

  const previewNode = (
    <div
      className={classNames(
        markdownEditorPreviewClasses,
        currentMode === 'split' ? markdownEditorSplitDividerClasses : undefined,
        !currentValue ? markdownEditorEmptyPreviewClasses : undefined
      )}
      role="region"
      aria-label="Markdown preview"
      dangerouslySetInnerHTML={{ __html: currentValue ? previewHtml : placeholder || '' }}
    />
  )

  return (
    <div
      className={getMarkdownContainerClasses(disabled, className)}
      style={containerStyle}
      data-mode={currentMode}
      {...restProps}>
      {showTopbar && (
        <div className={markdownEditorToolbarClasses}>
          {showFormattingToolbar ? (
            <div
              className={markdownEditorToolbarGroupClasses}
              role="toolbar"
              aria-label="Markdown formatting">
              {toolbarItems.map((item, index) => {
                if (isMarkdownToolbarSeparator(item)) {
                  return (
                    <div
                      key={`separator-${index}`}
                      className={markdownEditorToolbarSeparatorClasses}
                      role="separator"
                      aria-orientation="vertical"
                    />
                  )
                }
                return (
                  <button
                    key={item.name}
                    type="button"
                    className={getMarkdownToolbarButtonClasses(false)}
                    title={item.tooltip ?? item.label}
                    aria-label={item.tooltip ?? item.label}
                    disabled={disabled || readOnly}
                    onClick={() => applyToolbarButton(item)}>
                    {item.icon ? (
                      <span dangerouslySetInnerHTML={{ __html: item.icon }} />
                    ) : (
                      item.label
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <span />
          )}

          {showModeSwitch && (
            <div
              className={markdownEditorToolbarGroupClasses}
              role="toolbar"
              aria-label="Markdown view mode">
              {modes.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={getMarkdownToolbarButtonClasses(currentMode === item)}
                  aria-label={markdownModeLabels[item]}
                  aria-pressed={currentMode === item}
                  disabled={disabled}
                  onClick={() => commitMode(item)}>
                  {markdownModeLabels[item]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={getMarkdownBodyClasses(currentMode)}>
        {showEditor && (
          <textarea
            ref={textareaRef}
            className={markdownEditorTextareaClasses}
            value={currentValue}
            onChange={(event) => commitValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            readOnly={readOnly || disabled}
            disabled={disabled}
            spellCheck={true}
            aria-label="Markdown editor"
            aria-multiline={true}
          />
        )}
        {showPreview && previewNode}
      </div>
    </div>
  )
}

export default MarkdownEditor
