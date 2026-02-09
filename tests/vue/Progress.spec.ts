/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/vue'
import { Progress } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

describe('Progress', () => {
  it('renders a line progressbar with default ARIA', () => {
    const { container } = renderWithProps(Progress, {})

    const progressbar = container.querySelector('[role="progressbar"]')
    expect(progressbar).toBeInTheDocument()
    expect(progressbar).toHaveAttribute('aria-valuenow', '0')
    expect(progressbar).toHaveAttribute('aria-valuemin', '0')
    expect(progressbar).toHaveAttribute('aria-valuemax', '100')
    expect(progressbar).toHaveAttribute('aria-label', 'Progress: 0%')

    const wrapper = progressbar?.parentElement?.parentElement as HTMLElement | null
    expect(wrapper?.className).toContain('w-full')
  })

  it('clamps percentage to 0-100 range', () => {
    const { container: over } = renderWithProps(Progress, { percentage: 150 })
    const bar1 = over.querySelector('[role="progressbar"]')
    expect(bar1).toHaveAttribute('aria-valuenow', '100')
    expect(bar1).toHaveStyle({ width: '100%' })

    const { container: under } = renderWithProps(Progress, { percentage: -20 })
    const bar2 = under.querySelector('[role="progressbar"]')
    expect(bar2).toHaveAttribute('aria-valuenow', '0')
    expect(bar2).toHaveStyle({ width: '0%' })
  })

  it('applies variant color classes', () => {
    const { container } = renderWithProps(Progress, { percentage: 50, variant: 'success' })
    const progressbar = container.querySelector('[role="progressbar"]')
    expect(progressbar?.className).toContain('success')
  })

  it('status overrides variant color', () => {
    const { container } = renderWithProps(Progress, {
      percentage: 50,
      variant: 'primary',
      status: 'exception'
    })
    const progressbar = container.querySelector('[role="progressbar"]')
    expect(progressbar?.className).toContain('error')
    expect(progressbar?.className).not.toContain('primary')
  })

  it('hides text when showText is false', () => {
    const { container } = renderWithProps(Progress, { percentage: 50, showText: false })
    expect(container.querySelector('span')).not.toBeInTheDocument()
  })

  it('forwards className prop', () => {
    const { container } = renderWithProps(Progress, {
      percentage: 50,
      className: 'my-custom-class'
    })
    const wrapper = container.querySelector('[role="progressbar"]')?.parentElement?.parentElement
    expect(wrapper?.className).toContain('my-custom-class')
  })

  it('forwards aria-label to the progressbar element', () => {
    const { container } = renderWithProps(Progress, {
      percentage: 10,
      'aria-label': '上传进度'
    })

    const progressbar = container.querySelector('[role="progressbar"]')
    expect(progressbar).toHaveAttribute('aria-label', '上传进度')
  })

  it('renders line text and supports custom text/format', () => {
    renderWithProps(Progress, { percentage: 50 })
    expect(screen.getByText('50%')).toBeInTheDocument()

    renderWithProps(Progress, { percentage: 50, text: '进行中' })
    expect(screen.getByText('进行中')).toBeInTheDocument()

    renderWithProps(Progress, {
      percentage: 50,
      format: (p: number) => `${p}个/100个`
    })
    expect(screen.getByText('50个/100个')).toBeInTheDocument()
  })

  it('supports striped animation classes', () => {
    const { container } = renderWithProps(Progress, {
      percentage: 70,
      striped: true,
      stripedAnimation: true
    })

    const progressbar = container.querySelector('[role="progressbar"]')
    expect(progressbar?.className).toContain('bg-gradient')
    expect(progressbar?.className).toContain('animate')
  })

  it('supports custom width/height and circle strokeWidth', () => {
    const { container } = renderWithProps(Progress, {
      percentage: 50,
      width: '300px',
      height: 20
    })

    const progressbar = container.querySelector('[role="progressbar"]') as HTMLElement
    const track = progressbar.parentElement as HTMLElement
    const wrapper = track.parentElement as HTMLElement
    expect(wrapper).toHaveStyle({ width: '300px' })
    expect(track).toHaveStyle({ height: '20px' })

    const { container: circle } = renderWithProps(Progress, {
      type: 'circle',
      percentage: 50,
      strokeWidth: 10
    })
    circle.querySelectorAll('circle').forEach((c) => {
      expect(c).toHaveAttribute('stroke-width', '10')
    })
  })

  it('renders circle progress', () => {
    const { container } = renderWithProps(Progress, {
      type: 'circle',
      percentage: 75,
      showText: true
    })

    expect(container.querySelector('svg')).toBeInTheDocument()
    const progressbar = container.querySelector('[role="progressbar"]')
    expect(progressbar).toHaveAttribute('aria-valuenow', '75')
  })

  it('passes basic a11y checks', async () => {
    const { container: line } = renderWithProps(Progress, { percentage: 50 })
    await expectNoA11yViolations(line)

    const { container: circle } = renderWithProps(Progress, {
      type: 'circle',
      percentage: 75,
      showText: true
    })
    await expectNoA11yViolations(circle)
  })
})
