import { describe, it, expect, vi } from 'vitest'
import {
  createCollapseTransitionController,
  getInitialCollapseContentStyle,
  getNextAccordionHeaderIndex,
  isPanelActive,
  normalizeActiveKeys,
  togglePanelKey,
  type CollapseTransitionElement
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

function createTransitionElement(scrollHeight = 120) {
  const listeners = new Map<string, EventListener>()
  const element = {
    scrollHeight,
    style: {
      maxHeight: '',
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
  } as unknown as CollapseTransitionElement

  return {
    element,
    dispatchTransitionEnd(propertyName = 'max-height') {
      listeners.get('transitionend')?.({ target: element, propertyName } as unknown as Event)
    }
  }
}

describe('collapse-utils keys', () => {
  it('treats numeric and string keys as the same panel', () => {
    expect(isPanelActive(1, ['1'])).toBe(true)
    expect(isPanelActive('1', [1])).toBe(true)
    expect(togglePanelKey(1, ['1'], false)).toEqual([])
    expect(togglePanelKey('1', [1], true)).toEqual([])
  })

  it('accordion keeps the last key and empty stays []', () => {
    expect(normalizeActiveKeys(['1', '2'], { accordion: true })).toEqual(['2'])
    expect(normalizeActiveKeys([], { accordion: true })).toEqual([])
    expect(togglePanelKey('a', ['a'], true)).toEqual([])
  })

  it('wraps accordion header focus across enabled panels', () => {
    const headers = [
      { key: 'a', el: { focus: vi.fn() }, disabled: false },
      { key: 'b', el: { focus: vi.fn() }, disabled: true },
      { key: 'c', el: { focus: vi.fn() }, disabled: false }
    ]
    expect(getNextAccordionHeaderIndex(headers, 'a', 'next')).toBe(2)
    expect(getNextAccordionHeaderIndex(headers, 'c', 'next')).toBe(0)
    expect(getNextAccordionHeaderIndex(headers, 'c', 'prev')).toBe(0)
    expect(getNextAccordionHeaderIndex(headers, 'a', 'last')).toBe(2)
  })
})

describe('collapse-utils transition controller', () => {
  it('returns initial content styles for expanded and collapsed panels', () => {
    expect(getInitialCollapseContentStyle(false)).toEqual({ maxHeight: '0px', opacity: '0' })
    expect(getInitialCollapseContentStyle(true)).toEqual({ maxHeight: 'none', opacity: '1' })
  })

  it('expands by measuring height on the next animation frame', () => {
    const scheduler = createFrameScheduler()
    const { element, dispatchTransitionEnd } = createTransitionElement(144)
    const controller = createCollapseTransitionController(element, {
      expanded: false,
      requestAnimationFrame: scheduler.requestAnimationFrame,
      cancelAnimationFrame: scheduler.cancelAnimationFrame
    })

    controller.update(true)

    expect(element.style.maxHeight).toBe('0px')
    expect(element.style.opacity).toBe('1')
    expect(scheduler.requestAnimationFrame).toHaveBeenCalledTimes(1)

    scheduler.flush()
    expect(element.style.maxHeight).toBe('144px')

    dispatchTransitionEnd()
    expect(element.style.maxHeight).toBe('none')
  })

  it('collapses by snapshotting height before the next animation frame', () => {
    const scheduler = createFrameScheduler()
    const { element } = createTransitionElement(96)
    const controller = createCollapseTransitionController(element, {
      expanded: true,
      requestAnimationFrame: scheduler.requestAnimationFrame,
      cancelAnimationFrame: scheduler.cancelAnimationFrame
    })

    controller.update(false)

    expect(element.style.maxHeight).toBe('96px')
    expect(element.style.opacity).toBe('1')

    scheduler.flush()
    expect(element.style.maxHeight).toBe('0px')
    expect(element.style.opacity).toBe('0')
  })

  it('cancels a pending animation frame when a new transition starts', () => {
    const scheduler = createFrameScheduler()
    const { element } = createTransitionElement(88)
    const controller = createCollapseTransitionController(element, {
      expanded: false,
      requestAnimationFrame: scheduler.requestAnimationFrame,
      cancelAnimationFrame: scheduler.cancelAnimationFrame
    })

    controller.update(true)
    controller.update(false)

    expect(scheduler.cancelAnimationFrame).toHaveBeenCalledWith(1)
    scheduler.flush(1)
    expect(element.style.maxHeight).toBe('88px')

    scheduler.flush(2)
    expect(element.style.maxHeight).toBe('0px')
  })

  it('skips frames when reduced motion is preferred', () => {
    const scheduler = createFrameScheduler()
    const { element } = createTransitionElement(80)
    const controller = createCollapseTransitionController(element, {
      expanded: false,
      requestAnimationFrame: scheduler.requestAnimationFrame,
      cancelAnimationFrame: scheduler.cancelAnimationFrame,
      prefersReducedMotion: () => true
    })

    controller.update(true)

    expect(scheduler.requestAnimationFrame).not.toHaveBeenCalled()
    expect(element.style.maxHeight).toBe('none')
    expect(element.style.opacity).toBe('1')
  })

  it('removes the transition listener when disposed', () => {
    const scheduler = createFrameScheduler()
    const { element } = createTransitionElement()
    const controller = createCollapseTransitionController(element, {
      expanded: false,
      requestAnimationFrame: scheduler.requestAnimationFrame,
      cancelAnimationFrame: scheduler.cancelAnimationFrame
    })

    controller.dispose()

    expect(element.removeEventListener).toHaveBeenCalledWith('transitionend', expect.any(Function))
  })
})
