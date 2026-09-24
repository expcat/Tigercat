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
  generateLineNumbers,
  handleTabKey,
  getActiveLineIndex,
  getCodeEditorActiveLineClasses,
  codeEditorTextareaClasses,
  codeEditorHighlightClasses,
  codeEditorScrollerClasses,
  getCodeEditorWrapClass,
  resolveCodeEditorTheme,
  codeEditorLineWindow,
  findCodeMatches,
  getW9DataLabels,
  matchBrackets,
  registerCodeEditorLanguage,
  registeredCodeEditorLanguage,
  replaceCodeMatches,
  scrollCodeEditorCaretIntoView,
  shouldCommitEditorValue,
  syncEditorTextareaValue,
  clampTabSize,
  getCodeEditorHeightStyle,
  buildCodeEditorLineModels,
  resolveEditorTabAction,
  getCodeEditorLabels,
  mergeTigerLocale,
  type CodeEditorProps as CoreCodeEditorProps,
  type CodeHighlighter
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'
import { useFormItemControlContext } from './FormItemContext'

export interface CodeEditorProps extends Omit<CoreCodeEditorProps, 'style'> {
  onChange?: (value: string) => void
  style?: React.CSSProperties
  /** Optional pluggable highlighter. Returns tokens drawn as text. */
  highlighter?: CodeHighlighter
  name?: string
  id?: string
  bind?: {
    query?: string
    replacement?: string
    caret?: number
    scrollTop?: number
    viewportHeight?: number
    lineHeight?: number
    lineCount?: number
    language?: { id: string; keywords?: string[] }
  }
}

export interface CodeEditorHandle {
  focus: () => void
  textarea: HTMLTextAreaElement | null
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor(
  {
    value: controlledValue,
    defaultValue = '',
    language = 'plain',
    theme,
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
    bind,
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
  const scrollerRef = useRef<HTMLDivElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const pendingSelection = useRef<{ start: number; end: number } | null>(null)
  const composingRef = useRef(false)
  const [composing, setComposing] = useState(false)
  const resolvedTheme = resolveCodeEditorTheme(theme)
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

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus()
    },
    textarea: textareaRef.current
  }))

  useLayoutEffect(() => {
    syncEditorTextareaValue(textareaRef.current, code, composingRef.current || composing)
    const pending = pendingSelection.current
    if (!pending || !textareaRef.current || composingRef.current) return
    pendingSelection.current = null
    textareaRef.current.selectionStart = pending.start
    textareaRef.current.selectionEnd = pending.end
  })

  useLayoutEffect(() => {
    const gutter = gutterRef.current
    const scroller = scrollerRef.current
    if (!gutter || !scroller) {
      scroller?.style.removeProperty('--tiger-code-gutter')
      return
    }
    scroller.style.setProperty('--tiger-code-gutter', `${gutter.offsetWidth}px`)
  })

  const model = useMemo(
    () =>
      buildCodeEditorLineModels({
        value: code,
        language,
        theme: resolvedTheme,
        activeLine,
        highlightActiveLine,
        disabled: effectiveDisabled,
        highlighter
      }),
    [code, language, resolvedTheme, activeLine, highlightActiveLine, effectiveDisabled, highlighter]
  )
  const lineNums = useMemo(() => generateLineNumbers(model.lines.length), [model.lines.length])

  const containerClasses = useMemo(
    () => getCodeEditorContainerClasses(resolvedTheme, effectiveDisabled, className),
    [resolvedTheme, effectiveDisabled, className]
  )

  const scrollStyle = useMemo<React.CSSProperties>(() => {
    const height = getCodeEditorHeightStyle(minLines, maxLines)
    return { ...height, tabSize: clampTabSize(tabSize), flex: '1 1 auto' }
  }, [minLines, maxLines, tabSize])

  const updateActiveLine = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    setActiveLine(getActiveLineIndex(ta.value, ta.selectionStart))
  }, [])

  const revealCaret = useCallback(() => {
    scrollCodeEditorCaretIntoView(textareaRef.current, scrollerRef.current)
  }, [])

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const native = e.nativeEvent as InputEvent
      if (!shouldCommitEditorValue(composingRef.current || native.isComposing)) return
      const val = e.target.value
      setCode(val)
      setActiveLine(getActiveLineIndex(val, e.target.selectionStart))
      revealCaret()
    },
    [revealCaret, setCode]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const action = resolveEditorTabAction(e, {
        readOnly,
        disabled: effectiveDisabled,
        allowTabExit
      })
      if (composingRef.current) return
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
  const activeLineClass = getCodeEditorActiveLineClasses(resolvedTheme)
  const tabWidth = clampTabSize(tabSize)

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

  const renderToken = (token: { text: string; className?: string }, idx: number) => {
    return token.className ? (
      <span key={idx} className={token.className}>
        {token.text}
      </span>
    ) : (
      <React.Fragment key={idx}>{token.text}</React.Fragment>
    )
  }

  return (
    <div
      className={containerClasses}
      style={style}
      data-language={language}
      data-theme={resolvedTheme}
      {...extraContainer}>
      {bind ? (
        <div data-tiger-code-bind="">
          {findCodeMatches(code, bind.query ?? '').map((match, index) => (
            <span key={index} data-code-match={String(match.index)} />
          ))}
          <button
            type="button"
            data-tiger-replace=""
            onClick={() => {
              setCode(
                replaceCodeMatches(code, bind.query ?? '', bind.replacement ?? '', true)
              )
            }}>
            {getW9DataLabels().replaceAll}
          </button>
          <span
            data-bracket={(() => {
              const pair = matchBrackets(code, bind.caret ?? 0)
              return pair ? `${pair.open}-${pair.close}` : ''
            })()}
          />
          <span
            data-line-window={(() => {
              if (bind.language) {
                registerCodeEditorLanguage({
                  id: bind.language.id,
                  keywords: bind.language.keywords
                })
              }
              const window = codeEditorLineWindow({
                scrollTop: bind.scrollTop ?? 0,
                viewportHeight: bind.viewportHeight ?? 0,
                lineHeight: bind.lineHeight ?? 20,
                lineCount: bind.lineCount ?? 0
              })
              const registered = bind.language
                ? registeredCodeEditorLanguage(bind.language.id)?.id
                : ''
              return `${window.start}-${window.end}:${registered ?? ''}`
            })()}
          />
        </div>
      ) : null}
      <div
        ref={scrollerRef}
        className={codeEditorScrollerClasses}
        style={scrollStyle}
        data-tiger-code-scroller="">
        <div className="relative min-w-full" style={{ tabSize: tabWidth }}>
          <div
            className={classNames('grid py-3', wrapClass)}
            style={{
              gridTemplateColumns: lineNumbers ? 'auto minmax(0, 1fr)' : 'minmax(0, 1fr)'
            }}
            aria-hidden="true">
            {model.lines.map((line, lineIndex) => {
              const lineClass = classNames(
                'min-h-[1.625rem] px-3',
                line.isActive && activeLineClass
              )
              return (
                <React.Fragment key={line.index}>
                  {lineNumbers ? (
                    <div
                      ref={lineIndex === 0 ? gutterRef : undefined}
                      className={classNames(getLineNumberClasses(resolvedTheme), 'min-h-[1.625rem]')}>
                      {lineNums[lineIndex]}
                    </div>
                  ) : null}
                  <div
                    className={lineClass}
                    data-active-line={line.isActive ? '' : undefined}>
                    {line.tokens.map(renderToken)}
                    {line.text === '' ? '\n' : null}
                  </div>
                </React.Fragment>
              )
            })}
          </div>
          <textarea
            ref={textareaRef}
            className={classNames(codeEditorTextareaClasses, wrapClass)}
            style={{
              insetInlineStart: 0,
              width: '100%',
              height: '100%',
              paddingInlineStart: lineNumbers
                ? 'calc(var(--tiger-code-gutter, 3rem) + 0.75rem)'
                : '0.75rem',
              tabSize: tabWidth
            }}
            defaultValue={code}
            onChange={handleInput}
            onCompositionStart={() => {
              composingRef.current = true
              setComposing(true)
            }}
            onCompositionEnd={(event) => {
              composingRef.current = false
              setComposing(false)
              const val = event.currentTarget.value
              setCode(val)
              setActiveLine(getActiveLineIndex(val, event.currentTarget.selectionStart))
              revealCaret()
            }}
            onKeyDown={handleKeyDown}
            onSelect={() => {
              updateActiveLine()
              revealCaret()
            }}
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
