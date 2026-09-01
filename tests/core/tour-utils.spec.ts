/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import {
  getActiveTourStepPosition,
  getActiveTourSteps,
  getCurrentActiveTourStep,
  getTourCenteredPosition,
  getTourMaskHoleStyle,
  getTourPopoverPosition,
  getOppositeTourPlacement,
  resolveTourNav,
  resolveTourTarget,
  shouldLockTourOverlay,
  tourCloseEvents,
  tourFinishEvents,
  tourNextEvents,
  getTourTargetRect
} from '@expcat/tigercat-core'
import type { TourStep } from '@expcat/tigercat-core'

describe('tour utilities', () => {
  it('filters skipped and conditional skipped steps', () => {
    const skip = vi.fn(() => true)
    const steps: TourStep[] = [
      { title: 'Intro' },
      { title: 'Hidden', skip: true },
      { title: 'Conditional', skipWhen: skip },
      { title: 'Done', skipWhen: false }
    ]

    expect(getActiveTourSteps(steps)).toEqual([
      { step: steps[0], index: 0 },
      { step: steps[3], index: 3 }
    ])
    expect(skip).toHaveBeenCalled()
  })

  it('re-evaluates skipWhen each time the active list is resolved', () => {
    let skip = true
    const steps: TourStep[] = [
      { title: 'Intro' },
      { title: 'Optional', skipWhen: () => skip },
      { title: 'Done' }
    ]

    expect(getActiveTourSteps(steps)).toHaveLength(2)
    skip = false
    expect(getActiveTourSteps(steps)).toHaveLength(3)
  })

  it('resolves skipped current index to the next active step', () => {
    const steps: TourStep[] = [
      { title: 'Intro' },
      { title: 'Hidden', skip: true },
      { title: 'Done' }
    ]
    const activeSteps = getActiveTourSteps(steps)
    const activeStep = getCurrentActiveTourStep(activeSteps, 1)

    expect(activeStep).toEqual({ step: steps[2], index: 2 })
    expect(getActiveTourStepPosition(activeSteps, activeStep?.index)).toBe(1)
  })

  it('does not lock overlay while pending, skipped, or out of range', () => {
    expect(shouldLockTourOverlay(true, false)).toBe(false)
    expect(shouldLockTourOverlay(false, true)).toBe(false)
    expect(shouldLockTourOverlay(true, true)).toBe(true)
  })

  it('emits finish then close then open=false', () => {
    expect(tourFinishEvents()).toEqual([
      { type: 'finish' },
      { type: 'close' },
      { type: 'openChange', open: false }
    ])
    expect(tourCloseEvents()).toEqual([{ type: 'close' }, { type: 'openChange', open: false }])

    const nav = resolveTourNav([{ title: 'Only' }], 0)
    expect(tourNextEvents(nav)).toEqual(tourFinishEvents())
  })

  it('clamps popover coordinates inside the mobile viewport using the real box', () => {
    Object.defineProperty(window, 'innerWidth', { value: 320, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 480, configurable: true })

    const popoverWidth = 280
    const position = getTourPopoverPosition(
      { top: 12, left: 300, width: 20, height: 20 },
      popoverWidth,
      120,
      'right'
    )

    expect(position.left).toBeGreaterThanOrEqual(8)
    expect(position.top).toBeGreaterThanOrEqual(8)
    expect(position.left + popoverWidth).toBeLessThanOrEqual(312)
  })

  it('flips to the opposite side when the preferred placement overflows', () => {
    Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 400, configurable: true })

    expect(getOppositeTourPlacement('bottom')).toBe('top')
    const position = getTourPopoverPosition(
      { top: 360, left: 100, width: 40, height: 20 },
      120,
      80,
      'bottom'
    )

    expect(position.top).toBeLessThan(360)
  })

  it('centers using the measured popover size', () => {
    Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 400, configurable: true })

    const position = getTourCenteredPosition(200, 100)
    expect(position.left).toBe(100)
    expect(position.top).toBe(150)
  })

  it('builds a clip-path hole whose pixels match the viewport rect', () => {
    const rect = { top: 100, left: 200, width: 50, height: 30 }
    const style = getTourMaskHoleStyle(rect)
    const padding = 4

    expect(style.clipPath).toContain('evenodd')
    expect(style.clipPath).toContain(`${rect.left - padding}px ${rect.top - padding}px`)
    expect(style.clipPath).toContain(
      `${rect.left + rect.width + padding}px ${rect.top + rect.height + padding}px`
    )
  })

  it('resolves an element target and swallows illegal selectors', () => {
    const node = document.createElement('div')
    node.id = 'tour-core-target'
    document.body.appendChild(node)

    expect(resolveTourTarget(node)).toBe(node)
    expect(resolveTourTarget('#tour-core-target')).toBe(node)
    expect(() => resolveTourTarget('##')).not.toThrow()
    expect(resolveTourTarget('##')).toBeUndefined()
    expect(getTourTargetRect('##')).toBeUndefined()
    expect(getTourTargetRect('#missing-tour-target')).toBeUndefined()

    node.remove()
  })
})
