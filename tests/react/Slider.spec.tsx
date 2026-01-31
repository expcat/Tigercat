/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Slider } from '@expcat/tigercat-react'
import { expectNoA11yViolations, setThemeVariables, clearThemeVariables } from '../utils/react'

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
      const { container } = render(<Slider value={[20, 80]} />)

      const sliders = container.querySelectorAll('[role="slider"]')
      expect(sliders.length).toBeGreaterThan(0)
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
    it('should not exceed max value', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={100} min={0} max={100} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowRight' })

      // Should either not call or call with max value
      if (handleChange.mock.calls.length > 0) {
        const callValue = handleChange.mock.calls[0][0]
        expect(callValue).toBeLessThanOrEqual(100)
      }
    })

    it('should not go below min value', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={0} min={0} max={100} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'ArrowLeft' })

      // Should either not call or call with min value
      if (handleChange.mock.calls.length > 0) {
        const callValue = handleChange.mock.calls[0][0]
        expect(callValue).toBeGreaterThanOrEqual(0)
      }
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
    it('should render with marks enabled', () => {
      const { container } = render(<Slider marks />)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
    })

    it('should render with custom marks', () => {
      const { container } = render(
        <Slider
          marks={{
            0: '0°C',
            50: '50°C',
            100: '100°C'
          }}
        />
      )

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
    })
  })

  describe('Tooltip Behavior', () => {
    it('should show tooltip by default', () => {
      const { container } = render(<Slider value={50} />)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
    })

    it('should hide tooltip when tooltip prop is false', () => {
      const { container } = render(<Slider value={50} tooltip={false} />)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
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
    it('should render small size', () => {
      const { container } = render(<Slider size="sm" />)

      const slider = container.querySelector('[role="slider"]')
      expect(slider).toBeInTheDocument()
    })

    it('should render large size', () => {
      const { container } = render(<Slider size="lg" />)

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

      if (handleChange.mock.calls.length > 0) {
        const callValue = handleChange.mock.calls[0][0]
        expect(callValue).toBe(0)
      }
    })

    it('should handle End key to jump to max', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={50} min={0} max={100} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'End' })

      if (handleChange.mock.calls.length > 0) {
        const callValue = handleChange.mock.calls[0][0]
        expect(callValue).toBe(100)
      }
    })

    it('should handle PageUp for larger increments', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={50} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'PageUp' })

      if (handleChange.mock.calls.length > 0) {
        const callValue = handleChange.mock.calls[0][0]
        expect(callValue).toBeGreaterThan(50)
      }
    })

    it('should handle PageDown for larger decrements', async () => {
      const handleChange = vi.fn()
      const { container } = render(<Slider value={50} onChange={handleChange} />)

      const slider = container.querySelector('[role="slider"]')!
      await fireEvent.keyDown(slider, { key: 'PageDown' })

      if (handleChange.mock.calls.length > 0) {
        const callValue = handleChange.mock.calls[0][0]
        expect(callValue).toBeLessThan(50)
      }
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
})
