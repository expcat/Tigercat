/**
 * One stacking counter for Modal, Drawer, and Tour.
 * Values stay in the modal band, under fullscreen loading and toasts.
 */

import { OVERLAY_Z_INDEX } from './floating'

const MODAL_Z_CEILING = OVERLAY_Z_INDEX.loading - 1

let serial = 0
let openCount = 0

export function overlayZCeiling(): number {
  return MODAL_Z_CEILING
}

export function overlayZOpenCount(): number {
  return openCount
}

/**
 * Later layers receive a higher z-index. The counter resets when none remain.
 */
export function acquireOverlayZ(): { zIndex: number; release: () => void } {
  const offset = serial
  serial += 1
  openCount += 1
  const zIndex = Math.min(OVERLAY_Z_INDEX.modal + offset, MODAL_Z_CEILING)
  let released = false
  return {
    zIndex,
    release() {
      if (released) return
      released = true
      openCount = Math.max(0, openCount - 1)
      if (openCount === 0) serial = 0
    }
  }
}

/** Test helper. Production layers release themselves. */
export function resetOverlayZ(): void {
  serial = 0
  openCount = 0
}
