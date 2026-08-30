/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { defineComponent, h } from 'vue'
import { Highlight } from '@expcat/tigercat-vue/Highlight'
import { expectNoA11yViolationsIsolated } from '../utils'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-highlight]') as HTMLElement
}

describe('Highlight', () => {
  describe('Rendering', () => {
    it('wraps matching slot text in mark and preserves the rest', () => {
      const { container } = render(Highlight, {
        props: { keywords: 'Vue' },
        slots: { default: 'Learn Vue today' }
      })
      const root = getRoot(container)
      expect(root.tagName).toBe('SPAN')
      expect(root).toHaveTextContent('Learn Vue today')
      const marks = [...root.querySelectorAll('mark[data-highlight-mark]')]
      expect(marks).toHaveLength(1)
      expect(marks[0]).toHaveTextContent('Vue')
      expect(root.getAttribute('role')).toBeNull()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('keeps nested links when highlighting the default slot', () => {
      const { container } = render(Highlight, {
        props: { keywords: 'Vue' },
        slots: {
          default: () => ['Learn ', h('a', { href: '/vue' }, 'Vue'), ' today']
        }
      })
      const link = getRoot(container).querySelector('a')
      expect(link).toHaveAttribute('href', '/vue')
      expect(link?.querySelector('mark')).toHaveTextContent('Vue')
    })

    it('flattens text from nested component default slots', () => {
      const Wrapper = defineComponent({
        name: 'NestedHighlightText',
        setup(_, { slots }) {
          return () => h('span', slots.default?.())
        }
      })
      const { container } = render(Highlight, {
        props: { keywords: 'Vue' },
        slots: { default: () => h(Wrapper, () => 'Learn Vue today') }
      })
      const root = getRoot(container)
      expect(root).toHaveTextContent('Learn Vue today')
      const marks = [...root.querySelectorAll('mark[data-highlight-mark]')]
      expect(marks).toHaveLength(1)
      expect(marks[0]).toHaveTextContent('Vue')
    })

    it('uses the text prop over the default slot', () => {
      const { container } = render(Highlight, {
        props: { text: 'alpha beta', keywords: 'alpha' },
        slots: { default: 'ignored' }
      })
      expect(getRoot(container)).toHaveTextContent('alpha beta')
      expect(getRoot(container).querySelector('mark')).toHaveTextContent('alpha')
    })

    it('highlights every keyword in an array', () => {
      const { container } = render(Highlight, {
        props: { text: 'Vue and React', keywords: ['Vue', 'React'] }
      })
      const labels = [...getRoot(container).querySelectorAll('mark')].map(
        (node) => node.textContent
      )
      expect(labels).toEqual(['Vue', 'React'])
    })

    it('accepts a regular expression', () => {
      const { container } = render(Highlight, {
        props: { text: 'Order #42 and #7', keywords: /#\d+/ }
      })
      const labels = [...getRoot(container).querySelectorAll('mark')].map(
        (node) => node.textContent
      )
      expect(labels).toEqual(['#42', '#7'])
    })
  })

  describe('matching options', () => {
    it('honors caseSensitive for string keywords', () => {
      const { container } = render(Highlight, {
        props: { text: 'Vue then vue', keywords: 'Vue', caseSensitive: true }
      })
      const marks = getRoot(container).querySelectorAll('mark')
      expect(marks).toHaveLength(1)
      expect(marks[0]).toHaveTextContent('Vue')
      expect(getRoot(container)).toHaveAttribute('data-highlight-case-sensitive', 'true')
    })

    it('highlights only the first match when global is false', () => {
      const { container } = render(Highlight, {
        props: { text: 'foo foo foo', keywords: 'foo', global: false }
      })
      expect(getRoot(container).querySelectorAll('mark')).toHaveLength(1)
      expect(getRoot(container)).toHaveAttribute('data-highlight-global', 'false')
    })

    it('highlights the first match of each keyword when global is false', () => {
      const { container } = render(Highlight, {
        props: { text: 'a b a b', keywords: ['a', 'b'], global: false }
      })
      const labels = [...getRoot(container).querySelectorAll('mark')].map(
        (node) => node.textContent
      )
      expect(labels).toEqual(['a', 'b'])
    })
  })

  describe('attrs integration', () => {
    it('merges attrs class, className, and style onto the root span', () => {
      const { container } = render(Highlight, {
        props: { className: 'from-prop', style: { color: 'red' }, keywords: 'a', text: 'a' },
        attrs: { class: 'from-attr', id: 'hit' }
      })
      const root = getRoot(container)
      expect(root.id).toBe('hit')
      expect(root.className).toContain('from-prop')
      expect(root.className).toContain('from-attr')
      expect(root.className).toContain('tiger-highlight')
      expect(root.style.color).toBe('red')
    })

    it('applies highlightClassName and highlightStyle on marks', () => {
      const { container } = render(Highlight, {
        props: {
          text: 'hit',
          keywords: 'hit',
          highlightClassName: 'mark-extra',
          highlightStyle: { fontWeight: '700' }
        }
      })
      const mark = getRoot(container).querySelector('mark') as HTMLElement
      expect(mark.className).toContain('mark-extra')
      expect(mark.style.fontWeight).toBe('700')
    })

    it('forwards native attributes', () => {
      const { container } = render(Highlight, {
        attrs: { title: 'Search hits', 'aria-label': 'Highlighted text' },
        props: { text: 'safe', keywords: 'safe' }
      })
      const root = getRoot(container)
      expect(root).toHaveAttribute('title', 'Search hits')
      expect(root).toHaveAttribute('aria-label', 'Highlighted text')
    })
  })

  describe('a11y', () => {
    it('exposes native mark semantics without interactive roles', async () => {
      const { container } = render(Highlight, {
        props: { text: 'Find Vue here', keywords: 'Vue' }
      })
      const root = getRoot(container)
      expect(root.tagName).toBe('SPAN')
      expect(root.querySelector('mark')?.tagName).toBe('MARK')
      expect(root.querySelector('[role]')).toBeNull()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      await expectNoA11yViolationsIsolated(container)
    })

    it('passes a11y checks for slot content and regex matches', async () => {
      const { container } = render({
        render: () =>
          h('div', [
            h(Highlight, { keywords: 'Esc' }, { default: () => 'Press Esc' }),
            h(Highlight, { text: 'id-12', keywords: /\d+/ })
          ])
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('boundary', () => {
    it('renders the source text without marks when nothing matches', () => {
      const { container } = render(Highlight, {
        props: { text: 'nothing here', keywords: 'zzz' }
      })
      const root = getRoot(container)
      expect(root).toHaveTextContent('nothing here')
      expect(root.querySelectorAll('mark')).toHaveLength(0)
    })

    it('renders special characters as text, not HTML', () => {
      const { container } = render(Highlight, {
        props: { text: '<script>alert("xss")</script>', keywords: 'script' }
      })
      const root = getRoot(container)
      expect(root).toHaveTextContent('<script>alert("xss")</script>')
      expect(root.querySelectorAll('script')).toHaveLength(0)
      expect(root.querySelectorAll('mark')).toHaveLength(2)
    })

    it('renders an empty span when text and slot are both empty', () => {
      const { container } = render(Highlight, { props: { keywords: 'a' } })
      const root = getRoot(container)
      expect(root.tagName).toBe('SPAN')
      expect(root.textContent).toBe('')
      expect(root.querySelectorAll('mark')).toHaveLength(0)
    })
  })
})
