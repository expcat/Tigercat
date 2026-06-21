import { createContext, useContext } from 'react'
import type { MenuContextValue } from './types'

// Create menu context
export const MenuContext = createContext<MenuContextValue | null>(null)

// Hook to use menu context
export function useMenuContext(): MenuContextValue | null {
  return useContext(MenuContext)
}
