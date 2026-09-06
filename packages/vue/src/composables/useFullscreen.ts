import {
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref,
  toValue,
  type MaybeRefOrGetter
} from 'vue'
import {
  exitElementFullscreen,
  getFullscreenElement,
  isElementFullscreen,
  isFullscreenSupported,
  requestElementFullscreen,
  resolveFullscreenTarget,
  subscribeFullscreenChange,
  type UseFullscreenOptions
} from '@expcat/tigercat-core'

export type { UseFullscreenOptions }

export interface UseFullscreenReturn {
  isFullscreen: ReturnType<typeof ref<boolean>>
  supported: boolean
  enter: () => Promise<void>
  exit: () => Promise<void>
  toggle: () => Promise<void>
}

export function useFullscreen(
  options: MaybeRefOrGetter<UseFullscreenOptions> = {}
): UseFullscreenReturn {
  const getOptions = (): UseFullscreenOptions => toValue(options)
  const supported = isFullscreenSupported()
  const isFullscreen = ref(false)
  let stop: (() => void) | undefined

  const sync = () => {
    const current = getOptions()
    const target = resolveFullscreenTarget(current.target)
    const next = isElementFullscreen(target)
    isFullscreen.value = next
    current.onChange?.(next)
  }

  const enter = async () => {
    const current = getOptions()
    const target = resolveFullscreenTarget(current.target)
    if (!target) return
    if (isElementFullscreen(target)) return
    try {
      await requestElementFullscreen(target)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Fullscreen request failed')
      current.onError?.(err)
    }
  }

  const exit = async () => {
    if (!getFullscreenElement()) return
    const current = getOptions()
    try {
      await exitElementFullscreen()
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Fullscreen exit failed')
      current.onError?.(err)
    }
  }

  const toggle = async () => {
    if (isFullscreen.value) await exit()
    else await enter()
  }

  if (getCurrentInstance()) {
    onMounted(() => {
      sync()
      stop = subscribeFullscreenChange(sync)
    })
    onBeforeUnmount(() => {
      stop?.()
    })
  }

  return {
    isFullscreen,
    supported,
    enter,
    exit,
    toggle
  }
}
