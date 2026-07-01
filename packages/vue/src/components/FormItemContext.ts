import type { ComputedRef, InjectionKey } from 'vue'
import type { InputStatus } from '@expcat/tigercat-core'

export interface VueFormItemControlContext {
  status: ComputedRef<InputStatus | undefined>
  errorMessage: ComputedRef<string | undefined>
  shakeTrigger: ComputedRef<number | undefined>
}

export const FORM_ITEM_CONTROL_INJECTION_KEY: InjectionKey<VueFormItemControlContext> =
  Symbol('TigerFormItemControl')
