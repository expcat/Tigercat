/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/vue'
import { h } from 'vue'
import { AspectRatio } from '@expcat/tigercat-vue/AspectRatio'
import { expectNoA11yViolationsIsolated } from '../utils'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-aspect-ratio]') as HTMLElement
}

function getContent(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-aspect-ratio-content]') as HTMLElement
}

describe('AspectRatio', () => {
  describe('Rendering', () => {
    it('renders slot content inside the filling content wrapper', () => {
      const { container, getByText } = render(AspectRatio, {
        slots: { default: () => h('p', 'cover content') }
      })
      expect(getContent(container).contains(getByText('cover content'))).toBe(true)
    })

    it('always renders the content wrapper, even without a slot', () => {
      const { container } = render(AspectRatio)
      expect(getContent(container)).not.toBeNull()
    })

    it('exposes root and content positioning classes', () => {
      const { container } = render(AspectRatio)
      expect(getRoot(container).className).toContain('relative')
      expect(getRoot(container).className).toContain('w-full')
      expect(getContent(container).className).toContain('absolute')
      expect(getContent(container).className).toContain('inset-0')
    })

    it('applies className to the root and contentClassName to the wrapper', () => {
      const { container } = render(AspectRatio, {
        props: { className: 'rounded-lg', contentClassName: 'p-2' }
      })
      expect(getRoot(container).className).toContain('rounded-lg')
      expect(getRoot(container).className).not.toContain('p-2')
      expect(getContent(container).className).toContain('p-2')
      expect(getContent(container).className).not.toContain('rounded-lg')
    })
  })

  describe('ratio', () => {
    it('applies the default 16 / 9 ratio', () => {
      const { container } = render(AspectRatio)
      expect(getRoot(container).style.aspectRatio).toBe('16 / 9')
    })

    it('accepts fraction strings', () => {
      const { container } = render(AspectRatio, { props: { ratio: '4/3' } })
      expect(getRoot(container).style.aspectRatio).toBe('4 / 3')
    })

    it('accepts numeric ratios', () => {
      const { container } = render(AspectRatio, { props: { ratio: 1.5 } })
      // The CSSOM serializes a bare aspect-ratio number as '<value> / 1'
      expect(getRoot(container).style.aspectRatio).toBe('1.5 / 1')
    })

    it('falls back to the default ratio on invalid input', () => {
      const { container } = render(AspectRatio, { props: { ratio: 'broken' } })
      expect(getRoot(container).style.aspectRatio).toBe('16 / 9')
    })

    it('renders the ratio style without touching browser APIs', () => {
      // The style derives from a pure core util, so setup never needs window.
      const { container } = render(AspectRatio, { props: { ratio: '21/9' } })
      expect(getRoot(container).style.aspectRatio).toBe('21 / 9')
    })
  })

  describe('attrs integration', () => {
    it('merges attrs class and style onto the root', () => {
      const { container } = render(AspectRatio, {
        attrs: { class: 'custom-root', style: { border: '1px solid red' } }
      })
      const root = getRoot(container)
      expect(root.className).toContain('custom-root')
      expect(root.className).toContain('tiger-aspect-ratio')
      expect(root.style.border).toBe('1px solid red')
    })

    it('lets an explicit attrs aspect-ratio override the prop style', () => {
      const { container } = render(AspectRatio, {
        attrs: { style: { aspectRatio: '1 / 1' } }
      })
      expect(getRoot(container).style.aspectRatio).toBe('1 / 1')
    })

    it('keeps data-aspect-ratio when attrs also pass that attribute', () => {
      const { container } = render(AspectRatio, {
        attrs: { 'data-aspect-ratio': 'caller' }
      })
      expect(getRoot(container).getAttribute('data-aspect-ratio')).toBe('')
    })

    it('forwards non-class attrs to the root element', () => {
      const { container } = render(AspectRatio, {
        attrs: { id: 'hero-frame', 'aria-label': '主视觉' }
      })
      expect(getRoot(container).id).toBe('hero-frame')
      expect(getRoot(container).getAttribute('aria-label')).toBe('主视觉')
    })
  })

  describe('clipping', () => {
    it('clips the ratio box and fills a replaced image', () => {
      const { container } = render(AspectRatio, {
        props: { className: 'rounded-lg' },
        slots: {
          default: () =>
            h('img', { src: 'https://example.com/cover.jpg', alt: '', width: 800, height: 600 })
        }
      })
      const root = getRoot(container)
      const img = getContent(container).querySelector('img') as HTMLImageElement
      expect(getComputedStyle(root).overflow).toBe('hidden')
      expect(getComputedStyle(img).objectFit).toBe('cover')
      expect(getComputedStyle(img).width).toBe('100%')
      expect(getComputedStyle(img).height).toBe('100%')
    })
  })

  describe('a11y', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(AspectRatio, {
        slots: { default: () => h('p', '可访问的封面文案') }
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
