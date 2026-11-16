/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { Rate } from '@expcat/tigercat-react/Rate'
import { rateHalfStarInnerClasses, rateInactiveColor } from '@expcat/tigercat-core'
import { zhCN } from '../../packages/core/src/utils/i18n/locales/zh-CN'
import { defaultTheme } from '../../packages/core/src/themes/default/theme'
import { modernTheme } from '../../packages/core/src/themes/modern/theme'
import { expectNoA11yViolationsIsolated } from '../utils/react'

/** The interactive star spans are the direct children of the slider. */
function getStars(container: HTMLElement): HTMLElement[] {
  const slider = container.querySelector('[role="slider"]') as HTMLElement
  return Array.from(slider.children) as HTMLElement[]
}

function countFilledStars(container: HTMLElement): number {
  return getStars(container).filter((star) => star.querySelector('[class*="--tiger-warning"]'))
    .length
}

function srgbChannel(channel: number): number {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function contrastRatio(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const normalized = hex.replace('#', '')
    const red = Number.parseInt(normalized.slice(0, 2), 16)
    const green = Number.parseInt(normalized.slice(2, 4), 16)
    const blue = Number.parseInt(normalized.slice(4, 6), 16)
    return 0.2126 * srgbChannel(red) + 0.7152 * srgbChannel(green) + 0.0722 * srgbChannel(blue)
  }
  const lighter = Math.max(luminance(foreground), luminance(background))
  const darker = Math.min(luminance(foreground), luminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

function enabledEmptyColor(colors: {
  text: string
  textSecondary: string
  textDisabled: string
}): string {
  if (rateInactiveColor.includes('--tiger-text-secondary')) return colors.textSecondary
  if (rateInactiveColor.includes('--tiger-text-disabled')) return colors.textDisabled
  if (rateInactiveColor === 'text-[var(--tiger-text)]') return colors.text
  throw new Error('unmapped rate inactive color: ' + rateInactiveColor)
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
    expect(container.querySelector('[role="slider"]')).toHaveAttribute('aria-valuetext', '1 stars')
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
  it('locks on readOnly, stays focusable and prevents navigation scrolling', () => {
    const onChange = vi.fn()
    const { container } = render(<Rate defaultValue={4.5} allowHalf readOnly onChange={onChange} />)
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    slider.focus()
    fireEvent.click(getStars(container)[3])
    for (const key of ['Home', 'End', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      fireEvent(slider, event)
      expect(event.defaultPrevented).toBe(true)
      expect(slider).toHaveAttribute('aria-valuenow', '4.5')
      expect(slider).toHaveFocus()
    }
    expect(onChange).not.toHaveBeenCalled()
    expect(slider).toHaveAttribute('aria-readonly', 'true')
    expect(slider).toHaveAttribute('tabindex', '0')
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

  it('keeps a prevented ArrowRight at 2 and runs the caller mouseleave', () => {
    const onChange = vi.fn()
    const onKeyDown = vi.fn((event: React.KeyboardEvent<HTMLDivElement>) => {
      event.preventDefault()
    })
    const onMouseLeave = vi.fn()
    const { container } = render(
      <Rate
        defaultValue={2}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onMouseLeave={onMouseLeave}
      />
    )
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(onChange).not.toHaveBeenCalled()
    expect(slider).toHaveAttribute('aria-valuenow', '2')
    fireEvent.mouseLeave(slider)
    expect(onMouseLeave).toHaveBeenCalledTimes(1)
  })

  it('drops a stale hover preview after locking and does not restore it', () => {
    const { container, rerender } = render(<Rate defaultValue={2} />)
    const slider = () => container.querySelector('[role="slider"]') as HTMLElement
    fireEvent.mouseMove(getStars(container)[3])
    expect(countFilledStars(container)).toBe(4)

    rerender(<Rate defaultValue={2} readOnly />)
    fireEvent.mouseLeave(slider())
    expect(countFilledStars(container)).toBe(2)
    rerender(<Rate defaultValue={2} readOnly={false} />)
    expect(countFilledStars(container)).toBe(2)

    fireEvent.mouseMove(getStars(container)[3])
    rerender(<Rate defaultValue={2} disabled />)
    fireEvent.mouseLeave(slider())
    expect(countFilledStars(container)).toBe(2)
    rerender(<Rate defaultValue={2} disabled={false} />)
    expect(countFilledStars(container)).toBe(2)
  })

  it('gives enabled empty stars at least 3:1 contrast and keeps disabled stars muted', () => {
    const { container, rerender } = render(<Rate defaultValue={0} />)
    for (const star of getStars(container)) {
      const glyph = star.firstElementChild as HTMLElement
      expect(glyph.className).toContain(rateInactiveColor)
      expect(glyph.className).not.toContain('--tiger-text-disabled')
    }

    for (const theme of [defaultTheme, modernTheme]) {
      for (const scheme of ['light', 'dark'] as const) {
        const colors = theme[scheme].colors
        expect(contrastRatio(enabledEmptyColor(colors), colors.surface)).toBeGreaterThanOrEqual(3)
      }
    }

    rerender(<Rate defaultValue={0} disabled />)
    for (const star of getStars(container)) {
      expect((star.firstElementChild as HTMLElement).className).toContain('--tiger-text-disabled')
    }
  })

  // --- Half-star clip (Pages /rate) ---
  it('clips a full-size glyph to the inline-start half at 4.5', () => {
    const { container } = render(<Rate value={4.5} allowHalf disabled />)
    const stars = getStars(container)
    expect(stars).toHaveLength(5)

    for (let i = 0; i < 4; i++) {
      expect(stars[i].querySelector('.overflow-hidden')).toBeNull()
    }

    const fifth = stars[4]
    expect(fifth.children).toHaveLength(2)
    const [emptyLayer, fillLayer] = Array.from(fifth.children) as HTMLElement[]
    expect(fillLayer.getAttribute('class')).toContain(rateHalfStarInnerClasses)
    expect(fillLayer.style.width).toBe('')

    const emptyGlyph = emptyLayer.querySelector('svg')
    const fillGlyph = fillLayer.querySelector('svg')
    expect(emptyGlyph).not.toBeNull()
    expect(fillGlyph?.getAttribute('class')).toBe(emptyGlyph?.getAttribute('class'))
    expect(fillGlyph?.getAttribute('class')).not.toContain('w-[200%]')
  })

  it('stacks a custom half character on the same box as the empty star', () => {
    const { container } = render(<Rate value={3.5} allowHalf character="★" />)
    const fourth = getStars(container)[3]
    expect(fourth.children).toHaveLength(2)
    const [emptyLayer, fillLayer] = Array.from(fourth.children) as HTMLElement[]
    expect(fillLayer.getAttribute('class')).toContain('clip-path:inset(0_50%_0_0)')
    expect(emptyLayer.firstElementChild?.getAttribute('class')).toBe(
      fillLayer.firstElementChild?.getAttribute('class')
    )
    expect(fillLayer.firstElementChild?.getAttribute('class')).not.toContain('w-[200%]')
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
      const { container, rerender } = render(<Rate defaultValue={3} />)
      await expectNoA11yViolationsIsolated(container)
      rerender(<Rate value={4.5} allowHalf readOnly />)
      await expectNoA11yViolationsIsolated(container)
      rerender(<Rate value={2} disabled />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
