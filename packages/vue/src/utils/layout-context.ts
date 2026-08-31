import type { ComputedRef, InjectionKey, Ref } from 'vue'

export interface LayoutContextValue {
  nested: ComputedRef<boolean>
  hasSider: ComputedRef<boolean>
  siderCollapsed: Ref<boolean>
  setSiderCollapsed: (collapsed: boolean) => void
  contentEl: Ref<HTMLElement | null>
  setContentEl: (el: HTMLElement | null) => void
}

export const LayoutContextKey: InjectionKey<LayoutContextValue> = Symbol('TigerLayout')

export interface SidebarContextValue {
  collapsed: ComputedRef<boolean>
}

export const SidebarContextKey: InjectionKey<SidebarContextValue> = Symbol('TigerSidebar')
