/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Highlight } from '@expcat/tigercat-react/Highlight'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-highlight]') as HTMLElement
}

describe('Highlight', () => {
  describe('Rendering', () => {
    it('wraps matching children in mark and preserves the rest', () => {
      const { container } = render(<Highlight keywords="Vue">Learn Vue today</Highlight>)
      const root = getRoot(container)
      expect(root.tagName).toBe('SPAN')
      expect(root).toHaveTextContent('Learn Vue today')
      const marks = [...root.querySelectorAll('mark[data-highlight-mark]')]
      expect(marks).toHaveLength(1)
      expect(marks[0]).toHaveTextContent('Vue')
      expect(root.getAttribute('role')).toBeNull()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('uses the text prop over children', () => {
      const { container } = render(
        <Highlight text="alpha beta" keywords="alpha">
          ignored
        </Highlight>
      )
      expect(getRoot(container)).toHaveTextContent('alpha beta')
      expect(getRoot(container).querySelector('mark')).toHaveTextContent('alpha')
    })

    it('highlights every keyword in an array', () => {
      const { container } = render(<Highlight text="Vue and React" keywords={['Vue', 'React']} />)
      const labels = [...getRoot(container).querySelectorAll('mark')].map(
        (node) => node.textContent
      )
      expect(labels).toEqual(['Vue', 'React'])
    })

    it('accepts a regular expression', () => {
      const { container } = render(<Highlight text="Order #42 and #7" keywords={/#\d+/} />)
      const labels = [...getRoot(container).querySelectorAll('mark')].map(
        (node) => node.textContent
      )
      expect(labels).toEqual(['#42', '#7'])
    })

    it('forwards the ref to the root span', () => {
      const rootRef = React.createRef<HTMLSpanElement>()
      const { container } = render(
        <Highlight ref={rootRef} id="hit" keywords="a">
          a
        </Highlight>
      )
      expect(rootRef.current).toBe(getRoot(container))
      expect(getRoot(container).id).toBe('hit')
    })
  })

  describe('matching options', () => {
    it('honors caseSensitive for string keywords', () => {
      const { container } = render(<Highlight text="Vue then vue" keywords="Vue" caseSensitive />)
      const marks = getRoot(container).querySelectorAll('mark')
      expect(marks).toHaveLength(1)
      expect(marks[0]).toHaveTextContent('Vue')
      expect(getRoot(container)).toHaveAttribute('data-highlight-case-sensitive', 'true')
    })

    it('highlights only the first match when global is false', () => {
      const { container } = render(<Highlight text="foo foo foo" keywords="foo" global={false} />)
      expect(getRoot(container).querySelectorAll('mark')).toHaveLength(1)
      expect(getRoot(container)).toHaveAttribute('data-highlight-global', 'false')
    })
  })

  describe('style integration', () => {
    it('merges className and style onto the root span', () => {
      const { container } = render(
        <Highlight className="from-prop" style={{ color: 'red' }} keywords="a">
          a
        </Highlight>
      )
      const root = getRoot(container)
      expect(root.className).toContain('from-prop')
      expect(root.className).toContain('tiger-highlight')
      expect(root.style.color).toBe('red')
    })

    it('applies highlightClassName and highlightStyle on marks', () => {
      const { container } = render(
        <Highlight
          text="hit"
          keywords="hit"
          highlightClassName="mark-extra"
          highlightStyle={{ fontWeight: 700 }}
        />
      )
      const mark = getRoot(container).querySelector('mark') as HTMLElement
      expect(mark.className).toContain('mark-extra')
      expect(mark.style.fontWeight).toBe('700')
    })

    it('forwards native attributes', () => {
      const { container } = render(
        <Highlight title="Search hits" aria-label="Highlighted text" keywords="safe">
          safe
        </Highlight>
      )
      const root = getRoot(container)
      expect(root).toHaveAttribute('title', 'Search hits')
      expect(root).toHaveAttribute('aria-label', 'Highlighted text')
    })
  })

  describe('a11y', () => {
    it('exposes native mark semantics without interactive roles', async () => {
      const { container } = render(<Highlight text="Find Vue here" keywords="Vue" />)
      const root = getRoot(container)
      expect(root.tagName).toBe('SPAN')
      expect(root.querySelector('mark')?.tagName).toBe('MARK')
      expect(root.querySelector('[role]')).toBeNull()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      await expectNoA11yViolationsIsolated(container)
    })

    it('passes a11y checks for children and regex matches', async () => {
      const { container } = render(
        <>
          <Highlight keywords="Esc">Press Esc</Highlight>
          <Highlight text="id-12" keywords={/\d+/} />
        </>
      )
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('boundary', () => {
    it('renders the source text without marks when nothing matches', () => {
      const { container } = render(<Highlight text="nothing here" keywords="zzz" />)
      const root = getRoot(container)
      expect(root).toHaveTextContent('nothing here')
      expect(root.querySelectorAll('mark')).toHaveLength(0)
    })

    it('renders special characters as text, not HTML', () => {
      const { container } = render(
        <Highlight text={'<script>alert("xss")</script>'} keywords="script" />
      )
      const root = getRoot(container)
      expect(root).toHaveTextContent('<script>alert("xss")</script>')
      expect(root.querySelectorAll('script')).toHaveLength(0)
      expect(root.querySelectorAll('mark')).toHaveLength(2)
    })

    it('renders an empty span when text and children are both empty', () => {
      const { container } = render(<Highlight keywords="a" />)
      const root = getRoot(container)
      expect(root.tagName).toBe('SPAN')
      expect(root.textContent).toBe('')
      expect(root.querySelectorAll('mark')).toHaveLength(0)
    })
  })
})
