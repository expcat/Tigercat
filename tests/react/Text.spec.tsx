/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Text } from '@expcat/tigercat-react/Text'
import { renderWithProps } from '../utils/render-helpers-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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

  it('has no obvious a11y violations', async () => {
    const { container } = renderWithProps(Text, {
      tag: 'h1',
      children: 'Page Heading'
    })
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    await expectNoA11yViolationsIsolated(container)
  })

  it('renders a whitelist fallback for an illegal tag', () => {
    const { container } = render(<Text tag={'script' as 'p'}>Safe</Text>)
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('p')).toHaveTextContent('Safe')
  })

  it('applies logical start alignment', () => {
    const style = document.createElement('style')
    style.textContent = '.text-start { text-align: start; }'
    document.head.appendChild(style)
    const { container } = render(
      <div dir="rtl">
        <Text align="start">RTL start</Text>
      </div>
    )
    const el = container.querySelector('p') as HTMLElement
    expect(getComputedStyle(el).textAlign).toBe('start')
    style.remove()
  })

  it('forwards ref to the host element', () => {
    const ref = React.createRef<HTMLElement>()
    render(
      <Text ref={ref} tag="span">
        Host
      </Text>
    )
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })
})
