import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  forwardRef
} from 'react'
import { useControlledState } from '../hooks/useControlledState'
import {
  applyMarkdownToolbarAction,
  classNames,
  createDefaultMarkdownToolbar,
  findMarkdownHotkeyMatch,
  getMarkdownBodyClasses,
  resolveMarkdownPanes,
  isMarkdownNarrowViewport,
  subscribeMarkdownNarrow,
  shouldCommitEditorValue,
  syncEditorTextareaValue,
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
  getW9DataLabels,
  htmlToMarkdown,
  lockedPaneScroll,
  markdownHeadings,
  sanitizeHtml,
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
  'onChange' | 'defaultValue' | 'onFocus' | 'onBlur'
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
  bind?: { html?: string; lockScroll?: boolean }
  ariaLabel?: string
  name?: string
  onChange?: (markdown: string) => void
  onModeChange?: (mode: MarkdownEditorMode) => void
  onFocus?: React.FocusEventHandler<HTMLElement>
  onBlur?: React.FocusEventHandler<HTMLElement>
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
      bind,
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
    const previewRef = useRef<HTMLDivElement>(null)
    const lockingScroll = useRef(false)
    const syncLockedPane = (source: HTMLElement, target: HTMLElement | null) => {
      if (!bind?.lockScroll || !target || lockingScroll.current) return
      lockingScroll.current = true
      target.scrollTop = lockedPaneScroll(
        source.scrollTop,
        Math.max(0, source.scrollHeight - source.clientHeight),
        Math.max(0, target.scrollHeight - target.clientHeight)
      )
      lockingScroll.current = false
    }
    const pendingSelection = useRef<{ start: number; end: number } | null>(null)
    const composingRef = useRef(false)
    const narrow = useSyncExternalStore(subscribeMarkdownNarrow, isMarkdownNarrowViewport, () => false)
    const [narrowPane, setNarrowPane] = useState<'edit' | 'preview'>('edit')
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
    const panes = resolveMarkdownPanes(currentMode, narrow, narrowPane)
    const canEdit = panes.edit
    const showFormattingToolbar = toolbar !== false && canEdit && !readOnly
    const showTopbar = showFormattingToolbar || showModeSwitch || (narrow && currentMode === 'split')
    const showEditor = panes.edit
    const showPreview = panes.preview

    useLayoutEffect(() => {
      syncEditorTextareaValue(textareaRef.current, currentValue, composingRef.current)
      const pending = pendingSelection.current
      if (!pending || !textareaRef.current || composingRef.current) return
      pendingSelection.current = null
      textareaRef.current.selectionStart = pending.start
      textareaRef.current.selectionEnd = pending.end
      textareaRef.current.focus()
    })

    const [previewHtml, setPreviewHtml] = useState(() =>
      renderMarkdownToHtml(currentValue, renderer)
    )
    useEffect(() => {
      const handle = window.setTimeout(() => {
        setPreviewHtml(renderMarkdownToHtml(currentValue, renderer))
      }, 200)
      return () => window.clearTimeout(handle)
    }, [currentValue, renderer])

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

        if (readOnly || effectiveDisabled || composingRef.current) return
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

    const previewName = labels.previewAriaLabel?.trim() ?? ''
    const previewNode = (
      <div
        ref={previewRef}
        onScroll={(event) => syncLockedPane(event.currentTarget, textareaRef.current)}
        className={classNames(
          markdownEditorPreviewClasses,
          currentMode === 'split' && !narrow ? markdownEditorSplitDividerClasses : undefined,
          !currentValue ? markdownEditorEmptyPreviewClasses : undefined
        )}
        tabIndex={0}
        role={previewName ? 'region' : undefined}
        aria-label={previewName || undefined}
        {...(currentValue ? { dangerouslySetInnerHTML: { __html: previewHtml } } : {})}>
        {currentValue ? null : placeholder}
      </div>
    )

    return (
      <div
        className={getMarkdownContainerClasses(effectiveDisabled, className)}
        style={containerStyle}
        data-mode={currentMode}
        data-lock-scroll={bind?.lockScroll ? '' : undefined}
        {...containerRest}>
        {bind ? (
          <div data-tiger-markdown-bind="">
            {markdownHeadings(currentValue).map((heading) => (
              <button
                type="button"
                key={heading.index}
                data-toc={heading.text}
                onClick={() => {
                  textareaRef.current?.focus()
                  textareaRef.current?.setSelectionRange(heading.index, heading.index)
                }}>
                {heading.text}
              </button>
            ))}
            {currentValue
              .split('\n')
              .filter((line) => /^- \[[ xX]\] /.test(line))
              .map((line, index) => (
                <span
                  key={index}
                  data-markdown-task={line.includes('[x]') || line.includes('[X]') ? 'done' : 'open'}>
                  {line}
                </span>
              ))}
            <button
              type="button"
              data-tiger-md-paste=""
              onClick={() => commitValue(`${currentValue}${htmlToMarkdown(sanitizeHtml(bind.html ?? ''))}`)}>
              {getW9DataLabels().preview}
            </button>
          </div>
        ) : null}
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
                        <svg
                          viewBox={item.icon.viewBox ?? '0 0 24 24'}
                          width="16"
                          height="16"
                          aria-hidden="true">
                          <path d={item.icon.path} fill="currentColor" />
                        </svg>
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

        {narrow && currentMode === 'split' ? (
          <div className={markdownEditorToolbarGroupClasses}>
            <button
              type="button"
              className={getMarkdownToolbarButtonClasses(narrowPane === 'edit')}
              onClick={() => setNarrowPane('edit')}>
              {labels.showEditorText}
            </button>
            <button
              type="button"
              className={getMarkdownToolbarButtonClasses(narrowPane === 'preview')}
              onClick={() => setNarrowPane('preview')}>
              {labels.showPreviewText}
            </button>
          </div>
        ) : null}

        <div className={getMarkdownBodyClasses(showEditor && showPreview)}>
          {showEditor && (
            <textarea
              ref={(node) => {
                textareaRef.current = node
                if (typeof ref === 'function') ref(node)
                else if (ref) ref.current = node
              }}
              className={markdownEditorTextareaClasses}
              defaultValue={currentValue}
              onCompositionStart={() => {
                composingRef.current = true
              }}
              onCompositionEnd={(event) => {
                composingRef.current = false
                commitValue(event.currentTarget.value)
              }}
              onChange={(event) => {
                const native = event.nativeEvent as InputEvent
                if (!shouldCommitEditorValue(composingRef.current || native.isComposing)) return
                commitValue(event.target.value)
              }}
              onKeyDown={handleKeyDown}
              onScroll={(event) => syncLockedPane(event.currentTarget, previewRef.current)}
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
