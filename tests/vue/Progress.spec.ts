/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { h } from 'vue'
import { render, screen } from '@testing-library/vue'
import { Progress } from '@expcat/tigercat-vue/Progress'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { renderWithProps, expectNoA11yViolations } from '../utils'

function fillOf(container: HTMLElement): HTMLElement | null {
  return container.querySelector('.tiger-progress-fill')
}

describe('Progress', () => {
  it('renders a line progressbar with default ARIA', () => {
    const { container } = renderWithProps(Progress, {})

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '0')
    expect(progressbar).toHaveAttribute('aria-valuemin', '0')
    expect(progressbar).toHaveAttribute('aria-valuemax', '100')
    expect(progressbar).toHaveAttribute('aria-label', 'Progress')
    expect(fillOf(container)).toHaveStyle({ width: '0%' })
  })

  it('clamps percentage to 0-100 range', () => {
    const { container: over } = renderWithProps(Progress, { percentage: 150 })
    expect(over.querySelector('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '100')
    expect(fillOf(over)).toHaveStyle({ width: '100%' })

    const { container: under } = renderWithProps(Progress, { percentage: -20 })
    expect(under.querySelector('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '0')
    expect(fillOf(under)).toHaveStyle({ width: '0%' })
  })

  it('clamps NaN to 0', () => {
    renderWithProps(Progress, { percentage: Number.NaN })
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('hides text when showText is false', () => {
    const { container } = renderWithProps(Progress, { percentage: 50, showText: false })
    expect(container.querySelector('span')).not.toBeInTheDocument()
  })

  it('forwards className prop', () => {
    renderWithProps(Progress, {
      percentage: 50,
      className: 'my-custom-class'
    })
    expect(screen.getByRole('progressbar').className).toContain('my-custom-class')
  })

  it('forwards aria-label to the progressbar element', () => {
    renderWithProps(Progress, {
      percentage: 10,
      'aria-label': '上传进度'
    })
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', '上传进度')
  })

  it('puts custom text in valuetext and keeps the name free of the percentage', () => {
    renderWithProps(Progress, { percentage: 50, text: '进行中' })
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuetext', '进行中')
    expect(bar.getAttribute('aria-label')).not.toContain('50%')
    expect(screen.getByText('进行中')).toBeInTheDocument()
  })

  it('uses official locale names', () => {
    render({
      render: () => h(ConfigProvider, { locale: zhCN }, () => h(Progress, { percentage: 40 }))
    })
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', zhCN.progress!.ariaLabel)
  })

  it('uses zh-TW progress name from the official locale object', () => {
    render({
      render: () => h(ConfigProvider, { locale: zhTW }, () => h(Progress, { percentage: 40 }))
    })
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', zhTW.progress!.ariaLabel)
  })

  it('renders line text and supports custom text/format', () => {
    renderWithProps(Progress, { percentage: 50 })
    expect(screen.getByText('50%')).toBeInTheDocument()

    renderWithProps(Progress, {
      percentage: 50,
      format: (p: number) => `${p}个/100个`
    })
    expect(screen.getByText('50个/100个')).toBeInTheDocument()
  })

  it('supports custom width/height and circle strokeWidth', () => {
    const { container } = renderWithProps(Progress, {
      percentage: 50,
      width: '300px',
      height: 20
    })
    expect(screen.getByRole('progressbar')).toHaveStyle({ width: '300px' })
    expect(container.querySelector('[class*="overflow-hidden"]')).toHaveStyle({ height: '20px' })

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
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75')
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
