import { describe, it, expect, vi } from 'vitest'
import {
  createSubmenuHeightTransitionController,
  filterMenuItems,
  getMenuClasses,
  getInitialSubmenuHeightTransitionStyle,
  matchesMenuSearch,
  menuCollapsedIconClasses,
  menuItemIconClasses,
  normalizeMenuSearchQuery,
  submenuHeightTransitionClasses,
  type MenuItem,
  type SubmenuHeightTransitionElement
} from '@expcat/tigercat-core'

function createFrameScheduler() {
  let nextFrame = 1
  const callbacks = new Map<number, FrameRequestCallback>()
  const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    const frame = nextFrame++
    callbacks.set(frame, callback)
    return frame
  })
  const cancelAnimationFrame = vi.fn((frame: number) => {
    callbacks.delete(frame)
  })

  return {
    requestAnimationFrame,
    cancelAnimationFrame,
    flush(frame = [...callbacks.keys()][0]) {
      const callback = callbacks.get(frame)
      callbacks.delete(frame)
      callback?.(16)
    }
  }
}

function createTransitionElement(scrollHeight = 96) {
  const listeners = new Map<string, EventListener>()
  const element = {
    scrollHeight,
    style: {
      height: '',
      opacity: '',
      overflow: ''
    },
    addEventListener: vi.fn((type: string, listener: EventListener) => {
      listeners.set(type, listener)
    }),
    removeEventListener: vi.fn((type: string, listener: EventListener) => {
      if (listeners.get(type) === listener) {
        listeners.delete(type)
      }
    })
  } as unknown as SubmenuHeightTransitionElement

  return {
    element,
    dispatchTransitionEnd(propertyName = 'height') {
      listeners.get('transitionend')?.({ target: element, propertyName } as unknown as Event)
    }
  }
}

describe('menu-utils submenu height transition', () => {
  it('returns initial styles for expanded and collapsed submenus', () => {
    expect(getInitialSubmenuHeightTransitionStyle(false)).toEqual({
      height: '0px',
      opacity: '0',
      overflow: 'hidden'
    })
    expect(getInitialSubmenuHeightTransitionStyle(true)).toEqual({
      height: 'auto',
      opacity: '1',
      overflow: 'hidden'
    })
  })

  it('uses height transition classes without max-height or grid rows', () => {
    expect(submenuHeightTransitionClasses).toContain('transition-[height,opacity]')
    expect(submenuHeightTransitionClasses).not.toContain('max-height')
    expect(submenuHeightTransitionClasses).not.toContain('grid-template-rows')
  })

  it('expands by measuring scrollHeight on an animation frame', () => {
    const scheduler = createFrameScheduler()
    const { element, dispatchTransitionEnd } = createTransitionElement(144)
    const controller = createSubmenuHeightTransitionController(element, {
      expanded: false,
      requestAnimationFrame: scheduler.requestAnimationFrame,
      cancelAnimationFrame: scheduler.cancelAnimationFrame
    })

    controller.update(true)

    expect(element.style.height).toBe('0px')
    expect(element.style.opacity).toBe('1')
    expect(scheduler.requestAnimationFrame).toHaveBeenCalledTimes(1)

    scheduler.flush()
    expect(element.style.height).toBe('144px')

    dispatchTransitionEnd()
    expect(element.style.height).toBe('auto')
  })

  it('collapses from measured height on an animation frame', () => {
    const scheduler = createFrameScheduler()
    const { element } = createTransitionElement(88)
    const controller = createSubmenuHeightTransitionController(element, {
      expanded: true,
      requestAnimationFrame: scheduler.requestAnimationFrame,
      cancelAnimationFrame: scheduler.cancelAnimationFrame
    })

    controller.update(false)

    expect(element.style.height).toBe('88px')
    expect(element.style.opacity).toBe('1')

    scheduler.flush()
    expect(element.style.height).toBe('0px')
    expect(element.style.opacity).toBe('0')
  })

  it('cancels pending frames and removes listeners when disposed', () => {
    const scheduler = createFrameScheduler()
    const { element } = createTransitionElement()
    const controller = createSubmenuHeightTransitionController(element, {
      expanded: false,
      requestAnimationFrame: scheduler.requestAnimationFrame,
      cancelAnimationFrame: scheduler.cancelAnimationFrame
    })

    controller.update(true)
    controller.dispose()

    expect(scheduler.cancelAnimationFrame).toHaveBeenCalledWith(1)
    expect(element.removeEventListener).toHaveBeenCalledWith('transitionend', expect.any(Function))
  })
})

describe('menu-utils search filtering', () => {
  const items: MenuItem[] = [
    { key: 'dashboard', label: 'Dashboard' },
    {
      key: 'admin',
      label: 'Administration',
      children: [
        { key: 'users', label: 'Users' },
        { key: 'roles', label: 'Roles' }
      ]
    },
    { key: 'settings', label: 'Settings' }
  ]

  it('normalizes search queries', () => {
    expect(normalizeMenuSearchQuery('  Users  ')).toBe('users')
  })

  it('matches labels case-insensitively', () => {
    expect(matchesMenuSearch('Dashboard', 'dash')).toBe(true)
    expect(matchesMenuSearch('Dashboard', 'settings')).toBe(false)
  })

  it('preserves ancestors of matching children', () => {
    expect(filterMenuItems(items, 'roles')).toEqual([
      {
        key: 'admin',
        label: 'Administration',
        children: [{ key: 'roles', label: 'Roles' }]
      }
    ])
  })

  it('returns the original items for an empty query', () => {
    expect(filterMenuItems(items, '   ')).toBe(items)
  })
})

describe('menu-utils classes', () => {
  it('uses the collapsed width without retaining the default vertical min width', () => {
    const classes = getMenuClasses('vertical', 'light', true)

    expect(classes).toContain('min-w-[64px]')
    expect(classes).not.toContain('min-w-[200px]')
  })

  it('drops the icon right margin when collapsed', () => {
    expect(menuCollapsedIconClasses).toContain('flex-shrink-0')
    expect(menuCollapsedIconClasses).not.toContain('mr-2')
    expect(menuItemIconClasses).toContain('mr-2')
  })
})
