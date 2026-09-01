/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createImperativeHost,
  createToastQueue,
  resetDevWarnCache,
  resolveImperativeMountTarget,
  shouldHandleToastSurfaceEvent
} from '@expcat/tigercat-core'

describe('imperative host (dom)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    resetDevWarnCache()
  })

  it('mounts on the overlay-host chain and remounts when the root is yanked', () => {
    const unmount = vi.fn()
    const host = createImperativeHost({
      mount: (element) => {
        element.setAttribute('data-mounted', 'true')
        return { id: 1 }
      },
      unmount
    })

    const handle = host.ensure()
    expect(handle).toBeTruthy()
    expect(document.querySelector('[data-tiger-imperative-host]')).toBeTruthy()

    document.body.innerHTML = ''
    expect(host.isMounted()).toBe(false)

    host.ensure()
    expect(unmount).toHaveBeenCalled()
    expect(document.querySelector('[data-tiger-imperative-host]')).toBeTruthy()
    host.teardown()
  })

  it('moves to a new container on the next ensure', () => {
    const host = createImperativeHost({
      mount: () => ({ id: 1 }),
      unmount: () => undefined
    })
    const first = document.createElement('div')
    const second = document.createElement('div')
    document.body.append(first, second)

    host.ensure(first)
    expect(first.querySelector('[data-tiger-imperative-host]')).toBeTruthy()

    host.ensure(second)
    expect(first.querySelector('[data-tiger-imperative-host]')).toBeNull()
    expect(second.querySelector('[data-tiger-imperative-host]')).toBeTruthy()
    host.teardown()
  })

  it('does not fall back to body when a selector matches nothing', () => {
    const host = createImperativeHost({
      mount: () => ({ id: 1 }),
      unmount: () => undefined
    })
    expect(host.ensure('#missing-host')).toBeNull()
    expect(document.querySelector('[data-tiger-imperative-host]')).toBeNull()
  })

  it('warns and falls back for an illegal selector', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const target = resolveImperativeMountTarget('[')
    expect(target).toBe(document.body)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe('toast queue (dom)', () => {
  it('stores duration timers and only fires onClose once after a manual close', () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const queue = createToastQueue()
    const item = queue.add({ duration: 3000, onClose })
    expect(item).toBeTruthy()
    expect(queue.getSnapshot()).toHaveLength(1)

    queue.remove(item!.id)
    expect(onClose).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(3000)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(queue.getSnapshot()).toHaveLength(0)
    vi.useRealTimers()
  })

  it('keeps every add in the snapshot in the same turn', () => {
    const queue = createToastQueue()
    queue.add({ duration: 0 })
    queue.add({ duration: 0 })
    queue.add({ duration: 0 })
    expect(queue.getSnapshot()).toHaveLength(3)
    queue.clear()
  })

  it('ignores clicks that start on inner buttons', () => {
    const button = document.createElement('button')
    const toast = document.createElement('div')
    toast.append(button)
    expect(shouldHandleToastSurfaceEvent({ target: button, currentTarget: toast })).toBe(false)
    expect(shouldHandleToastSurfaceEvent({ target: toast, currentTarget: toast })).toBe(true)
  })
})
