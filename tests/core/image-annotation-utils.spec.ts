import { describe, expect, it } from 'vitest'
import {
  clampImageAnnotationPoint,
  createImageAnnotationBox,
  createImageAnnotationPath,
  getImageAnnotationCenter,
  getImageAnnotationPathData,
  getImageAnnotationPointFromClient,
  getNextImageAnnotationTool,
  normalizeImageAnnotationBox,
  shouldCommitImageAnnotationBox
} from '@expcat/tigercat-core'

describe('image-annotation-utils', () => {
  it('clamps normalized points into image bounds', () => {
    expect(clampImageAnnotationPoint({ x: -0.2, y: 1.4 })).toEqual({ x: 0, y: 1 })
    expect(clampImageAnnotationPoint({ x: Number.NaN, y: Number.POSITIVE_INFINITY })).toEqual({
      x: 0,
      y: 0
    })
  })

  it('normalizes boxes regardless of drag direction', () => {
    expect(normalizeImageAnnotationBox({ x: 0.8, y: 0.7 }, { x: 0.2, y: 0.1 })).toEqual({
      x: 0.2,
      y: 0.1,
      width: 0.6000000000000001,
      height: 0.6
    })
  })

  it('creates rectangle and ellipse annotations with shared box geometry', () => {
    expect(
      createImageAnnotationBox(
        'rectangle',
        'a1',
        { x: 0.1, y: 0.2 },
        { x: 0.5, y: 0.6 },
        {
          label: 'Face',
          color: '#ef4444'
        }
      )
    ).toEqual({
      id: 'a1',
      type: 'rectangle',
      x: 0.1,
      y: 0.2,
      width: 0.4,
      height: 0.39999999999999997,
      label: 'Face',
      color: '#ef4444'
    })
  })

  it('filters tiny box annotations', () => {
    expect(shouldCommitImageAnnotationBox({ width: 0.02, height: 0.02 })).toBe(true)
    expect(shouldCommitImageAnnotationBox({ width: 0.005, height: 0.02 })).toBe(false)
  })

  it('creates closed polygon and open freehand path data', () => {
    const polygon = createImageAnnotationPath('polygon', 'poly', [
      { x: 0.1, y: 0.1 },
      { x: 0.4, y: 0.1 },
      { x: 0.4, y: 0.5 }
    ])
    const freehand = createImageAnnotationPath('freehand', 'draw', [
      { x: 0.1, y: 0.2 },
      { x: 0.3, y: 0.4 }
    ])

    expect(getImageAnnotationPathData(polygon, 200, 100)).toBe('M 20 10 L 80 10 L 80 50 Z')
    expect(getImageAnnotationPathData(freehand, 200, 100)).toBe('M 20 20 L 60 40')
  })

  it('gets annotation centers for boxes and paths', () => {
    const rect = createImageAnnotationBox(
      'rectangle',
      'rect',
      { x: 0.2, y: 0.2 },
      { x: 0.4, y: 0.6 }
    )
    const path = createImageAnnotationPath('freehand', 'path', [
      { x: 0.1, y: 0.2 },
      { x: 0.3, y: 0.4 }
    ])

    expect(getImageAnnotationCenter(rect, 1000, 500).x).toBeCloseTo(300)
    expect(getImageAnnotationCenter(rect, 1000, 500).y).toBeCloseTo(200)
    expect(getImageAnnotationCenter(path, 1000, 500).x).toBeCloseTo(200)
    expect(getImageAnnotationCenter(path, 1000, 500).y).toBeCloseTo(150)
  })

  it('converts pointer coordinates to normalized image points', () => {
    expect(
      getImageAnnotationPointFromClient(150, 80, {
        left: 50,
        top: 20,
        width: 200,
        height: 100
      })
    ).toEqual({ x: 0.5, y: 0.6 })
  })

  it('cycles enabled tools', () => {
    expect(getNextImageAnnotationTool('select', ['select', 'rectangle'])).toBe('rectangle')
    expect(getNextImageAnnotationTool('rectangle', ['select', 'rectangle'])).toBe('select')
    expect(getNextImageAnnotationTool('freehand', ['rectangle'])).toBe('rectangle')
  })
})
