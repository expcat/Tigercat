import React, { useState } from 'react'
import { copyTextToClipboard, getSpaceClasses, resolveButtonClasses } from '@expcat/tigercat-core'

export interface CopyButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onCopy'
> {
  text: string
  onCopy?: (ok: boolean) => void
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  onCopy,
  children,
  disabled,
  onClick,
  className,
  ...rest
}) => {
  const [failed, setFailed] = useState(false)
  const [status, setStatus] = useState('')

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    onClick?.(event)
    if (disabled || event.defaultPrevented) return
    const button = event.currentTarget
    const ok = await copyTextToClipboard(text)
    setFailed(!ok)
    setStatus(ok ? 'Copied' : 'Copy failed')
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
        aria-invalid={failed ? true : undefined}
        onClick={handleClick}>
        {children ?? 'Copy'}
      </button>
      {status ? <span role="status">{status}</span> : null}
    </span>
  )
}

export default CopyButton
