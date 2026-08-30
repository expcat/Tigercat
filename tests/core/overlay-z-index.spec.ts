/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  OVERLAY_Z_INDEX,
  loadingFullscreenBaseClasses,
  messageContainerBaseClasses,
  loadingBarContainerBaseClasses,
  viewportFloatingBaseClasses
} from '@expcat/tigercat-core'

describe('overlay z-index scale', () => {
  it('orders viewport chrome below anchored overlays, modals, messages, and the loading bar', () => {
    expect(OVERLAY_Z_INDEX.viewport).toBeLessThan(OVERLAY_Z_INDEX.overlay)
    expect(OVERLAY_Z_INDEX.overlay).toBeLessThan(OVERLAY_Z_INDEX.modal)
    expect(OVERLAY_Z_INDEX.modal).toBeLessThan(OVERLAY_Z_INDEX.message)
    expect(OVERLAY_Z_INDEX.message).toBeLessThan(OVERLAY_Z_INDEX.loadingBar)
  })

  it('places fullscreen loading above anchored overlays', () => {
    expect(loadingFullscreenBaseClasses).toContain(`z-[${OVERLAY_Z_INDEX.modal}]`)
    expect(OVERLAY_Z_INDEX.modal).toBeGreaterThan(OVERLAY_Z_INDEX.overlay)
  })

  it('uses the shared scale in viewport, message, and loading-bar chrome', () => {
    expect(viewportFloatingBaseClasses).toContain(`z-[${OVERLAY_Z_INDEX.viewport}]`)
    expect(messageContainerBaseClasses).toContain(`z-[${OVERLAY_Z_INDEX.message}]`)
    expect(loadingBarContainerBaseClasses).toContain(`z-[${OVERLAY_Z_INDEX.loadingBar}]`)
  })
})
