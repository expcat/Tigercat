/**
 * Display versus editing. The component renders the input slot only while editing.
 */

export interface InplaceState {
  editing: boolean
}

export type InplaceActionType = 'edit' | 'commit' | 'cancel' | 'toggle'

export type InplaceAction = InplaceActionType | { type: InplaceActionType }

export function toggleInplace(state: InplaceState, action: InplaceAction): InplaceState {
  const type = typeof action === 'string' ? action : action.type
  if (type === 'edit') return { editing: true }
  if (type === 'commit' || type === 'cancel') return { editing: false }
  return { editing: !state.editing }
}
