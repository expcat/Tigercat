import React, { useState } from 'react'
import { copyTextToClipboard } from '@expcat/tigercat-core'

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
    <span data-tiger-copy="">
      <button
        type="button"
        {...rest}
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
