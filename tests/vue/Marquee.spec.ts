/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { Marquee } from '@expcat/tigercat-vue/Marquee'
import { MARQUEE_DURATION_VAR, MARQUEE_STYLE_ID } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-marquee]') as HTMLElement
}

function getTrack(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-marquee-track]') as HTMLElement
}

describe('Marquee', () => {
  describe('Rendering', () => {
    it('renders a labeled region and duplicates the slot for a seamless loop', () => {
      const { container } = render(Marquee, {
        slots: { default: () => h('span', 'Vue React') }
      })
      const root = getRoot(container)
      expect(root.tagName).toBe('DIV')
      expect(root).toHaveAttribute('role', 'region')
      expect(root).toHaveAttribute('aria-label', 'Scrolling content')
      expect(root).toHaveAttribute('data-marquee-direction', 'left')
      expect(root).toHaveAttribute('data-marquee-paused', 'false')
      expect(root.querySelectorAll('[data-marquee-content]')).toHaveLength(2)
      expect(root.querySelectorAll('[data-marquee-clone]')).toHaveLength(1)
      expect(root.querySelector('[data-marquee-clone]')).toHaveAttribute('aria-hidden', 'true')
      expect(root.querySelector('[data-marquee-clone]')).toHaveTextContent('Vue React')
    })

    it('renders a single static copy when repeat is 1', () => {
      const { container } = render(Marquee, {
        props: { repeat: 1 },
        slots: { default: 'Once' }
      })
      const root = getRoot(container)
      expect(root.querySelectorAll('[data-marquee-content]')).toHaveLength(1)
      expect(root.querySelector('[data-marquee-clone]')).toBeNull()
      expect(root.className).toContain('tiger-marquee-static')
    })
  })

  describe('direction duration gap', () => {
    it.each(['left', 'right', 'up', 'down'] as const)('renders direction="%s"', (direction) => {
      const { container } = render(Marquee, {
        props: { direction },
        slots: { default: direction }
      })
      expect(getRoot(container)).toHaveAttribute('data-marquee-direction', direction)
    })

    it('writes duration and gap onto the track as CSS variables', () => {
      const { container } = render(Marquee, {
        props: { duration: 8000, gap: 24 },
        slots: { default: 'News' }
      })
      const track = getTrack(container)
      expect(track.style.getPropertyValue(MARQUEE_DURATION_VAR)).toBe('8000ms')
      expect(track.style.getPropertyValue('--tiger-marquee-gap')).toBe('24px')
    })
  })

  describe('pause on hover and focus', () => {
    it('pauses while hovered and resumes on leave', async () => {
      const { container } = render(Marquee, {
        slots: { default: () => h('span', 'Ticker') }
      })
      const root = getRoot(container)
      await fireEvent.mouseEnter(root)
      expect(root).toHaveAttribute('data-marquee-paused', 'true')
      await fireEvent.mouseLeave(root)
      expect(root).toHaveAttribute('data-marquee-paused', 'false')
    })

    it('pauses while focus is inside and resumes when it leaves', async () => {
      const { container } = render(Marquee, {
        slots: { default: () => h('button', { type: 'button' }, 'Item') }
      })
      const root = getRoot(container)
      const button = screen.getByRole('button', { name: 'Item' })
      await fireEvent.focusIn(button)
      expect(root).toHaveAttribute('data-marquee-paused', 'true')
      await fireEvent.focusOut(root)
      expect(root).toHaveAttribute('data-marquee-paused', 'false')
    })

    it('does not pause on hover when pauseOnHover is false', async () => {
      const { container } = render(Marquee, {
        props: { pauseOnHover: false },
        slots: { default: 'Live' }
      })
      const root = getRoot(container)
      expect(root).toHaveAttribute('data-marquee-pause-on-hover', 'false')
      await fireEvent.mouseEnter(root)
      expect(root).toHaveAttribute('data-marquee-paused', 'false')
    })
  })

  describe('attrs integration', () => {
    it('merges attrs class, className, and style onto the root', () => {
      const { container } = render(Marquee, {
        props: { className: 'from-prop', style: { color: 'red' } },
        attrs: { class: 'from-attr', id: 'ticker' },
        slots: { default: 'K' }
      })
      const root = getRoot(container)
      expect(root.id).toBe('ticker')
      expect(root.className).toContain('from-prop')
      expect(root.className).toContain('from-attr')
      expect(root.className).toContain('tiger-marquee')
      expect(root.style.color).toBe('red')
    })

    it('lets a native aria-label override the default', () => {
      const { container } = render(Marquee, {
        attrs: { 'aria-label': 'Latest headlines' },
        slots: { default: 'News' }
      })
      expect(getRoot(container)).toHaveAttribute('aria-label', 'Latest headlines')
    })
  })

  describe('a11y', () => {
    it('exposes a region without interactive roles and hides cloned copies', async () => {
      const { container } = render(Marquee, {
        slots: { default: () => h('span', 'Vue React') }
      })
      const root = getRoot(container)
      expect(root).toHaveAttribute('role', 'region')
      expect(screen.getByRole('region', { name: 'Scrolling content' })).toBe(root)
      expect(root.querySelector('[data-marquee-clone]')).toHaveAttribute('aria-hidden', 'true')
      expect(screen.queryByRole('marquee')).not.toBeInTheDocument()
      await expectNoA11yViolationsIsolated(container)
    })

    it('injects reduced-motion CSS that freezes the track and hides clones', () => {
      render(Marquee, { slots: { default: 'News' } })
      const style = document.getElementById(MARQUEE_STYLE_ID)
      expect(style?.textContent).toContain('prefers-reduced-motion: reduce')
      expect(style?.textContent).toContain('animation: none !important')
      expect(style?.textContent).toContain('.tiger-marquee-clone')
    })
  })

  describe('boundary', () => {
    it('renders an empty looping track when the slot is empty', () => {
      const { container } = render(Marquee)
      const root = getRoot(container)
      expect(root.querySelectorAll('[data-marquee-content]')).toHaveLength(2)
      expect(root.textContent).toBe('')
    })

    it('renders special characters as text, not HTML', () => {
      const { container } = render(Marquee, {
        slots: { default: () => '<script>alert("xss")</script>' }
      })
      const root = getRoot(container)
      expect(root).toHaveTextContent('<script>alert("xss")</script>')
      expect(root.querySelectorAll('script')).toHaveLength(0)
    })
  })
})
