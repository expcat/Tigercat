import type { ComputedRef, InjectionKey } from 'vue'

export interface LayoutContextValue {
  nested: ComputedRef<boolean>
  hasSider: ComputedRef<boolean>
  fullHeight: ComputedRef<boolean>
  namedSidebarClaimed: ComputedRef<boolean>
}

export const LayoutContextKey: InjectionKey<LayoutContextValue> = Symbol('TigerLayout')

export interface SidebarContextValue {
  collapsed: ComputedRef<boolean>
}

export const SidebarContextKey: InjectionKey<SidebarContextValue> = Symbol('TigerSidebar')
