import { createApp, defineComponent, h, ref, type App } from 'vue'
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
export type { VueLoadingBarContainerProps } from './LoadingBarContainer'

export type VueLoadingBarProps = LoadingBarOptions

let containerApp: App<Element> | null = null
let controller: ReturnType<typeof createLoadingBarController> | null = null
const barState = ref<LoadingBarRuntimeState | null>(null)

function getDefaultAriaLabel(): string | undefined {
  return getGlobalTigerLocale()?.common?.loadingText
}

function getController(): ReturnType<typeof createLoadingBarController> {
  if (!controller) {
    controller = createLoadingBarController()
    controller.subscribe(() => {
      barState.value = controller?.getState() ?? null
    })
  }
  return controller
}

const LoadingBarHost = /* @__PURE__ */ defineComponent({
  name: 'TigerLoadingBarHost',
  setup() {
    return () => {
      const state = barState.value
      if (!state?.visible) return null
      return h(LoadingBarContainer, {
        percentage: state.percentage,
        status: state.status,
        color: state.color,
        height: state.height,
        className: state.className,
        style: state.style,
        ariaLabel: state.ariaLabel
      })
    }
  }
})

function ensureContainer(container?: string | HTMLElement) {
  if (!isBrowser()) {
    return
  }

  const existingRootEl = document.getElementById(LOADING_BAR_CONTAINER_ROOT_ID)

  if (containerApp && !existingRootEl) {
    containerApp = null
  }

  if (containerApp) {
    return
  }

  let rootEl = existingRootEl
  if (!rootEl) {
    rootEl = document.createElement('div')
    rootEl.id = LOADING_BAR_CONTAINER_ROOT_ID
    const mountTarget = resolveLoadingBarMountTarget(container) ?? document.body
    mountTarget.appendChild(rootEl)
  }

  containerApp = createApp(LoadingBarHost)
  containerApp.mount(rootEl)
}

function teardownContainer() {
  if (containerApp) {
    containerApp.unmount()
    containerApp = null
  }
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
    getController().start(resolved)
    ensureContainer(resolved?.container)
  },
  finish(): void {
    getController().finish()
    if (getController().getState().visible) {
      ensureContainer()
    }
  },
  error(): void {
    getController().error()
    ensureContainer()
  },
  clear(): void {
    getController().clear()
    teardownContainer()
  }
}

export default LoadingBar
