import React, { useState, useRef, useMemo, useCallback } from 'react'
import {
  classNames,
  getCodeEditorContainerClasses,
  getLineNumberClasses,
  getTokenClasses,
  tokenizeLine,
  countLines,
  generateLineNumbers,
  handleTabKey,
  codeEditorTextareaClasses,
  codeEditorHighlightClasses,
  type CodeEditorProps as CoreCodeEditorProps,
  type Token
} from '@expcat/tigercat-core'

export interface CodeEditorProps extends Omit<CoreCodeEditorProps, 'style'> {
  onChange?: (value: string) => void
  children?: React.ReactNode
  style?: React.CSSProperties
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
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
  disabled = false,
  className,
  style,
  onChange
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const code = controlledValue !== undefined ? controlledValue : internalValue

  const lines = useMemo(() => code.split('\n'), [code])
  const lineCount = useMemo(() => countLines(code), [code])
  const lineNums = useMemo(() => generateLineNumbers(lineCount), [lineCount])

  const containerClasses = useMemo(
    () => getCodeEditorContainerClasses(theme, disabled, className),
    [theme, disabled, className]
  )

  const containerStyle = useMemo<React.CSSProperties>(() => {
    const lineHeight = 1.625
    const s: React.CSSProperties = { ...style }
    if (minLines > 0) s.minHeight = `${minLines * lineHeight + 1.5}rem`
    if (maxLines > 0) s.maxHeight = `${maxLines * lineHeight + 1.5}rem`
    return s
  }, [minLines, maxLines, style])

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value
      setInternalValue(val)
      onChange?.(val)
    },
    [onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const ta = textareaRef.current
        if (!ta) return
        const result = handleTabKey(ta.value, ta.selectionStart, ta.selectionEnd, tabSize)
        setInternalValue(result.value)
        onChange?.(result.value)
        requestAnimationFrame(() => {
          ta.selectionStart = result.selectionStart
          ta.selectionEnd = result.selectionStart
        })
      }
    },
    [tabSize, onChange]
  )

  const wrapClass = wordWrap ? 'whitespace-pre-wrap break-all' : ''

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

  const renderLine = (line: string, lineIndex: number) => {
    const tokens = tokenizeLine(line, language)
    return (
      <div key={lineIndex} className="min-h-[1.625rem]">
        {tokens.map(renderToken)}
        {line === '' ? '\n' : null}
      </div>
    )
  }

  return (
    <div
      className={containerClasses}
      style={containerStyle}
      data-language={language}
      data-theme={theme}>
      <div className="flex h-full">
        {lineNumbers && (
          <div className={getLineNumberClasses(theme)} aria-hidden="true">
            {lineNums.map((n) => (
              <div key={n} className="min-h-[1.625rem]">
                {n}
              </div>
            ))}
          </div>
        )}
        <div className="relative flex-1 overflow-auto">
          <div className={classNames(codeEditorHighlightClasses, wrapClass)} aria-hidden="true">
            {lines.map(renderLine)}
          </div>
          <textarea
            ref={textareaRef}
            className={classNames(codeEditorTextareaClasses, wrapClass)}
            value={code}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            readOnly={readOnly || disabled}
            disabled={disabled}
            placeholder={placeholder}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            data-gramm="false"
            aria-label="Code editor"
            role="textbox"
            aria-multiline={true}
          />
        </div>
      </div>
    </div>
  )
}

export default CodeEditor
