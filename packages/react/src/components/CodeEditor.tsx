import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle
} from 'react'
import {
  classNames,
  getCodeEditorContainerClasses,
  getLineNumberClasses,
  getTokenClasses,
  generateLineNumbers,
  handleTabKey,
  getActiveLineIndex,
  getCodeEditorActiveLineClasses,
  codeEditorTextareaClasses,
  codeEditorHighlightClasses,
  codeEditorScrollerClasses,
  getCodeEditorWrapClass,
  getCodeEditorThemeVars,
  getCodeEditorHeightStyle,
  buildCodeEditorLineModels,
  resolveEditorTabAction,
  getCodeEditorLabels,
  mergeTigerLocale,
  type CodeEditorProps as CoreCodeEditorProps,
  type Token,
  type CodeHighlighter
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'
import { useFormItemControlContext } from './FormItemContext'

export interface CodeEditorProps extends Omit<CoreCodeEditorProps, 'style'> {
  onChange?: (value: string) => void
  style?: React.CSSProperties
  /**
   * Optional pluggable highlighter. Output is TRUSTED HTML — sanitise
   * inside the engine if the source is untrusted.
   */
  highlighter?: CodeHighlighter
  name?: string
  id?: string
}

export interface CodeEditorHandle {
  focus: () => void
  textarea: HTMLTextAreaElement | null
}

export const CodeEditor = forwardRef<HTMLTextAreaElement, CodeEditorProps>(function CodeEditor(
  {
    value: controlledValue,
    defaultValue = '',
    language = 'plain',
    theme = 'light',
    readOnly = false,
    lineNumbers = true,
    tabSize = 2,
    placeholder,
    wordWrap = false,
    minLines = 3,
    maxLines = 0,
    highlightActiveLine = true,
    disabled = false,
    className,
    style,
    onChange,
    highlighter,
    locale,
    labels: labelsOverride,
    ariaLabel,
    name,
    id,
    ...restProps
  },
  ref
) {
  const config = useTigerConfig()
  const formItemControl = useFormItemControlContext()
  const formBoundValue = formItemControl?.value
  const resolvedValue =
    controlledValue !== undefined
      ? controlledValue
      : typeof formBoundValue === 'string'
        ? formBoundValue
        : undefined
  const [code, setCode] = useControlledState({
    value: resolvedValue,
    defaultValue,
    onChange: (next) => {
      onChange?.(next)
      formItemControl?.onChange?.(next)
    }
  })
  const [activeLine, setActiveLine] = useState(0)
  const [allowTabExit, setAllowTabExit] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pendingSelection = useRef<{ start: number; end: number } | null>(null)
  const effectiveDisabled = Boolean(disabled) || Boolean(formItemControl?.disabled)
  const effectiveId = id ?? formItemControl?.id
  const effectiveName = name ?? formItemControl?.name
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getCodeEditorLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )

  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)

  useLayoutEffect(() => {
    const pending = pendingSelection.current
    if (!pending || !textareaRef.current) return
    pendingSelection.current = null
    textareaRef.current.selectionStart = pending.start
    textareaRef.current.selectionEnd = pending.end
  })

  const model = useMemo(
    () =>
      buildCodeEditorLineModels({
        value: code,
        language,
        theme,
        activeLine,
        highlightActiveLine,
        disabled: effectiveDisabled,
        highlighter
      }),
    [code, language, theme, activeLine, highlightActiveLine, effectiveDisabled, highlighter]
  )
  const lineNums = useMemo(() => generateLineNumbers(model.lines.length), [model.lines.length])

  const containerClasses = useMemo(
    () => getCodeEditorContainerClasses(theme, effectiveDisabled, className),
    [theme, effectiveDisabled, className]
  )

  const containerStyle = useMemo<React.CSSProperties>(() => {
    const height = getCodeEditorHeightStyle(minLines, maxLines)
    const themeVars = getCodeEditorThemeVars(theme)
    return { ...height, ...themeVars, ...style }
  }, [minLines, maxLines, theme, style])

  const updateActiveLine = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    setActiveLine(getActiveLineIndex(ta.value, ta.selectionStart))
  }, [])

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value
      setCode(val)
      setActiveLine(getActiveLineIndex(val, e.target.selectionStart))
    },
    [setCode]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const action = resolveEditorTabAction(e, {
        readOnly,
        disabled: effectiveDisabled,
        allowTabExit
      })
      if (action === 'arm-exit') {
        setAllowTabExit(true)
        return
      }
      if (action === 'passthrough') {
        if (e.key !== 'Tab') setAllowTabExit(false)
        return
      }
      e.preventDefault()
      setAllowTabExit(false)
      const ta = textareaRef.current
      if (!ta) return
      const result = handleTabKey(ta.value, ta.selectionStart, ta.selectionEnd, tabSize, {
        shift: action === 'outdent'
      })
      pendingSelection.current = {
        start: result.selectionStart,
        end: result.selectionEnd
      }
      setCode(result.value)
    },
    [allowTabExit, effectiveDisabled, readOnly, setCode, tabSize]
  )

  const wrapClass = getCodeEditorWrapClass(wordWrap)
  const activeLineClass = getCodeEditorActiveLineClasses(theme)

  const {
    id: _ignoredId,
    name: _ignoredName,
    onFocus,
    onBlur,
    'aria-label': ariaLabelAttr,
    'aria-labelledby': ariaLabelledBy,
    ...containerRest
  } = restProps as Record<string, unknown>

  const hostRest: Record<string, unknown> = {}
  const extraContainer: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(containerRest)) {
    if (
      key.startsWith('data-') ||
      key.startsWith('aria-') ||
      key === 'onFocus' ||
      key === 'onBlur'
    ) {
      if (key === 'data-language' || key === 'data-theme') extraContainer[key] = val
      else hostRest[key] = val
    } else {
      extraContainer[key] = val
    }
  }

  const renderToken = (token: Token, idx: number) => {
    const cls = getTokenClasses(token.type, theme)
    return cls ? (
      <span key={idx} className={cls}>
        {token.value}
      </span>
    ) : (
      <React.Fragment key={idx}>{token.value}</React.Fragment>
    )
  }

  return (
    <div
      className={containerClasses}
      style={containerStyle}
      data-language={language}
      data-theme={theme}
      {...extraContainer}>
      <div className={codeEditorScrollerClasses} data-tiger-code-scroller="">
        {lineNumbers && (
          <div className={getLineNumberClasses(theme)} aria-hidden="true">
            {lineNums.map((n) => (
              <div key={n} className="min-h-[1.625rem]">
                {n}
              </div>
            ))}
          </div>
        )}
        <div className="relative flex-1">
          {model.blockHtml !== null ? (
            <div
              className={classNames(codeEditorHighlightClasses, wrapClass)}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: model.blockHtml }}
            />
          ) : (
            <div className={classNames(codeEditorHighlightClasses, wrapClass)} aria-hidden="true">
              {model.lines.map((line) => {
                const lineClass = classNames('min-h-[1.625rem]', line.isActive && activeLineClass)
                if (line.html !== null) {
                  return (
                    <div
                      key={line.index}
                      className={lineClass}
                      data-active-line={line.isActive ? '' : undefined}
                      dangerouslySetInnerHTML={{ __html: line.html }}
                    />
                  )
                }
                return (
                  <div
                    key={line.index}
                    className={lineClass}
                    data-active-line={line.isActive ? '' : undefined}>
                    {(line.tokens ?? []).map(renderToken)}
                    {line.text === '' ? '\n' : null}
                  </div>
                )
              })}
            </div>
          )}
          <textarea
            ref={textareaRef}
            className={classNames(codeEditorTextareaClasses, wrapClass)}
            value={code}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onSelect={updateActiveLine}
            onClick={updateActiveLine}
            onKeyUp={updateActiveLine}
            onFocus={onFocus as React.FocusEventHandler<HTMLTextAreaElement> | undefined}
            onBlur={(event) => {
              formItemControl?.onBlur?.()
              ;(onBlur as React.FocusEventHandler<HTMLTextAreaElement> | undefined)?.(event)
            }}
            readOnly={readOnly || effectiveDisabled}
            disabled={effectiveDisabled}
            placeholder={placeholder}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            data-gramm="false"
            id={effectiveId}
            name={effectiveName}
            aria-label={
              ariaLabel ?? (ariaLabelAttr as string | undefined) ?? labels.editorAriaLabel
            }
            aria-labelledby={(ariaLabelledBy as string | undefined) ?? formItemControl?.labelId}
            aria-multiline={true}
            aria-describedby={formItemControl?.describedBy}
            {...hostRest}
          />
        </div>
      </div>
    </div>
  )
})

export default CodeEditor
