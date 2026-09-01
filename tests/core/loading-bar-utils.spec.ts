/**
 * @vitest-environment node
 */

import { describe, expect, it, vi } from 'vitest'
import {
  clampLoadingBarPercentage,
  createInitialLoadingBarState,
  createLoadingBarController,
  DEFAULT_LOADING_BAR_ARIA_LABEL,
  DEFAULT_LOADING_BAR_COLOR,
  DEFAULT_LOADING_BAR_HEIGHT,
  getLoadingBarColorClasses,
  getLoadingBarContainerClasses,
  getLoadingBarFillClasses,
  getLoadingBarFillStyle,
  LOADING_BAR_FINISH_HIDE_DELAY_MS,
  LOADING_BAR_MAX_TRICKLE_PERCENTAGE,
  LOADING_BAR_START_PERCENTAGE,
  LOADING_BAR_TRICKLE_INTERVAL_MS,
  nextLoadingBarTricklePercentage,
  resolveLoadingBarAriaLabel,
  resolveLoadingBarColor,
  resolveLoadingBarFillColor,
  resolveLoadingBarHeight,
  resolveLoadingBarMountTarget
} from '@expcat/tigercat-core'

describe('loading-bar-utils', () => {
  describe('resolvers', () => {
    it('clamps percentage into 0-100', () => {
      expect(clampLoadingBarPercentage(40)).toBe(40)
      expect(clampLoadingBarPercentage(-10)).toBe(0)
      expect(clampLoadingBarPercentage(150)).toBe(100)
      expect(clampLoadingBarPercentage(Number.NaN)).toBe(0)
    })

    it('resolves color, height and aria-label defaults', () => {
      expect(resolveLoadingBarColor()).toBe(DEFAULT_LOADING_BAR_COLOR)
      expect(resolveLoadingBarColor('success')).toBe('success')
      expect(resolveLoadingBarColor('nope' as never)).toBe(DEFAULT_LOADING_BAR_COLOR)
      expect(resolveLoadingBarHeight()).toBe(DEFAULT_LOADING_BAR_HEIGHT)
      expect(resolveLoadingBarHeight(0)).toBe(DEFAULT_LOADING_BAR_HEIGHT)
      expect(resolveLoadingBarHeight(4)).toBe(4)
      expect(resolveLoadingBarAriaLabel()).toBe(DEFAULT_LOADING_BAR_ARIA_LABEL)
      expect(resolveLoadingBarAriaLabel('  Page loading  ')).toBe('Page loading')
    })

    it('maps error status to danger fill color', () => {
      expect(resolveLoadingBarFillColor('loading', 'info')).toBe('info')
      expect(resolveLoadingBarFillColor('success', 'primary')).toBe('primary')
      expect(resolveLoadingBarFillColor('error', 'primary')).toBe('danger')
    })

    it('does not touch document when resolving a mount target outside the browser', () => {
      expect(typeof document).toBe('undefined')
      expect(resolveLoadingBarMountTarget()).toBeNull()
      expect(resolveLoadingBarMountTarget('#host')).toBeNull()
    })

    it('does not mutate the controller across two SSR starts', () => {
      const controller = createLoadingBarController()
      controller.start()
      controller.start()
      expect(controller.getState().startedCount).toBe(0)
      expect(controller.getState().visible).toBe(false)
    })
  })

  describe('class and style builders', () => {
    it('builds container and fill classes', () => {
      expect(getLoadingBarContainerClasses('extra')).toContain('fixed')
      expect(getLoadingBarContainerClasses('extra')).toContain('extra')
      expect(getLoadingBarFillClasses('loading', 'primary')).toContain('origin-left')
      expect(getLoadingBarFillClasses('loading', 'primary')).toContain('rtl:origin-right')
      expect(getLoadingBarFillClasses('error', 'primary')).toBe(
        getLoadingBarFillClasses('loading', 'danger')
      )
      expect(getLoadingBarColorClasses('danger')).toContain('error')
    })

    it('builds fill transform style from percentage and height', () => {
      expect(getLoadingBarFillStyle(50, 3)).toEqual({
        transform: 'scaleX(0.5)',
        height: '3px'
      })
    })
  })

  describe('trickle math', () => {
    it('never reaches 100 and caps at the max trickle percentage', () => {
      const next = nextLoadingBarTricklePercentage(10, () => 1)
      expect(next).toBeGreaterThan(10)
      expect(next).toBeLessThanOrEqual(LOADING_BAR_MAX_TRICKLE_PERCENTAGE)
      expect(nextLoadingBarTricklePercentage(LOADING_BAR_MAX_TRICKLE_PERCENTAGE)).toBe(
        LOADING_BAR_MAX_TRICKLE_PERCENTAGE
      )
    })
  })

  describe('createLoadingBarController', () => {
    it('starts visible at the start percentage and trickles', () => {
      const timers: Array<{ id: number; handler: () => void }> = []
      let nextId = 1
      const controller = createLoadingBarController({
        setTimeout: (handler) => {
          const id = nextId++
          timers.push({ id, handler })
          return id
        },
        clearTimeout: (id) => {
          const index = timers.findIndex((timer) => timer.id === id)
          if (index !== -1) timers.splice(index, 1)
        }
      })

      controller.start({ color: 'info', height: 4, className: 'custom' })
      const started = controller.getState()
      expect(started.visible).toBe(true)
      expect(started.status).toBe('loading')
      expect(started.percentage).toBe(LOADING_BAR_START_PERCENTAGE)
      expect(started.color).toBe('info')
      expect(started.height).toBe(4)
      expect(started.className).toBe('custom')
      expect(started.startedCount).toBe(1)

      const before = started.percentage
      timers[0]?.handler()
      expect(controller.getState().percentage).toBeGreaterThan(before)
    })

    it('requires matching finish calls for nested starts', () => {
      const controller = createLoadingBarController({
        setTimeout: () => 1,
        clearTimeout: () => undefined
      })

      controller.start()
      controller.start()
      expect(controller.getState().startedCount).toBe(2)

      controller.finish()
      expect(controller.getState().status).toBe('loading')
      expect(controller.getState().visible).toBe(true)

      controller.finish()
      expect(controller.getState().status).toBe('success')
      expect(controller.getState().percentage).toBe(100)
    })

    it('finish completes then hides after the delay', () => {
      const timers: Array<{ id: number; handler: () => void; timeout: number }> = []
      let nextId = 1
      const controller = createLoadingBarController({
        setTimeout: (handler, timeout) => {
          const id = nextId++
          timers.push({ id, handler, timeout })
          return id
        },
        clearTimeout: (id) => {
          const index = timers.findIndex((timer) => timer.id === id)
          if (index !== -1) timers.splice(index, 1)
        }
      })

      controller.start()
      controller.finish()
      expect(controller.getState().status).toBe('success')
      expect(controller.getState().percentage).toBe(100)

      const hideTimer = timers.find((timer) => timer.timeout === LOADING_BAR_FINISH_HIDE_DELAY_MS)
      expect(hideTimer).toBeTruthy()
      hideTimer?.handler()
      expect(controller.getState().visible).toBe(false)
      expect(controller.getState().status).toBe('idle')
    })

    it('error shows the error status then hides', () => {
      const timers: Array<{ handler: () => void; timeout: number }> = []
      const controller = createLoadingBarController({
        setTimeout: (handler, timeout) => {
          timers.push({ handler, timeout })
          return timers.length
        },
        clearTimeout: () => undefined
      })

      controller.error()
      expect(controller.getState().visible).toBe(true)
      expect(controller.getState().status).toBe('error')
      expect(controller.getState().percentage).toBe(100)

      const hideTimer = timers.find((timer) => timer.timeout === LOADING_BAR_FINISH_HIDE_DELAY_MS)
      hideTimer?.handler()
      expect(controller.getState().visible).toBe(false)
    })

    it('clear resets immediately', () => {
      const controller = createLoadingBarController({
        setTimeout: () => 1,
        clearTimeout: () => undefined
      })
      controller.start()
      controller.clear()
      expect(controller.getState()).toMatchObject(createInitialLoadingBarState())
    })

    it('hide after finish resets sticky start options', () => {
      const timers: Array<{ handler: () => void; timeout: number }> = []
      const controller = createLoadingBarController({
        setTimeout: (handler, timeout) => {
          timers.push({ handler, timeout })
          return timers.length
        },
        clearTimeout: () => undefined
      })
      controller.start({ color: 'success', height: 4 })
      controller.finish()
      timers.find((timer) => timer.timeout === LOADING_BAR_FINISH_HIDE_DELAY_MS)?.handler()
      expect(controller.getState()).toMatchObject(createInitialLoadingBarState())
    })

    it('set and inc stop trickle and write a clamped percentage', () => {
      const controller = createLoadingBarController({
        setTimeout: () => 1,
        clearTimeout: () => undefined
      })
      controller.start()
      controller.set(150)
      expect(controller.getState().percentage).toBe(100)
      controller.set(40)
      controller.inc(10)
      expect(controller.getState().percentage).toBe(50)
    })

    it('skips trickle and hide delay when reduced motion is preferred', () => {
      const timers: Array<{ handler: () => void; timeout: number }> = []
      const controller = createLoadingBarController({
        setTimeout: (handler, timeout) => {
          timers.push({ handler, timeout })
          return timers.length
        },
        clearTimeout: () => undefined,
        prefersReducedMotion: () => true
      })
      controller.start()
      expect(timers).toHaveLength(0)
      expect(controller.getState().percentage).toBe(LOADING_BAR_START_PERCENTAGE)
      controller.finish()
      expect(controller.getState().visible).toBe(false)
    })

    it('start after finish cancels hide and restarts', () => {
      const timers: Array<{ id: number; handler: () => void; timeout: number }> = []
      let nextId = 1
      const controller = createLoadingBarController({
        setTimeout: (handler, timeout) => {
          const id = nextId++
          timers.push({ id, handler, timeout })
          return id
        },
        clearTimeout: (id) => {
          const index = timers.findIndex((timer) => timer.id === id)
          if (index !== -1) timers.splice(index, 1)
        }
      })

      controller.start()
      controller.finish()
      controller.start()
      expect(controller.getState().status).toBe('loading')
      expect(controller.getState().percentage).toBe(LOADING_BAR_START_PERCENTAGE)
      expect(timers.some((timer) => timer.timeout === LOADING_BAR_TRICKLE_INTERVAL_MS)).toBe(true)
    })
  })
})
