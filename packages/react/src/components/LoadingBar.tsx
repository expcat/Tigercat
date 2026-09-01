import React, { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import {
  createImperativeHost,
  createLoadingBarController,
  isBrowser,
  type LoadingBarApi,
  type LoadingBarOptions,
  type LoadingBarRuntimeState
} from '@expcat/tigercat-core'
import { LoadingBarContainer } from './LoadingBarContainer'

export { LoadingBarContainer } from './LoadingBarContainer'
export type { LoadingBarContainerProps } from './LoadingBarContainer'

let controller: ReturnType<typeof createLoadingBarController> | null = null

function getController(): ReturnType<typeof createLoadingBarController> {
  if (!controller) {
    controller = createLoadingBarController()
    controller.subscribe(() => {
      if (controller?.getState().visible) return
      host.teardown()
    })
  }
  return controller
}

const host = createImperativeHost<Root>({
  mount(element) {
    const root = createRoot(element)
    flushSync(() => {
      root.render(<LoadingBarHost />)
    })
    return root
  },
  unmount(root) {
    root.unmount()
  }
})

function subscribeLoadingBar(onStoreChange: () => void): () => void {
  return getController().subscribe(onStoreChange)
}

function getLoadingBarSnapshot(): LoadingBarRuntimeState {
  return getController().getState()
}

function LoadingBarHost() {
  const state = useSyncExternalStore(
    subscribeLoadingBar,
    getLoadingBarSnapshot,
    getLoadingBarSnapshot
  )

  if (!state.visible) return null

  return (
    <LoadingBarContainer
      percentage={state.percentage}
      status={state.status}
      color={state.color}
      height={state.height}
      className={state.className}
      style={state.style}
      ariaLabel={state.ariaLabel}
    />
  )
}

function syncHost(container?: string | HTMLElement): void {
  if (!isBrowser()) return
  if (!getController().getState().visible) return
  host.ensure(container)
}

export const LoadingBar: LoadingBarApi = {
  start(options?: LoadingBarOptions): void {
    if (!isBrowser()) return
    getController().start(options)
    syncHost(options?.container ?? getController().getState().container)
  },
  set(percentage: number): void {
    if (!isBrowser()) return
    getController().set(percentage)
    syncHost(getController().getState().container)
  },
  inc(delta?: number): void {
    if (!isBrowser()) return
    getController().inc(delta)
    syncHost(getController().getState().container)
  },
  finish(): void {
    if (!isBrowser()) return
    getController().finish()
    if (getController().getState().visible) {
      syncHost(getController().getState().container)
    }
  },
  error(): void {
    if (!isBrowser()) return
    getController().error()
    if (getController().getState().visible) {
      syncHost(getController().getState().container)
    }
  },
  clear(): void {
    if (!isBrowser()) return
    getController().clear()
    host.teardown()
  }
}

export default LoadingBar
