/**
 * Arrow-key roving tabindex for toolbars, menus, and tabs.
 * Home and End jump to the ends. Disabled items are skipped.
 */

export type RovingOrientation = 'horizontal' | 'vertical' | 'both'

export interface RovingItem {
  id: string
  disabled?: boolean
}

export interface RovingFocusOptions {
  orientation?: RovingOrientation
  loop?: boolean
  onActive?: (id: string) => void
}

export interface RovingKeyEvent {
  key: string
  preventDefault?: () => void
}

export interface RovingFocus {
  getActive(): string | null
  setActive(id: string): void
  onKeyDown(event: RovingKeyEvent): void
}

function enabledIndexes(items: readonly RovingItem[]): number[] {
  const indexes: number[] = []
  items.forEach((item, index) => {
    if (!item.disabled) indexes.push(index)
  })
  return indexes
}

function isNextKey(key: string, orientation: RovingOrientation): boolean {
  if (orientation === 'vertical') return key === 'ArrowDown'
  if (orientation === 'horizontal') return key === 'ArrowRight'
  return key === 'ArrowDown' || key === 'ArrowRight'
}

function isPreviousKey(key: string, orientation: RovingOrientation): boolean {
  if (orientation === 'vertical') return key === 'ArrowUp'
  if (orientation === 'horizontal') return key === 'ArrowLeft'
  return key === 'ArrowUp' || key === 'ArrowLeft'
}

export function createRovingFocus(
  items: readonly RovingItem[],
  options: RovingFocusOptions = {}
): RovingFocus {
  const orientation = options.orientation ?? 'horizontal'
  const loop = options.loop ?? true
  const enabled = enabledIndexes(items)
  let active = enabled.length > 0 ? items[enabled[0]!]!.id : null

  function setActive(id: string): void {
    const match = items.find((item) => item.id === id && !item.disabled)
    if (!match) return
    active = match.id
    options.onActive?.(match.id)
  }

  function move(delta: number): void {
    const indexes = enabledIndexes(items)
    if (indexes.length === 0) return
    const current = indexes.findIndex((index) => items[index]?.id === active)
    const start = current === -1 ? 0 : current
    let next = start + delta
    if (loop) {
      next = (next + indexes.length) % indexes.length
    } else {
      next = Math.max(0, Math.min(indexes.length - 1, next))
    }
    const id = items[indexes[next]!]!.id
    setActive(id)
  }

  return {
    getActive: () => active,
    setActive,
    onKeyDown(event) {
      const key = event.key
      if (key === 'Home') {
        event.preventDefault?.()
        const first = enabledIndexes(items)[0]
        if (first !== undefined) setActive(items[first]!.id)
        return
      }
      if (key === 'End') {
        event.preventDefault?.()
        const indexes = enabledIndexes(items)
        const last = indexes[indexes.length - 1]
        if (last !== undefined) setActive(items[last]!.id)
        return
      }
      if (isNextKey(key, orientation)) {
        event.preventDefault?.()
        move(1)
        return
      }
      if (isPreviousKey(key, orientation)) {
        event.preventDefault?.()
        move(-1)
      }
    }
  }
}
