import { describe, it, expect } from 'vitest'
import {
  getSplitterContainerClasses,
  getSplitterGutterClasses,
  getSplitterGutterHandleClasses,
  parsePaneSize,
  calculateInitialSizes,
  clampPaneSize,
  resizePanes,
  getPaneStyle,
  sizesToPercentages,
  splitterBaseClasses,
  splitterHorizontalClasses,
  splitterVerticalClasses
} from '@expcat/tigercat-core'

describe('splitter-utils', () => {
  describe('getSplitterContainerClasses', () => {
    it('should return horizontal classes by default', () => {
      const classes = getSplitterContainerClasses('horizontal')
      expect(classes).toContain(splitterBaseClasses)
      expect(classes).toContain(splitterHorizontalClasses)
    })

    it('should return vertical classes', () => {
      const classes = getSplitterContainerClasses('vertical')
      expect(classes).toContain(splitterVerticalClasses)
      expect(classes).not.toContain(splitterHorizontalClasses)
    })

    it('should append custom className', () => {
      const classes = getSplitterContainerClasses('horizontal', 'my-custom')
      expect(classes).toContain('my-custom')
    })
  })

  describe('getSplitterGutterClasses', () => {
    it('should return horizontal gutter classes', () => {
      const classes = getSplitterGutterClasses('horizontal', false, false)
      expect(classes).toContain('cursor-col-resize')
    })

    it('should return vertical gutter classes', () => {
      const classes = getSplitterGutterClasses('vertical', false, false)
      expect(classes).toContain('cursor-row-resize')
    })

    it('should include dragging class when dragging', () => {
      const classes = getSplitterGutterClasses('horizontal', true, false)
      expect(classes).toContain('bg-[var(--tiger-primary,#2563eb)]')
    })

    it('should include disabled class when disabled', () => {
      const classes = getSplitterGutterClasses('horizontal', false, true)
      expect(classes).toContain('pointer-events-none')
      expect(classes).toContain('opacity-50')
    })

    it('should include both dragging and disabled', () => {
      const classes = getSplitterGutterClasses('horizontal', true, true)
      expect(classes).toContain('bg-[var(--tiger-primary,#2563eb)]')
      expect(classes).toContain('pointer-events-none')
    })
  })

  describe('getSplitterGutterHandleClasses', () => {
    it('should return horizontal handle classes', () => {
      const classes = getSplitterGutterHandleClasses('horizontal')
      expect(classes).toContain('w-0.5')
      expect(classes).toContain('h-6')
    })

    it('should return vertical handle classes', () => {
      const classes = getSplitterGutterHandleClasses('vertical')
      expect(classes).toContain('h-0.5')
      expect(classes).toContain('w-6')
    })
  })

  describe('parsePaneSize', () => {
    it('should return number as-is', () => {
      expect(parsePaneSize(200, 1000)).toBe(200)
    })

    it('should parse percentage string', () => {
      expect(parsePaneSize('50%', 1000)).toBe(500)
    })

    it('should parse pixel string', () => {
      expect(parsePaneSize('300px', 1000)).toBe(300)
    })

    it('should parse bare number string', () => {
      expect(parsePaneSize('250', 1000)).toBe(250)
    })

    it('should return 0 for invalid string', () => {
      expect(parsePaneSize('abc', 1000)).toBe(0)
    })

    it('should handle zero percentage', () => {
      expect(parsePaneSize('0%', 1000)).toBe(0)
    })

    it('should handle 100 percentage', () => {
      expect(parsePaneSize('100%', 800)).toBe(800)
    })
  })

  describe('calculateInitialSizes', () => {
    it('should split equally when no default sizes', () => {
      const sizes = calculateInitialSizes(2, 1000, 4)
      expect(sizes).toHaveLength(2)
      expect(sizes[0]).toBe(498) // (1000 - 4) / 2
      expect(sizes[1]).toBe(498)
    })

    it('should split 3 panes equally', () => {
      const sizes = calculateInitialSizes(3, 1000, 4)
      expect(sizes).toHaveLength(3)
      const available = 1000 - 2 * 4 // 992
      expect(sizes[0]).toBeCloseTo(available / 3)
    })

    it('should use provided default sizes', () => {
      const sizes = calculateInitialSizes(2, 1000, 4, [300, 692])
      expect(sizes).toEqual([300, 692])
    })

    it('should parse percentage default sizes', () => {
      const sizes = calculateInitialSizes(2, 1000, 4, ['30%', '70%'])
      const available = 1000 - 4 // 996
      expect(sizes[0]).toBeCloseTo(0.3 * available)
      expect(sizes[1]).toBeCloseTo(0.7 * available)
    })

    it('should ignore default sizes with wrong count', () => {
      const sizes = calculateInitialSizes(3, 1000, 4, [300, 700])
      // Wrong count, falls back to equal split
      expect(sizes).toHaveLength(3)
    })

    it('should handle single pane', () => {
      const sizes = calculateInitialSizes(1, 500, 4)
      expect(sizes).toEqual([500])
    })
  })

  describe('clampPaneSize', () => {
    it('should clamp below min', () => {
      expect(clampPaneSize(50, 100)).toBe(100)
    })

    it('should clamp above max', () => {
      expect(clampPaneSize(500, 0, 400)).toBe(400)
    })

    it('should return value within range', () => {
      expect(clampPaneSize(200, 100, 400)).toBe(200)
    })

    it('should handle no max', () => {
      expect(clampPaneSize(99999, 0)).toBe(99999)
    })

    it('should handle min = max', () => {
      expect(clampPaneSize(500, 200, 200)).toBe(200)
    })
  })

  describe('resizePanes', () => {
    it('should resize two panes with positive delta', () => {
      const result = resizePanes([400, 400], 0, 100, [0, 0], [undefined, undefined])
      expect(result).not.toBeNull()
      expect(result![0]).toBe(500)
      expect(result![1]).toBe(300)
    })

    it('should resize two panes with negative delta', () => {
      const result = resizePanes([400, 400], 0, -100, [0, 0], [undefined, undefined])
      expect(result).not.toBeNull()
      expect(result![0]).toBe(300)
      expect(result![1]).toBe(500)
    })

    it('should respect minimum sizes', () => {
      const result = resizePanes([400, 400], 0, -500, [100, 100], [undefined, undefined])
      expect(result).not.toBeNull()
      expect(result![0]).toBeGreaterThanOrEqual(100)
      expect(result![1]).toBeGreaterThanOrEqual(100)
    })

    it('should respect maximum sizes', () => {
      const result = resizePanes([400, 400], 0, 500, [0, 0], [600, 600])
      expect(result).not.toBeNull()
      expect(result![0]).toBeLessThanOrEqual(600)
      expect(result![1]).toBeLessThanOrEqual(600)
    })

    it('should return null for invalid gutter index', () => {
      expect(resizePanes([400, 400], -1, 100, [0, 0], [undefined, undefined])).toBeNull()
      expect(resizePanes([400, 400], 2, 100, [0, 0], [undefined, undefined])).toBeNull()
    })

    it('should handle three panes, resize middle gutter', () => {
      const result = resizePanes(
        [300, 300, 300],
        1,
        50,
        [0, 0, 0],
        [undefined, undefined, undefined]
      )
      expect(result).not.toBeNull()
      expect(result![0]).toBe(300) // unchanged
      expect(result![1]).toBe(350)
      expect(result![2]).toBe(250)
    })

    it('should not modify original array', () => {
      const sizes = [400, 400]
      resizePanes(sizes, 0, 100, [0, 0], [undefined, undefined])
      expect(sizes).toEqual([400, 400])
    })

    it('should handle zero delta', () => {
      const result = resizePanes([400, 400], 0, 0, [0, 0], [undefined, undefined])
      expect(result).not.toBeNull()
      expect(result).toEqual([400, 400])
    })
  })

  describe('getPaneStyle', () => {
    it('should return width style for horizontal', () => {
      const style = getPaneStyle(300, 'horizontal')
      expect(style.width).toBe('300px')
      expect(style.flexShrink).toBe('0')
      expect(style.flexGrow).toBe('0')
    })

    it('should return height style for vertical', () => {
      const style = getPaneStyle(200, 'vertical')
      expect(style.height).toBe('200px')
      expect(style.flexShrink).toBe('0')
    })
  })

  describe('sizesToPercentages', () => {
    it('should convert sizes to percentages', () => {
      const pcts = sizesToPercentages([300, 300])
      expect(pcts[0]).toBeCloseTo(50)
      expect(pcts[1]).toBeCloseTo(50)
    })

    it('should handle unequal sizes', () => {
      const pcts = sizesToPercentages([100, 300])
      expect(pcts[0]).toBeCloseTo(25)
      expect(pcts[1]).toBeCloseTo(75)
    })

    it('should handle all zeros', () => {
      const pcts = sizesToPercentages([0, 0, 0])
      expect(pcts).toEqual([0, 0, 0])
    })

    it('should handle single pane', () => {
      const pcts = sizesToPercentages([500])
      expect(pcts[0]).toBeCloseTo(100)
    })
  })
})
