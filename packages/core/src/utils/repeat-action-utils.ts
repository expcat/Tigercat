export type RepeatAction = () => void

export type RepeatFrameCallback = (timestamp: number) => void

export type RepeatFrameRequest = (callback: RepeatFrameCallback) => number

export type RepeatFrameCancel = (handle: number) => void

export interface RafRepeatActionOptions {
  initialDelay?: number
  interval?: number
  now?: () => number
  requestFrame?: RepeatFrameRequest
  cancelFrame?: RepeatFrameCancel
}

export interface RafRepeatActionController {
  start: (action: RepeatAction) => void
  stop: () => void
  isRunning: () => boolean
}

export const defaultRepeatInitialDelay = 350
export const defaultRepeatInterval = 80

function readNow(): number {
  return globalThis.performance?.now?.() ?? Date.now()
}

function requestDefaultFrame(callback: RepeatFrameCallback): number {
  if (globalThis.requestAnimationFrame) {
    return globalThis.requestAnimationFrame(callback)
  }

  return globalThis.setTimeout(() => callback(readNow()), 16)
}

function cancelDefaultFrame(handle: number): void {
  if (globalThis.cancelAnimationFrame) {
    globalThis.cancelAnimationFrame(handle)
    return
  }

  globalThis.clearTimeout(handle)
}

export function createRafRepeatActionController(
  options: RafRepeatActionOptions = {}
): RafRepeatActionController {
  const initialDelay = Math.max(0, options.initialDelay ?? defaultRepeatInitialDelay)
  const interval = Math.max(1, options.interval ?? defaultRepeatInterval)
  const now = options.now ?? readNow
  const requestFrame = options.requestFrame ?? requestDefaultFrame
  const cancelFrame = options.cancelFrame ?? cancelDefaultFrame

  let frameHandle: number | undefined
  let repeatAction: RepeatAction | undefined
  let running = false
  let startedAt = 0
  let lastActionAt = 0

  function stop(): void {
    if (frameHandle !== undefined) {
      cancelFrame(frameHandle)
      frameHandle = undefined
    }

    repeatAction = undefined
    running = false
  }

  function tick(timestamp: number): void {
    if (!running || !repeatAction) return

    if (timestamp - startedAt >= initialDelay && timestamp - lastActionAt >= interval) {
      repeatAction()
      lastActionAt = timestamp
    }

    if (!running) return
    frameHandle = requestFrame(tick)
  }

  function start(action: RepeatAction): void {
    stop()

    repeatAction = action
    running = true
    startedAt = now()
    lastActionAt = startedAt
    action()

    if (running) {
      frameHandle = requestFrame(tick)
    }
  }

  return {
    start,
    stop,
    isRunning: () => running
  }
}
