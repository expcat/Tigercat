/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Text } from '@expcat/tigercat-vue/Text'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

describe('Text (Vue)', () => {
  it('renders default tag (p)', () => {
    render(Text, { slots: { default: 'Default text' } })
    expect(screen.getByText('Default text').tagName).toBe('P')
  })

  it('renders custom tag', () => {
    const { container } = renderWithProps(Text, { tag: 'span' }, { slots: { default: 'Inline' } })

    expect(container.querySelector('span')).toBeInTheDocument()
  })

  it('merges attrs.class with computed classes', () => {
    const { container } = render(Text, {
      attrs: { class: 'custom-text-class' },
      slots: { default: 'Custom styled text' }
    })

    const text = container.querySelector('p')
    expect(text).toHaveClass('custom-text-class')
    expect(text?.className).toContain('text-base')
  })

  it('forwards native attributes', () => {
    render(Text, {
      attrs: { 'data-testid': 'text', 'aria-label': 'Label' },
      slots: { default: 'A' }
    })

    const el = screen.getByTestId('text')
    expect(el).toHaveAttribute('aria-label', 'Label')
  })

  it('has no obvious a11y violations', async () => {
    const { container } = renderWithProps(
      Text,
      { tag: 'h1' },
      { slots: { default: 'Page Heading' } }
    )

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    await expectNoA11yViolationsIsolated(container)
  })

  it('renders a whitelist fallback for an illegal tag', () => {
    const { container } = renderWithProps(
      Text,
      { tag: 'script' as 'p' },
      { slots: { default: 'Safe' } }
    )
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('p')).toHaveTextContent('Safe')
  })

  it('applies logical start alignment', () => {
    const style = document.createElement('style')
    style.textContent = '.text-start { text-align: start; }'
    document.head.appendChild(style)
    const { container } = render(Text, {
      props: { align: 'start' },
      slots: { default: 'RTL start' },
      attrs: { dir: 'rtl' }
    })
    const el = container.querySelector('p') as HTMLElement
    expect(getComputedStyle(el).textAlign).toBe('start')
    style.remove()
  })
})
