import React, { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import {
  createLoadingBarController,
  isBrowser,
  LOADING_BAR_CONTAINER_ROOT_ID,
  resolveLoadingBarMountTarget,
  type LoadingBarApi,
  type LoadingBarOptions,
  type LoadingBarRuntimeState
} from '@expcat/tigercat-core'
import { LoadingBarContainer } from './LoadingBarContainer'
import { getGlobalTigerLocale } from '../utils/global-locale'

export { LoadingBarContainer } from './LoadingBarContainer'
export type { LoadingBarContainerProps } from './LoadingBarContainer'

export type LoadingBarProps = LoadingBarOptions

let containerRoot: Root | null = null
let updateCallback: (() => void) | null = null
let controller: ReturnType<typeof createLoadingBarController> | null = null

function getDefaultAriaLabel(): string | undefined {
  return getGlobalTigerLocale()?.common?.loadingText
}

function getController(): ReturnType<typeof createLoadingBarController> {
  if (!controller) {
    controller = createLoadingBarController()
    controller.subscribe(() => {
      updateCallback?.()
    })
  }
  return controller
}

const LoadingBarHost: React.FC = () => {
  const [state, setState] = useState<LoadingBarRuntimeState>(() => getController().getState())

  useEffect(() => {
    updateCallback = () => {
      setState(getController().getState())
    }
    setState(getController().getState())

    return () => {
      updateCallback = null
    }
  }, [])

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

function ensureContainer(container?: string | HTMLElement) {
  if (!isBrowser()) {
    return
  }

  const existingRootEl = document.getElementById(LOADING_BAR_CONTAINER_ROOT_ID)

  if (containerRoot && !existingRootEl) {
    containerRoot = null
    updateCallback = null
  }

  if (containerRoot) {
    return
  }

  let rootEl = existingRootEl
  if (!rootEl) {
    rootEl = document.createElement('div')
    rootEl.id = LOADING_BAR_CONTAINER_ROOT_ID
    const mountTarget = resolveLoadingBarMountTarget(container) ?? document.body
    mountTarget.appendChild(rootEl)
  }

  containerRoot = createRoot(rootEl)
  flushSync(() => {
    containerRoot?.render(<LoadingBarHost />)
  })
}

function teardownContainer() {
  if (containerRoot) {
    containerRoot.unmount()
    containerRoot = null
  }
  updateCallback = null

  if (isBrowser()) {
    const rootEl = document.getElementById(LOADING_BAR_CONTAINER_ROOT_ID)
    if (rootEl?.parentNode) {
      rootEl.parentNode.removeChild(rootEl)
    }
  }
}

function withAriaLabel(options?: LoadingBarOptions): LoadingBarOptions | undefined {
  if (options?.ariaLabel) return options
  const localeLabel = getDefaultAriaLabel()
  if (!localeLabel && !options) return options
  return { ...options, ariaLabel: options?.ariaLabel ?? localeLabel }
}

export const LoadingBar: LoadingBarApi = {
  start(options?: LoadingBarOptions): void {
    const resolved = withAriaLabel(options)
    const shouldUpdateExistingContainer =
      isBrowser() &&
      containerRoot !== null &&
      document.getElementById(LOADING_BAR_CONTAINER_ROOT_ID) !== null

    getController().start(resolved)
    ensureContainer(resolved?.container)

    if (shouldUpdateExistingContainer && updateCallback) {
      updateCallback()
    }
  },
  finish(): void {
    getController().finish()
    if (updateCallback) {
      updateCallback()
    } else if (getController().getState().visible) {
      ensureContainer()
    }
  },
  error(): void {
    getController().error()
    if (updateCallback) {
      updateCallback()
    } else {
      ensureContainer()
    }
  },
  clear(): void {
    getController().clear()
    teardownContainer()
  }
}

export default LoadingBar
