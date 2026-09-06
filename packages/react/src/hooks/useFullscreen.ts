import { useCallback, useEffect, useRef, useState } from 'react'
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
  isFullscreen: boolean
  supported: boolean
  enter: () => Promise<void>
  exit: () => Promise<void>
  toggle: () => Promise<void>
}

export function useFullscreen(options: UseFullscreenOptions = {}): UseFullscreenReturn {
  const optionsRef = useRef(options)
  optionsRef.current = options
  const [supported] = useState(() => isFullscreenSupported())
  const [isFullscreen, setIsFullscreen] = useState(false)

  const sync = useCallback(() => {
    const target = resolveFullscreenTarget(optionsRef.current.target)
    const next = isElementFullscreen(target)
    setIsFullscreen(next)
    optionsRef.current.onChange?.(next)
  }, [])

  useEffect(() => {
    sync()
    return subscribeFullscreenChange(sync)
  }, [sync])

  const enter = useCallback(async () => {
    const target = resolveFullscreenTarget(optionsRef.current.target)
    if (!target) return
    if (isElementFullscreen(target)) return
    try {
      await requestElementFullscreen(target)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Fullscreen request failed')
      optionsRef.current.onError?.(err)
    }
  }, [])

  const exit = useCallback(async () => {
    if (!getFullscreenElement()) return
    try {
      await exitElementFullscreen()
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Fullscreen exit failed')
      optionsRef.current.onError?.(err)
    }
  }, [])

  const toggle = useCallback(async () => {
    if (isFullscreen) await exit()
    else await enter()
  }, [enter, exit, isFullscreen])

  return { isFullscreen, supported, enter, exit, toggle }
}
