/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  getOverlayArrowClasses,
  getOverlayPanelClasses,
  getPopoverContentClasses
} from '@expcat/tigercat-core'

describe('popover panel chrome', () => {
  it('uses theme padding, radius, and elevation tokens that are actually defined', () => {
    const panel = getPopoverContentClasses()
    expect(panel).toContain('p-[var(--tiger-spacing-lg)]')
    expect(panel).toContain('rounded-[var(--tiger-radius-lg)]')
    expect(panel).toContain('shadow-[var(--tiger-shadow-lg)]')
    expect(panel).toContain('min-w-[200px]')
    expect(panel).toContain('max-w-[20rem]')
    expect(panel).not.toContain('--tiger-component-popover-')
    expect(getOverlayPanelClasses()).toContain('tiger-overlay-panel')
  })

  it('keeps only the outer arrow borders so the caret joins the panel', () => {
    const up = getOverlayArrowClasses('bottom')
    expect(up).toContain('border-t')
    expect(up).toContain('border-s')
    expect(up).toContain('border-b-transparent')
    expect(up).toContain('border-e-transparent')
    expect(getOverlayArrowClasses('top')).toContain('border-b')
  })
})
