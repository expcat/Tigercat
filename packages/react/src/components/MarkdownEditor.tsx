import React, { useCallback, useLayoutEffect, useMemo, useRef, useState, forwardRef } from 'react'
import { useControlledState } from '../hooks/useControlledState'
import {
  applyMarkdownToolbarAction,
  classNames,
  createDefaultMarkdownToolbar,
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
  handleTabKey,
  resolveEditorTabAction,
  nextToolbarRovingIndex,
  getMarkdownToolbarButtons,
  type MarkdownEditorMode,
  type MarkdownEditorProps as CoreMarkdownEditorProps,
  type MarkdownToolbarButton,
  type MarkdownToolbarItem,
  type TigerLocale,
  type TigerLocaleMarkdownEditor
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { useFormItemControlContext } from './FormItemContext'

const modes: MarkdownEditorMode[] = ['edit', 'split', 'preview']

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
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleMarkdownEditor>
  tabSize?: number
  ariaLabel?: string
  name?: string
  onChange?: (markdown: string) => void
  onModeChange?: (mode: MarkdownEditorMode) => void
}

export const MarkdownEditor = forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(
  function MarkdownEditor(
    {
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
      tabSize = 2,
      ariaLabel,
      name,
      id,
      onChange,
      onModeChange,
      className,
      style,
      onFocus,
      onBlur,
      ...restProps
    },
    ref
  ) {
    const config = useTigerConfig()
    const formItemControl = useFormItemControlContext()
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const pendingSelection = useRef<{ start: number; end: number } | null>(null)
    const [allowTabExit, setAllowTabExit] = useState(false)
    const [formatToolbarIndex, setFormatToolbarIndex] = useState(0)
    const formBoundValue = formItemControl?.value
    const resolvedValue =
      value !== undefined ? value : typeof formBoundValue === 'string' ? formBoundValue : undefined
    const [currentValue, commitValue] = useControlledState({
      value: resolvedValue,
      defaultValue,
      onChange: (next) => {
        onChange?.(next)
        formItemControl?.onChange?.(next)
      }
    })
    const [currentMode, commitMode] = useControlledState({
      value: mode,
      defaultValue: defaultMode,
      onChange: onModeChange
    })
    const mergedLocale = useMemo(
      () => mergeTigerLocale(config.locale, locale),
      [config.locale, locale]
    )
    const labels = useMemo(
      () => getMarkdownEditorLabels(mergedLocale, labelsOverride),
      [mergedLocale, labelsOverride]
    )
    const toolbarItems = useMemo(
      () => (toolbar === false ? [] : (toolbar ?? createDefaultMarkdownToolbar(labels))),
      [toolbar, labels]
    )
    const toolbarButtons = useMemo(() => getMarkdownToolbarButtons(toolbarItems), [toolbarItems])
    const effectiveDisabled = Boolean(disabled) || Boolean(formItemControl?.disabled)
    const effectiveId = id ?? formItemControl?.id
    const effectiveName = name ?? formItemControl?.name
    const canEdit = currentMode === 'edit' || currentMode === 'split'
    const showFormattingToolbar = toolbar !== false && canEdit && !readOnly
    const showTopbar = showFormattingToolbar || showModeSwitch
    const showEditor = canEdit
    const showPreview = currentMode === 'preview' || currentMode === 'split'

    useLayoutEffect(() => {
      const pending = pendingSelection.current
      if (!pending || !textareaRef.current) return
      pendingSelection.current = null
      textareaRef.current.selectionStart = pending.start
      textareaRef.current.selectionEnd = pending.end
      textareaRef.current.focus()
    })

    const previewHtml = useMemo(
      () => renderMarkdownToHtml(currentValue, renderer),
      [currentValue, renderer]
    )

    const containerStyle = useMemo<React.CSSProperties>(() => {
      const parsedHeight = parseMarkdownHeight(height)
      return { ...(parsedHeight ? { height: parsedHeight } : {}), ...style }
    }, [height, style])
    const modeLabels: Record<MarkdownEditorMode, string> = {
      edit: labels.editModeLabel,
      split: labels.splitModeLabel,
      preview: labels.previewModeLabel
    }

    const applyToolbarButton = useCallback(
      (button: MarkdownToolbarButton) => {
        if (readOnly || effectiveDisabled || !canEdit) return
        const textarea = textareaRef.current
        if (!textarea) return
        const selection = {
          value: currentValue,
          selectionStart: textarea.selectionStart,
          selectionEnd: textarea.selectionEnd
        }
        const result = applyMarkdownToolbarAction(button, selection, labels)
        pendingSelection.current = {
          start: result.selectionStart,
          end: result.selectionEnd
        }
        commitValue(result.value)
      },
      [canEdit, commitValue, currentValue, effectiveDisabled, labels, readOnly]
    )

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const action = resolveEditorTabAction(event, {
          readOnly,
          disabled: effectiveDisabled,
          allowTabExit
        })
        if (action === 'arm-exit') {
          setAllowTabExit(true)
          return
        }
        if (action === 'indent' || action === 'outdent') {
          event.preventDefault()
          setAllowTabExit(false)
          const textarea = event.currentTarget
          const result = handleTabKey(
            textarea.value,
            textarea.selectionStart,
            textarea.selectionEnd,
            tabSize,
            { shift: action === 'outdent' }
          )
          pendingSelection.current = {
            start: result.selectionStart,
            end: result.selectionEnd
          }
          commitValue(result.value)
          return
        }
        if (event.key !== 'Tab') setAllowTabExit(false)

        if (readOnly || effectiveDisabled) return
        const match = findMarkdownHotkeyMatch(toolbarItems, event.nativeEvent)
        if (match) {
          event.preventDefault()
          applyToolbarButton(match)
        }
      },
      [
        allowTabExit,
        applyToolbarButton,
        commitValue,
        effectiveDisabled,
        readOnly,
        tabSize,
        toolbarItems
      ]
    )

    const hostRest: Record<string, unknown> = {}
    const containerRest: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(restProps)) {
      if (
        key === 'id' ||
        key === 'name' ||
        key.startsWith('data-') ||
        key.startsWith('aria-') ||
        key === 'onFocus' ||
        key === 'onBlur'
      ) {
        hostRest[key] = val
      } else {
        containerRest[key] = val
      }
    }

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
        className={getMarkdownContainerClasses(effectiveDisabled, className)}
        style={containerStyle}
        data-mode={currentMode}
        {...containerRest}>
        {showTopbar && (
          <div className={markdownEditorToolbarClasses}>
            {showFormattingToolbar ? (
              <div
                className={markdownEditorToolbarGroupClasses}
                role="toolbar"
                aria-label={labels.formattingToolbarAriaLabel}
                onKeyDown={(event) => {
                  const next = nextToolbarRovingIndex(
                    formatToolbarIndex,
                    toolbarButtons.length,
                    event.key
                  )
                  if (next === null) return
                  event.preventDefault()
                  setFormatToolbarIndex(next)
                  const buttons = event.currentTarget.querySelectorAll('button')
                  buttons[next]?.focus()
                }}>
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
                  const buttonIndex = toolbarButtons.findIndex((entry) => entry.name === item.name)
                  return (
                    <button
                      key={item.name}
                      type="button"
                      className={getMarkdownToolbarButtonClasses(false)}
                      title={item.tooltip ?? item.label}
                      aria-label={item.tooltip ?? item.label}
                      tabIndex={buttonIndex === formatToolbarIndex ? 0 : -1}
                      disabled={effectiveDisabled || readOnly}
                      onMouseDown={(event) => event.preventDefault()}
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
                    disabled={effectiveDisabled}
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
              ref={(node) => {
                textareaRef.current = node
                if (typeof ref === 'function') ref(node)
                else if (ref) ref.current = node
              }}
              className={markdownEditorTextareaClasses}
              value={currentValue}
              onChange={(event) => commitValue(event.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onBlur={(event) => {
                formItemControl?.onBlur?.()
                onBlur?.(event)
              }}
              placeholder={placeholder}
              readOnly={readOnly || effectiveDisabled}
              disabled={effectiveDisabled}
              spellCheck={true}
              id={effectiveId}
              name={effectiveName}
              aria-label={
                ariaLabel ??
                (hostRest['aria-label'] as string | undefined) ??
                labels.editorAriaLabel
              }
              aria-labelledby={
                (hostRest['aria-labelledby'] as string | undefined) ?? formItemControl?.labelId
              }
              aria-multiline={true}
              {...hostRest}
            />
          )}
          {showPreview && previewNode}
        </div>
      </div>
    )
  }
)

export default MarkdownEditor
