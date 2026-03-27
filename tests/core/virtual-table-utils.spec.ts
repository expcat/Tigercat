import { describe, it, expect } from 'vitest'
import {
  calculateVirtualRange,
  getVirtualRowKey,
  getVirtualTableContainerClasses,
  getVirtualTableRowClasses,
  virtualTableContainerClasses,
  virtualTableBorderedClasses,
  virtualTableRowClasses,
  virtualTableRowHoverClasses,
  virtualTableRowStripedClasses,
  virtualTableRowSelectedClasses
} from '@expcat/tigercat-core'

describe('virtual-table-utils', () => {
  // ─── calculateVirtualRange ────────────────────────────────

  describe('calculateVirtualRange', () => {
    it('returns empty range for zero rows', () => {
      const r = calculateVirtualRange(0, 400, 0, 48, 5)
      expect(r).toEqual({ start: 0, end: 0, offsetTop: 0, totalHeight: 0 })
    })

    it('returns empty range for zero rowHeight', () => {
      const r = calculateVirtualRange(0, 400, 100, 0, 5)
      expect(r).toEqual({ start: 0, end: 0, offsetTop: 0, totalHeight: 0 })
    })

    it('calculates range at scroll top 0', () => {
      const r = calculateVirtualRange(0, 400, 1000, 40, 5)
      expect(r.start).toBe(0)
      // visible = ceil(400/40) = 10, end = min(1000, 0+10+5) = 15
      expect(r.end).toBe(15)
      expect(r.offsetTop).toBe(0)
      expect(r.totalHeight).toBe(40000)
    })

    it('calculates range mid-scroll', () => {
      // scrollTop=2000 → startRaw=50, overscan=5, start=45
      const r = calculateVirtualRange(2000, 400, 1000, 40, 5)
      expect(r.start).toBe(45)
      // end = min(1000, 50 + 10 + 5) = 65
      expect(r.end).toBe(65)
      expect(r.offsetTop).toBe(45 * 40)
    })

    it('clamps start to 0', () => {
      // scrollTop=80 → startRaw=2, overscan=5, start = max(0, -3) = 0
      const r = calculateVirtualRange(80, 400, 100, 40, 5)
      expect(r.start).toBe(0)
    })

    it('clamps end to totalRows', () => {
      // scrollTop near bottom
      const r = calculateVirtualRange(3900, 400, 100, 40, 5)
      expect(r.end).toBe(100)
    })

    it('uses default overscan of 5', () => {
      const r = calculateVirtualRange(0, 400, 1000, 40)
      expect(r.end).toBe(15)
    })
  })

  // ─── getRowKey ────────────────────────────────────────────

  describe('getVirtualRowKey', () => {
    it('returns index when no rowKey', () => {
      expect(getVirtualRowKey({ id: 1 }, 5)).toBe(5)
    })

    it('returns property value for string key', () => {
      expect(getVirtualRowKey({ id: 42, name: 'a' }, 0, 'id')).toBe(42)
    })

    it('uses function key', () => {
      const fn = (row: { id: number }, idx: number) => `${row.id}-${idx}`
      expect(getVirtualRowKey({ id: 7 }, 3, fn)).toBe('7-3')
    })
  })

  // ─── getVirtualTableContainerClasses ──────────────────────

  describe('getVirtualTableContainerClasses', () => {
    it('returns base classes when not bordered', () => {
      const cls = getVirtualTableContainerClasses(false)
      expect(cls).toBe(virtualTableContainerClasses)
    })

    it('includes bordered classes', () => {
      const cls = getVirtualTableContainerClasses(true)
      expect(cls).toContain(virtualTableContainerClasses)
      expect(cls).toContain(virtualTableBorderedClasses)
    })

    it('appends custom className', () => {
      const cls = getVirtualTableContainerClasses(false, 'my-class')
      expect(cls).toContain('my-class')
    })
  })

  // ─── getVirtualTableRowClasses ────────────────────────────

  describe('getVirtualTableRowClasses', () => {
    it('returns base + hover classes', () => {
      const cls = getVirtualTableRowClasses(0, false, false)
      expect(cls).toContain(virtualTableRowClasses)
      expect(cls).toContain(virtualTableRowHoverClasses)
    })

    it('adds striped for odd index', () => {
      const cls = getVirtualTableRowClasses(1, true, false)
      expect(cls).toContain(virtualTableRowStripedClasses)
    })

    it('does not add striped for even index', () => {
      const cls = getVirtualTableRowClasses(0, true, false)
      expect(cls).not.toContain(virtualTableRowStripedClasses)
    })

    it('adds selected class', () => {
      const cls = getVirtualTableRowClasses(0, false, true)
      expect(cls).toContain(virtualTableRowSelectedClasses)
    })
  })
})
