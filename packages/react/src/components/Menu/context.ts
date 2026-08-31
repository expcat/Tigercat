import { createContext, useContext } from 'react'
import { devWarn } from '@expcat/tigercat-core'
import type { MenuContextValue, SubMenuScopeValue } from './types'

export const MenuContext = createContext<MenuContextValue | null>(null)
export const SubMenuScopeContext = createContext<SubMenuScopeValue | null>(null)

export function useMenuContext(): MenuContextValue | null {
  return useContext(MenuContext)
}

export function useSubMenuScope(): SubMenuScopeValue | null {
  return useContext(SubMenuScopeContext)
}

export function warnMissingMenuContext(component: 'MenuItem' | 'SubMenu'): void {
  devWarn(`Menu.${component}.context`, `${component} must be used within Menu component`)
}
