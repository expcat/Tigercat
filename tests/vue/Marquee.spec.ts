/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { Marquee } from '@expcat/tigercat-vue/Marquee'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import {
  MARQUEE_COPY_INDEX_VAR,
  MARQUEE_DURATION_VAR,
  MARQUEE_INLINE_SIGN_VAR,
  MARQUEE_STYLE_ID
} from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-marquee]') as HTMLElement
}

function getTrack(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-marquee-track]') as HTMLElement
}

describe('Marquee', () => {
  describe('Rendering', () => {
    it('duplicates the slot for a seamless loop without becoming a landmark', () => {
      const { container } = render(Marquee, {
        slots: { default: () => h('span', 'Vue React') }
      })
      const root = getRoot(container)
      expect(root.tagName).toBe('DIV')
      expect(root).not.toHaveAttribute('role')
      expect(root).not.toHaveAttribute('aria-label')
      expect(root).toHaveAttribute('data-marquee-direction', 'left')
      expect(root).toHaveAttribute('data-marquee-paused', 'false')
      expect(root.querySelectorAll('[data-marquee-content]')).toHaveLength(2)
      expect(root.querySelectorAll('[data-marquee-clone]')).toHaveLength(1)
      const clone = root.querySelector('[data-marquee-clone]')
      expect(clone).toHaveAttribute('aria-hidden', 'true')
      expect(clone).toHaveAttribute('inert')
      expect(clone).toHaveTextContent('Vue React')
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

    it('treats repeat 0 as a single static copy', () => {
      const { container } = render(Marquee, {
        props: { repeat: 0 },
        slots: { default: 'Once' }
      })
      const root = getRoot(container)
      expect(root.querySelectorAll('[data-marquee-content]')).toHaveLength(1)
      expect(root.querySelector('[data-marquee-clone]')).toBeNull()
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

    it('takes vertical clones out of flow so the viewport is the first copy', () => {
      const { container } = render(Marquee, {
        props: { direction: 'up' },
        slots: { default: () => h('div', { style: { height: '48px' } }, 'A') }
      })
      const root = getRoot(container)
      const first = root.querySelector(
        '[data-marquee-content]:not([data-marquee-clone])'
      ) as HTMLElement
      const clone = root.querySelector('[data-marquee-clone]') as HTMLElement
      expect(getComputedStyle(clone).position).toBe('absolute')
      expect(getComputedStyle(first).position).not.toBe('absolute')
      expect(clone.style.getPropertyValue(MARQUEE_COPY_INDEX_VAR)).toBe('1')
      const rootHeight = root.getBoundingClientRect().height
      const firstHeight = first.getBoundingClientRect().height
      if (firstHeight > 0 && rootHeight > 0) {
        expect(rootHeight).toBeCloseTo(firstHeight, 0)
        expect(rootHeight).toBeLessThan(firstHeight * 2)
      }
    })

    it('flips the inline motion sign under dir=rtl', () => {
      const { container } = render({
        setup() {
          return () => h('div', { dir: 'rtl' }, [h(Marquee, null, () => 'News')])
        }
      })
      const root = getRoot(container)
      const sign = getComputedStyle(root).getPropertyValue(MARQUEE_INLINE_SIGN_VAR).trim()
      if (sign) expect(sign).toBe('-1')
      const track = getTrack(container)
      expect(getComputedStyle(track).flexDirection).toBe('row')
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

    it('still pauses on focus when pauseOnHover is false', async () => {
      const { container } = render(Marquee, {
        props: { pauseOnHover: false },
        slots: { default: () => h('button', { type: 'button' }, 'Item') }
      })
      const root = getRoot(container)
      await fireEvent.focusIn(screen.getByRole('button', { name: 'Item' }))
      expect(root).toHaveAttribute('data-marquee-paused', 'true')
    })

    it('honors a controlled paused flag', async () => {
      const { container, rerender } = render(Marquee, {
        props: { paused: true },
        slots: { default: 'Live' }
      })
      const root = getRoot(container)
      expect(root).toHaveAttribute('data-marquee-paused', 'true')
      await fireEvent.mouseLeave(root)
      expect(root).toHaveAttribute('data-marquee-paused', 'true')
      await rerender({ paused: false })
      const next = getRoot(container)
      await fireEvent.mouseEnter(next)
      expect(next).toHaveAttribute('data-marquee-paused', 'false')
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

    it('becomes a named region only with an explicit accessible name', () => {
      const { container } = render(Marquee, {
        attrs: { 'aria-label': 'Latest headlines' },
        slots: { default: 'News' }
      })
      const root = getRoot(container)
      expect(root).toHaveAttribute('role', 'region')
      expect(root).toHaveAttribute('aria-label', 'Latest headlines')
    })

    it('does not write a default name over aria-labelledby', () => {
      const { container } = render({
        setup() {
          return () =>
            h('div', [
              h('span', { id: 'ticker-title' }, 'Headlines'),
              h(Marquee, { 'aria-labelledby': 'ticker-title' }, () => 'News')
            ])
        }
      })
      const root = getRoot(container)
      expect(root).toHaveAttribute('role', 'region')
      expect(root).toHaveAttribute('aria-labelledby', 'ticker-title')
      expect(root).not.toHaveAttribute('aria-label')
    })
  })

  describe('a11y', () => {
    it('keeps cloned interactive nodes out of the tab order', async () => {
      const { container } = render(Marquee, {
        slots: { default: () => h('button', { type: 'button' }, 'Item') }
      })
      const root = getRoot(container)
      expect(root.querySelectorAll('button')).toHaveLength(2)
      expect(screen.getAllByRole('button')).toHaveLength(1)
      expect(root.querySelector('[data-marquee-clone]')).toHaveAttribute('inert')
      expect(screen.queryByRole('region')).not.toBeInTheDocument()
      expect(screen.queryByRole('marquee')).not.toBeInTheDocument()
      await expectNoA11yViolationsIsolated(container)
    })

    it('does not invent an English landmark under ConfigProvider zh-CN', () => {
      const { container } = render({
        setup() {
          return () => h(ConfigProvider, { locale: zhCN }, () => h(Marquee, null, () => 'News'))
        }
      })
      expect(screen.queryByRole('region')).not.toBeInTheDocument()
      expect(getRoot(container)).not.toHaveAttribute('aria-label')
    })

    it('injects reduced-motion CSS that freezes the track and hides clones', () => {
      render(Marquee, { slots: { default: 'News' } })
      const style = document.getElementById(MARQUEE_STYLE_ID)
      expect(style?.textContent).toContain('prefers-reduced-motion: reduce')
      expect(style?.textContent).toContain('animation: none !important')
      expect(style?.textContent).toContain('.tiger-marquee-clone')
    })

    it('re-injects keyframes after the style node is removed', () => {
      const first = render(Marquee, { slots: { default: 'News' } })
      document.getElementById(MARQUEE_STYLE_ID)?.remove()
      first.unmount()
      render(Marquee, { slots: { default: 'Again' } })
      expect(document.getElementById(MARQUEE_STYLE_ID)?.textContent).toContain('tiger-marquee-x')
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
