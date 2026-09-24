/**
 * Independent format-bit reader.
 * Coordinates follow ISO/IEC 18004 and are not imported from the encoder.
 */
import { describe, expect, it } from 'vitest'
import { generateQRMatrix } from '@expcat/tigercat-core'

const FORMAT_MASK = 0b101010000010010
const FORMAT_GENERATOR = 0b10100110111

function readFormatCopy(modules: boolean[][], coordinates: Array<[number, number]>): number {
  let bits = 0
  coordinates.forEach(([row, column], index) => {
    if (modules[row]?.[column]) bits |= 1 << index
  })
  return bits
}

function formatResidue(masked: number): number {
  let rem = masked ^ FORMAT_MASK
  for (let i = 14; i >= 10; i -= 1) {
    if (((rem >>> i) & 1) !== 0) rem ^= FORMAT_GENERATOR << (i - 10)
  }
  return rem
}

function specFormatCoordinates(size: number): {
  primary: Array<[number, number]>
  secondary: Array<[number, number]>
} {
  const primary: Array<[number, number]> = []
  for (let row = 0; row <= 5; row += 1) primary.push([row, 8])
  primary.push([7, 8], [8, 8], [8, 7])
  for (let column = 5; column >= 0; column -= 1) primary.push([8, column])

  const secondary: Array<[number, number]> = []
  for (let column = size - 1; column >= size - 8; column -= 1) secondary.push([8, column])
  for (let row = size - 7; row <= size - 1; row += 1) secondary.push([row, 8])
  return { primary, secondary }
}

describe('QR format bits', () => {
  it('places both format copies on the spec axes', () => {
    for (const value of ['hello', 'https://tigercat.dev', '你好', 'a'.repeat(200)]) {
      const modules = generateQRMatrix(value)
      const size = modules.length
      const { primary, secondary } = specFormatCoordinates(size)
      const low = readFormatCopy(modules, primary)
      const high = readFormatCopy(modules, secondary)
      expect(primary[0]).toEqual([0, 8])
      expect(secondary[0]).toEqual([8, size - 1])
      expect(low).toBe(high)
      expect(formatResidue(low)).toBe(0)
    }
  })
})
