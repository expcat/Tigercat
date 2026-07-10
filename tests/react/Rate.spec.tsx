/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ConfigProvider, Rate } from '@expcat/tigercat-react'
import { zhCN } from '../../packages/core/src/utils/i18n/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils/react'

/** The interactive star spans are the direct children of the slider. */
function getStars(container: HTMLElement): HTMLElement[] {
  const slider = container.querySelector('[role="slider"]') as HTMLElement
  return Array.from(slider.children) as HTMLElement[]
}

describe('Rate', () => {
  // --- Basic rendering ---
  it('renders as a single slider (not a radiogroup)', () => {
    const { container } = render(<Rate />)
    expect(container.querySelector('[role="slider"]')).toBeInTheDocument()
    expect(container.querySelector('[role="radiogroup"]')).not.toBeInTheDocument()
    expect(container.querySelector('[role="radio"]')).not.toBeInTheDocument()
  })

  it('renders 5 stars by default', () => {
    const { container } = render(<Rate />)
    expect(getStars(container).length).toBe(5)
  })
  it('applies className', () => {
    const { container } = render(<Rate className="custom-rate" />)
    expect(container.querySelector('.custom-rate')).toBeInTheDocument()
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    const { container } = render(<Rate size={size} />)
    expect(container.querySelector('[role="slider"]')).toBeInTheDocument()
  })

  // --- Selection (mouse) ---
  it('calls onChange on star click', () => {
    const onChange = vi.fn()
    const { container } = render(<Rate value={0} onChange={onChange} />)
    fireEvent.click(getStars(container)[2])
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('reflects the current value via aria-valuenow (single source, no multi-checked)', () => {
    const { container } = render(<Rate value={3} />)
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    expect(slider).toHaveAttribute('aria-valuenow', '3')
    expect(slider).toHaveAttribute('aria-valuetext', '3 stars')
    // No element should claim aria-checked anymore.
    expect(container.querySelector('[aria-checked]')).not.toBeInTheDocument()
  })

  it('uses singular valuetext for a value of 1', () => {
    const { container } = render(<Rate value={1} />)
    expect(container.querySelector('[role="slider"]')).toHaveAttribute('aria-valuetext', '1 star')
  })

  it('localizes slider aria text from ConfigProvider', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <Rate value={3} />
      </ConfigProvider>
    )

    expect(screen.getByRole('slider', { name: '评分' })).toHaveAttribute('aria-valuetext', '3 星')
  })

  // --- Keyboard ---
  it('increments on ArrowRight / ArrowUp', () => {
    const onChange = vi.fn()
    const { container } = render(<Rate value={2} onChange={onChange} />)
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith(3)
    fireEvent.keyDown(slider, { key: 'ArrowUp' })
    expect(onChange).toHaveBeenCalledWith(3)
  })
  it('steps by 0.5 with allowHalf', () => {
    const onChange = vi.fn()
    const { container } = render(<Rate value={2} allowHalf onChange={onChange} />)
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith(2.5)
  })
  // --- Disabled ---
  it('does not call onChange when disabled (mouse or keyboard) and is not focusable', () => {
    const onChange = vi.fn()
    const { container } = render(<Rate value={0} disabled onChange={onChange} />)
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    fireEvent.click(getStars(container)[1])
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).not.toHaveBeenCalled()
    expect(slider).toHaveAttribute('tabindex', '-1')
    expect(slider).toHaveAttribute('aria-disabled', 'true')
  })
  // --- Allow clear ---
  it('clears value when clicking same star with allowClear', () => {
    const onChange = vi.fn()
    const { container } = render(<Rate value={3} allowClear onChange={onChange} />)
    fireEvent.click(getStars(container)[2])
    expect(onChange).toHaveBeenCalledWith(0)
  })
  // --- Accessibility ---
  it('has aria-label and value bounds on the slider', () => {
    const { container } = render(<Rate value={2} count={5} />)
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    expect(slider).toHaveAttribute('aria-label', 'Rating')
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '5')
    expect(slider).toHaveAttribute('aria-valuenow', '2')
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Rate />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {})
})
