/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { Kbd } from '@expcat/tigercat-react/Kbd'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-kbd]') as HTMLElement
}

function mountSSR(html: string): HTMLElement {
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.appendChild(host)
  return host
}

// The shared isolated helper disables aria-prohibited-attr for other components.
// Kbd opts back in so a native kbd cannot keep a prohibited aria-label.
const kbdAxeOptions = {
  rules: { 'aria-prohibited-attr': { enabled: true } }
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
      expect(root.getAttribute('aria-label')).toBeNull()
      const keyLabels = [...root.querySelectorAll('[data-kbd-key]')].map((node) => node.textContent)
      expect(keyLabels).toEqual(['Ctrl', 'K'])
      expect(root.querySelectorAll('kbd[data-kbd-key]')).toHaveLength(2)
      expect(root.querySelector('[aria-hidden="true"]')).toBeNull()
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
      await expectNoA11yViolationsIsolated(container, kbdAxeOptions)
    })

    it('names a keys combo from visible SSR text without a prohibited aria-label', async () => {
      const combo = mountSSR(renderToStaticMarkup(<Kbd keys={['Ctrl', 'K']} />))
      const trailing = mountSSR(renderToStaticMarkup(<Kbd keys={['Ctrl']}>S</Kbd>))
      try {
        const comboRoot = getRoot(combo)
        expect(comboRoot.getAttribute('role')).toBeNull()
        expect(comboRoot.getAttribute('aria-label')).toBeNull()
        expect(comboRoot.textContent).toContain('Ctrl')
        expect(comboRoot.textContent).toContain('K')
        await expectNoA11yViolationsIsolated(combo, kbdAxeOptions)

        const trailingRoot = getRoot(trailing)
        expect(trailingRoot.getAttribute('aria-label')).toBeNull()
        expect(trailingRoot.querySelector('[aria-hidden="true"]')).toBeNull()
        expect(trailingRoot.textContent).toContain('Ctrl')
        expect(trailingRoot.textContent).toContain('S')
        await expectNoA11yViolationsIsolated(trailing, kbdAxeOptions)
      } finally {
        combo.remove()
        trailing.remove()
      }
    })

    it('passes a11y checks for children and the subtle variant', async () => {
      const { container } = render(
        <>
          <Kbd>Esc</Kbd>
          <Kbd variant="subtle" keys={['Shift', 'Enter']} />
        </>
      )
      await expectNoA11yViolationsIsolated(container, kbdAxeOptions)
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

    it('does not append a separator for empty children', () => {
      const hosts = [
        mountSSR(renderToStaticMarkup(<Kbd keys={['Ctrl']}>{[]}</Kbd>)),
        mountSSR(
          renderToStaticMarkup(
            <Kbd keys={['Ctrl']}>
              <></>
            </Kbd>
          )
        )
      ]
      try {
        for (const host of hosts) {
          expect(getRoot(host).textContent).toBe('Ctrl')
        }
      } finally {
        for (const host of hosts) host.remove()
      }
    })
  })
})
