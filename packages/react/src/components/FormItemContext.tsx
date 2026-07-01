import React, { createContext, useContext } from 'react'
import type { InputStatus } from '@expcat/tigercat-core'

export interface FormItemControlContextValue {
  status?: InputStatus
  errorMessage?: string
  shakeTrigger?: number
}

const FormItemControlContext = createContext<FormItemControlContextValue | null>(null)

export const FormItemControlProvider = FormItemControlContext.Provider

export function useFormItemControlContext(): FormItemControlContextValue | null {
  return useContext(FormItemControlContext)
}
