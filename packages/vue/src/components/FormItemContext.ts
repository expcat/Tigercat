import type { ComputedRef, InjectionKey } from 'vue'
import type { InputStatus } from '@expcat/tigercat-core'

export interface VueFormItemControlContext {
  id: ComputedRef<string | undefined>
  labelId: ComputedRef<string | undefined>
  name: ComputedRef<string | undefined>
  status: ComputedRef<InputStatus | undefined>
  /** @deprecated FormItem is the only error surface; always undefined. */
  errorMessage: ComputedRef<string | undefined>
  shakeTrigger: ComputedRef<number | undefined>
  disabled: ComputedRef<boolean>
  describedBy: ComputedRef<string | undefined>
  required: ComputedRef<boolean>
  value: ComputedRef<unknown>
  onChange: (value: unknown) => void
  onBlur: () => void
}

export const FORM_ITEM_CONTROL_INJECTION_KEY: InjectionKey<VueFormItemControlContext> =
  Symbol('TigerFormItemControl')
