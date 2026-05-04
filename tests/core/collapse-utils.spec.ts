import { describe, it, expect, vi } from 'vitest'
import {
  createCollapseTransitionController,
  getInitialCollapseContentStyle,
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
