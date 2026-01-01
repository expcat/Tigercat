/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Slider } from '@tigercat/react'
import {
  expectNoA11yViolations,
  setThemeVariables,
  clearThemeVariables,
} from '../utils'

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
        '--tiger-primary': '#ff0000',
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
})
