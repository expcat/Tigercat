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
  parseMarkdownHeight,
  renderMarkdownToHtml,
  mergeTigerLocale,
  getMarkdownEditorLabels,
  type MarkdownEditorMode,
  type MarkdownEditorProps as CoreMarkdownEditorProps,
  type MarkdownInsertResult,
  type MarkdownToolbarButton,
  type MarkdownToolbarItem,
  type TigerLocale,
  type TigerLocaleMarkdownEditor
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

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
  /** Locale overrides merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
  /** Text/aria label overrides */
  labels?: Partial<TigerLocaleMarkdownEditor>
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
  locale,
  labels: labelsOverride,
  onChange,
  onModeChange,
  className,
  style,
  ...restProps
}) => {
  const config = useTigerConfig()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [currentValue, commitValue] = useControlledState(value, defaultValue, onChange)
  const [currentMode, commitMode] = useControlledState(mode, defaultMode, onModeChange)
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
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getMarkdownEditorLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const modeLabels: Record<MarkdownEditorMode, string> = {
    edit: labels.editModeLabel,
    split: labels.splitModeLabel,
    preview: labels.previewModeLabel
  }

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
      aria-label={labels.previewAriaLabel}
      {...(currentValue ? { dangerouslySetInnerHTML: { __html: previewHtml } } : {})}>
      {currentValue ? null : placeholder}
    </div>
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
              aria-label={labels.formattingToolbarAriaLabel}>
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
              aria-label={labels.modeToolbarAriaLabel}>
              {modes.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={getMarkdownToolbarButtonClasses(currentMode === item)}
                  aria-label={modeLabels[item]}
                  aria-pressed={currentMode === item}
                  disabled={disabled}
                  onClick={() => commitMode(item)}>
                  {modeLabels[item]}
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
            aria-label={labels.editorAriaLabel}
            aria-multiline={true}
          />
        )}
        {showPreview && previewNode}
      </div>
    </div>
  )
}

export default MarkdownEditor
