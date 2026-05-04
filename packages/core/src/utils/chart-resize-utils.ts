export interface ChartCanvasSize {
  width: number
  height: number
}

export type ChartResizeFrameCallback = (timestamp: number) => void

export type ChartResizeFrameRequest = (callback: ChartResizeFrameCallback) => number

export type ChartResizeFrameCancel = (handle: number) => void

export interface ChartResizeObserverLike {
  observe: (target: Element) => void
  disconnect: () => void
}

export type ChartResizeObserverFactory = (
  callback: ResizeObserverCallback
) => ChartResizeObserverLike

export interface ChartResizeObserverControllerOptions {
  onSizeChange: (size: ChartCanvasSize) => void
  requestFrame?: ChartResizeFrameRequest
  cancelFrame?: ChartResizeFrameCancel
  createResizeObserver?: ChartResizeObserverFactory
}

export interface ChartResizeObserverController {
  observe: (target: Element) => void
  disconnect: () => void
  flush: () => void
  isPending: () => boolean
}

function requestDefaultFrame(callback: ChartResizeFrameCallback): number {
  if (globalThis.requestAnimationFrame) {
    return globalThis.requestAnimationFrame(callback)
  }

  return globalThis.setTimeout(() => callback(globalThis.performance?.now?.() ?? Date.now()), 16)
}

function cancelDefaultFrame(handle: number): void {
  if (globalThis.cancelAnimationFrame) {
    globalThis.cancelAnimationFrame(handle)
    return
  }

  globalThis.clearTimeout(handle)
}

function getEntrySize(entry: ResizeObserverEntry): ChartCanvasSize {
  const boxSize = Array.isArray(entry.contentBoxSize)
    ? entry.contentBoxSize[0]
    : entry.contentBoxSize

  if (boxSize) {
    return {
      width: boxSize.inlineSize,
      height: boxSize.blockSize
    }
  }

  return {
    width: entry.contentRect.width,
    height: entry.contentRect.height
  }
}

function createDefaultResizeObserver(callback: ResizeObserverCallback): ChartResizeObserverLike {
  return new ResizeObserver(callback)
}

export function resolveResponsiveChartSize(
  fallback: ChartCanvasSize,
  observedSize: ChartCanvasSize | null | undefined
): ChartCanvasSize {
  return {
    width: observedSize && observedSize.width > 0 ? observedSize.width : fallback.width,
    height: observedSize && observedSize.height > 0 ? observedSize.height : fallback.height
  }
}

export function createChartResizeObserverController(
  options: ChartResizeObserverControllerOptions
): ChartResizeObserverController {
  const requestFrame = options.requestFrame ?? requestDefaultFrame
  const cancelFrame = options.cancelFrame ?? cancelDefaultFrame
  const createResizeObserver = options.createResizeObserver ?? createDefaultResizeObserver

  let observer: ChartResizeObserverLike | undefined
  let observedTarget: Element | undefined
  let frameHandle: number | undefined
  let pendingSize: ChartCanvasSize | undefined

  function applyPending(): void {
    frameHandle = undefined
    if (!pendingSize) return

    const nextSize = pendingSize
    pendingSize = undefined
    options.onSizeChange(nextSize)
  }

  function schedule(size: ChartCanvasSize): void {
    pendingSize = size
    if (frameHandle !== undefined) return

    frameHandle = requestFrame(applyPending)
  }

  function disconnect(): void {
    observer?.disconnect()
    observer = undefined
    observedTarget = undefined

    if (frameHandle !== undefined) {
      cancelFrame(frameHandle)
      frameHandle = undefined
    }

    pendingSize = undefined
  }

  function observe(target: Element): void {
    if (target === observedTarget && observer) return

    disconnect()
    observedTarget = target
    observer = createResizeObserver((entries) => {
      const entry = entries.find((item) => item.target === target)
      if (!entry) return

      schedule(getEntrySize(entry))
    })
    observer.observe(target)
  }

  function flush(): void {
    if (frameHandle !== undefined) {
      cancelFrame(frameHandle)
    }

    applyPending()
  }

  return {
    observe,
    disconnect,
    flush,
    isPending: () => frameHandle !== undefined
  }
}
