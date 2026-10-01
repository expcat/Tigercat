import React, { useState } from 'react'
import {
  copyTextToClipboard,
  getSpaceClasses,
  getTextLabels,
  resolveButtonClasses,
  type CopyButtonProps as CoreCopyButtonProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'

export interface CopyButtonProps
  extends
    CoreCopyButtonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CoreCopyButtonProps | 'onCopy'> {
  onCopy?: (ok: boolean) => void
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label,
  onCopy,
  children,
  disabled,
  onClick,
  className,
  ...rest
}) => {
  const config = useTigerConfig()
  const labels = getTextLabels(config.locale)
  const [status, setStatus] = useState<'copied' | 'failed' | null>(null)

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    onClick?.(event)
    if (disabled || event.defaultPrevented) return
    const button = event.currentTarget
    const ok = await copyTextToClipboard(text)
    setStatus(ok ? 'copied' : 'failed')
    onCopy?.(ok)
    button.focus()
  }

  return (
    <span data-tiger-copy="" className={getSpaceClasses({ size: 'sm', align: 'center' })}>
      <button
        type="button"
        {...rest}
        className={resolveButtonClasses({ variant: 'outline', size: 'sm', disabled, className })}
        disabled={disabled}
        aria-invalid={status === 'failed' ? true : undefined}
        onClick={handleClick}>
        {children ?? label ?? labels.copyLabel}
      </button>
      {status ? (
        <span role="status">
          {status === 'copied' ? labels.copiedLabel : labels.copyFailedLabel}
        </span>
      ) : null}
    </span>
  )
}

export default CopyButton
