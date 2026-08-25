/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import {
  getActiveTourStepPosition,
  getActiveTourSteps,
  getCurrentActiveTourStep,
  getTourMaskHoleStyle,
  getTourPopoverPosition
} from '@expcat/tigercat-core'
import type { TourStep } from '@expcat/tigercat-core'

describe('tour utilities', () => {
  it('filters skipped and conditional skipped steps', () => {
    const steps: TourStep[] = [
      { title: 'Intro' },
      { title: 'Hidden', skip: true },
      { title: 'Conditional', skipWhen: () => true },
      { title: 'Done', skipWhen: false }
    ]

    expect(getActiveTourSteps(steps)).toEqual([
      { step: steps[0], index: 0 },
      { step: steps[3], index: 3 }
    ])
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

  it('clamps popover coordinates inside the mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', { value: 320, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 480, configurable: true })

    const position = getTourPopoverPosition(
      { top: 12, left: 300, width: 20, height: 20 },
      320,
      160,
      'right'
    )

    expect(position.left).toBe(8)
    expect(position.top).toBeGreaterThanOrEqual(8)
  })

  it('builds an evenodd clip-path hole from the target rect', () => {
    const style = getTourMaskHoleStyle({ top: 100, left: 200, width: 50, height: 30 })

    expect(style.clipPath).toBeTruthy()
    expect(style.clipPath).toContain('evenodd')
    expect(style.clipPath).toContain('196px 96px')
    expect(style.clipPath).toContain('254px 134px')
  })
})
