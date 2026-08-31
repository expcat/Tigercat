/**
 * Byte-mode QR encoder (ISO/IEC 18004).
 *
 * Finder / timing / alignment, Reed–Solomon ECC, 8 masks, format (+ version)
 * information. Default ECC is M. Dark modules are `true`.
 */

export type QREccLevel = 'L' | 'M' | 'Q' | 'H'

const ECC_INDEX: Record<QREccLevel, number> = { L: 0, M: 1, Q: 2, H: 3 }

/** Quiet-zone modules on each side. Scanners need this. */
export const QR_QUIET_ZONE = 4

// ECC codewords per block, indexed [level][version]. Version 0 unused.
const ECC_CODEWORDS_PER_BLOCK = [
  [
    -1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30,
    30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30
  ],
  [
    -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28,
    28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28
  ],
  [
    -1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30,
    30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30
  ],
  [
    -1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30
  ]
]

const NUM_ERROR_CORRECTION_BLOCKS = [
  [
    -1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14,
    15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25
  ],
  [
    -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23,
    25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49
  ],
  [
    -1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34,
    34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68
  ],
  [
    -1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35,
    37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81
  ]
]

const EXP = new Uint8Array(512)
const LOG = new Uint8Array(256)

;(() => {
  let x = 1
  for (let i = 0; i < 255; i++) {
    EXP[i] = x
    LOG[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]
})()

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return EXP[LOG[a] + LOG[b]]
}

function rsGenerator(degree: number): Uint8Array {
  let poly: number[] = [1]
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0)
    const factor = EXP[i]
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j]
      next[j + 1] ^= gfMul(poly[j], factor)
    }
    poly = next
  }
  return Uint8Array.from(poly.slice(1))
}

function rsRemainder(data: Uint8Array, eccLen: number): Uint8Array {
  const gen = rsGenerator(eccLen)
  const result = new Uint8Array(eccLen)
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ result[0]
    result.copyWithin(0, 1)
    result[eccLen - 1] = 0
    if (factor === 0) continue
    for (let j = 0; j < eccLen; j++) {
      result[j] ^= gfMul(gen[j], factor)
    }
  }
  return result
}

function versionSize(version: number): number {
  return 17 + 4 * version
}

function numRawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2
    result -= (25 * numAlign - 10) * numAlign - 55
    if (version >= 7) result -= 36
  }
  return result
}

function totalCodewords(version: number): number {
  return Math.floor(numRawDataModules(version) / 8)
}

function byteCountBits(version: number): number {
  if (version <= 9) return 8
  if (version <= 26) return 16
  return 16
}

function dataCapacity(version: number, ecc: QREccLevel): number {
  const level = ECC_INDEX[ecc]
  const eccLen = ECC_CODEWORDS_PER_BLOCK[level][version]
  const blocks = NUM_ERROR_CORRECTION_BLOCKS[level][version]
  return totalCodewords(version) - eccLen * blocks
}

function chooseVersion(byteLength: number, ecc: QREccLevel): number {
  for (let version = 1; version <= 40; version++) {
    const cap = dataCapacity(version, ecc)
    const headerBits = 4 + byteCountBits(version)
    const needBytes = Math.ceil((headerBits + byteLength * 8) / 8)
    if (needBytes <= cap) return version
  }
  throw new Error('QRCode: value is too long to encode')
}

function getAlignmentPatternPositions(version: number): number[] {
  if (version === 1) return []
  const size = versionSize(version)
  const numAlign = Math.floor(version / 7) + 2
  const step = version === 32 ? 26 : Math.ceil((size - 13) / (numAlign * 2 - 2)) * 2
  const result: number[] = [6]
  for (let pos = size - 7; result.length < numAlign; pos -= step) {
    result.splice(1, 0, pos)
  }
  return result
}

class BitBuffer {
  bits: number[] = []
  put(value: number, length: number): void {
    for (let i = length - 1; i >= 0; i--) this.bits.push((value >>> i) & 1)
  }
  putBytes(bytes: Uint8Array): void {
    for (const b of bytes) this.put(b, 8)
  }
}

function encodeData(bytes: Uint8Array, version: number, ecc: QREccLevel): Uint8Array {
  const cap = dataCapacity(version, ecc)
  const buf = new BitBuffer()
  buf.put(0b0100, 4)
  buf.put(bytes.length, byteCountBits(version))
  buf.putBytes(bytes)
  const capacityBits = cap * 8
  const term = Math.min(4, capacityBits - buf.bits.length)
  for (let i = 0; i < term; i++) buf.bits.push(0)
  while (buf.bits.length % 8 !== 0) buf.bits.push(0)
  const padBytes = [0xec, 0x11]
  let pad = 0
  while (buf.bits.length / 8 < cap) {
    buf.put(padBytes[pad % 2], 8)
    pad++
  }
  const data = new Uint8Array(cap)
  for (let i = 0; i < cap; i++) {
    let v = 0
    for (let j = 0; j < 8; j++) v = (v << 1) | buf.bits[i * 8 + j]
    data[i] = v
  }
  return data
}

function interleave(data: Uint8Array, version: number, ecc: QREccLevel): Uint8Array {
  const level = ECC_INDEX[ecc]
  const eccLen = ECC_CODEWORDS_PER_BLOCK[level][version]
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[level][version]
  const total = totalCodewords(version)
  const shortBlockData = Math.floor(data.length / numBlocks)
  const numLong = data.length % numBlocks
  const numShort = numBlocks - numLong

  const blocks: { data: Uint8Array; ecc: Uint8Array }[] = []
  let offset = 0
  for (let i = 0; i < numBlocks; i++) {
    const len = shortBlockData + (i < numShort ? 0 : 1)
    const blockData = data.subarray(offset, offset + len)
    offset += len
    blocks.push({ data: blockData, ecc: rsRemainder(blockData, eccLen) })
  }

  const out = new Uint8Array(total)
  let k = 0
  const maxData = shortBlockData + (numLong > 0 ? 1 : 0)
  for (let i = 0; i < maxData; i++) {
    for (const block of blocks) {
      if (i < block.data.length) out[k++] = block.data[i]
    }
  }
  for (let i = 0; i < eccLen; i++) {
    for (const block of blocks) out[k++] = block.ecc[i]
  }
  return out
}

type Grid = boolean[][]

function blankGrid(n: number): Grid {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => false))
}

function drawFinder(modules: Grid, func: Grid, ox: number, oy: number): void {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const y = oy + r
      const x = ox + c
      if (y < 0 || x < 0 || y >= modules.length || x >= modules.length) continue
      const dark =
        (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
        (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
        (r >= 2 && r <= 4 && c >= 2 && c <= 4)
      modules[y][x] = dark
      func[y][x] = true
    }
  }
}

function drawAlignment(modules: Grid, func: Grid, cx: number, cy: number): void {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const dark = Math.max(Math.abs(r), Math.abs(c)) !== 1
      modules[cy + r][cx + c] = dark
      func[cy + r][cx + c] = true
    }
  }
}

function drawFunctionPatterns(modules: Grid, func: Grid, version: number): void {
  const n = modules.length
  drawFinder(modules, func, 0, 0)
  drawFinder(modules, func, n - 7, 0)
  drawFinder(modules, func, 0, n - 7)

  for (let i = 0; i < n; i++) {
    const dark = i % 2 === 0
    if (!func[6][i]) {
      modules[6][i] = dark
      func[6][i] = true
    }
    if (!func[i][6]) {
      modules[i][6] = dark
      func[i][6] = true
    }
  }

  const aligns = getAlignmentPatternPositions(version)
  for (const y of aligns) {
    for (const x of aligns) {
      const onFinder = (x <= 7 && y <= 7) || (x >= n - 8 && y <= 7) || (x <= 7 && y >= n - 8)
      if (onFinder) continue
      drawAlignment(modules, func, x, y)
    }
  }

  modules[n - 8][8] = true
  func[n - 8][8] = true

  for (let i = 0; i < 9; i++) {
    func[8][i] = true
    func[i][8] = true
  }
  for (let i = 0; i < 8; i++) {
    func[8][n - 1 - i] = true
    func[n - 1 - i][8] = true
  }

  if (version >= 7) {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 3; c++) {
        func[r][n - 11 + c] = true
        func[n - 11 + c][r] = true
      }
    }
  }
}

function maskBit(mask: number, r: number, c: number): boolean {
  switch (mask) {
    case 0:
      return (r + c) % 2 === 0
    case 1:
      return r % 2 === 0
    case 2:
      return c % 3 === 0
    case 3:
      return (r + c) % 3 === 0
    case 4:
      return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0
    case 5:
      return ((r * c) % 2) + ((r * c) % 3) === 0
    case 6:
      return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0
    case 7:
      return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0
    default:
      return false
  }
}

function placeData(modules: Grid, func: Grid, data: Uint8Array): void {
  const n = modules.length
  let bit = 0
  const totalBits = data.length * 8
  let goingUp = true
  for (let col = n - 1; col > 0; col -= 2) {
    if (col === 6) col--
    for (let i = 0; i < n; i++) {
      const row = goingUp ? n - 1 - i : i
      for (let c = 0; c < 2; c++) {
        const x = col - c
        if (func[row][x]) continue
        const dark = bit < totalBits ? ((data[bit >> 3] >>> (7 - (bit & 7))) & 1) === 1 : false
        modules[row][x] = dark
        bit++
      }
    }
    goingUp = !goingUp
  }
}

function applyMask(modules: Grid, func: Grid, mask: number): void {
  const n = modules.length
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!func[r][c] && maskBit(mask, r, c)) modules[r][c] = !modules[r][c]
    }
  }
}

function drawFormat(modules: Grid, ecc: QREccLevel, mask: number): void {
  const eccBits = { L: 1, M: 0, Q: 3, H: 2 }[ecc]
  let data = (eccBits << 3) | mask
  let rem = data << 10
  for (let i = 14; i >= 10; i--) {
    if (((rem >>> i) & 1) !== 0) rem ^= 0b10100110111 << (i - 10)
  }
  const bits = ((data << 10) | rem) ^ 0b101010000010010
  const n = modules.length
  for (let i = 0; i <= 5; i++) modules[8][i] = ((bits >> i) & 1) === 1
  modules[8][7] = ((bits >> 6) & 1) === 1
  modules[8][8] = ((bits >> 7) & 1) === 1
  modules[7][8] = ((bits >> 8) & 1) === 1
  for (let i = 9; i < 15; i++) modules[14 - i][8] = ((bits >> i) & 1) === 1
  for (let i = 0; i < 8; i++) modules[n - 1 - i][8] = ((bits >> i) & 1) === 1
  for (let i = 8; i < 15; i++) modules[8][n - 15 + i] = ((bits >> i) & 1) === 1
}

function drawVersion(modules: Grid, version: number): void {
  if (version < 7) return
  let rem = version << 12
  for (let i = 17; i >= 12; i--) {
    if (((rem >>> i) & 1) !== 0) rem ^= 0b1111100100101 << (i - 12)
  }
  const bits = (version << 12) | rem
  const n = modules.length
  for (let i = 0; i < 18; i++) {
    const dark = ((bits >> i) & 1) === 1
    const a = Math.floor(i / 3)
    const b = i % 3
    modules[a][n - 11 + b] = dark
    modules[n - 11 + b][a] = dark
  }
}

function penalty(modules: Grid): number {
  const n = modules.length
  let score = 0
  for (let r = 0; r < n; r++) {
    let run = 1
    for (let c = 1; c <= n; c++) {
      if (c < n && modules[r][c] === modules[r][c - 1]) run++
      else {
        if (run >= 5) score += 3 + (run - 5)
        run = 1
      }
    }
  }
  for (let c = 0; c < n; c++) {
    let run = 1
    for (let r = 1; r <= n; r++) {
      if (r < n && modules[r][c] === modules[r - 1][c]) run++
      else {
        if (run >= 5) score += 3 + (run - 5)
        run = 1
      }
    }
  }
  for (let r = 0; r < n - 1; r++) {
    for (let c = 0; c < n - 1; c++) {
      const v = modules[r][c]
      if (v === modules[r][c + 1] && v === modules[r + 1][c] && v === modules[r + 1][c + 1]) {
        score += 3
      }
    }
  }
  const finder = [true, false, true, true, true, false, true]
  const hasFinder = (row: boolean[], start: number): boolean => {
    for (let i = 0; i < 7; i++) if (row[start + i] !== finder[i]) return false
    return true
  }
  for (let r = 0; r < n; r++) {
    for (let c = 0; c <= n - 7; c++) {
      if (hasFinder(modules[r], c)) {
        const left = c >= 4 && modules[r].slice(c - 4, c).every((x) => !x)
        const right = c + 11 <= n && modules[r].slice(c + 7, c + 11).every((x) => !x)
        if (left || right) score += 40
      }
    }
  }
  for (let c = 0; c < n; c++) {
    const col = modules.map((row) => row[c])
    for (let r = 0; r <= n - 7; r++) {
      if (hasFinder(col, r)) {
        const up = r >= 4 && col.slice(r - 4, r).every((x) => !x)
        const down = r + 11 <= n && col.slice(r + 7, r + 11).every((x) => !x)
        if (up || down) score += 40
      }
    }
  }
  let dark = 0
  for (const row of modules) for (const cell of row) if (cell) dark++
  const percent = (dark * 100) / (n * n)
  score += Math.floor(Math.abs(percent - 50) / 5) * 10
  return score
}

function cloneGrid(modules: Grid): Grid {
  return modules.map((row) => row.slice())
}

function utf8Bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value)
}

/**
 * Encode `value` as a QR module matrix (no quiet zone). Dark = true.
 */
export function encodeQRMatrix(value: string, ecc: QREccLevel = 'M'): boolean[][] {
  const bytes = utf8Bytes(value ?? '')
  const version = chooseVersion(bytes.length, ecc)
  const data = encodeData(bytes, version, ecc)
  const interleaved = interleave(data, version, ecc)
  const n = versionSize(version)
  const modules = blankGrid(n)
  const func = blankGrid(n)
  drawFunctionPatterns(modules, func, version)

  let best: Grid | null = null
  let bestScore = Infinity
  for (let mask = 0; mask < 8; mask++) {
    const candidate = cloneGrid(modules)
    placeData(candidate, func, interleaved)
    applyMask(candidate, func, mask)
    drawFormat(candidate, ecc, mask)
    drawVersion(candidate, version)
    const score = penalty(candidate)
    if (score < bestScore) {
      bestScore = score
      best = candidate
    }
  }
  return best ?? modules
}

/** Remainder of `data || ecc` must be zero if Reed–Solomon is well-formed. */
export function qrRsRemainder(data: Uint8Array, eccLen: number): Uint8Array {
  return rsRemainder(data, eccLen)
}

export function qrDataCapacity(version: number, ecc: QREccLevel): number {
  return dataCapacity(version, ecc)
}

export function qrChooseVersion(byteLength: number, ecc: QREccLevel = 'M'): number {
  return chooseVersion(byteLength, ecc)
}

/**
 * Read the byte-mode payload back out of a matrix produced by `encodeQRMatrix`.
 * Used to prove round-trip without a third-party scanner.
 */
export function decodeQRMatrixBytes(modules: boolean[][]): string {
  const n = modules.length
  if ((n - 17) % 4 !== 0) throw new Error('invalid QR size')
  const version = (n - 17) / 4
  const func = blankGrid(n)
  const scratch = blankGrid(n)
  drawFunctionPatterns(scratch, func, version)

  const readFormat = (): { ecc: QREccLevel; mask: number } => {
    let bits = 0
    for (let i = 0; i < 6; i++) if (modules[8][i]) bits |= 1 << i
    if (modules[8][7]) bits |= 1 << 6
    if (modules[8][8]) bits |= 1 << 7
    if (modules[7][8]) bits |= 1 << 8
    for (let i = 9; i < 15; i++) if (modules[14 - i][8]) bits |= 1 << i
    bits ^= 0b101010000010010
    const data = bits >> 10
    const eccBits = data >> 3
    const mask = data & 7
    const ecc: QREccLevel = ({ 1: 'L', 0: 'M', 3: 'Q', 2: 'H' } as const)[eccBits] ?? 'M'
    return { ecc, mask }
  }

  const { ecc, mask } = readFormat()
  const unmasked = cloneGrid(modules)
  applyMask(unmasked, func, mask)

  const total = totalCodewords(version)
  const bits: number[] = []
  let goingUp = true
  for (let col = n - 1; col > 0; col -= 2) {
    if (col === 6) col--
    for (let i = 0; i < n; i++) {
      const row = goingUp ? n - 1 - i : i
      for (let c = 0; c < 2; c++) {
        const x = col - c
        if (func[row][x]) continue
        bits.push(unmasked[row][x] ? 1 : 0)
      }
    }
    goingUp = !goingUp
  }

  const codewords = new Uint8Array(total)
  for (let i = 0; i < total; i++) {
    let v = 0
    for (let j = 0; j < 8; j++) v = (v << 1) | (bits[i * 8 + j] ?? 0)
    codewords[i] = v
  }

  const level = ECC_INDEX[ecc]
  const eccLen = ECC_CODEWORDS_PER_BLOCK[level][version]
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[level][version]
  const dataLen = total - eccLen * numBlocks
  const shortBlockData = Math.floor(dataLen / numBlocks)
  const numLong = dataLen % numBlocks
  const numShort = numBlocks - numLong
  const blockDataLens = Array.from({ length: numBlocks }, (_, i) =>
    i < numShort ? shortBlockData : shortBlockData + 1
  )
  const dataBlocks = blockDataLens.map((len) => new Uint8Array(len))
  let k = 0
  const maxData = shortBlockData + (numLong > 0 ? 1 : 0)
  for (let i = 0; i < maxData; i++) {
    for (let b = 0; b < numBlocks; b++) {
      if (i < dataBlocks[b].length) dataBlocks[b][i] = codewords[k++]
    }
  }
  const data = new Uint8Array(dataLen)
  let d = 0
  for (const block of dataBlocks) {
    data.set(block, d)
    d += block.length
  }

  let bitPos = 0
  const read = (len: number): number => {
    let v = 0
    for (let i = 0; i < len; i++) {
      const byte = data[bitPos >> 3]
      const bit = (byte >>> (7 - (bitPos & 7))) & 1
      v = (v << 1) | bit
      bitPos++
    }
    return v
  }
  const mode = read(4)
  if (mode !== 0b0100) throw new Error(`unsupported QR mode ${mode}`)
  const count = read(byteCountBits(version))
  const out = new Uint8Array(count)
  for (let i = 0; i < count; i++) out[i] = read(8)
  return new TextDecoder().decode(out)
}
