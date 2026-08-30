/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Kbd } from '@expcat/tigercat-react/Kbd'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-kbd]') as HTMLElement
}

describe('Kbd', () => {
  describe('Rendering', () => {
    it('renders a native kbd element with children', () => {
      const { container } = render(<Kbd>Esc</Kbd>)
      const root = getRoot(container)
      expect(root.tagName).toBe('KBD')
      expect(root).toHaveTextContent('Esc')
      expect(root.getAttribute('role')).toBeNull()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('renders a single key from the keys string prop', () => {
      const { container } = render(<Kbd keys="Enter" />)
      expect(getRoot(container)).toHaveTextContent('Enter')
      expect(getRoot(container).querySelector('[data-kbd-key]')).toHaveTextContent('Enter')
    })

    it('renders a readable combo from the keys array', () => {
      const { container } = render(<Kbd keys={['Ctrl', 'K']} />)
      const root = getRoot(container)
      expect(root).toHaveTextContent('Ctrl + K')
      expect(root).toHaveAttribute('aria-label', 'Ctrl + K')
      const keyLabels = [...root.querySelectorAll('[data-kbd-key]')].map((node) => node.textContent)
      expect(keyLabels).toEqual(['Ctrl', 'K'])
      expect(root.querySelectorAll('kbd[data-kbd-key]')).toHaveLength(2)
      const visibleKbd = container.querySelectorAll('kbd:not([aria-hidden="true"])')
      expect(visibleKbd).toHaveLength(1)
      expect(visibleKbd[0]).toBe(root)
    })

    it('appends children after keys', () => {
      const { container } = render(<Kbd keys={['Ctrl']}>K</Kbd>)
      expect(getRoot(container)).toHaveTextContent('Ctrl + K')
    })

    it('forwards the ref to the root kbd', () => {
      const rootRef = React.createRef<HTMLElement>()
      const { container } = render(
        <Kbd ref={rootRef} id="shortcut">
          K
        </Kbd>
      )
      expect(rootRef.current).toBe(getRoot(container))
      expect(getRoot(container).id).toBe('shortcut')
    })
  })

  describe('separator', () => {
    it('uses a custom separator between combo keys', () => {
      const { container } = render(<Kbd keys={['Alt', 'Tab']} separator="then" />)
      expect(getRoot(container)).toHaveTextContent('Alt then Tab')
    })
  })

  describe('size and variant', () => {
    it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
      const { container } = render(<Kbd size={size}>{size}</Kbd>)
      expect(getRoot(container)).toHaveAttribute('data-kbd-size', size)
    })

    it('renders the subtle variant without becoming interactive', () => {
      const { container } = render(<Kbd variant="subtle" keys={['Ctrl', 'S']} />)
      const root = getRoot(container)
      expect(root).toHaveAttribute('data-kbd-variant', 'subtle')
      expect(root.getAttribute('role')).toBeNull()
      expect(root.tabIndex).toBe(-1)
    })
  })

  describe('style integration', () => {
    it('merges className and style onto the root kbd', () => {
      const { container } = render(
        <Kbd className="from-prop" style={{ color: 'red' }}>
          K
        </Kbd>
      )
      const root = getRoot(container)
      expect(root.className).toContain('from-prop')
      expect(root.className).toContain('tiger-kbd')
      expect(root.style.color).toBe('red')
    })

    it('forwards native attributes', () => {
      const { container } = render(
        <Kbd title="Escape" aria-label="Escape key">
          Esc
        </Kbd>
      )
      const root = getRoot(container)
      expect(root).toHaveAttribute('title', 'Escape')
      expect(root).toHaveAttribute('aria-label', 'Escape key')
    })
  })

  describe('a11y', () => {
    it('exposes native kbd semantics without interactive roles', async () => {
      const { container } = render(<Kbd keys={['Ctrl', 'K']} />)
      const root = getRoot(container)
      expect(root.tagName).toBe('KBD')
      expect(root.querySelector('[role]')).toBeNull()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      await expectNoA11yViolationsIsolated(container)
    })

    it('passes a11y checks for children and the subtle variant', async () => {
      const { container } = render(
        <>
          <Kbd>Esc</Kbd>
          <Kbd variant="subtle" keys={['Shift', 'Enter']} />
        </>
      )
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('boundary', () => {
    it('renders an empty kbd when keys and children are both empty', () => {
      const { container } = render(<Kbd keys={[]} />)
      const root = getRoot(container)
      expect(root.tagName).toBe('KBD')
      expect(root.textContent).toBe('')
      expect(root).toHaveAttribute('aria-hidden', 'true')
    })

    it('renders special characters as text, not HTML', () => {
      const { container } = render(<Kbd keys={['<Ctrl>', '&']} />)
      const root = getRoot(container)
      expect(root).toHaveTextContent('<Ctrl> + &')
      expect(root.innerHTML).not.toContain('<ctrl>')
    })

    it('ignores blank keys in a combo', () => {
      const { container } = render(<Kbd keys={['', '  ', 'S']} />)
      expect(getRoot(container)).toHaveTextContent('S')
      expect(getRoot(container).querySelectorAll('[data-kbd-key]')).toHaveLength(1)
    })
  })
})
