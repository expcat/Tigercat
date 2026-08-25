import React, { useEffect, useMemo, useState } from 'react'
import {
  codeBlockPreClasses,
  copyTextToClipboard,
  getCodeBlockContainerClasses,
  getCodeBlockCopyButtonClasses,
  getCodeLabels,
  mergeTigerLocale,
  resolveLocaleText,
  type CodeCopyButtonStatus,
  type CodeProps as CoreCodeProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export type CodeProps = CoreCodeProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, keyof CoreCodeProps | 'onCopy'> & {
    onCopy?: (code: string) => void
  }

export const Code: React.FC<CodeProps> = ({
  code,
  copyable = true,
  copyLabel,
  copiedLabel,
  copyFailedLabel,
  locale,
  labels: labelsOverride,
  onCopy,
  className,
  ...props
}) => {
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

  useEffect(() => {
    if (copyStatus === 'idle') return
    const timer = window.setTimeout(() => {
      setCopyStatus('idle')
    }, 1500)

    return () => window.clearTimeout(timer)
  }, [copyStatus])

  const handleCopy = async () => {
    if (!copyable) return
    const ok = await copyTextToClipboard(code)
    if (ok) {
      setCopyStatus('copied')
      onCopy?.(code)
    } else {
      setCopyStatus('failed')
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

  return (
    <div className={containerClasses} {...props}>
      <pre className={codeBlockPreClasses}>
        <code className="block">{code}</code>
      </pre>
      {copyable && (
        <button
          type="button"
          className={copyButtonClasses}
          onClick={handleCopy}
          aria-label={buttonLabel}>
          {buttonLabel}
        </button>
      )}
    </div>
  )
}

export default Code
