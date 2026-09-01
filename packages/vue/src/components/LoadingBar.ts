import { createApp, defineComponent, h, onBeforeUnmount, shallowRef, type App } from 'vue'
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
export type { VueLoadingBarContainerProps } from './LoadingBarContainer'

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

const host = createImperativeHost<App<Element>>({
  mount(element) {
    const app = createApp(LoadingBarHost)
    app.mount(element)
    return app
  },
  unmount(app) {
    app.unmount()
  }
})

const LoadingBarHost = /* @__PURE__ */ defineComponent({
  name: 'TigerLoadingBarHost',
  setup() {
    const state = shallowRef<LoadingBarRuntimeState>(getController().getState())
    const stop = getController().subscribe(() => {
      state.value = getController().getState()
    })
    onBeforeUnmount(stop)

    return () => {
      const current = state.value
      if (!current.visible) return null
      return h(LoadingBarContainer, {
        percentage: current.percentage,
        status: current.status,
        color: current.color,
        height: current.height,
        className: current.className,
        style: current.style,
        ariaLabel: current.ariaLabel
      })
    }
  }
})

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
