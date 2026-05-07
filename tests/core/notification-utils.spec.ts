import { describe, expect, it, vi } from 'vitest'
import {
  createNotificationStackUpdateScheduler,
  type NotificationStackFrameCallback
} from '@expcat/tigercat-core'
import { createFrameScheduler } from '../utils/frame-scheduler'

describe('notification-utils', () => {
  describe('createNotificationStackUpdateScheduler', () => {
    it('batches repeated updates for one position to one frame', () => {
      const frames = createFrameScheduler()
      const first = vi.fn()
      const second = vi.fn()
      const scheduler = createNotificationStackUpdateScheduler({
        requestFrame: frames.requestFrame,
        cancelFrame: frames.cancelFrame
      })

      scheduler.schedule('top-right', first)
      scheduler.schedule('top-right', second)

      expect(scheduler.isPending()).toBe(true)
      expect(frames.pendingCount()).toBe(1)
      expect(first).not.toHaveBeenCalled()
      expect(second).not.toHaveBeenCalled()

      frames.flush()

      expect(scheduler.isPending()).toBe(false)
      expect(first).not.toHaveBeenCalled()
      expect(second).toHaveBeenCalledTimes(1)
    })

    it('flushes different positions in the same frame', () => {
      const frames = createFrameScheduler()
      const topRight = vi.fn()
      const bottomLeft = vi.fn()
      const scheduler = createNotificationStackUpdateScheduler({
        requestFrame: frames.requestFrame,
        cancelFrame: frames.cancelFrame
      })

      scheduler.schedule('top-right', topRight)
      scheduler.schedule('bottom-left', bottomLeft)

      expect(frames.pendingCount()).toBe(1)

      frames.flush()

      expect(topRight).toHaveBeenCalledTimes(1)
      expect(bottomLeft).toHaveBeenCalledTimes(1)
    })

    it('cancels updates for a specific position without dropping others', () => {
      const frames = createFrameScheduler()
      const topRight = vi.fn()
      const bottomLeft = vi.fn()
      const scheduler = createNotificationStackUpdateScheduler({
        requestFrame: frames.requestFrame,
        cancelFrame: frames.cancelFrame
      })

      scheduler.schedule('top-right', topRight)
      scheduler.schedule('bottom-left', bottomLeft)
      scheduler.cancel('top-right')

      expect(scheduler.isPending()).toBe(true)
      frames.flush()

      expect(topRight).not.toHaveBeenCalled()
      expect(bottomLeft).toHaveBeenCalledTimes(1)
    })

    it('cancels the frame when every pending position is cleared', () => {
      const frames = createFrameScheduler()
      const callback = vi.fn()
      const scheduler = createNotificationStackUpdateScheduler({
        requestFrame: frames.requestFrame,
        cancelFrame: frames.cancelFrame
      })

      scheduler.schedule('top-left', callback)
      scheduler.cancel('top-left')

      expect(scheduler.isPending()).toBe(false)
      expect(frames.pendingCount()).toBe(0)
      frames.flush()
      expect(callback).not.toHaveBeenCalled()
    })
  })
})
