/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Text } from '@tigercat/vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

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

  it('applies key style props', () => {
    const { container } = renderWithProps(
      Text,
      {
        tag: 'h1',
        size: '2xl',
        weight: 'bold',
        align: 'center',
        color: 'primary',
        underline: true
      },
      { slots: { default: 'Heading' } }
    )

    const heading = container.querySelector('h1')
    expect(heading?.className).toContain('text-2xl')
    expect(heading?.className).toContain('font-bold')
    expect(heading?.className).toContain('text-center')
    expect(heading).toHaveClass('underline')
  })

  it('has no obvious a11y violations', async () => {
    const { container } = renderWithProps(
      Text,
      { tag: 'h1' },
      { slots: { default: 'Page Heading' } }
    )

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
