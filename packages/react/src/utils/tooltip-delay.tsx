import React, { createContext, useContext, useMemo } from 'react'
import { createTooltipDelayGroup, type TooltipDelayGroup } from '@expcat/tigercat-core'

const TooltipDelayContext = createContext<TooltipDelayGroup | null>(null)

export function useTooltipDelayGroup(): TooltipDelayGroup | null {
  return useContext(TooltipDelayContext)
}

export function TooltipDelayProvider({ children }: { children?: React.ReactNode }) {
  const group = useMemo(() => createTooltipDelayGroup(), [])
  return <TooltipDelayContext.Provider value={group}>{children}</TooltipDelayContext.Provider>
}
