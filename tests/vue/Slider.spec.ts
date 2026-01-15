/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { Slider } from '@expcat/tigercat-vue'
import {
  renderWithProps,
  expectNoA11yViolations,
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
        props: { value: [20, 80] }
      })

      const sliders = container.querySelectorAll('[role="slider"]')
      expect(sliders.length).toBeGreaterThan(0)
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
})
