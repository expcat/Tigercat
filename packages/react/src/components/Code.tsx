import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import {
  basicLabel,
  classNames,
  codeBlockCopyStatusLiveClasses,
  codeBlockFloatingActionClasses,
  codeBlockHeaderActionsClasses,
  codeBlockHeaderClasses,
  codeBlockLanguageClasses,
  codeBlockLineNumberClasses,
  codeBlockWrapButtonClasses,
  codeLineNumbers,
  copyTextToClipboard,
  createCopyStatusReset,
  getCodeBlockContainerClasses,
  getCodeBlockCopyButtonClasses,
  getCodeBlockPreClasses,
  getCodeLabels,
  mergeTigerLocale,
  highlightToTokens,
  resolveCodeHighlightTheme,
  type HighlightToken,
  resolveLocaleText,
  type CodeCopyButtonStatus,
  type CodeProps as CoreCodeProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'

function renderHighlightTokens(lines: HighlightToken[][]): React.ReactNode {
  return lines.map((tokens, lineIndex) => (
    <span key={lineIndex}>
      {lineIndex > 0 ? '\n' : null}
      {tokens.map((token, tokenIndex) =>
        token.className ? (
          <span key={tokenIndex} className={token.className}>
            {token.text}
          </span>
        ) : (
          <React.Fragment key={tokenIndex}>{token.text}</React.Fragment>
        )
      )}
    </span>
  ))
}

export type CodeProps = CoreCodeProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, keyof CoreCodeProps | 'onCopy'> & {
    onCopy?: (code: string) => void
  }

export const Code = forwardRef<HTMLDivElement, CodeProps>(function Code(
  {
    code,
    copyable = true,
    language,
    highlighter,
    copyLabel,
    copiedLabel,
    copyFailedLabel,
    locale,
    labels: labelsOverride,
    lineNumbers = false,
    showLanguage = false,
    wrapToggle = false,
    onCopy,
    className,
    ...props
  },
  ref
) {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getCodeLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const resolvedCopyLabel = resolveLocaleText(labels.copyLabel, copyLabel)
  const resolvedCopiedLabel = resolveLocaleText(labels.copiedLabel, copiedLabel)
  const resolvedCopyFailedLabel = resolveLocaleText(labels.copyFailedLabel, copyFailedLabel)

  const [copyStatus, setCopyStatus] = useState<CodeCopyButtonStatus>('idle')
  const [wrapped, setWrapped] = useState(false)
  const resetRef = useRef<ReturnType<typeof createCopyStatusReset> | null>(null)
  if (resetRef.current == null) {
    resetRef.current = createCopyStatusReset(setCopyStatus)
  }

  useEffect(() => {
    const machine = resetRef.current
    return () => machine?.dispose()
  }, [])

  const handleCopy = async () => {
    if (!copyable) return
    const ok = await copyTextToClipboard(code)
    if (ok) {
      resetRef.current?.schedule('copied')
      onCopy?.(code)
    } else {
      resetRef.current?.schedule('failed')
    }
  }

  const containerClasses = getCodeBlockContainerClasses(className)
  const copyButtonClasses = getCodeBlockCopyButtonClasses(copyStatus)
  const buttonLabel =
    copyStatus === 'failed'
      ? resolvedCopyFailedLabel
      : copyStatus === 'copied'
        ? resolvedCopiedLabel
        : resolvedCopyLabel
  const liveText = copyStatus === 'idle' ? '' : buttonLabel
  const showHeader = Boolean(showLanguage && language)
  const wrapButton = wrapToggle ? (
    <button
      type="button"
      className={classNames(
        codeBlockWrapButtonClasses,
        !showHeader && codeBlockFloatingActionClasses,
        !showHeader && copyable && 'end-28'
      )}
      aria-pressed={wrapped}
      onClick={() => setWrapped((value) => !value)}>
      {basicLabel(mergedLocale?.locale, 'code', wrapped ? 'nowrap' : 'wrap')}
    </button>
  ) : null
  const copyButton = copyable ? (
    <button
      type="button"
      className={classNames(copyButtonClasses, !showHeader && codeBlockFloatingActionClasses)}
      onClick={handleCopy}>
      {buttonLabel}
    </button>
  ) : null

  return (
    <div ref={ref} className={containerClasses} {...props}>
      {showHeader ? (
        <div className={codeBlockHeaderClasses}>
          <span className={codeBlockLanguageClasses}>
            {basicLabel(mergedLocale?.locale, 'code', 'language')}: {language}
          </span>
          {wrapButton || copyButton ? (
            <div className={codeBlockHeaderActionsClasses}>
              {wrapButton}
              {copyButton}
            </div>
          ) : null}
        </div>
      ) : null}
      <pre
        className={classNames(getCodeBlockPreClasses(wrapped), lineNumbers && 'flex')}
        tabIndex={0}
        aria-label={labels.scrollLabel}>
        {lineNumbers ? (
          <ol className={codeBlockLineNumberClasses} aria-hidden="true">
            {codeLineNumbers(code).map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ol>
        ) : null}
        {(() => {
          const highlighted = highlightToTokens(
            code,
            language,
            highlighter,
            resolveCodeHighlightTheme(config.colorScheme)
          )
          return highlighted == null ? (
            <code className="block">{code}</code>
          ) : (
            <code className="block">{renderHighlightTokens(highlighted)}</code>
          )
        })()}
      </pre>
      {showHeader ? null : wrapButton}
      {showHeader ? null : copyButton}
      {copyable ? (
        <span className={codeBlockCopyStatusLiveClasses} aria-live="polite">
          {liveText}
        </span>
      ) : null}
    </div>
  )
})
Code.displayName = 'Code'

export default Code
