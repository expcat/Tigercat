/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { Steps, StepsItem } from '@tigercat/react'

describe('Steps', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(
        <Steps>
          <StepsItem title="Step 1" />
          <StepsItem title="Step 2" />
          <StepsItem title="Step 3" />
        </Steps>
      )

      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.getByText('Step 3')).toBeInTheDocument()
    })

    it('should render with descriptions', () => {
      render(
        <Steps>
          <StepsItem title="Step 1" description="Description 1" />
          <StepsItem title="Step 2" description="Description 2" />
        </Steps>
      )

      expect(screen.getByText('Description 1')).toBeInTheDocument()
      expect(screen.getByText('Description 2')).toBeInTheDocument()
    })

    it('should render horizontal layout by default', () => {
      const { container } = render(
        <Steps>
          <StepsItem title="Step 1" />
        </Steps>
      )

      const stepsContainer = container.querySelector('.tiger-steps')
      expect(stepsContainer).toHaveClass('flex-row')
    })

    it('should render vertical layout', () => {
      const { container } = render(
        <Steps direction="vertical">
          <StepsItem title="Step 1" />
        </Steps>
      )

      const stepsContainer = container.querySelector('.tiger-steps')
      expect(stepsContainer).toHaveClass('flex-col')
    })
  })

  describe('Props', () => {
    it('should respect current prop', () => {
      const { container } = render(
        <Steps current={1}>
          <StepsItem title="Step 1" />
          <StepsItem title="Step 2" />
          <StepsItem title="Step 3" />
        </Steps>
      )

      // First step should be finished (has checkmark)
      const icons = container.querySelectorAll('.tiger-step-icon')
      expect(icons[0]).toBeInTheDocument()
      
      // Second step should be current (process)
      expect(icons[1]).toBeInTheDocument()
    })

    it('should apply error status to current step', () => {
      const { container } = render(
        <Steps current={1} status="error">
          <StepsItem title="Step 1" />
          <StepsItem title="Step 2" />
          <StepsItem title="Step 3" />
        </Steps>
      )

      const icons = container.querySelectorAll('.tiger-step-icon')
      // Second step should have error styling (red)
      expect(icons[1]).toHaveClass('text-red-500')
    })

    it('should render simple mode without descriptions', () => {
      const { container } = render(
        <Steps simple>
          <StepsItem title="Step 1" description="Description 1" />
          <StepsItem title="Step 2" description="Description 2" />
        </Steps>
      )

      // Titles should be visible
      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      
      // Descriptions should not be rendered
      expect(screen.queryByText('Description 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Description 2')).not.toBeInTheDocument()
    })

    it('should render small size', () => {
      const { container } = render(
        <Steps size="small">
          <StepsItem title="Step 1" />
        </Steps>
      )

      const icon = container.querySelector('.tiger-step-icon')
      expect(icon).toHaveClass('w-8')
      expect(icon).toHaveClass('h-8')
    })

    it('should render default size', () => {
      const { container } = render(
        <Steps size="default">
          <StepsItem title="Step 1" />
        </Steps>
      )

      const icon = container.querySelector('.tiger-step-icon')
      expect(icon).toHaveClass('w-10')
      expect(icon).toHaveClass('h-10')
    })
  })

  describe('Step Status', () => {
    it('should show step numbers for wait and process status', () => {
      const { container } = render(
        <Steps current={0}>
          <StepsItem title="Step 1" />
          <StepsItem title="Step 2" />
          <StepsItem title="Step 3" />
        </Steps>
      )

      // Current step should show number 1
      expect(screen.getByText('1')).toBeInTheDocument()
      // Waiting steps should show numbers 2 and 3
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should show checkmark for finished steps', () => {
      const { container } = render(
        <Steps current={2}>
          <StepsItem title="Step 1" />
          <StepsItem title="Step 2" />
          <StepsItem title="Step 3" />
        </Steps>
      )

      // Finished steps should have SVG checkmarks
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThanOrEqual(2)
    })

    it('should allow custom status override', () => {
      const { container } = render(
        <Steps current={0}>
          <StepsItem title="Step 1" />
          <StepsItem title="Step 2" status="error" />
        </Steps>
      )

      const icons = container.querySelectorAll('.tiger-step-icon')
      // Second step should have error styling
      expect(icons[1]).toHaveClass('text-red-500')
    })
  })

  describe('Events', () => {
    it('should call onChange when clickable and step is clicked', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      
      render(
        <Steps current={0} clickable onChange={onChange}>
          <StepsItem title="Step 1" />
          <StepsItem title="Step 2" />
          <StepsItem title="Step 3" />
        </Steps>
      )

      const step2Title = screen.getByText('Step 2')
      await user.click(step2Title)

      expect(onChange).toHaveBeenCalledWith(1)
    })

    it('should not call onChange when not clickable', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      
      render(
        <Steps current={0} clickable={false} onChange={onChange}>
          <StepsItem title="Step 1" />
          <StepsItem title="Step 2" />
        </Steps>
      )

      const step2Title = screen.getByText('Step 2')
      await user.click(step2Title)

      expect(onChange).not.toHaveBeenCalled()
    })

    it('should not call onChange when step is disabled', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      
      render(
        <Steps current={0} clickable onChange={onChange}>
          <StepsItem title="Step 1" />
          <StepsItem title="Step 2" disabled />
        </Steps>
      )

      const step2Title = screen.getByText('Step 2')
      await user.click(step2Title)

      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Custom Icons', () => {
    it('should render custom icon', () => {
      const { container } = render(
        <Steps>
          <StepsItem
            title="Step 1"
            icon={<span className="custom-icon">★</span>}
          />
        </Steps>
      )

      expect(container.querySelector('.custom-icon')).toBeInTheDocument()
      expect(screen.getByText('★')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper structure', () => {
      const { container } = render(
        <Steps>
          <StepsItem title="Step 1" />
          <StepsItem title="Step 2" />
        </Steps>
      )

      const stepsContainer = container.querySelector('.tiger-steps')
      expect(stepsContainer).toBeInTheDocument()
    })

    it('should show title text for all steps', () => {
      render(
        <Steps>
          <StepsItem title="Login" />
          <StepsItem title="Verify" />
          <StepsItem title="Complete" />
        </Steps>
      )

      expect(screen.getByText('Login')).toBeInTheDocument()
      expect(screen.getByText('Verify')).toBeInTheDocument()
      expect(screen.getByText('Complete')).toBeInTheDocument()
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for horizontal steps', () => {
      const { container } = render(
        <Steps current={1}>
          <StepsItem title="Step 1" description="First step" />
          <StepsItem title="Step 2" description="Second step" />
          <StepsItem title="Step 3" description="Third step" />
        </Steps>
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for vertical steps', () => {
      const { container } = render(
        <Steps current={1} direction="vertical">
          <StepsItem title="Step 1" description="First step" />
          <StepsItem title="Step 2" description="Second step" />
          <StepsItem title="Step 3" description="Third step" />
        </Steps>
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for simple mode', () => {
      const { container } = render(
        <Steps current={1} simple>
          <StepsItem title="Step 1" />
          <StepsItem title="Step 2" />
          <StepsItem title="Step 3" />
        </Steps>
      )

      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
