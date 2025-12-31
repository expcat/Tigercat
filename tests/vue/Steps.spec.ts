/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { Steps, StepsItem } from '@tigercat/vue'

describe('Steps', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Steps, {
        slots: {
          default: () => [
            h(StepsItem, { title: 'Step 1' }),
            h(StepsItem, { title: 'Step 2' }),
            h(StepsItem, { title: 'Step 3' }),
          ],
        },
      })

      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.getByText('Step 3')).toBeInTheDocument()
    })

    it('should render with descriptions', () => {
      render(Steps, {
        slots: {
          default: () => [
            h(StepsItem, { title: 'Step 1', description: 'Description 1' }),
            h(StepsItem, { title: 'Step 2', description: 'Description 2' }),
          ],
        },
      })

      expect(screen.getByText('Description 1')).toBeInTheDocument()
      expect(screen.getByText('Description 2')).toBeInTheDocument()
    })

    it('should render horizontal layout by default', () => {
      const { container } = render(Steps, {
        slots: {
          default: () => [h(StepsItem, { title: 'Step 1' })],
        },
      })

      const stepsContainer = container.querySelector('.tiger-steps')
      expect(stepsContainer).toHaveClass('flex-row')
    })

    it('should render vertical layout', () => {
      const { container } = render(Steps, {
        props: { direction: 'vertical' },
        slots: {
          default: () => [h(StepsItem, { title: 'Step 1' })],
        },
      })

      const stepsContainer = container.querySelector('.tiger-steps')
      expect(stepsContainer).toHaveClass('flex-col')
    })
  })

  describe('Props', () => {
    it('should respect current prop', () => {
      const { container } = render(Steps, {
        props: { current: 1 },
        slots: {
          default: () => [
            h(StepsItem, { title: 'Step 1' }),
            h(StepsItem, { title: 'Step 2' }),
            h(StepsItem, { title: 'Step 3' }),
          ],
        },
      })

      // First step should be finished (has checkmark)
      const icons = container.querySelectorAll('.tiger-step-icon')
      expect(icons[0]).toBeInTheDocument()
      
      // Second step should be current (process)
      expect(icons[1]).toBeInTheDocument()
    })

    it('should apply error status to current step', () => {
      const { container } = render(Steps, {
        props: { current: 1, status: 'error' },
        slots: {
          default: () => [
            h(StepsItem, { title: 'Step 1' }),
            h(StepsItem, { title: 'Step 2' }),
            h(StepsItem, { title: 'Step 3' }),
          ],
        },
      })

      const icons = container.querySelectorAll('.tiger-step-icon')
      // Second step should have error styling (red)
      expect(icons[1]).toHaveClass('text-red-500')
    })

    it('should render simple mode without descriptions', () => {
      const { container } = render(Steps, {
        props: { simple: true },
        slots: {
          default: () => [
            h(StepsItem, { title: 'Step 1', description: 'Description 1' }),
            h(StepsItem, { title: 'Step 2', description: 'Description 2' }),
          ],
        },
      })

      // Titles should be visible
      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      
      // Descriptions should not be rendered
      expect(screen.queryByText('Description 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Description 2')).not.toBeInTheDocument()
    })

    it('should render small size', () => {
      const { container } = render(Steps, {
        props: { size: 'small' },
        slots: {
          default: () => [h(StepsItem, { title: 'Step 1' })],
        },
      })

      const icon = container.querySelector('.tiger-step-icon')
      expect(icon).toHaveClass('w-8')
      expect(icon).toHaveClass('h-8')
    })

    it('should render default size', () => {
      const { container } = render(Steps, {
        props: { size: 'default' },
        slots: {
          default: () => [h(StepsItem, { title: 'Step 1' })],
        },
      })

      const icon = container.querySelector('.tiger-step-icon')
      expect(icon).toHaveClass('w-10')
      expect(icon).toHaveClass('h-10')
    })
  })

  describe('Step Status', () => {
    it('should show step numbers for wait and process status', () => {
      const { container } = render(Steps, {
        props: { current: 0 },
        slots: {
          default: () => [
            h(StepsItem, { title: 'Step 1' }),
            h(StepsItem, { title: 'Step 2' }),
            h(StepsItem, { title: 'Step 3' }),
          ],
        },
      })

      // Current step should show number 1
      expect(screen.getByText('1')).toBeInTheDocument()
      // Waiting steps should show numbers 2 and 3
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should show checkmark for finished steps', () => {
      const { container } = render(Steps, {
        props: { current: 2 },
        slots: {
          default: () => [
            h(StepsItem, { title: 'Step 1' }),
            h(StepsItem, { title: 'Step 2' }),
            h(StepsItem, { title: 'Step 3' }),
          ],
        },
      })

      // Finished steps should have SVG checkmarks
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThanOrEqual(2)
    })

    it('should allow custom status override', () => {
      const { container } = render(Steps, {
        props: { current: 0 },
        slots: {
          default: () => [
            h(StepsItem, { title: 'Step 1' }),
            h(StepsItem, { title: 'Step 2', status: 'error' }),
          ],
        },
      })

      const icons = container.querySelectorAll('.tiger-step-icon')
      // Second step should have error styling
      expect(icons[1]).toHaveClass('text-red-500')
    })
  })

  describe('Events', () => {
    it('should emit change event when clickable and step is clicked', async () => {
      const onChange = vi.fn()
      
      render(Steps, {
        props: {
          current: 0,
          clickable: true,
          'onUpdate:current': onChange,
        },
        slots: {
          default: () => [
            h(StepsItem, { title: 'Step 1' }),
            h(StepsItem, { title: 'Step 2' }),
            h(StepsItem, { title: 'Step 3' }),
          ],
        },
      })

      const step2Title = screen.getByText('Step 2')
      await step2Title.click()

      expect(onChange).toHaveBeenCalledWith(1)
    })

    it('should not emit change event when not clickable', async () => {
      const onChange = vi.fn()
      
      render(Steps, {
        props: {
          current: 0,
          clickable: false,
          'onUpdate:current': onChange,
        },
        slots: {
          default: () => [
            h(StepsItem, { title: 'Step 1' }),
            h(StepsItem, { title: 'Step 2' }),
          ],
        },
      })

      const step2Title = screen.getByText('Step 2')
      await step2Title.click()

      expect(onChange).not.toHaveBeenCalled()
    })

    it('should not emit change event when step is disabled', async () => {
      const onChange = vi.fn()
      
      render(Steps, {
        props: {
          current: 0,
          clickable: true,
          'onUpdate:current': onChange,
        },
        slots: {
          default: () => [
            h(StepsItem, { title: 'Step 1' }),
            h(StepsItem, { title: 'Step 2', disabled: true }),
          ],
        },
      })

      const step2Title = screen.getByText('Step 2')
      await step2Title.click()

      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Custom Icons', () => {
    it('should render custom icon from slot', () => {
      const { container } = render(Steps, {
        slots: {
          default: () => [
            h(StepsItem, { title: 'Step 1' }, {
              icon: () => h('span', { class: 'custom-icon' }, '★'),
            }),
          ],
        },
      })

      expect(container.querySelector('.custom-icon')).toBeInTheDocument()
      expect(screen.getByText('★')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper structure', () => {
      const { container } = render(Steps, {
        slots: {
          default: () => [
            h(StepsItem, { title: 'Step 1' }),
            h(StepsItem, { title: 'Step 2' }),
          ],
        },
      })

      const stepsContainer = container.querySelector('.tiger-steps')
      expect(stepsContainer).toBeInTheDocument()
    })

    it('should show title text for all steps', () => {
      render(Steps, {
        slots: {
          default: () => [
            h(StepsItem, { title: 'Login' }),
            h(StepsItem, { title: 'Verify' }),
            h(StepsItem, { title: 'Complete' }),
          ],
        },
      })

      expect(screen.getByText('Login')).toBeInTheDocument()
      expect(screen.getByText('Verify')).toBeInTheDocument()
      expect(screen.getByText('Complete')).toBeInTheDocument()
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for horizontal steps', () => {
      const { container } = render(Steps, {
        props: { current: 1 },
        slots: {
          default: () => [
            h(StepsItem, { title: 'Step 1', description: 'First step' }),
            h(StepsItem, { title: 'Step 2', description: 'Second step' }),
            h(StepsItem, { title: 'Step 3', description: 'Third step' }),
          ],
        },
      })

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for vertical steps', () => {
      const { container } = render(Steps, {
        props: { current: 1, direction: 'vertical' },
        slots: {
          default: () => [
            h(StepsItem, { title: 'Step 1', description: 'First step' }),
            h(StepsItem, { title: 'Step 2', description: 'Second step' }),
            h(StepsItem, { title: 'Step 3', description: 'Third step' }),
          ],
        },
      })

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for simple mode', () => {
      const { container } = render(Steps, {
        props: { current: 1, simple: true },
        slots: {
          default: () => [
            h(StepsItem, { title: 'Step 1' }),
            h(StepsItem, { title: 'Step 2' }),
            h(StepsItem, { title: 'Step 3' }),
          ],
        },
      })

      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
