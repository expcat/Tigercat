import { describe, expect, it } from 'vitest'
import {
  clampImageAnnotationPoint,
  createImageAnnotationBox,
  createImageAnnotationId,
  createImageAnnotationPath,
  finishImageAnnotationDraw,
  getAnnotationDisplaySize,
  getImageAnnotationCenter,
  getImageAnnotationPathData,
  getImageAnnotationPointFromClient,
  getImageAnnotationShapeAriaLabel,
  getImageAnnotationToolButtonClasses,
  getImageEditorLabels,
  getNextImageAnnotationTool,
  normalizeImageAnnotationBox,
  shouldCommitImageAnnotationBox,
  shouldCommitImageAnnotationPath,
  startImageAnnotationDraw
} from '@expcat/tigercat-core'

describe('image-annotation-utils', () => {
  it('lands inactive tool buttons on registered surface/text, not locked white or bg aliases', () => {
    const inactive = getImageAnnotationToolButtonClasses(false)
    expect(inactive).toContain('--tiger-surface')
    expect(inactive).toContain('--tiger-text')
    expect(inactive).toContain('--tiger-annotation-tool-bg,var(--tiger-surface')
    expect(inactive).toContain('--tiger-annotation-tool-text,var(--tiger-text')
    expect(inactive).toContain('hover:bg-[var(--tiger-surface-muted')
    expect(inactive).not.toContain('bg-[var(--tiger-bg,#ffffff)]')
    expect(inactive).not.toContain('--tiger-bg')
    expect(inactive).not.toContain('--tiger-fill')
    expect(inactive).not.toContain('text-white')

    const overrideIdx = inactive.indexOf('--tiger-annotation-tool-bg')
    const semanticIdx = inactive.indexOf('--tiger-surface')
    expect(overrideIdx).toBeGreaterThan(-1)
    expect(semanticIdx).toBeGreaterThan(overrideIdx)
  })

  it('keeps active tool buttons on primary with white text', () => {
    const active = getImageAnnotationToolButtonClasses(true)
    expect(active).toContain('bg-[var(--tiger-primary,#2563eb)]')
    expect(active).toContain('border-[var(--tiger-primary,#2563eb)]')
    expect(active).toContain('text-white')
    expect(active).not.toContain('--tiger-annotation-tool-bg')
    expect(active).not.toContain('bg-[var(--tiger-bg,#ffffff)]')
  })

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

  it('does not reuse ids that already exist on the value', () => {
    const id = createImageAnnotationId('rectangle', ['rectangle-1', 'ellipse-1'])
    expect(id).not.toBe('rectangle-1')
    expect(id.startsWith('rectangle-')).toBe(true)
  })

  it('fits the image to the host width and allows upscale', () => {
    expect(getAnnotationDisplaySize(800, 600, 400)).toEqual({ width: 400, height: 300 })
    expect(getAnnotationDisplaySize(100, 50, 400)).toEqual({ width: 400, height: 200 })
  })

  it('rejects a freehand stroke that never moved', () => {
    const drawing = startImageAnnotationDraw('freehand', { x: 0.2, y: 0.2 })
    expect(shouldCommitImageAnnotationPath(drawing.points, 0.01)).toBe(false)
    expect(finishImageAnnotationDraw(drawing, { x: 0.2, y: 0.2 }, 'freehand-1', 0.01)).toBeNull()
  })

  it('names shapes from locale templates', () => {
    const labels = getImageEditorLabels()
    expect(
      getImageAnnotationShapeAriaLabel(
        { id: 'a', type: 'rectangle', x: 0, y: 0, width: 0.1, height: 0.1 },
        labels
      )
    ).toBe('Rectangle annotation')
    expect(
      getImageAnnotationShapeAriaLabel(
        { id: 'a', type: 'rectangle', x: 0, y: 0, width: 0.1, height: 0.1, label: 'Face' },
        labels
      )
    ).toBe('Face, Rectangle annotation')
  })
})
