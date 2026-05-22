/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { Slider } from '@expcat/tigercat-vue'
import {
  renderWithProps,
  expectNoA11yViolationsIsolated,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils'

describe('Slider', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(Slider)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
    })

    it('should render with initial value', () => {
      const { container } = render(Slider, {
        props: { value: 50 }
      })

      const slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuenow', '50')
    })

    it('should render with min and max values', () => {
      const { container } = render(Slider, {
        props: { min: 0, max: 100 }
      })

      const slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuemin', '0')
      expect(slider).toHaveAttribute('aria-valuemax', '100')
    })
  })

  describe('Props', () => {
    it('should apply min prop', () => {
      const { container } = render(Slider, {
        props: { min: 10 }
      })

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toHaveAttribute('aria-valuemin', '10')
    })

    it('should apply max prop', () => {
      const { container } = render(Slider, {
        props: { max: 90 }
      })

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toHaveAttribute('aria-valuemax', '90')
    })

    it('should apply step prop', () => {
      const { container } = render(Slider, {
        props: { step: 5 }
      })

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
    })

    it('should be disabled when disabled prop is true', () => {
      const { container } = render(Slider, {
        props: { disabled: true }
      })

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toHaveAttribute('aria-disabled', 'true')
    })

    it('should support range mode', () => {
      const { container } = render(Slider, {
        props: { value: [20, 80], range: true }
      })

      const sliders = container.querySelectorAll('[role="slider"]')
      expect(sliders.length).toBe(2)
    })
  })

  describe('Events', () => {
    it('should emit update:value when changed', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          'onUpdate:value': onUpdate
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      expect(onUpdate).toHaveBeenCalled()
    })

    it('should not emit events when disabled', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          disabled: true,
          'onUpdate:value': onUpdate
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('should emit change event', async () => {
      const onChange = vi.fn()
      const { container } = render(Slider, {
        props: {
          onChange: onChange
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      expect(onChange).toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should increase value on ArrowRight', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: 50,
          'onUpdate:value': onUpdate
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      expect(onUpdate).toHaveBeenCalled()
    })

    it('should decrease value on ArrowLeft', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: 50,
          'onUpdate:value': onUpdate
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowLeft' })

      expect(onUpdate).toHaveBeenCalled()
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })

    it('should support custom theme colors', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000'
      })

      const { container } = render(Slider)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()

      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { container } = render(Slider, {
        props: { value: 50, min: 0, max: 100 }
      })

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toHaveAttribute('role', 'slider')
      expect(slider).toHaveAttribute('aria-valuenow', '50')
      expect(slider).toHaveAttribute('aria-valuemin', '0')
      expect(slider).toHaveAttribute('aria-valuemax', '100')
    })

    it('should be keyboard accessible', async () => {
      const { container } = render(Slider)

      const slider = container.querySelector('[role="slider"]')!
      slider.focus()

      expect(slider).toHaveFocus()
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default state', () => {
      const { container } = render(Slider)

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with value', () => {
      const { container } = render(Slider, {
        props: { value: 50 }
      })

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for disabled state', () => {
      const { container } = render(Slider, {
        props: { disabled: true }
      })

      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('Step Behavior', () => {
    it('should respect step value when using keyboard', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: 50,
          step: 10,
          'onUpdate:value': onUpdate
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      expect(onUpdate).toHaveBeenCalled()
      const callValue = onUpdate.mock.calls[0][0]
      expect(callValue).toBe(60)
    })

    it('should respect step value when moving left', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: 50,
          step: 10,
          'onUpdate:value': onUpdate
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowLeft' })

      expect(onUpdate).toHaveBeenCalled()
      const callValue = onUpdate.mock.calls[0][0]
      expect(callValue).toBe(40)
    })

    it('should handle decimal step values', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: 5,
          step: 0.5,
          min: 0,
          max: 10,
          'onUpdate:value': onUpdate
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      expect(onUpdate).toHaveBeenCalled()
      const callValue = onUpdate.mock.calls[0][0]
      expect(callValue).toBe(5.5)
    })
  })

  describe('Boundary Conditions', () => {
    it('should clamp value at max boundary', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: 100,
          min: 0,
          max: 100,
          'onUpdate:value': onUpdate
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      // Component still calls handler but value stays at max
      expect(onUpdate).toHaveBeenCalledWith(100)
    })

    it('should clamp value at min boundary', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: 0,
          min: 0,
          max: 100,
          'onUpdate:value': onUpdate
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowLeft' })

      // Component still calls handler but value stays at min
      expect(onUpdate).toHaveBeenCalledWith(0)
    })

    it('should handle custom min/max range', () => {
      const { container } = render(Slider, {
        props: { value: 15, min: 10, max: 20 }
      })

      const slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuemin', '10')
      expect(slider).toHaveAttribute('aria-valuemax', '20')
      expect(slider).toHaveAttribute('aria-valuenow', '15')
    })

    it('should handle negative values', () => {
      const { container } = render(Slider, {
        props: { value: -5, min: -10, max: 0 }
      })

      const slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuenow', '-5')
    })
  })

  describe('Range Mode', () => {
    it('should render two sliders in range mode', () => {
      const { container } = render(Slider, {
        props: { value: [20, 80], range: true }
      })

      const sliders = container.querySelectorAll('[role="slider"]')
      expect(sliders.length).toBe(2)
    })

    it('should have correct aria values for both thumbs in range mode', () => {
      const { container } = render(Slider, {
        props: { value: [30, 70], range: true, min: 0, max: 100 }
      })

      const sliders = container.querySelectorAll('[role="slider"]')
      expect(sliders[0]).toHaveAttribute('aria-valuenow', '30')
      expect(sliders[1]).toHaveAttribute('aria-valuenow', '70')
    })

    it('should emit array value in range mode', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: [20, 80],
          range: true,
          'onUpdate:value': onUpdate
        }
      })

      const sliders = container.querySelectorAll('[role="slider"]')
      await fireEvent.keyDown(sliders[0], { key: 'ArrowRight' })

      expect(onUpdate).toHaveBeenCalled()
      const callValue = onUpdate.mock.calls[0][0]
      expect(Array.isArray(callValue)).toBe(true)
    })

    it('should accept inverted range values without normalization', () => {
      const { container } = render(Slider, {
        props: { value: [60, 40], range: true, min: 0, max: 100 }
      })

      const sliders = container.querySelectorAll('[role="slider"]')
      expect(sliders.length).toBe(2)

      // Component renders values as-is (doesn't auto-normalize)
      expect(sliders[0]).toHaveAttribute('aria-valuenow', '60')
      expect(sliders[1]).toHaveAttribute('aria-valuenow', '40')
    })
  })

  describe('Marks Support', () => {
    it('should render slider with marks prop', () => {
      const { container } = render(Slider, {
        props: { marks: true, min: 0, max: 100 }
      })

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
      // Marks should be rendered but their exact DOM structure is implementation detail
    })

    it('should accept custom marks object', () => {
      const customMarks = {
        0: '0°C',
        50: '50°C',
        100: '100°C'
      }
      const { container } = render(Slider, {
        props: { marks: customMarks }
      })

      expect(container.textContent).toContain('0°C')
      expect(container.textContent).toContain('50°C')
      expect(container.textContent).toContain('100°C')
    })
  })

  describe('Tooltip Behavior', () => {
    it('should enable tooltip by default', () => {
      const { container } = render(Slider, {
        props: { value: 50, tooltip: true }
      })

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
      // Tooltip presence/visibility is controlled by hover/drag, not static DOM
    })

    it('should accept tooltip prop as false', () => {
      const { container } = render(Slider, {
        props: { value: 50, tooltip: false }
      })

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
      // Tooltip disabled - behavior is internal
    })
  })

  describe('V-Model Support', () => {
    it('should work with v-model:value', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: 50,
          'onUpdate:value': onUpdate
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      expect(onUpdate).toHaveBeenCalled()
    })

    it('should update when v-model value changes', async () => {
      const { container, rerender } = render(Slider, {
        props: { value: 30 }
      })

      let slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuenow', '30')

      await rerender({ value: 70 })

      slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuenow', '70')
    })
  })

  describe('Size Variations', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(Slider, { size })

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
    })
  })

  describe('Default Value', () => {
    it('should use defaultValue when value is not provided', () => {
      const { container } = render(Slider, {
        props: { defaultValue: 75 }
      })

      const slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuenow', '75')
    })

    it('should use defaultValue for range mode', () => {
      const { container } = render(Slider, {
        props: { defaultValue: [25, 75], range: true }
      })

      const sliders = container.querySelectorAll('[role="slider"]')
      expect(sliders[0]).toHaveAttribute('aria-valuenow', '25')
      expect(sliders[1]).toHaveAttribute('aria-valuenow', '75')
    })
  })

  describe('Keyboard Interaction', () => {
    it('should handle ArrowUp same as ArrowRight', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: 50,
          'onUpdate:value': onUpdate
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowUp' })

      expect(onUpdate).toHaveBeenCalled()
    })

    it('should handle ArrowDown same as ArrowLeft', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: 50,
          'onUpdate:value': onUpdate
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowDown' })

      expect(onUpdate).toHaveBeenCalled()
    })

    it('should handle Home key to jump to min', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: 50,
          min: 0,
          max: 100,
          'onUpdate:value': onUpdate
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'Home' })

      expect(onUpdate).toHaveBeenCalled()
      const callValue = onUpdate.mock.calls[0][0]
      expect(callValue).toBe(0)
    })

    it('should handle End key to jump to max', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: 50,
          min: 0,
          max: 100,
          'onUpdate:value': onUpdate
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'End' })

      expect(onUpdate).toHaveBeenCalled()
      const callValue = onUpdate.mock.calls[0][0]
      expect(callValue).toBe(100)
    })

    it('should handle PageUp for larger increments', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: 50,
          step: 1,
          'onUpdate:value': onUpdate
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'PageUp' })

      expect(onUpdate).toHaveBeenCalled()
      const callValue = onUpdate.mock.calls[0][0]
      // PageUp should increment by 10 * step (default large step)
      expect(callValue).toBe(60)
    })

    it('should handle PageDown for larger decrements', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: 50,
          step: 1,
          'onUpdate:value': onUpdate
        }
      })

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'PageDown' })

      expect(onUpdate).toHaveBeenCalled()
      const callValue = onUpdate.mock.calls[0][0]
      // PageDown should decrement by 10 * step (default large step)
      expect(callValue).toBe(40)
    })
  })

  describe('Edge Cases', () => {
    it('should handle className prop', () => {
      const { container } = render(Slider, {
        props: { className: 'custom-slider' }
      })

      expect(container.querySelector('.custom-slider')).toBeInTheDocument()
    })

    it('should handle style prop', () => {
      const { container } = render(Slider, {
        props: { style: { marginTop: '20px' } }
      })

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
    })

    it('should handle zero as a valid value', () => {
      const { container } = render(Slider, {
        props: { value: 0 }
      })

      const slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuenow', '0')
    })

    it('should handle single step in large range', () => {
      const { container } = render(Slider, {
        props: { value: 500, min: 0, max: 1000, step: 1 }
      })

      const slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuenow', '500')
    })
  })

  describe('Mouse Interaction', () => {
    it('should start drag on thumb mousedown', async () => {
      const { container } = render(Slider, {
        props: { value: 50 }
      })

      const thumb = container.querySelector('[role="slider"]')!
      await fireEvent.mouseDown(thumb, { clientX: 150, clientY: 10 })
      // Drag started — tooltip should be visible if enabled
      expect(thumb).toBeInTheDocument()
    })

    it('should show tooltip on thumb hover when tooltip enabled', async () => {
      const { container } = render(Slider, {
        props: { value: 50, tooltip: true }
      })

      const thumb = container.querySelector('[role="slider"]')!
      await fireEvent.mouseEnter(thumb)
      // Tooltip should appear showing value
      expect(container.textContent).toContain('50')
    })

    it('should hide tooltip on thumb mouseleave when not dragging', async () => {
      const { container } = render(Slider, {
        props: { value: 50, tooltip: true }
      })

      const thumb = container.querySelector('[role="slider"]')!
      await fireEvent.mouseEnter(thumb)
      await fireEvent.mouseLeave(thumb)
      // Not dragging, so tooltip should hide
      expect(thumb).toBeInTheDocument()
    })

    it('should not start drag when disabled', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: { value: 50, disabled: true, 'onUpdate:value': onUpdate }
      })

      const thumb = container.querySelector('[role="slider"]')!
      await fireEvent.mouseDown(thumb, { clientX: 150, clientY: 10 })
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  describe('Range keyboard interaction', () => {
    it('should constrain min thumb not to exceed max thumb', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: [70, 80],
          range: true,
          step: 20,
          'onUpdate:value': onUpdate
        }
      })

      const sliders = container.querySelectorAll('[role="slider"]')
      // Move min thumb right — should be clamped to not exceed max
      await fireEvent.keyDown(sliders[0], { key: 'ArrowRight' })

      expect(onUpdate).toHaveBeenCalled()
      const [min, max] = onUpdate.mock.calls[0][0]
      expect(min).toBeLessThanOrEqual(max)
    })

    it('should constrain max thumb not to go below min thumb', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: {
          value: [20, 30],
          range: true,
          step: 20,
          'onUpdate:value': onUpdate
        }
      })

      const sliders = container.querySelectorAll('[role="slider"]')
      // Move max thumb left — should be clamped to not go below min
      await fireEvent.keyDown(sliders[1], { key: 'ArrowLeft' })

      expect(onUpdate).toHaveBeenCalled()
      const [min, max] = onUpdate.mock.calls[0][0]
      expect(max).toBeGreaterThanOrEqual(min)
    })
  })

  describe('ARIA labels in range mode', () => {
    it('should add min/max labels to range thumbs', () => {
      const { container } = render(Slider, {
        props: { value: [20, 80], range: true }
      })

      const sliders = container.querySelectorAll('[role="slider"]')
      // Range thumbs should have aria-label
      expect(sliders[0].getAttribute('aria-label')).toContain('Minimum')
      expect(sliders[1].getAttribute('aria-label')).toContain('Maximum')
    })
  })

  // Helper: stub the track element's getBoundingClientRect
  const stubTrackRect = (container: HTMLElement, width = 200) => {
    const thumb = container.querySelector('[role="slider"]') as HTMLElement
    const track = thumb.parentElement as HTMLElement
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

  describe('Track click', () => {
    it('should update value when clicking the track', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: { value: 0, min: 0, max: 100, step: 1, 'onUpdate:value': onUpdate }
      })
      const track = stubTrackRect(container, 200)

      await fireEvent.click(track, { clientX: 80 })

      expect(onUpdate).toHaveBeenCalledWith(40)
    })

    it('should not update when clicking track while disabled', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Slider, {
        props: { value: 0, disabled: true, 'onUpdate:value': onUpdate }
      })
      const track = stubTrackRect(container, 200)

      await fireEvent.click(track, { clientX: 80 })

      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('should move nearer thumb in range mode when clicking track', async () => {
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
      const track = stubTrackRect(container, 200)

      // click at clientX=60 -> value 30, closer to min (20) than max (80)
      await fireEvent.click(track, { clientX: 60 })
      const last = onUpdate.mock.calls.at(-1)![0]
      expect(last).toEqual([30, 80])
    })
  })
})
