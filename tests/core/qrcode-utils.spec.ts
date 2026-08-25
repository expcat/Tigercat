/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import { generateQRMatrix } from '@expcat/tigercat-core'

describe('generateQRMatrix', () => {
  it('returns a 21x21 boolean matrix for a URL', () => {
    const matrix = generateQRMatrix('https://tigercat.dev')
    expect(matrix).toHaveLength(21)
    expect(matrix.every((row) => row.length === 21)).toBe(true)
    expect(matrix.every((row) => row.every((cell) => typeof cell === 'boolean'))).toBe(true)
  })

  it('is deterministic for the same value', () => {
    expect(generateQRMatrix('https://tigercat.dev')).toEqual(
      generateQRMatrix('https://tigercat.dev')
    )
  })

  it('produces a different matrix for different values', () => {
    expect(generateQRMatrix('aaa')).not.toEqual(generateQRMatrix('bbb'))
  })

  it('uses the second argument as matrix size, not an ECC level', () => {
    const matrix = generateQRMatrix('x', 25)
    expect(matrix).toHaveLength(25)
    expect(matrix.every((row) => row.length === 25)).toBe(true)
  })
})
