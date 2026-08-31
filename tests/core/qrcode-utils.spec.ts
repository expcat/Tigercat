/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  generateQRMatrix,
  decodeQRMatrixBytes,
  qrChooseVersion,
  qrColorContrast,
  qrNeedsContrastWarning,
  QR_QUIET_ZONE
} from '@expcat/tigercat-core'

describe('generateQRMatrix', () => {
  it('round-trips byte payloads a scanner would read', () => {
    for (const value of ['HELLO WORLD', 'https://tigercat.dev', '你好', '', 'a'.repeat(80)]) {
      const matrix = generateQRMatrix(value)
      expect(decodeQRMatrixBytes(matrix)).toBe(value)
    }
  })

  it('grows past version 1 when the payload needs it', () => {
    const small = generateQRMatrix('hi')
    const large = generateQRMatrix('https://example.com/path?q=tigercat&ref=docs#section')
    expect(small).toHaveLength(21)
    expect(large.length).toBeGreaterThan(21)
    expect((large.length - 17) % 4).toBe(0)
  })

  it('is deterministic for the same value', () => {
    expect(generateQRMatrix('https://tigercat.dev')).toEqual(
      generateQRMatrix('https://tigercat.dev')
    )
  })

  it('produces a different matrix for different values', () => {
    expect(generateQRMatrix('aaa')).not.toEqual(generateQRMatrix('bbb'))
  })

  it('picks version 1 for a short byte string', () => {
    expect(qrChooseVersion(11)).toBe(1)
  })

  it('keeps a 4-module quiet zone constant for scanners', () => {
    expect(QR_QUIET_ZONE).toBe(4)
  })
})

describe('qr contrast', () => {
  it('flags low-contrast hex pairs', () => {
    expect(qrColorContrast('#000000', '#ffffff')).toBeGreaterThan(10)
    expect(qrNeedsContrastWarning('#000000', '#ffffff')).toBe(false)
    expect(qrNeedsContrastWarning('#cccccc', '#ffffff')).toBe(true)
  })

  it('skips CSS variables', () => {
    expect(qrColorContrast('var(--tiger-text)', 'var(--tiger-surface)')).toBeNull()
    expect(qrNeedsContrastWarning('var(--tiger-text)', '#ffffff')).toBe(false)
  })
})
