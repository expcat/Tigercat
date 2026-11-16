/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { Rate } from '@expcat/tigercat-vue/Rate'
import { rateHalfStarInnerClasses, rateInactiveColor } from '@expcat/tigercat-core'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

/** The interactive star spans are the direct children of the slider. */
function getStars(container: HTMLElement): HTMLElement[] {
  const slider = container.querySelector('[role="slider"]') as HTMLElement
  return Array.from(slider.children) as HTMLElement[]
}

function countFilledStars(container: HTMLElement): number {
  return getStars(container).filter((star) => star.querySelector('[class*="--tiger-warning"]'))
    .length
}

describe('Rate', () => {
  // --- Basic rendering ---
  it('renders as a single slider (not a radiogroup)', () => {
    const { container } = renderWithProps(Rate, {})
    expect(container.querySelector('[role="slider"]')).toBeInTheDocument()
    expect(container.querySelector('[role="radiogroup"]')).not.toBeInTheDocument()
    expect(container.querySelector('[role="radio"]')).not.toBeInTheDocument()
  })

  it('renders 5 stars by default', () => {
    const { container } = renderWithProps(Rate, {})
    expect(getStars(container).length).toBe(5)
  })
  it('applies className prop', () => {
    const { container } = renderWithProps(Rate, { className: 'custom-rate' })
    expect(container.querySelector('.custom-rate')).toBeInTheDocument()
  })

  // --- Selection (mouse) ---
  it('selects a star on click', async () => {
    const onChange = vi.fn()
    const { container } = render(Rate, {
      props: { modelValue: 0, 'onUpdate:modelValue': onChange }
    })
    await fireEvent.click(getStars(container)[2])
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('reflects the current value via aria-valuenow (single source, no multi-checked)', () => {
    const { container } = renderWithProps(Rate, { modelValue: 3 })
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    expect(slider).toHaveAttribute('aria-valuenow', '3')
    expect(slider).toHaveAttribute('aria-valuetext', '3 stars')
    expect(container.querySelector('[aria-checked]')).not.toBeInTheDocument()
  })
  it('steps by 0.5 with allowHalf', async () => {
    const onChange = vi.fn()
    const { container } = render(Rate, {
      props: { modelValue: 2, allowHalf: true, 'onUpdate:modelValue': onChange }
    })
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    await fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith(2.5)
  })

  it('locks on readOnly, stays focusable and prevents navigation scrolling', async () => {
    const onChange = vi.fn()
    const { container } = render(Rate, {
      props: { defaultValue: 4.5, allowHalf: true, readOnly: true, 'onUpdate:modelValue': onChange }
    })
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    slider.focus()
    await fireEvent.click(getStars(container)[3])
    for (const key of ['Home', 'End', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      await fireEvent(slider, event)
      expect(event.defaultPrevented).toBe(true)
      expect(slider).toHaveAttribute('aria-valuenow', '4.5')
      expect(slider).toHaveFocus()
    }
    expect(onChange).not.toHaveBeenCalled()
    expect(slider).toHaveAttribute('aria-readonly', 'true')
    expect(slider).toHaveAttribute('tabindex', '0')
  })

  // --- Disabled ---
  it('does not emit on click or keyboard when disabled and is not focusable', async () => {
    const onChange = vi.fn()
    const { container } = render(Rate, {
      props: { modelValue: 0, disabled: true, 'onUpdate:modelValue': onChange }
    })
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    await fireEvent.click(getStars(container)[1])
    await fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).not.toHaveBeenCalled()
    expect(slider).toHaveAttribute('tabindex', '-1')
    expect(slider).toHaveAttribute('aria-disabled', 'true')
  })

  // --- Allow clear ---
  it('clears value when clicking same star with allowClear', async () => {
    const onChange = vi.fn()
    const { container } = render(Rate, {
      props: { modelValue: 3, allowClear: true, 'onUpdate:modelValue': onChange }
    })
    await fireEvent.click(getStars(container)[2])
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('keeps a prevented ArrowRight at 2 and runs caller keydown and mouseleave', async () => {
    const onChange = vi.fn()
    const onKeydown = vi.fn((event: KeyboardEvent) => {
      event.preventDefault()
    })
    const onMouseleave = vi.fn()
    const { container } = render(Rate, {
      props: { defaultValue: 2, 'onUpdate:modelValue': onChange },
      attrs: { onKeydown, onMouseleave }
    })
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    await fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onKeydown).toHaveBeenCalledTimes(1)
    expect(onChange).not.toHaveBeenCalled()
    expect(slider).toHaveAttribute('aria-valuenow', '2')
    await fireEvent.mouseLeave(slider)
    expect(onMouseleave).toHaveBeenCalledTimes(1)
  })

  it('drops a stale hover preview after locking and does not restore it', async () => {
    const { container, rerender } = render(Rate, { props: { defaultValue: 2 } })
    const slider = () => container.querySelector('[role="slider"]') as HTMLElement
    await fireEvent.mouseMove(getStars(container)[3])
    expect(countFilledStars(container)).toBe(4)

    await rerender({ defaultValue: 2, readOnly: true, disabled: false })
    await fireEvent.mouseLeave(slider())
    expect(countFilledStars(container)).toBe(2)
    await rerender({ defaultValue: 2, readOnly: false, disabled: false })
    expect(countFilledStars(container)).toBe(2)

    await fireEvent.mouseMove(getStars(container)[3])
    await rerender({ defaultValue: 2, readOnly: false, disabled: true })
    await fireEvent.mouseLeave(slider())
    expect(countFilledStars(container)).toBe(2)
    await rerender({ defaultValue: 2, readOnly: false, disabled: false })
    expect(countFilledStars(container)).toBe(2)
  })

  it('uses the enabled empty-star color and keeps disabled stars muted', async () => {
    const { container, rerender } = render(Rate, { props: { defaultValue: 0 } })
    for (const star of getStars(container)) {
      const glyph = star.firstElementChild as HTMLElement
      expect(glyph.className).toContain(rateInactiveColor)
      expect(glyph.className).not.toContain('--tiger-text-disabled')
    }

    await rerender({ defaultValue: 0, disabled: true })
    for (const star of getStars(container)) {
      expect((star.firstElementChild as HTMLElement).className).toContain('--tiger-text-disabled')
    }
  })

  // --- Half-star clip (Pages /rate) ---
  it('clips a full-size glyph to the inline-start half at 4.5', () => {
    const { container } = renderWithProps(Rate, {
      modelValue: 4.5,
      allowHalf: true,
      disabled: true
    })
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
    const { container } = renderWithProps(Rate, {
      modelValue: 3.5,
      allowHalf: true,
      character: '★'
    })
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
    const { container } = renderWithProps(Rate, { modelValue: 2, count: 5 })
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    expect(slider).toHaveAttribute('aria-label', 'Rating')
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '5')
    expect(slider).toHaveAttribute('aria-valuenow', '2')
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Rate)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
