import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import {
  codeBlockCopyStatusLiveClasses,
  codeBlockPreClasses,
  copyTextToClipboard,
  createCopyStatusReset,
  getCodeBlockContainerClasses,
  getCodeBlockCopyButtonClasses,
  getCodeLabels,
  mergeTigerLocale,
  highlightToTokens,
  resolveCodeHighlightTheme,
  type HighlightToken,
  resolveLocaleText,
  type CodeCopyButtonStatus,
  type CodeProps as CoreCodeProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

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

  return (
    <div ref={ref} className={containerClasses} {...props}>
      <pre className={codeBlockPreClasses} tabIndex={0} aria-label={labels.scrollLabel}>
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
      {copyable && (
        <>
          <button type="button" className={copyButtonClasses} onClick={handleCopy}>
            {buttonLabel}
          </button>
          <span className={codeBlockCopyStatusLiveClasses} aria-live="polite">
            {liveText}
          </span>
        </>
      )}
    </div>
  )
})
Code.displayName = 'Code'

export default Code
