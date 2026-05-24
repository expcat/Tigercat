/**
 * Shared touch gesture recognition utilities.
 */

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

export interface GesturePoint {
  x: number
  y: number
  time?: number
}

export interface SwipeGestureOptions {
  minDistance?: number
  minVelocity?: number
  maxCrossAxisRatio?: number
}

export interface SwipeGesture {
  direction: SwipeDirection
  distance: number
  velocity: number
  deltaX: number
  deltaY: number
  duration: number
}

export interface PanGestureOptions {
  minDistance?: number
}

export interface PanGesture {
  offsetX: number
  offsetY: number
  distance: number
  deltaX: number
  deltaY: number
}

export interface PinchGesture {
  scale: number
  distance: number
}

export interface LongPressGestureOptions {
  threshold?: number
}

export interface LongPressControllerOptions extends LongPressGestureOptions {
  onLongPress: () => void
  setTimer?: (callback: () => void, delay: number) => number
  clearTimer?: (handle: number) => void
}

export interface LongPressController {
  start: () => void
  cancel: () => void
  isPending: () => boolean
}

const DEFAULT_SWIPE_DISTANCE = 24
const DEFAULT_LONG_PRESS_THRESHOLD = 500

function getCurrentTime(): number {
  return globalThis.performance?.now?.() ?? Date.now()
}

function normalizePositiveNumber(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && (value ?? 0) > 0 ? (value as number) : fallback
}

export function getGestureTouchPoint(
  touches: ArrayLike<{ clientX: number; clientY: number }> | null | undefined,
  time: number = getCurrentTime()
): GesturePoint | null {
  if (!touches || touches.length === 0) return null

  const touch = touches[0]
  return {
    x: touch.clientX,
    y: touch.clientY,
    time
  }
}

export function getGestureTouchDistance(
  touches: ArrayLike<{ clientX: number; clientY: number }> | null | undefined
): number | null {
  if (!touches || touches.length < 2) return null

  const first = touches[0]
  const second = touches[1]
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY)
}

export function resolveSwipeGesture(
  startPoint: GesturePoint | null | undefined,
  endPoint: GesturePoint | null | undefined,
  options: SwipeGestureOptions = {}
): SwipeGesture | null {
  if (!startPoint || !endPoint) return null

  const deltaX = endPoint.x - startPoint.x
  const deltaY = endPoint.y - startPoint.y
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)
  const isHorizontal = absX >= absY
  const mainDistance = isHorizontal ? absX : absY
  const crossDistance = isHorizontal ? absY : absX
  const minDistance = normalizePositiveNumber(options.minDistance, DEFAULT_SWIPE_DISTANCE)
  const maxCrossAxisRatio = normalizePositiveNumber(options.maxCrossAxisRatio, 1)

  if (mainDistance < minDistance || crossDistance / mainDistance > maxCrossAxisRatio) {
    return null
  }

  const startTime = startPoint.time ?? 0
  const endTime = endPoint.time ?? startTime
  const duration = Math.max(1, endTime - startTime)
  const velocity = mainDistance / duration
  const minVelocity = options.minVelocity ?? 0

  if (velocity < minVelocity) return null

  const direction: SwipeDirection = isHorizontal
    ? deltaX < 0
      ? 'left'
      : 'right'
    : deltaY < 0
      ? 'up'
      : 'down'

  return {
    direction,
    distance: mainDistance,
    velocity,
    deltaX,
    deltaY,
    duration
  }
}

export function resolvePanGesture(
  startPoint: GesturePoint | null | undefined,
  currentPoint: GesturePoint | null | undefined,
  options: PanGestureOptions = {}
): PanGesture | null {
  if (!startPoint || !currentPoint) return null

  const deltaX = currentPoint.x - startPoint.x
  const deltaY = currentPoint.y - startPoint.y
  const distance = Math.hypot(deltaX, deltaY)
  const minDistance = options.minDistance ?? 0

  if (distance < minDistance) return null

  return {
    offsetX: deltaX,
    offsetY: deltaY,
    distance,
    deltaX,
    deltaY
  }
}

export function resolvePinchScale(
  startDistance: number | null | undefined,
  currentDistance: number | null | undefined
): PinchGesture | null {
  if (!startDistance || !currentDistance || startDistance <= 0 || currentDistance <= 0) {
    return null
  }

  return {
    scale: currentDistance / startDistance,
    distance: currentDistance
  }
}

export function isLongPress(
  startTime: number,
  endTime: number,
  options: LongPressGestureOptions = {}
): boolean {
  const threshold = normalizePositiveNumber(options.threshold, DEFAULT_LONG_PRESS_THRESHOLD)
  return endTime - startTime >= threshold
}

export function createLongPressController(
  options: LongPressControllerOptions
): LongPressController {
  const setTimer = options.setTimer ?? ((callback, delay) => globalThis.setTimeout(callback, delay))
  const clearTimer = options.clearTimer ?? ((handle) => globalThis.clearTimeout(handle))
  const threshold = normalizePositiveNumber(options.threshold, DEFAULT_LONG_PRESS_THRESHOLD)
  let timerHandle: number | undefined

  const cancel = (): void => {
    if (timerHandle === undefined) return
    clearTimer(timerHandle)
    timerHandle = undefined
  }

  const start = (): void => {
    cancel()
    timerHandle = setTimer(() => {
      timerHandle = undefined
      options.onLongPress()
    }, threshold)
  }

  return {
    start,
    cancel,
    isPending: () => timerHandle !== undefined
  }
}
