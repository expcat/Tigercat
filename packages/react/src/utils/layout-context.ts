import { createContext, useContext } from 'react'

export interface LayoutContextValue {
  nested: boolean
  hasSider: boolean
  siderCollapsed: boolean
  setSiderCollapsed: (collapsed: boolean) => void
  contentEl: HTMLElement | null
  setContentEl: (el: HTMLElement | null) => void
}

export const LayoutContext = createContext<LayoutContextValue | null>(null)

export function useLayoutContext(): LayoutContextValue | null {
  return useContext(LayoutContext)
}

export interface SidebarContextValue {
  collapsed: boolean
}

export const SidebarContext = createContext<SidebarContextValue | null>(null)

export function useSidebarContext(): SidebarContextValue | null {
  return useContext(SidebarContext)
}
