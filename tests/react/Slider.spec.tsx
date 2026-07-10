/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Slider } from '@expcat/tigercat-react'
import {
  expectNoA11yViolationsIsolated,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils/react'

const getThumb = (container: HTMLElement) =>
  container.querySelector('[role="slider"]') as HTMLElement
const getThumbs = (container: HTMLElement) => container.querySelectorAll('[role="slider"]')

// Stub the track's getBoundingClientRect so position-based drag / track-click
// computations are deterministic.
const stubTrackRect = (container: HTMLElement, width = 200) => {
  const track = getThumb(container).parentElement as HTMLElement
  track.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      right: width,
      bottom: 8,
      width,
      height: 8,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }) as DOMRect
  return track
}

describe('Slider', () => {
  describe('Rendering', () => {
    it('should render a slider thumb by default', () => {
      const { container } = render(<Slider />)
      expect(getThumb(container)).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<Slider className="custom-class" />)
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it.each(componentSizes)('should render %s size', (size) => {
      const { container } = render(<Slider size={size} />)
      expect(getThumb(container)).toBeInTheDocument()
    })
  })

  describe('Value and ARIA', () => {
    it('should reflect value, min and max as aria attributes', () => {
      const { container } = render(<Slider value={15} min={10} max={20} />)
      const slider = getThumb(container)
      expect(slider).toHaveAttribute('role', 'slider')
      expect(slider).toHaveAttribute('aria-valuenow', '15')
      expect(slider).toHaveAttribute('aria-valuemin', '10')
      expect(slider).toHaveAttribute('aria-valuemax', '20')
    })

    it('should support negative values', () => {
      const { container } = render(<Slider value={-5} min={-10} max={0} />)
      expect(getThumb(container)).toHaveAttribute('aria-valuenow', '-5')
    })

    it('should mark the disabled state with aria-disabled', () => {
      const { container } = render(<Slider disabled />)
      expect(getThumb(container)).toHaveAttribute('aria-disabled', 'true')
    })

    it('should forward aria-label and custom props', () => {
      const { container } = render(<Slider aria-label="Volume" data-testid="custom-slider" />)
      expect(getThumb(container)).toHaveAttribute('aria-label', 'Volume')
      expect(container.querySelector('[data-testid="custom-slider"]')).toBeInTheDocument()
    })
  })

  describe('Keyboard', () => {
    it('should call onChange on arrow key, but not when disabled', async () => {
      const onChange = vi.fn()
      const { container, rerender } = render(<Slider value={50} onChange={onChange} />)
      await fireEvent.keyDown(getThumb(container), { key: 'ArrowRight' })
      expect(onChange).toHaveBeenCalled()

      onChange.mockClear()
      rerender(<Slider value={50} disabled onChange={onChange} />)
      await fireEvent.keyDown(getThumb(container), { key: 'ArrowRight' })
      expect(onChange).not.toHaveBeenCalled()
    })
    it.each([
      ['ArrowRight', 100, 100],
      ['ArrowLeft', 0, 0]
    ])('should clamp %s at the boundary', async (key, value, expected) => {
      const onChange = vi.fn()
      const { container } = render(
        <Slider value={value as number} min={0} max={100} onChange={onChange} />
      )
      await fireEvent.keyDown(getThumb(container), { key: key as string })
      expect(onChange).toHaveBeenCalledWith(expected)
    })

    it('should be focusable via keyboard', async () => {
      const user = userEvent.setup()
      const { container } = render(<Slider />)
      await user.tab()
      expect(getThumb(container)).toHaveFocus()
    })
  })

  describe('Controlled and uncontrolled', () => {
    it('should update aria-valuenow when the value prop changes', () => {
      const { container, rerender } = render(<Slider value={30} />)
      expect(getThumb(container)).toHaveAttribute('aria-valuenow', '30')
      rerender(<Slider value={70} />)
      expect(getThumb(container)).toHaveAttribute('aria-valuenow', '70')
    })

    it('should update internally in uncontrolled mode', async () => {
      const { container } = render(<Slider defaultValue={50} />)
      const slider = getThumb(container)
      expect(slider).toHaveAttribute('aria-valuenow', '50')
      await fireEvent.keyDown(slider, { key: 'ArrowRight' })
      expect(slider.getAttribute('aria-valuenow')).not.toBe('50')
    })
  })

  describe('Range mode', () => {
    it('should render two thumbs with correct aria values', () => {
      const { container } = render(<Slider value={[30, 70]} range min={0} max={100} />)
      const thumbs = getThumbs(container)
      expect(thumbs.length).toBe(2)
      expect(thumbs[0]).toHaveAttribute('aria-valuenow', '30')
      expect(thumbs[1]).toHaveAttribute('aria-valuenow', '70')
    })

    it('should support defaultValue in range mode', () => {
      const { container } = render(<Slider defaultValue={[25, 75]} range />)
      const thumbs = getThumbs(container)
      expect(thumbs[0]).toHaveAttribute('aria-valuenow', '25')
      expect(thumbs[1]).toHaveAttribute('aria-valuenow', '75')
    })

    it('should call onChange with an array and update the targeted thumb', async () => {
      const onChange = vi.fn()
      const { container } = render(<Slider value={[20, 80]} range onChange={onChange} />)
      const thumbs = getThumbs(container)
      await fireEvent.keyDown(thumbs[0], { key: 'ArrowRight' })
      expect(Array.isArray(onChange.mock.calls[0][0])).toBe(true)

      onChange.mockClear()
      await fireEvent.keyDown(thumbs[1], { key: 'ArrowLeft' })
      expect(onChange).toHaveBeenCalled()
    })
    it('should label per-thumb aria-label, falling back to defaults', () => {
      const { container: withLabel } = render(
        <Slider value={[20, 80]} range aria-label="Brightness" />
      )
      const labelled = getThumbs(withLabel)
      expect(labelled[0]).toHaveAttribute('aria-label', 'Brightness (min)')
      expect(labelled[1]).toHaveAttribute('aria-label', 'Brightness (max)')

      const { container: noLabel } = render(<Slider value={[20, 80]} range />)
      const fallback = getThumbs(noLabel)
      expect(fallback[0]).toHaveAttribute('aria-label', 'Minimum value')
      expect(fallback[1]).toHaveAttribute('aria-label', 'Maximum value')
    })
  })

  describe('Pointer drag', () => {
    it('should update value via mouse drag', () => {
      const onChange = vi.fn()
      const { container } = render(
        <Slider value={0} min={0} max={100} step={1} onChange={onChange} />
      )
      stubTrackRect(container, 200)
      fireEvent.mouseDown(getThumb(container), { clientX: 0 })
      fireEvent.mouseMove(document, { clientX: 100 })
      fireEvent.mouseUp(document)
      expect(onChange.mock.calls.at(-1)![0]).toBe(50)
    })
    it('should not start drag when disabled', () => {
      const onChange = vi.fn()
      const { container } = render(<Slider value={0} disabled onChange={onChange} />)
      stubTrackRect(container, 200)
      fireEvent.mouseDown(getThumb(container), { clientX: 0 })
      fireEvent.mouseMove(document, { clientX: 100 })
      fireEvent.mouseUp(document)
      expect(onChange).not.toHaveBeenCalled()
    })

    it.each([
      [0, 40, 60, [30, 80]],
      [1, 160, 120, [20, 60]]
    ])('should drag thumb %s in range mode', (index, from, to, expected) => {
      const onChange = vi.fn()
      const { container } = render(
        <Slider value={[20, 80]} range min={0} max={100} step={1} onChange={onChange} />
      )
      stubTrackRect(container, 200)
      const thumbs = getThumbs(container)

      fireEvent.mouseDown(thumbs[index as number], { clientX: from as number })
      fireEvent.mouseMove(document, { clientX: to as number })
      fireEvent.mouseUp(document)
      expect(onChange.mock.calls.at(-1)![0]).toEqual(expected)
    })

    it('should clamp the min thumb so it cannot pass the max thumb', () => {
      const onChange = vi.fn()
      const { container } = render(
        <Slider value={[20, 60]} range min={0} max={100} step={1} onChange={onChange} />
      )
      stubTrackRect(container, 200)
      const thumbs = getThumbs(container)
      fireEvent.mouseDown(thumbs[0], { clientX: 40 })
      fireEvent.mouseMove(document, { clientX: 180 })
      fireEvent.mouseUp(document)
      expect(onChange.mock.calls.at(-1)![0]).toEqual([60, 60])
    })
  })

  describe('Track click', () => {
    it('should set value via track click, and ignore it when disabled', () => {
      const onChange = vi.fn()
      const { container } = render(
        <Slider value={0} min={0} max={100} step={1} onChange={onChange} />
      )
      fireEvent.click(stubTrackRect(container, 200), { clientX: 80 })
      expect(onChange).toHaveBeenCalledWith(40)

      const off = vi.fn()
      const { container: disabled } = render(<Slider value={0} disabled onChange={off} />)
      fireEvent.click(stubTrackRect(disabled, 200), { clientX: 80 })
      expect(off).not.toHaveBeenCalled()
    })

    it.each([
      [60, [30, 80]],
      [140, [20, 70]]
    ])('should move the nearer thumb when clicking the track at %s', (clientX, expected) => {
      const onChange = vi.fn()
      const { container } = render(
        <Slider value={[20, 80]} range min={0} max={100} step={1} onChange={onChange} />
      )
      fireEvent.click(stubTrackRect(container, 200), { clientX: clientX as number })
      expect(onChange.mock.calls.at(-1)![0]).toEqual(expected)
    })
  })

  describe('Tooltip', () => {
    it('should show the tooltip on hover and hide it on leave when enabled', () => {
      const { container } = render(<Slider value={50} tooltip />)
      const thumb = getThumb(container)
      fireEvent.mouseEnter(thumb)
      expect(thumb.querySelector('div')).not.toBeNull()
      fireEvent.mouseLeave(thumb)
      expect(thumb.querySelector('div')).toBeNull()
    })

    it('should not show the tooltip when disabled', () => {
      const { container } = render(<Slider value={50} tooltip={false} />)
      const thumb = getThumb(container)
      fireEvent.mouseEnter(thumb)
      expect(thumb.querySelector('div')).toBeNull()
    })
  })

  describe('Marks', () => {
    it('should render custom mark labels', () => {
      const { container } = render(<Slider marks={{ 0: '0°C', 50: '50°C', 100: '100°C' }} />)
      expect(container.textContent).toContain('0°C')
      expect(container.textContent).toContain('50°C')
      expect(container.textContent).toContain('100°C')
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Slider value={50} aria-label="Volume" />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
