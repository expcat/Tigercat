/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/vue'
import { Skeleton } from '@expcat/tigercat-vue/Skeleton'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

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
      const { container } = render(Skeleton, {
        props: { style: { height: '32px' } }
      })
      expect(getRoot(container).style.height).toBe('32px')
    })

    it('does not give custom a default size', () => {
      const { container } = renderWithProps(Skeleton, { variant: 'custom' })
      expect(getRoot(container).style.height).toBe('')
      expect(getRoot(container).style.width).toBe('')
    })
  })

  describe('Animation', () => {
    it('sweeps a highlight for wave and stays still for none', () => {
      const wave = render(Skeleton, { props: { animation: 'wave' } })
      expect(getRoot(wave.container).className).toContain('tiger-skeleton-wave')
      wave.unmount()

      const pulse = render(Skeleton, { props: { animation: 'pulse' } })
      expect(getRoot(pulse.container).className).toContain('tiger-skeleton-pulse')
      pulse.unmount()

      const none = render(Skeleton, { props: { animation: 'none' } })
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

    it('keeps className on the root when rows change', async () => {
      const { container, rerender } = render(Skeleton, {
        props: { className: 'custom-host' }
      })
      expect(getRoot(container).className).toContain('custom-host')
      await rerender({ className: 'custom-host', rows: 3 })
      expect(getRoot(container).className).toContain('custom-host')
      getBars(container).forEach((bar) => {
        expect(bar.className).not.toContain('custom-host')
      })
    })
  })

  describe('Paragraph Mode', () => {
    it('varies row widths inside the caller width', () => {
      const { container } = renderWithProps(Skeleton, {
        variant: 'text',
        rows: 3,
        paragraph: true,
        width: '240px'
      })
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
      const { container } = render(Skeleton, {
        attrs: { 'aria-label': 'Loading profile' }
      })
      const root = getRoot(container)
      expect(root.getAttribute('aria-hidden')).toBeNull()
      expect(root).toHaveAttribute('role', 'status')
      expect(root).toHaveAttribute('aria-busy', 'true')
      expect(root).toHaveAttribute('aria-label', 'Loading profile')
      await expectNoA11yViolationsIsolated(container)
    })

    it('treats aria-hidden="false" as visible', () => {
      const { container } = render(Skeleton, {
        attrs: { 'aria-hidden': 'false' }
      })
      expect(getRoot(container).getAttribute('aria-hidden')).toBe('false')
    })
  })

  describe('preset', () => {
    it('maps preset=avatar onto the avatar shape and does not pass preset through', () => {
      const avatar = render(Skeleton, { props: { preset: 'avatar' } })
      const avatarRoot = getRoot(avatar.container)
      expect(avatarRoot.className).toContain('rounded-full')
      expect(avatarRoot.className).toContain('w-10')
      expect(avatarRoot.className).toContain('h-10')
      expect(avatarRoot.hasAttribute('preset')).toBe(false)
      avatar.unmount()

      const explicit = render(Skeleton, {
        props: { variant: 'text', preset: 'avatar' }
      })
      const textRoot = getRoot(explicit.container)
      expect(textRoot.className).toContain('w-full')
      expect(textRoot.className).toContain('h-4')
      expect(textRoot.className).not.toContain('rounded-full')
      expect(textRoot.className).not.toContain('w-10')
    })
  })

  describe('row normalization', () => {
    it('caps rows, floors paragraph rows, and keeps the last line at 60%', () => {
      const capped = render(Skeleton, { props: { rows: 8 } })
      expect(getBars(capped.container)).toHaveLength(6)
      capped.unmount()

      const fraction = render(Skeleton, { props: { rows: 2.5, paragraph: true } })
      const bars = getBars(fraction.container)
      expect(bars).toHaveLength(2)
      expect(bars[1].style.width).toBe('60%')
      fraction.unmount()

      const infinite = render(Skeleton, { props: { rows: Infinity } })
      expect(getBars(infinite.container)).toHaveLength(1)
    })
  })

  describe('loaded host', () => {
    it('keeps caller root props and clicks after loading becomes false', async () => {
      const onClick = vi.fn()
      const { container, rerender } = render(Skeleton, {
        props: {
          loading: true,
          className: 'persistent-class',
          style: { padding: '12px' }
        },
        attrs: {
          id: 'persistent-host',
          'aria-describedby': 'help',
          'data-marker': 'keep',
          onClick
        },
        slots: { default: '<button type="button">ready</button>' }
      })
      const loadingRoot = getRoot(container)
      expect(loadingRoot.className).toContain('tiger-skeleton')
      expect(loadingRoot.getAttribute('aria-hidden')).toBe('true')
      await fireEvent.click(loadingRoot)
      expect(onClick).toHaveBeenCalledTimes(1)

      await rerender({
        loading: false,
        className: 'persistent-class',
        style: { padding: '12px' }
      })
      const loaded = getRoot(container)
      expect(loaded.id).toBe('persistent-host')
      expect(loaded.className).toContain('persistent-class')
      expect(loaded.style.padding).toBe('12px')
      expect(loaded).toHaveAttribute('aria-describedby', 'help')
      expect(loaded).toHaveAttribute('data-marker', 'keep')
      expect(loaded).toHaveAttribute('aria-busy', 'false')
      expect(loaded.hasAttribute('aria-hidden')).toBe(false)
      expect(loaded.hasAttribute('role')).toBe(false)
      await fireEvent.click(loaded.querySelector('button')!)
      expect(onClick).toHaveBeenCalledTimes(2)
    })
  })
})
