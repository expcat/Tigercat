/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import React from 'react'
import { fireEvent, render } from '@testing-library/react'
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
      expect(getRoot(wave.container).className).toContain('tiger-skeleton-wave')
      wave.unmount()

      const pulse = render(<Skeleton animation="pulse" />)
      expect(getRoot(pulse.container).className).toContain('tiger-skeleton-pulse')
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

  describe('preset', () => {
    it('maps preset=avatar onto the avatar shape and does not pass preset through', () => {
      const avatar = render(<Skeleton preset="avatar" />)
      const avatarRoot = getRoot(avatar.container)
      expect(avatarRoot.className).toContain('rounded-full')
      expect(avatarRoot.className).toContain('w-10')
      expect(avatarRoot.className).toContain('h-10')
      expect(avatarRoot.hasAttribute('preset')).toBe(false)
      avatar.unmount()

      const explicit = render(<Skeleton variant="text" preset="avatar" />)
      const textRoot = getRoot(explicit.container)
      expect(textRoot.className).toContain('w-full')
      expect(textRoot.className).toContain('h-4')
      expect(textRoot.className).not.toContain('rounded-full')
      expect(textRoot.className).not.toContain('w-10')
    })
  })

  describe('row normalization', () => {
    it('caps rows, floors paragraph rows, and keeps the last line at 60%', () => {
      const capped = render(<Skeleton rows={8} />)
      expect(getBars(capped.container)).toHaveLength(6)
      capped.unmount()

      const fraction = render(<Skeleton rows={2.5} paragraph />)
      const bars = getBars(fraction.container)
      expect(bars).toHaveLength(2)
      expect(bars[1].style.width).toBe('60%')
      fraction.unmount()

      const infinite = render(<Skeleton rows={Infinity} />)
      expect(getBars(infinite.container)).toHaveLength(1)
    })
  })

  describe('loaded host', () => {
    it('keeps caller root props and clicks after loading becomes false', () => {
      const onClick = vi.fn()
      const host = {
        id: 'persistent-host',
        className: 'persistent-class',
        style: { padding: '12px' },
        'aria-describedby': 'help',
        'data-marker': 'keep',
        onClick
      }
      const { container, rerender } = render(
        <Skeleton {...host} loading>
          <button type="button">ready</button>
        </Skeleton>
      )
      const loadingRoot = getRoot(container)
      expect(loadingRoot.className).toContain('tiger-skeleton')
      expect(loadingRoot.getAttribute('aria-hidden')).toBe('true')
      fireEvent.click(loadingRoot)
      expect(onClick).toHaveBeenCalledTimes(1)

      rerender(
        <Skeleton {...host} loading={false}>
          <button type="button">ready</button>
        </Skeleton>
      )
      const loaded = getRoot(container)
      expect(loaded.id).toBe('persistent-host')
      expect(loaded.className).toContain('persistent-class')
      expect(loaded.style.padding).toBe('12px')
      expect(loaded).toHaveAttribute('aria-describedby', 'help')
      expect(loaded).toHaveAttribute('data-marker', 'keep')
      expect(loaded).toHaveAttribute('aria-busy', 'false')
      expect(loaded.hasAttribute('aria-hidden')).toBe(false)
      expect(loaded.hasAttribute('role')).toBe(false)
      fireEvent.click(loaded.querySelector('button')!)
      expect(onClick).toHaveBeenCalledTimes(2)
    })
  })
})
