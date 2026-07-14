/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it } from 'vitest'
import {
  getAnchoredOverlayTabTarget,
  getAnchoredOverlayLayoutClasses,
  resolveAnchoredOverlayTarget
} from '@expcat/tigercat-core'

describe('anchored overlay contract', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('uses the nearest nested layer host and falls back to document.body', () => {
    const outerLayer = document.createElement('div')
    outerLayer.setAttribute('data-tiger-overlay-layer', '')
    const outerHost = document.createElement('div')
    outerHost.setAttribute('data-tiger-overlay-host', '')
    outerLayer.appendChild(outerHost)

    const innerLayer = document.createElement('div')
    innerLayer.setAttribute('data-tiger-overlay-layer', '')
    const reference = document.createElement('button')
    const innerHost = document.createElement('div')
    innerHost.setAttribute('data-tiger-overlay-host', '')
    innerLayer.append(reference, innerHost)
    outerLayer.appendChild(innerLayer)
    document.body.appendChild(outerLayer)

    expect(resolveAnchoredOverlayTarget(reference)).toBe(innerHost)
    expect(resolveAnchoredOverlayTarget(document.createElement('button'))).toBe(document.body)
  })

  it('keeps layout and first-position visibility in the shared class contract', () => {
    const anchored = getAnchoredOverlayLayoutClasses('anchored', true)
    const fullscreen = getAnchoredOverlayLayoutClasses('fullscreen-sm', true)
    const bottomSheet = getAnchoredOverlayLayoutClasses('bottom-sheet-sm')

    expect(anchored).toContain('data-[positioned=true]:visible')
    expect(anchored).toContain('w-[var(--tiger-overlay-reference-width)]')
    expect(fullscreen).toContain('max-sm:fixed')
    expect(fullscreen).toContain('max-sm:inset-0')
    expect(bottomSheet).toContain('max-sm:bottom-0')
    expect(bottomSheet).toContain('max-sm:inset-x-0')
  })

  it('resolves Tab focus next to the anchor while excluding portaled content', () => {
    const layer = document.createElement('div')
    layer.setAttribute('data-tiger-overlay-layer', '')
    const reference = document.createElement('div')
    const trigger = document.createElement('button')
    reference.appendChild(trigger)
    const nextInput = document.createElement('input')
    const host = document.createElement('div')
    host.setAttribute('data-tiger-overlay-host', '')
    const floating = document.createElement('div')
    const option = document.createElement('button')
    floating.appendChild(option)
    host.appendChild(floating)
    layer.append(reference, nextInput, host)
    document.body.appendChild(layer)

    expect(getAnchoredOverlayTabTarget(reference, floating)).toBe(nextInput)
    expect(getAnchoredOverlayTabTarget(reference, floating, true)).toBe(nextInput)
  })
})
