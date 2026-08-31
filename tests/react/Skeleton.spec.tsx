/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import { Skeleton } from '@expcat/tigercat-react/Skeleton'
import { expectNoA11yViolationsIsolated } from '../utils/a11y-helpers'
import { renderWithProps } from '../utils/render-helpers-react'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-tiger-skeleton]') as HTMLElement
}

function getBars(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll('.tiger-skeleton')) as HTMLElement[]
}

describe('Skeleton', () => {
  describe('Rendering', () => {
    it('should render single skeleton element by default', () => {
      const { container } = renderWithProps(Skeleton, {})
      expect(getBars(container)).toHaveLength(1)
      expect(getRoot(container)).toBe(getBars(container)[0])
    })

    it('forwards the ref to the root (single and multi-row)', () => {
      const singleRef = React.createRef<HTMLDivElement>()
      const { container, rerender } = render(<Skeleton ref={singleRef} />)
      expect(singleRef.current).toBe(getRoot(container))

      const multiRef = React.createRef<HTMLDivElement>()
      rerender(<Skeleton ref={multiRef} rows={3} />)
      expect(multiRef.current).toBe(getRoot(container))
    })
  })

  describe('Dimensions', () => {
    it('should apply both custom width and height', () => {
      const { container } = renderWithProps(Skeleton, {
        width: '300px',
        height: '100px'
      })
      expect(getRoot(container)).toHaveStyle({ width: '300px', height: '100px' })
    })

    it('lets style.height win over the text default', () => {
      const { container } = render(<Skeleton style={{ height: '32px' }} />)
      expect(getRoot(container).style.height).toBe('32px')
    })

    it('does not give custom a default size', () => {
      const { container } = render(<Skeleton variant="custom" />)
      expect(getRoot(container).style.height).toBe('')
      expect(getRoot(container).style.width).toBe('')
    })
  })

  describe('Animation', () => {
    it('sweeps a highlight for wave and stays still for none', () => {
      const wave = render(<Skeleton animation="wave" />)
      expect(getComputedStyle(getRoot(wave.container)).animationName).toBe('tiger-skeleton-wave')
      wave.unmount()

      const pulse = render(<Skeleton animation="pulse" />)
      expect(getComputedStyle(getRoot(pulse.container)).animationName).toBe('tiger-skeleton-pulse')
      pulse.unmount()

      const none = render(<Skeleton animation="none" />)
      const noneName = getComputedStyle(getRoot(none.container)).animationName
      expect(noneName === 'none' || noneName === '').toBe(true)
    })
  })

  describe('Multiple Rows', () => {
    it('should render multiple rows when rows prop is greater than 1', () => {
      const { container } = renderWithProps(Skeleton, {
        variant: 'text',
        rows: 3
      })
      expect(getBars(container)).toHaveLength(3)
    })

    it('keeps className on the root when rows change', () => {
      const { container, rerender } = render(<Skeleton className="custom-host" />)
      expect(getRoot(container).className).toContain('custom-host')
      rerender(<Skeleton className="custom-host" rows={3} />)
      expect(getRoot(container).className).toContain('custom-host')
      getBars(container).forEach((bar) => {
        expect(bar.className).not.toContain('custom-host')
      })
    })
  })

  describe('Paragraph Mode', () => {
    it('varies row widths inside the caller width', () => {
      const { container } = render(<Skeleton variant="text" rows={3} paragraph width="240px" />)
      const root = getRoot(container)
      const bars = getBars(container)
      expect(root.style.width).toBe('240px')
      expect(bars).toHaveLength(3)
      expect(bars[2].style.width).toBe('60%')
      expect(bars[0].style.width).not.toBe(bars[2].style.width)
    })
  })

  describe('Custom Classes', () => {
    it('should apply custom className and preserve base classes', () => {
      const { container } = renderWithProps(Skeleton, {
        className: 'custom-class'
      })
      const skeleton = getRoot(container)
      expect(skeleton.className).toContain('tiger-skeleton')
      expect(skeleton.className).toContain('custom-class')
    })
  })

  describe('Accessibility', () => {
    it('should have no a11y violations with default props', async () => {
      const { container } = render(<Skeleton />)
      await expectNoA11yViolationsIsolated(container)
    })

    it('names a live status when aria-label is set', async () => {
      const { container } = render(<Skeleton aria-label="Loading profile" />)
      const root = getRoot(container)
      expect(root.getAttribute('aria-hidden')).toBeNull()
      expect(root).toHaveAttribute('role', 'status')
      expect(root).toHaveAttribute('aria-busy', 'true')
      expect(root).toHaveAttribute('aria-label', 'Loading profile')
      await expectNoA11yViolationsIsolated(container)
    })

    it('treats aria-hidden="false" as visible', () => {
      const { container } = render(<Skeleton aria-hidden="false" />)
      expect(getRoot(container).getAttribute('aria-hidden')).toBe('false')
    })
  })
})
