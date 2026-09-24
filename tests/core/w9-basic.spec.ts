/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import {
  basicLabel,
  cropOutputSize,
  formatImageCompareValueText,
  generateQRMatrix,
  getWatermarkOverlayStyle,
  marqueeBaseStyles,
  qrChooseVersion,
  resolveCropAspectRatio,
  resolveLightboxNavIndex,
  watermarkBaseStyles
} from '@expcat/tigercat-core'

describe('W9 basic helpers', () => {
  it('loops a multi-image index and keeps a single image still', () => {
    expect(resolveLightboxNavIndex(2, 3, 'next', true)).toBe(0)
    expect(resolveLightboxNavIndex(0, 3, 'prev', true)).toBe(2)
    expect(resolveLightboxNavIndex(0, 1, 'next', true)).toBeNull()
  })

  it('maps crop presets and swaps edges on quarter turns', () => {
    expect(resolveCropAspectRatio('1:1')).toBe(1)
    expect(resolveCropAspectRatio('4:3')).toBeCloseTo(4 / 3)
    expect(resolveCropAspectRatio('16:9')).toBeCloseTo(16 / 9)
    expect(resolveCropAspectRatio('free', 2)).toBeUndefined()
    expect(cropOutputSize(400, 200, 90)).toEqual({ width: 200, height: 400 })
    expect(cropOutputSize(400, 200, 180)).toEqual({ width: 400, height: 200 })
  })

  it('changes QR version when the error level needs more modules', () => {
    const payload = 'HELLO WORLD'
    const low = generateQRMatrix(payload, 'L')
    const high = generateQRMatrix(payload, 'H')
    expect(qrChooseVersion(11, 'L')).toBe(1)
    expect(qrChooseVersion(11, 'H')).toBeGreaterThan(1)
    expect(high.length).toBeGreaterThan(low.length)
    expect(high).not.toEqual(low)
  })

  it('puts compare titles into the slider value text', () => {
    expect(formatImageCompareValueText('{percent}% before', 40, { before: 'Raw', after: 'Edited' })).toBe(
      'Raw 40% before Edited'
    )
  })

  it('changes watermark style vars without a canvas hook', () => {
    const style = getWatermarkOverlayStyle({
      width: 120,
      height: 64,
      gapX: 100,
      gapY: 100,
      offsetX: 0,
      offsetY: 0,
      zIndex: 20,
      rowGap: 12,
      density: 2
    })
    expect(style['--tiger-watermark-row-gap']).toBe('12px')
    expect(style['--tiger-watermark-density']).toBe('2')
    expect(style['--tiger-watermark-size']).toBe('110px 88px')
    expect(watermarkBaseStyles['@media print']).toBeTruthy()
  })

  it('keeps marquee fade from receiving clicks', () => {
    const fade = marqueeBaseStyles['.tiger-marquee-fade::before, .tiger-marquee-fade::after']
    expect(fade.pointerEvents).toBe('none')
  })

  it('reads zh-CN and en-US basic labels', () => {
    expect(basicLabel('zh-CN', 'qrcode', 'scanned')).toBe('已扫描')
    expect(basicLabel('en-US', 'qrcode', 'scanned')).toBe('Scanned')
    expect(basicLabel('fr-FR', 'qrcode', 'scanned')).toBe('Scanned')
  })

  it('does not construct a MutationObserver while reading watermark vars', () => {
    const Observer = vi.fn()
    vi.stubGlobal('MutationObserver', Observer)
    getWatermarkOverlayStyle({
      width: 10,
      height: 10,
      gapX: 0,
      gapY: 0,
      offsetX: 0,
      offsetY: 0,
      zIndex: 1,
      rowGap: 4,
      density: 1
    })
    expect(Observer).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
