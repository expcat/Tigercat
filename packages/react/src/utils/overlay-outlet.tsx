/**
 * Renders open layers after the provider's children so server HTML and the
 * hydrated tree share one mount point.
 */
import React, { useContext, useEffect, useId, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { createRenderOutlet, isBrowser, type RenderOutlet } from '@expcat/tigercat-core'
import { renderOverlayPortal } from './overlay'

const OverlayOutletContext = React.createContext<RenderOutlet<React.ReactNode> | null>(null)

export function OverlayOutletProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<RenderOutlet<React.ReactNode> | null>(null)
  if (storeRef.current === null) storeRef.current = createRenderOutlet<React.ReactNode>()
  const store = storeRef.current
  return (
    <OverlayOutletContext.Provider value={store}>
      {children}
      <OverlayOutletSlot store={store} />
    </OverlayOutletContext.Provider>
  )
}

function OverlayOutletSlot({ store }: { store: RenderOutlet<React.ReactNode> }) {
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
  return (
    <div className="contents" data-tiger-overlay-root="" data-tiger-overlay-host="">
      {items.map((item) => (
        <React.Fragment key={item.id}>{item.node}</React.Fragment>
      ))}
    </div>
  )
}

/** Place `children` in the nearest outlet. Without one, render them in place. */
export function OverlayPortal({
  children,
  disabled = false,
  target = null
}: {
  children: React.ReactNode
  disabled?: boolean
  /** DOM portal target used when this tree has no ConfigProvider outlet. */
  target?: HTMLElement | null
}) {
  const outlet = useContext(OverlayOutletContext)
  const id = useId()
  useEffect(() => {
    if (disabled || !outlet) return
    return () => outlet.remove(id)
  }, [disabled, outlet, id])

  if (outlet && !disabled) {
    outlet.upsert(id, children)
    return null
  }
  if (!disabled && isBrowser() && !target) return createPortal(children, document.body)
  return <>{renderOverlayPortal(children, target, disabled)}</>
}
