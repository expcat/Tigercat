import React, { useEffect, useState } from 'react'
import {
  classNames,
  codeBlockContainerClasses,
  codeBlockCopyButtonBaseClasses,
  codeBlockCopyButtonCopiedClasses,
  codeBlockPreClasses,
  copyTextToClipboard,
  type CodeProps as CoreCodeProps
} from '@expcat/tigercat-core'

export type CodeProps = CoreCodeProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, keyof CoreCodeProps | 'onCopy'> & {
    onCopy?: (code: string) => void
  }

export const Code: React.FC<CodeProps> = ({
  code,
  copyable = true,
  copyLabel = '复制',
  copiedLabel = '已复制',
  onCopy,
  className,
  ...props
}) => {
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (!isCopied) return
    const timer = window.setTimeout(() => {
      setIsCopied(false)
    }, 1500)

    return () => window.clearTimeout(timer)
  }, [isCopied])

  const handleCopy = async () => {
    if (!copyable) return
    const ok = await copyTextToClipboard(code)
    if (!ok) return

    setIsCopied(true)
    onCopy?.(code)
  }

  const containerClasses = classNames(codeBlockContainerClasses, className)
  const copyButtonClasses = classNames(
    codeBlockCopyButtonBaseClasses,
    isCopied && codeBlockCopyButtonCopiedClasses
  )

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
          aria-label={isCopied ? copiedLabel : copyLabel}>
          {isCopied ? copiedLabel : copyLabel}
        </button>
      )}
    </div>
  )
}

export default Code
