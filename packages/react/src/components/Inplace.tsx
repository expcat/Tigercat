import React, { useEffect, useRef, useState } from 'react'
import { resolveButtonClasses, toggleInplace } from '@expcat/tigercat-core'

const INPLACE_FOCUSABLE =
  'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), a[href], [contenteditable="true"], [tabindex]:not([tabindex="-1"])'

function focusInplaceEditor(container: HTMLElement | null): void {
  if (!container) return
  const target = container.querySelector<HTMLElement>(INPLACE_FOCUSABLE)
  if (target) {
    target.focus()
    return
  }
  container.focus()
}

export interface InplaceProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  editing?: boolean
  defaultEditing?: boolean
  onEditingChange?: (editing: boolean) => void
  disabled?: boolean
  display?: React.ReactNode
  input?: React.ReactNode
  children?: React.ReactNode
}

export const Inplace: React.FC<InplaceProps> = ({
  editing,
  defaultEditing = false,
  onEditingChange,
  disabled = false,
  display,
  input,
  children,
  ...rest
}) => {
  const [unmanaged, setUnmanaged] = useState(defaultEditing)
  const isControlled = editing !== undefined
  const isEditing = isControlled ? Boolean(editing) : unmanaged
  const inputRef = useRef<HTMLSpanElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const focusIntent = useRef<'edit' | 'display' | null>(null)

  function publish(action: 'edit' | 'commit' | 'cancel'): void {
    const state = toggleInplace({ editing: isEditing }, action)
    if (!isControlled) setUnmanaged(state.editing)
    onEditingChange?.(state.editing)
    focusIntent.current = state.editing ? 'edit' : 'display'
  }

  useEffect(() => {
    const intent = focusIntent.current
    if (!intent) return
    focusIntent.current = null
    if (intent === 'edit') focusInplaceEditor(inputRef.current)
    else buttonRef.current?.focus()
  }, [isEditing])

  function onKeyDown(event: React.KeyboardEvent<HTMLSpanElement>): void {
    if (event.nativeEvent.isComposing || event.defaultPrevented) return
    if (event.key === 'Enter') {
      event.preventDefault()
      publish('commit')
    } else if (event.key === 'Escape') {
      event.preventDefault()
      publish('cancel')
    }
  }

  return (
    <span {...rest} data-tiger-inplace="" data-editing={isEditing ? 'true' : 'false'}>
      {isEditing ? (
        <span ref={inputRef} tabIndex={-1} onKeyDown={onKeyDown}>
          {input ?? children}
        </span>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          className={resolveButtonClasses({ variant: 'ghost', size: 'sm', disabled })}
          disabled={disabled}
          onClick={() => !disabled && publish('edit')}>
          {display ?? children}
        </button>
      )}
    </span>
  )
}

export default Inplace
