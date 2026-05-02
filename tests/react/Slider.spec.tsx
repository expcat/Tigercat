/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Slider } from '@expcat/tigercat-react'
import {
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils/react'

describe('Slider', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Slider />)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
    })

    it('should render with initial value', () => {
      const { container } = render(<Slider value={50} />)

      const slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuenow', '50')
    })

    it('should render with min and max values', () => {
      const { container } = render(<Slider min={0} max={100} />)

      const slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuemin', '0')
      expect(slider).toHaveAttribute('aria-valuemax', '100')
    })

    it('should apply custom className', () => {
      const { container } = render(<Slider className="custom-class" />)

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should apply min prop', () => {
      const { container } = render(<Slider min={10} />)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toHaveAttribute('aria-valuemin', '10')
    })

    it('should apply max prop', () => {
      const { container } = render(<Slider max={90} />)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toHaveAttribute('aria-valuemax', '90')
    })

    it('should apply step prop', () => {
      const { container } = render(<Slider step={5} />)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
    })

    it('should be disabled when disabled prop is true', () => {
      const { container } = render(<Slider disabled />)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toHaveAttribute('aria-disabled', 'true')
    })

    it('should support range mode', () => {
      const { container } = render(<Slider value={[20, 80]} range />)

      const sliders = container.querySelectorAll('[role="slider"]')
      expect(sliders.length).toBe(2)
    })
  })

  describe('Events', () => {
    it('should call onChange when changed', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      expect(handleChange).toHaveBeenCalled()
    })

    it('should not call onChange when disabled', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider disabled onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('Controlled Component', () => {
    it('should work as controlled component', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState(50)

        return <Slider value={value} onChange={(val) => setValue(val as number)} />
      }

      const { container } = render(<TestComponent />)
      const slider = container.querySelector('[role="slider"]') as HTMLElement

      expect(slider).toHaveAttribute('aria-valuenow', '50')

      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      // Value should change
      expect(slider.getAttribute('aria-valuenow')).not.toBe('50')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should increase value on ArrowRight', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={50} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      expect(handleChange).toHaveBeenCalled()
    })

    it('should decrease value on ArrowLeft', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={50} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowLeft' })

      expect(handleChange).toHaveBeenCalled()
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

      const { container } = render(<Slider />)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()

      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { container } = render(<Slider value={50} min={0} max={100} />)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toHaveAttribute('role', 'slider')
      expect(slider).toHaveAttribute('aria-valuenow', '50')
      expect(slider).toHaveAttribute('aria-valuemin', '0')
      expect(slider).toHaveAttribute('aria-valuemax', '100')
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      const { container } = render(<Slider />)

      const slider = container.querySelector('[role="slider"]')!
      await user.tab()

      expect(slider).toHaveFocus()
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default state', () => {
      const { container } = render(<Slider />)

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with value', () => {
      const { container } = render(<Slider value={50} />)

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for disabled state', () => {
      const { container } = render(<Slider disabled />)

      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('Step Behavior', () => {
    it('should respect step value when using keyboard', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={50} step={10} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      expect(handleChange).toHaveBeenCalled()
      const callValue = handleChange.mock.calls[0][0]
      expect(callValue).toBe(60)
    })

    it('should respect step value when moving left', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={50} step={10} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowLeft' })

      expect(handleChange).toHaveBeenCalled()
      const callValue = handleChange.mock.calls[0][0]
      expect(callValue).toBe(40)
    })

    it('should handle decimal step values', async () => {
      const handleChange = vi.fn()
      const { container } = render(
        <Slider value={5} step={0.5} min={0} max={10} onChange={handleChange} />
      )

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      expect(handleChange).toHaveBeenCalled()
      const callValue = handleChange.mock.calls[0][0]
      expect(callValue).toBe(5.5)
    })
  })

  describe('Boundary Conditions', () => {
    it('should clamp value at max boundary', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={100} min={0} max={100} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      // Component still calls handler but value stays at max
      expect(handleChange).toHaveBeenCalledWith(100)
    })

    it('should clamp value at min boundary', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={0} min={0} max={100} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowLeft' })

      // Component still calls handler but value stays at min
      expect(handleChange).toHaveBeenCalledWith(0)
    })

    it('should handle custom min/max range', () => {
      const { container } = render(<Slider value={15} min={10} max={20} />)

      const slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuemin', '10')
      expect(slider).toHaveAttribute('aria-valuemax', '20')
      expect(slider).toHaveAttribute('aria-valuenow', '15')
    })

    it('should handle negative values', () => {
      const { container } = render(<Slider value={-5} min={-10} max={0} />)

      const slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuenow', '-5')
    })
  })

  describe('Range Mode', () => {
    it('should render two sliders in range mode', () => {
      const { container } = render(<Slider value={[20, 80]} range />)

      const sliders = container.querySelectorAll('[role="slider"]')
      expect(sliders.length).toBe(2)
    })

    it('should have correct aria values for both thumbs in range mode', () => {
      const { container } = render(<Slider value={[30, 70]} range min={0} max={100} />)

      const sliders = container.querySelectorAll('[role="slider"]')
      expect(sliders[0]).toHaveAttribute('aria-valuenow', '30')
      expect(sliders[1]).toHaveAttribute('aria-valuenow', '70')
    })

    it('should call onChange with array value in range mode', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={[20, 80]} range onChange={handleChange} />)

      const sliders = container.querySelectorAll('[role="slider"]')
      await fireEvent.keyDown(sliders[0], { key: 'ArrowRight' })

      expect(handleChange).toHaveBeenCalled()
      const callValue = handleChange.mock.calls[0][0]
      expect(Array.isArray(callValue)).toBe(true)
    })

    it('should update correct thumb in range mode', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={[20, 80]} range onChange={handleChange} />)

      const sliders = container.querySelectorAll('[role="slider"]')

      // Update min thumb
      await fireEvent.keyDown(sliders[0], { key: 'ArrowRight' })
      expect(handleChange).toHaveBeenCalled()

      handleChange.mockClear()

      // Update max thumb
      await fireEvent.keyDown(sliders[1], { key: 'ArrowLeft' })
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('Marks Support', () => {
    it('should render slider with marks prop', () => {
      const { container } = render(<Slider marks min={0} max={100} />)

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
      const { container } = render(<Slider marks={customMarks} />)

      expect(container.textContent).toContain('0°C')
      expect(container.textContent).toContain('50°C')
      expect(container.textContent).toContain('100°C')
    })
  })

  describe('Tooltip Behavior', () => {
    it('should enable tooltip by default', () => {
      const { container } = render(<Slider value={50} tooltip />)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
      // Tooltip presence/visibility is controlled by hover/drag, not static DOM
    })

    it('should accept tooltip prop as false', () => {
      const { container } = render(<Slider value={50} tooltip={false} />)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
      // Tooltip disabled - behavior is internal
    })
  })

  describe('Uncontrolled Component', () => {
    it('should work as uncontrolled component with defaultValue', () => {
      const { container } = render(<Slider defaultValue={75} />)

      const slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuenow', '75')
    })

    it('should work with defaultValue in range mode', () => {
      const { container } = render(<Slider defaultValue={[25, 75]} range />)

      const sliders = container.querySelectorAll('[role="slider"]')
      expect(sliders[0]).toHaveAttribute('aria-valuenow', '25')
      expect(sliders[1]).toHaveAttribute('aria-valuenow', '75')
    })

    it('should update internal state when using uncontrolled mode', async () => {
      const { container } = render(<Slider defaultValue={50} />)

      const slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuenow', '50')

      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      // Value should change in uncontrolled mode
      expect(slider.getAttribute('aria-valuenow')).not.toBe('50')
    })
  })

  describe('Size Variations', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = render(<Slider size={size} />)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
    })
  })

  describe('Keyboard Interaction', () => {
    it('should handle ArrowUp same as ArrowRight', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={50} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowUp' })

      expect(handleChange).toHaveBeenCalled()
    })

    it('should handle ArrowDown same as ArrowLeft', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={50} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowDown' })

      expect(handleChange).toHaveBeenCalled()
    })

    it('should handle Home key to jump to min', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={50} min={0} max={100} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'Home' })

      expect(handleChange).toHaveBeenCalled()
      const callValue = handleChange.mock.calls[0][0]
      expect(callValue).toBe(0)
    })

    it('should handle End key to jump to max', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={50} min={0} max={100} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'End' })

      expect(handleChange).toHaveBeenCalled()
      const callValue = handleChange.mock.calls[0][0]
      expect(callValue).toBe(100)
    })

    it('should handle PageUp for larger increments', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={50} step={1} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'PageUp' })

      expect(handleChange).toHaveBeenCalled()
      const callValue = handleChange.mock.calls[0][0]
      // PageUp should increment by 10 * step (default large step)
      expect(callValue).toBe(60)
    })

    it('should handle PageDown for larger decrements', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={50} step={1} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'PageDown' })

      expect(handleChange).toHaveBeenCalled()
      const callValue = handleChange.mock.calls[0][0]
      // PageDown should decrement by 10 * step (default large step)
      expect(callValue).toBe(40)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero as a valid value', () => {
      const { container } = render(<Slider value={0} />)

      const slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuenow', '0')
    })

    it('should handle single step in large range', () => {
      const { container } = render(<Slider value={500} min={0} max={1000} step={1} />)

      const slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuenow', '500')
    })

    it('should handle aria-label prop', () => {
      const { container } = render(<Slider aria-label="Volume control" />)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toHaveAttribute('aria-label', 'Volume control')
    })

    it('should handle aria-labelledby prop', () => {
      const { container } = render(<Slider aria-labelledby="label-id" />)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toHaveAttribute('aria-labelledby', 'label-id')
    })

    it('should pass through custom props', () => {
      const { container } = render(<Slider data-testid="custom-slider" />)

      const sliderContainer = container.querySelector('[data-testid="custom-slider"]')
      expect(sliderContainer).toBeInTheDocument()
    })
  })

  describe('State Updates', () => {
    it('should update when value prop changes', () => {
      const { container, rerender } = render(<Slider value={30} />)

      let slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuenow', '30')

      rerender(<Slider value={70} />)

      slider = container.querySelector('[role="slider"]') as HTMLElement
      expect(slider).toHaveAttribute('aria-valuenow', '70')
    })

    it('should update range values correctly', () => {
      const { container, rerender } = render(<Slider value={[20, 80]} range />)

      let sliders = container.querySelectorAll('[role="slider"]')
      expect(sliders[0]).toHaveAttribute('aria-valuenow', '20')
      expect(sliders[1]).toHaveAttribute('aria-valuenow', '80')

      rerender(<Slider value={[30, 70]} range />)

      sliders = container.querySelectorAll('[role="slider"]')
      expect(sliders[0]).toHaveAttribute('aria-valuenow', '30')
      expect(sliders[1]).toHaveAttribute('aria-valuenow', '70')
    })
  })

  // Helper: stub the track element's getBoundingClientRect so position-based
  // computations (drag / track click) are deterministic.
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

  describe('Pointer Drag (mouse)', () => {
    it('should update value via mousedown -> mousemove -> mouseup', () => {
      const handleChange = vi.fn()
      const { container } = render(
        <Slider value={0} min={0} max={100} step={1} onChange={handleChange} />
      )
      stubTrackRect(container, 200)
      const thumb = container.querySelector('[role="slider"]')!

      fireEvent.mouseDown(thumb, { clientX: 0 })
      fireEvent.mouseMove(document, { clientX: 100 })
      fireEvent.mouseUp(document)

      expect(handleChange).toHaveBeenCalled()
      const last = handleChange.mock.calls.at(-1)![0]
      expect(last).toBe(50)
    })

    it('should not start drag when disabled', () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={0} disabled onChange={handleChange} />)
      stubTrackRect(container, 200)
      const thumb = container.querySelector('[role="slider"]')!

      fireEvent.mouseDown(thumb, { clientX: 0 })
      fireEvent.mouseMove(document, { clientX: 100 })
      fireEvent.mouseUp(document)

      expect(handleChange).not.toHaveBeenCalled()
    })

    it('should drag the min thumb in range mode', () => {
      const handleChange = vi.fn()
      const { container } = render(
        <Slider value={[20, 80]} range min={0} max={100} step={1} onChange={handleChange} />
      )
      stubTrackRect(container, 200)
      const thumbs = container.querySelectorAll('[role="slider"]')

      fireEvent.mouseDown(thumbs[0], { clientX: 40 })
      fireEvent.mouseMove(document, { clientX: 60 })
      fireEvent.mouseUp(document)

      const last = handleChange.mock.calls.at(-1)![0] as [number, number]
      expect(last[0]).toBe(30)
      expect(last[1]).toBe(80)
    })

    it('should drag the max thumb in range mode', () => {
      const handleChange = vi.fn()
      const { container } = render(
        <Slider value={[20, 80]} range min={0} max={100} step={1} onChange={handleChange} />
      )
      stubTrackRect(container, 200)
      const thumbs = container.querySelectorAll('[role="slider"]')

      fireEvent.mouseDown(thumbs[1], { clientX: 160 })
      fireEvent.mouseMove(document, { clientX: 120 })
      fireEvent.mouseUp(document)

      const last = handleChange.mock.calls.at(-1)![0] as [number, number]
      expect(last[0]).toBe(20)
      expect(last[1]).toBe(60)
    })

    it('should clamp min thumb to not exceed max thumb when dragging', () => {
      const handleChange = vi.fn()
      const { container } = render(
        <Slider value={[20, 60]} range min={0} max={100} step={1} onChange={handleChange} />
      )
      stubTrackRect(container, 200)
      const thumbs = container.querySelectorAll('[role="slider"]')

      // Try to drag min thumb past max (60). Expected: min stays clamped at <= 60.
      fireEvent.mouseDown(thumbs[0], { clientX: 40 })
      fireEvent.mouseMove(document, { clientX: 180 })
      fireEvent.mouseUp(document)

      const last = handleChange.mock.calls.at(-1)![0] as [number, number]
      expect(last[0]).toBe(60)
      expect(last[1]).toBe(60)
    })
  })

  describe('Pointer Drag (touch)', () => {
    it('should update value via touchstart -> touchmove -> touchend', () => {
      const handleChange = vi.fn()
      const { container } = render(
        <Slider value={0} min={0} max={100} step={1} onChange={handleChange} />
      )
      stubTrackRect(container, 200)
      const thumb = container.querySelector('[role="slider"]')!

      fireEvent.touchStart(thumb, { touches: [{ clientX: 0 }] })
      fireEvent.touchMove(document, { touches: [{ clientX: 150 }] })
      fireEvent.touchEnd(document)

      const last = handleChange.mock.calls.at(-1)![0]
      expect(last).toBe(75)
    })
  })

  describe('Track click', () => {
    it('should set value via clicking the track in single mode', () => {
      const handleChange = vi.fn()
      const { container } = render(
        <Slider value={0} min={0} max={100} step={1} onChange={handleChange} />
      )
      const track = stubTrackRect(container, 200)

      fireEvent.click(track, { clientX: 80 })

      expect(handleChange).toHaveBeenCalledWith(40)
    })

    it('should ignore track click when disabled', () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={0} disabled onChange={handleChange} />)
      const track = stubTrackRect(container, 200)

      fireEvent.click(track, { clientX: 80 })

      expect(handleChange).not.toHaveBeenCalled()
    })

    it('should move the nearer thumb when clicking track in range mode (towards min)', () => {
      const handleChange = vi.fn()
      const { container } = render(
        <Slider value={[20, 80]} range min={0} max={100} step={1} onChange={handleChange} />
      )
      const track = stubTrackRect(container, 200)

      // click at 30 (clientX=60). distance: |30-20|=10 vs |30-80|=50 -> moves min.
      fireEvent.click(track, { clientX: 60 })

      const last = handleChange.mock.calls.at(-1)![0] as [number, number]
      expect(last).toEqual([30, 80])
    })

    it('should move the nearer thumb when clicking track in range mode (towards max)', () => {
      const handleChange = vi.fn()
      const { container } = render(
        <Slider value={[20, 80]} range min={0} max={100} step={1} onChange={handleChange} />
      )
      const track = stubTrackRect(container, 200)

      // click at 70 (clientX=140). |70-20|=50 vs |70-80|=10 -> moves max.
      fireEvent.click(track, { clientX: 140 })

      const last = handleChange.mock.calls.at(-1)![0] as [number, number]
      expect(last).toEqual([20, 70])
    })
  })

  describe('Tooltip visibility', () => {
    it('should show tooltip on mouseenter when tooltip enabled', () => {
      const { container } = render(<Slider value={50} tooltip />)
      const thumb = container.querySelector('[role="slider"]')!

      fireEvent.mouseEnter(thumb)
      // tooltip is rendered as inner div inside thumb when shown
      expect(thumb.querySelector('div')).not.toBeNull()
    })

    it('should not show tooltip on mouseenter when tooltip disabled', () => {
      const { container } = render(<Slider value={50} tooltip={false} />)
      const thumb = container.querySelector('[role="slider"]')!

      fireEvent.mouseEnter(thumb)
      expect(thumb.querySelector('div')).toBeNull()
    })

    it('should hide tooltip on mouseleave when not dragging', () => {
      const { container } = render(<Slider value={50} tooltip />)
      const thumb = container.querySelector('[role="slider"]')!

      fireEvent.mouseEnter(thumb)
      expect(thumb.querySelector('div')).not.toBeNull()

      fireEvent.mouseLeave(thumb)
      expect(thumb.querySelector('div')).toBeNull()
    })
  })

  describe('Range thumb aria-label', () => {
    it('should suffix per-thumb aria-label in range mode when ariaLabel provided', () => {
      const { container } = render(<Slider value={[20, 80]} range aria-label="Brightness" />)
      const thumbs = container.querySelectorAll('[role="slider"]')
      expect(thumbs[0]).toHaveAttribute('aria-label', 'Brightness (min)')
      expect(thumbs[1]).toHaveAttribute('aria-label', 'Brightness (max)')
    })

    it('should fall back to "Minimum value" / "Maximum value" when no aria-label', () => {
      const { container } = render(<Slider value={[20, 80]} range />)
      const thumbs = container.querySelectorAll('[role="slider"]')
      expect(thumbs[0]).toHaveAttribute('aria-label', 'Minimum value')
      expect(thumbs[1]).toHaveAttribute('aria-label', 'Maximum value')
    })
  })

  describe('Range mode keyboard constraint', () => {
    it('should clamp min thumb at max value when ArrowRight crosses over', () => {
      const handleChange = vi.fn()
      const { container } = render(
        <Slider value={[60, 60]} range min={0} max={100} step={5} onChange={handleChange} />
      )
      const thumbs = container.querySelectorAll('[role="slider"]')

      fireEvent.keyDown(thumbs[0], { key: 'ArrowRight' })

      const last = handleChange.mock.calls.at(-1)![0] as [number, number]
      expect(last[0]).toBe(60)
      expect(last[1]).toBe(60)
    })

    it('should clamp max thumb at min value when ArrowLeft crosses over', () => {
      const handleChange = vi.fn()
      const { container } = render(
        <Slider value={[60, 60]} range min={0} max={100} step={5} onChange={handleChange} />
      )
      const thumbs = container.querySelectorAll('[role="slider"]')

      fireEvent.keyDown(thumbs[1], { key: 'ArrowLeft' })

      const last = handleChange.mock.calls.at(-1)![0] as [number, number]
      expect(last[0]).toBe(60)
      expect(last[1]).toBe(60)
    })
  })
})
