/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { Slider } from '@expcat/tigercat-vue'
import {
  expectNoA11yViolationsIsolated,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils'

const getThumb = (container: HTMLElement) =>
  container.querySelector('[role="slider"]') as HTMLElement
const getThumbs = (container: HTMLElement) => container.querySelectorAll('[role="slider"]')

// Stub the track's getBoundingClientRect so track-click computations are deterministic.
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
      const { container } = render(Slider)
      expect(getThumb(container)).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(Slider, { props: { className: 'custom-slider' } })
      expect(container.querySelector('.custom-slider')).toBeInTheDocument()
    })

    it.each(componentSizes)('should render %s size', (size) => {
      const { container } = render(Slider, { props: { size } })
      expect(getThumb(container)).toBeInTheDocument()
    })
  })

  describe('Value and ARIA', () => {
    it('should reflect value, min and max as aria attributes', () => {
      const { container } = render(Slider, { props: { value: 15, min: 10, max: 20 } })
      const slider = getThumb(container)
      expect(slider).toHaveAttribute('role', 'slider')
      expect(slider).toHaveAttribute('aria-valuenow', '15')
      expect(slider).toHaveAttribute('aria-valuemin', '10')
      expect(slider).toHaveAttribute('aria-valuemax', '20')
    })

    it('should support negative values', () => {
      const { container } = render(Slider, { props: { value: -5, min: -10, max: 0 } })
      expect(getThumb(container)).toHaveAttribute('aria-valuenow', '-5')
    })

    it('should mark the disabled state with aria-disabled', () => {
      const { container } = render(Slider, { props: { disabled: true } })
      expect(getThumb(container)).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Events', () => {
    it('should emit update:value and change on arrow key', async () => {
      const onUpdate = vi.fn()
      const onChange = vi.fn()
      const { container } = render(Slider, {
        props: { value: 50, 'onUpdate:value': onUpdate, onChange }
      })
      await fireEvent.keyDown(getThumb(container), { key: 'ArrowRight' })
      expect(onUpdate).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalled()
    })

    it('should not emit events when disabled', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: { disabled: true, 'onUpdate:value': onUpdate }
      })
      await fireEvent.keyDown(getThumb(container), { key: 'ArrowRight' })
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard', () => {
    it.each([
      ['ArrowRight', 100, 100],
      ['ArrowLeft', 0, 0]
    ])('should clamp %s at the boundary', async (key, value, expected) => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: { value: value as number, min: 0, max: 100, 'onUpdate:value': onUpdate }
      })
      await fireEvent.keyDown(getThumb(container), { key: key as string })
      expect(onUpdate).toHaveBeenCalledWith(expected)
    })

    it('should be focusable', () => {
      const { container } = render(Slider)
      const slider = getThumb(container)
      slider.focus()
      expect(slider).toHaveFocus()
    })
  })

  describe('Controlled and uncontrolled', () => {
    it('should update aria-valuenow when the value prop changes', async () => {
      const { container, rerender } = render(Slider, { props: { value: 30 } })
      expect(getThumb(container)).toHaveAttribute('aria-valuenow', '30')
      await rerender({ value: 70 })
      expect(getThumb(container)).toHaveAttribute('aria-valuenow', '70')
    })

    it('should use defaultValue when value is not provided', () => {
      const { container } = render(Slider, { props: { defaultValue: 75 } })
      expect(getThumb(container)).toHaveAttribute('aria-valuenow', '75')
    })
  })

  describe('Range mode', () => {
    it('should render two thumbs with correct aria values', () => {
      const { container } = render(Slider, {
        props: { value: [30, 70], range: true, min: 0, max: 100 }
      })
      const thumbs = getThumbs(container)
      expect(thumbs.length).toBe(2)
      expect(thumbs[0]).toHaveAttribute('aria-valuenow', '30')
      expect(thumbs[1]).toHaveAttribute('aria-valuenow', '70')
    })

    it('should support defaultValue in range mode', () => {
      const { container } = render(Slider, { props: { defaultValue: [25, 75], range: true } })
      const thumbs = getThumbs(container)
      expect(thumbs[0]).toHaveAttribute('aria-valuenow', '25')
      expect(thumbs[1]).toHaveAttribute('aria-valuenow', '75')
    })

    it('should render inverted range values as-is (no normalization)', () => {
      const { container } = render(Slider, {
        props: { value: [60, 40], range: true, min: 0, max: 100 }
      })
      const thumbs = getThumbs(container)
      expect(thumbs[0]).toHaveAttribute('aria-valuenow', '60')
      expect(thumbs[1]).toHaveAttribute('aria-valuenow', '40')
    })

    it('should emit an array value in range mode', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: { value: [20, 80], range: true, 'onUpdate:value': onUpdate }
      })
      await fireEvent.keyDown(getThumbs(container)[0], { key: 'ArrowRight' })
      expect(Array.isArray(onUpdate.mock.calls[0][0])).toBe(true)
    })
    it('should label range thumbs with min/max', () => {
      const { container } = render(Slider, { props: { value: [20, 80], range: true } })
      const thumbs = getThumbs(container)
      expect(thumbs[0].getAttribute('aria-label')).toContain('Minimum')
      expect(thumbs[1].getAttribute('aria-label')).toContain('Maximum')
    })
  })

  describe('Track click', () => {
    it('should update value via track click, and ignore it when disabled', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: { value: 0, min: 0, max: 100, step: 1, 'onUpdate:value': onUpdate }
      })
      await fireEvent.click(stubTrackRect(container, 200), { clientX: 80 })
      expect(onUpdate).toHaveBeenCalledWith(40)

      const off = vi.fn()
      const { container: disabled } = render(Slider, {
        props: { value: 0, disabled: true, 'onUpdate:value': off }
      })
      await fireEvent.click(stubTrackRect(disabled, 200), { clientX: 80 })
      expect(off).not.toHaveBeenCalled()
    })

    it('should move the nearer thumb when clicking the track in range mode', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: [20, 80],
          range: true,
          min: 0,
          max: 100,
          step: 1,
          'onUpdate:value': onUpdate
        }
      })
      await fireEvent.click(stubTrackRect(container, 200), { clientX: 60 })
      expect(onUpdate.mock.calls.at(-1)![0]).toEqual([30, 80])
    })
  })

  describe('Tooltip', () => {
    it('should show the value in a tooltip on hover when enabled', async () => {
      const { container } = render(Slider, { props: { value: 50, tooltip: true } })
      await fireEvent.mouseEnter(getThumb(container))
      expect(container.textContent).toContain('50')
    })
  })

  describe('Marks', () => {
    it('should render custom mark labels', () => {
      const { container } = render(Slider, {
        props: { marks: { 0: '0°C', 50: '50°C', 100: '100°C' } }
      })
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
      const { container } = render(Slider, { props: { value: 50, 'aria-label': 'Volume' } })
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
