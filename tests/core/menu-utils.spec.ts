import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  createSubmenuHeightTransitionController,
  filterMenuItems,
  focusFirstChildItem,
  focusMenuEdge,
  getMenuButtons,
  getMenuClasses,
  getMenuNavigationKeys,
  getInitialSubmenuHeightTransitionStyle,
  initRovingTabIndex,
  matchesMenuSearch,
  menuCollapsedIconClasses,
  menuItemIconClasses,
  moveFocusInMenu,
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

describe('getMenuNavigationKeys', () => {
  it('uses horizontal arrows for a horizontal root menu', () => {
    expect(getMenuNavigationKeys('horizontal', true)).toEqual({
      nextKey: 'ArrowRight',
      prevKey: 'ArrowLeft'
    })
  })

  it('uses vertical arrows for vertical and inline roots', () => {
    expect(getMenuNavigationKeys('vertical', true)).toEqual({
      nextKey: 'ArrowDown',
      prevKey: 'ArrowUp'
    })
    expect(getMenuNavigationKeys('inline', true)).toEqual({
      nextKey: 'ArrowDown',
      prevKey: 'ArrowUp'
    })
  })

  it('uses vertical arrows for non-root menus regardless of mode', () => {
    expect(getMenuNavigationKeys('horizontal', false)).toEqual({
      nextKey: 'ArrowDown',
      prevKey: 'ArrowUp'
    })
  })
})

describe('menu-utils roving tabindex helpers', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  /**
   * Build:
   *   <ul role="menu" id="root">
   *     <li><button data-tiger-menuitem>0</button></li>
   *     <li><button data-tiger-menuitem disabled>1</button></li>   (disabled → filtered)
   *     <li data-tiger-menu-hidden="true"><button data-tiger-menuitem>2</button></li> (hidden → filtered)
   *     <li class="title"><button data-tiger-menuitem data-tiger-selected="true">3</button>
   *       <ul role="menu"><li><button data-tiger-menuitem>3a</button></li></ul>  (nested → not in root)
   *     </li>
   *     <li><button data-tiger-menuitem>4</button></li>
   *   </ul>
   */
  function buildMenu(): HTMLElement {
    // Buttons render with an explicit tabindex="-1" (the roving baseline the
    // Menu component sets), since native <button> reports tabIndex 0 by default.
    document.body.innerHTML = `
      <ul role="menu" id="root">
        <li><button data-tiger-menuitem="true" id="b0" tabindex="-1">0</button></li>
        <li><button data-tiger-menuitem="true" id="b1" tabindex="-1" disabled>1</button></li>
        <li data-tiger-menu-hidden="true"><button data-tiger-menuitem="true" id="b2" tabindex="-1">2</button></li>
        <li class="title">
          <button data-tiger-menuitem="true" id="b3" tabindex="-1" data-tiger-selected="true">3</button>
          <ul role="menu" id="sub"><li><button data-tiger-menuitem="true" id="b3a" tabindex="-1">3a</button></li></ul>
        </li>
        <li><button data-tiger-menuitem="true" id="b4" tabindex="-1">4</button></li>
      </ul>
    `
    return document.getElementById('root') as HTMLElement
  }

  it('getMenuButtons returns only enabled, visible, direct items of the container', () => {
    const root = buildMenu()
    const ids = getMenuButtons(root).map((b) => b.id)
    expect(ids).toEqual(['b0', 'b3', 'b4'])
  })

  it('moveFocusInMenu moves roving focus forward and wraps, updating tabIndex', () => {
    const root = buildMenu()
    const items = getMenuButtons(root)
    moveFocusInMenu(items[0], 1)
    expect(document.activeElement).toBe(items[1])
    expect(items[1].tabIndex).toBe(0)
    expect(items[0].tabIndex).toBe(-1)
    expect(items[2].tabIndex).toBe(-1)

    // wrap from last back to first
    moveFocusInMenu(items[2], 1)
    expect(document.activeElement).toBe(items[0])
    expect(items[0].tabIndex).toBe(0)
  })

  it('moveFocusInMenu moves backward and wraps from first to last', () => {
    const root = buildMenu()
    const items = getMenuButtons(root)
    moveFocusInMenu(items[0], -1)
    expect(document.activeElement).toBe(items[items.length - 1])
    expect(items[items.length - 1].tabIndex).toBe(0)
  })

  it('focusMenuEdge focuses the first or last item', () => {
    const root = buildMenu()
    const items = getMenuButtons(root)
    focusMenuEdge(items[1], 'start')
    expect(document.activeElement).toBe(items[0])
    expect(items[0].tabIndex).toBe(0)

    focusMenuEdge(items[0], 'end')
    expect(document.activeElement).toBe(items[items.length - 1])
    expect(items[items.length - 1].tabIndex).toBe(0)
  })

  it('initRovingTabIndex sets tabindex 0 on the selected item, -1 on the rest', () => {
    const root = buildMenu()
    initRovingTabIndex(root)
    const items = getMenuButtons(root)
    // b3 is data-tiger-selected
    expect(items.find((b) => b.id === 'b3')?.tabIndex).toBe(0)
    expect(items.filter((b) => b.id !== 'b3').every((b) => b.tabIndex === -1)).toBe(true)
  })

  it('initRovingTabIndex falls back to the first item when none selected', () => {
    document.body.innerHTML = `
      <ul role="menu" id="root">
        <li><button data-tiger-menuitem="true" id="a" tabindex="-1">a</button></li>
        <li><button data-tiger-menuitem="true" id="b" tabindex="-1">b</button></li>
      </ul>
    `
    const root = document.getElementById('root') as HTMLElement
    initRovingTabIndex(root)
    const items = getMenuButtons(root)
    expect(items[0].tabIndex).toBe(0)
    expect(items[1].tabIndex).toBe(-1)
  })

  it('initRovingTabIndex is a no-op when an item already has tabindex 0', () => {
    const root = buildMenu()
    const items = getMenuButtons(root)
    items[2].tabIndex = 0
    initRovingTabIndex(root)
    // unchanged: b3 not forced to 0
    expect(items[2].tabIndex).toBe(0)
    expect(items.find((b) => b.id === 'b3')?.tabIndex).not.toBe(0)
  })

  it('focusFirstChildItem focuses the first item of the submenu under the title', () => {
    const root = buildMenu()
    const title = document.getElementById('b3') as HTMLElement
    focusFirstChildItem(title)
    const first = document.getElementById('b3a') as HTMLButtonElement
    expect(document.activeElement).toBe(first)
    expect(first.tabIndex).toBe(0)
  })
})
