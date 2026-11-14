/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Container } from '@expcat/tigercat-react/Container'
import { expectNoA11yViolationsIsolated } from '../utils/react'
import React from 'react'

describe('Container (React)', () => {
  const Content = <div>Container content</div>

  it('should render children content', () => {
    render(<Container>{Content}</Container>)
    expect(screen.getByText('Container content')).toBeInTheDocument()
  })

  it('distinguishes false, full, and named maxWidth', () => {
    const none = render(<Container maxWidth={false}>{Content}</Container>)
    const noneEl = none.container.querySelector('.tiger-container') as HTMLElement
    expect(noneEl.style.maxWidth).toBe('')

    const full = render(<Container maxWidth="full">{Content}</Container>)
    const fullEl = full.container.querySelector('.tiger-container') as HTMLElement
    expect(fullEl.style.maxWidth).toBe('100%')
    expect(getComputedStyle(fullEl).maxWidth).toBe('100%')

    const sm = render(<Container maxWidth="sm">{Content}</Container>)
    const smEl = sm.container.querySelector('.tiger-container') as HTMLElement
    expect(smEl.style.maxWidth).toContain('--tiger-breakpoint-sm')
    expect(smEl.style.maxWidth).not.toBe(fullEl.style.maxWidth)
    expect(smEl.style.maxWidth).not.toBe(noneEl.style.maxWidth)
  })

  it('ignores inherited maxWidth keys the same way as unknown values', () => {
    const unknown = render(<Container maxWidth={'nope' as 'sm'}>{Content}</Container>)
    const unknownEl = unknown.container.querySelector('.tiger-container') as HTMLElement
    for (const maxWidth of ['toString', 'constructor'] as const) {
      const view = render(<Container maxWidth={maxWidth as 'sm'}>{Content}</Container>)
      const el = view.container.querySelector('.tiger-container') as HTMLElement
      expect(el.style.maxWidth).toBe(unknownEl.style.maxWidth)
      expect(el.style.maxWidth).toBe('')
      expect(el.getAttribute('style') ?? '').not.toContain('function')
    }
  })

  it('follows a changed breakpoint CSS variable', () => {
    const { container } = render(<Container maxWidth="md">{Content}</Container>)
    const el = container.querySelector('.tiger-container') as HTMLElement
    document.documentElement.style.setProperty('--tiger-breakpoint-md', '800px')
    expect(getComputedStyle(el).maxWidth).toBe('800px')
    document.documentElement.style.removeProperty('--tiger-breakpoint-md')
  })

  it('centers and pads by default, and both can be turned off', () => {
    const on = render(<Container>{Content}</Container>)
    const onEl = on.container.querySelector('.tiger-container') as HTMLElement
    expect(onEl.className).toContain('tiger-container-center')
    expect(onEl.className).toContain('tiger-container-pad')

    const off = render(
      <Container center={false} padding={false}>
        {Content}
      </Container>
    )
    const offEl = off.container.querySelector('.tiger-container') as HTMLElement
    expect(offEl.className).not.toContain('tiger-container-center')
    expect(offEl.className).not.toContain('tiger-container-pad')
  })

  it('merges className and forwards ref to a custom tag', () => {
    const ref = React.createRef<HTMLElement>()
    const { container } = render(
      <Container ref={ref} as="section" className="custom-container-class">
        {Content}
      </Container>
    )
    const el = container.querySelector('section') as HTMLElement
    expect(el).toBeTruthy()
    expect(el.className).toContain('tiger-container')
    expect(el.className).toContain('custom-container-class')
    expect(ref.current).toBe(el)
  })

  it('should have no accessibility violations', async () => {
    const { container } = render(<Container>{Content}</Container>)
    await expectNoA11yViolationsIsolated(container)
  })
})
