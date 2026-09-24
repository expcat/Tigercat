import { defineComponent, inject, provide, type InjectionKey } from 'vue'
import { createTooltipDelayGroup, type TooltipDelayGroup } from '@expcat/tigercat-core'

export const tooltipDelayKey: InjectionKey<TooltipDelayGroup> = Symbol('tiger-tooltip-delay')

export function useTooltipDelayGroup(): TooltipDelayGroup | null {
  return inject(tooltipDelayKey, null)
}

export const TooltipDelayProvider = defineComponent({
  name: 'TigerTooltipDelayProvider',
  setup(_, { slots }) {
    provide(tooltipDelayKey, createTooltipDelayGroup())
    return () => slots.default?.()
  }
})
