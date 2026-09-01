/**
 * Chart interaction: hover, tooltip tracking, click, and select.
 * Vue/React hooks bind controlled sources and event names onto these rules.
 */

export interface ChartInteractionState {
  hoveredIndex: number | null
  selectedIndex: number | null
}

export interface ChartInteractionHandlers<T = unknown> {
  onMouseEnter: (index: number, datum: T | undefined, position?: ChartTooltipPosition) => void
  onMouseLeave: () => void
  onClick: (index: number, datum: T | undefined) => void
  onKeyDown: (
    event: { key: string; preventDefault: () => void },
    index: number,
    datum: T | undefined,
    position?: ChartTooltipPosition
  ) => void
}

export type ChartFrameCallback = (timestamp: number) => void

export type ChartFrameRequest = (callback: ChartFrameCallback) => number

export type ChartFrameCancel = (handle: number) => void

export interface ChartTooltipPosition {
  x: number
  y: number
}

export interface ChartPointerMoveSchedulerOptions {
  onPositionChange: (position: ChartTooltipPosition) => void
  requestFrame?: ChartFrameRequest
  cancelFrame?: ChartFrameCancel
}

export interface ChartPointerMoveScheduler {
  schedule: (position: ChartTooltipPosition) => void
  flush: () => void
  cancel: () => void
  isPending: () => boolean
}

export interface ChartInteractionOptions<T = unknown> {
  hoverable?: boolean
  showTooltip?: boolean
  selectable?: boolean
  hoveredIndex?: number | null
  selectedIndex?: number | null
  onHoverChange?: (index: number | null, datum: T | null) => void
  onSelectChange?: (index: number | null, datum: T | null) => void
  onItemClick?: (index: number, datum: T | undefined) => void
}

export function resolveChartIndex(
  controlled: number | null | undefined,
  local: number | null
): number | null {
  return controlled !== undefined ? controlled : local
}

export function resolveChartActiveIndex(
  selectedIndex: number | null,
  hoveredIndex: number | null,
  hoverable: boolean
): number | null {
  if (selectedIndex !== null) return selectedIndex
  if (hoverable && hoveredIndex !== null) return hoveredIndex
  return null
}

export function shouldTrackChartPointer(hoverable: boolean, showTooltip: boolean): boolean {
  return hoverable || showTooltip
}

export function nextChartSelectedIndex(current: number | null, clicked: number): number | null {
  return current === clicked ? null : clicked
}

export function isChartActivationKey(key: string): boolean {
  return key === 'Enter' || key === ' '
}

export function isChartNavigationKey(key: string): boolean {
  return key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown'
}

export function tooltipPositionFromEvent(event: {
  clientX?: number
  clientY?: number
  currentTarget?: EventTarget | null
}): ChartTooltipPosition {
  if (typeof event.clientX === 'number' && Number.isFinite(event.clientX)) {
    return { x: event.clientX, y: event.clientY ?? 0 }
  }
  const target = event.currentTarget
  if (target instanceof Element) {
    const rect = target.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }
  return { x: 0, y: 0 }
}

export function createChartInteractionHandlers<T>(
  data: T[],
  state: ChartInteractionState,
  options: ChartInteractionOptions<T>
): ChartInteractionHandlers<T> {
  const hoverable = Boolean(options.hoverable)
  const showTooltip = options.showTooltip !== false
  const selectable = Boolean(options.selectable)

  const resolveDatum = (index: number, datum: T | undefined): T | undefined => {
    return datum !== undefined ? datum : data[index]
  }

  const applyHover = (index: number | null, datum: T | null) => {
    if (options.hoveredIndex !== undefined) {
      options.onHoverChange?.(index, datum)
      return
    }
    state.hoveredIndex = index
    options.onHoverChange?.(index, datum)
  }

  const handleMouseEnter = (
    index: number,
    datum: T | undefined,
    _position?: ChartTooltipPosition
  ) => {
    if (!shouldTrackChartPointer(hoverable, showTooltip)) return
    const resolved = resolveDatum(index, datum)
    if (!hoverable) {
      if (options.hoveredIndex === undefined) state.hoveredIndex = index
      return
    }
    applyHover(index, resolved ?? null)
  }

  const handleMouseLeave = () => {
    if (!shouldTrackChartPointer(hoverable, showTooltip)) return
    if (!hoverable) {
      if (options.hoveredIndex === undefined) state.hoveredIndex = null
      return
    }
    applyHover(null, null)
  }

  const handleClick = (index: number, datum: T | undefined) => {
    const resolved = resolveDatum(index, datum)
    options.onItemClick?.(index, resolved)
    if (!selectable) return

    const nextIndex = nextChartSelectedIndex(state.selectedIndex, index)
    const nextDatum = nextIndex !== null ? (data[nextIndex] ?? null) : null

    if (options.selectedIndex !== undefined) {
      options.onSelectChange?.(nextIndex, nextDatum)
      return
    }
    state.selectedIndex = nextIndex
    options.onSelectChange?.(nextIndex, nextDatum)
  }

  const handleKeyDown = (
    event: { key: string; preventDefault: () => void },
    index: number,
    datum: T | undefined,
    position?: ChartTooltipPosition
  ) => {
    if (!isChartActivationKey(event.key)) return
    event.preventDefault()
    if (shouldTrackChartPointer(hoverable, showTooltip)) {
      handleMouseEnter(index, datum, position)
    }
    handleClick(index, datum)
  }

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick: handleClick,
    onKeyDown: handleKeyDown
  }
}

/**
 * Opacity for a mark given the resolved active index.
 */
export function getChartElementOpacity(
  index: number,
  activeIndex: number | null,
  options: {
    activeOpacity?: number
    inactiveOpacity?: number
    defaultOpacity?: number
  } = {}
): number | undefined {
  const { activeOpacity = 1, inactiveOpacity = 0.25, defaultOpacity } = options

  if (activeIndex === null) {
    return defaultOpacity
  }

  return index === activeIndex ? activeOpacity : inactiveOpacity
}

function requestDefaultFrame(callback: ChartFrameCallback): number {
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

export function createChartPointerMoveScheduler(
  options: ChartPointerMoveSchedulerOptions
): ChartPointerMoveScheduler {
  const requestFrame = options.requestFrame ?? requestDefaultFrame
  const cancelFrame = options.cancelFrame ?? cancelDefaultFrame
  let frameHandle: number | undefined
  let pendingPosition: ChartTooltipPosition | undefined

  function applyPending(): void {
    frameHandle = undefined
    if (!pendingPosition) return

    const nextPosition = pendingPosition
    pendingPosition = undefined
    options.onPositionChange(nextPosition)
  }

  function cancel(): void {
    if (frameHandle !== undefined) {
      cancelFrame(frameHandle)
      frameHandle = undefined
    }

    pendingPosition = undefined
  }

  function flush(): void {
    if (frameHandle !== undefined) {
      cancelFrame(frameHandle)
    }

    applyPending()
  }

  function schedule(position: ChartTooltipPosition): void {
    pendingPosition = position
    if (frameHandle !== undefined) return

    frameHandle = requestFrame(applyPending)
  }

  return {
    schedule,
    flush,
    cancel,
    isPending: () => frameHandle !== undefined
  }
}
