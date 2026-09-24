import React, { useState } from 'react'
import { toggleInplace } from '@expcat/tigercat-core'

export interface InplaceProps {
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
  children
}) => {
  const [unmanaged, setUnmanaged] = useState(defaultEditing)
  const isControlled = editing !== undefined
  const isEditing = isControlled ? Boolean(editing) : unmanaged

  function publish(action: 'edit' | 'commit' | 'cancel'): void {
    const state = toggleInplace({ editing: isEditing }, action)
    if (!isControlled) setUnmanaged(state.editing)
    onEditingChange?.(state.editing)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLSpanElement>): void {
    if (event.key === 'Enter') {
      event.preventDefault()
      publish('commit')
    } else if (event.key === 'Escape') {
      event.preventDefault()
      publish('cancel')
    }
  }

  return (
    <span data-tiger-inplace="" data-editing={isEditing ? 'true' : 'false'}>
      {isEditing ? (
        <span onKeyDown={onKeyDown}>{input ?? children}</span>
      ) : (
        <button type="button" disabled={disabled} onClick={() => !disabled && publish('edit')}>
          {display ?? children}
        </button>
      )}
    </span>
  )
}

export default Inplace
