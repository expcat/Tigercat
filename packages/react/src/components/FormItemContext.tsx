import { createContext, useContext } from 'react'
import type { InputStatus } from '@expcat/tigercat-core'

export interface FormItemControlContextValue {
  id?: string
  name?: string
  status?: InputStatus
  /** @deprecated FormItem is the only error surface; always undefined. */
  errorMessage?: string
  shakeTrigger?: number
  disabled?: boolean
  describedBy?: string
  required?: boolean
  value?: unknown
  onChange?: (value: unknown) => void
  onBlur?: () => void
}

const FormItemControlContext = createContext<FormItemControlContextValue | null>(null)

export const FormItemControlProvider = FormItemControlContext.Provider

export function useFormItemControlContext(): FormItemControlContextValue | null {
  return useContext(FormItemControlContext)
}
