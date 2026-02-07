/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Text } from '@expcat/tigercat-react'
import { renderWithProps } from '../utils/render-helpers-react'
import { expectNoA11yViolations } from '../utils/react'

describe('Text (React)', () => {
  it('renders default tag (p)', () => {
    render(<Text>Default text</Text>)
    expect(screen.getByText('Default text').tagName).toBe('P')
  })

  it('renders custom tag', () => {
    const { container } = renderWithProps(Text, {
      tag: 'span',
      children: 'Inline'
    })
    expect(container.querySelector('span')).toBeInTheDocument()
  })

  it('merges className with computed classes', () => {
    const { container } = renderWithProps(Text, {
      className: 'custom-text-class',
      children: 'Custom styled text'
    })
    const text = container.querySelector('p')
    expect(text).toHaveClass('custom-text-class')
    expect(text?.className).toContain('text-base')
  })

  it('forwards native attributes', () => {
    render(
      <Text data-testid="text" aria-label="Label">
        A
      </Text>
    )
    const el = screen.getByTestId('text')
    expect(el).toHaveAttribute('aria-label', 'Label')
  })

  it('applies key style props', () => {
    const { container } = renderWithProps(Text, {
      tag: 'h1',
      size: '2xl',
      weight: 'bold',
      align: 'center',
      color: 'primary',
      underline: true,
      children: 'Heading'
    })
    const heading = container.querySelector('h1')
    expect(heading?.className).toContain('text-2xl')
    expect(heading?.className).toContain('font-bold')
    expect(heading?.className).toContain('text-center')
    expect(heading).toHaveClass('underline')
  })

  it('applies text decoration props individually', () => {
    const { container: c1 } = renderWithProps(Text, {
      truncate: true,
      children: 'Truncated'
    })
    expect(c1.querySelector('p')).toHaveClass('truncate')

    const { container: c2 } = renderWithProps(Text, {
      italic: true,
      children: 'Italic'
    })
    expect(c2.querySelector('p')).toHaveClass('italic')

    const { container: c3 } = renderWithProps(Text, {
      lineThrough: true,
      children: 'Deleted'
    })
    expect(c3.querySelector('p')).toHaveClass('line-through')
  })

  it('has no obvious a11y violations', async () => {
    const { container } = renderWithProps(Text, {
      tag: 'h1',
      children: 'Page Heading'
    })
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
