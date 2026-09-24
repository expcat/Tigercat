import { createContext, useContext } from 'react'

export interface LayoutContextValue {
  nested: boolean
  hasSider: boolean
  fullHeight: boolean
  /** A default sidebar name was already used in this shell or an ancestor. */
  namedSidebarClaimed: boolean
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
