import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoA11yViolationsIsolated } from '../utils/a11y-helpers'
import { Layout, Header, Footer, Sidebar, Content } from '@expcat/tigercat-react'

describe('Layout Sections', () => {
  it('renders Layout with className and forwarded attrs', () => {
    const { container } = render(
      <Layout className="from-props" id="layout-id" data-testid="layout">
        Layout content
      </Layout>
    )

    const layout = container.querySelector('#layout-id')
    expect(layout).toBeTruthy()
    expect(layout?.className).toContain('tiger-layout')
    expect(layout?.className).toContain('from-props')
    expect(screen.getByTestId('layout')).toBeTruthy()
  })

  it('sets Header height and merged style', () => {
    const { container } = render(
      <Header height="80px" style={{ paddingLeft: 12 }} aria-label="Site header">
        Header
      </Header>
    )

    const header = container.querySelector('header') as HTMLElement | null
    expect(header).toBeTruthy()
    expect(header?.style.height).toBe('80px')
    expect(header?.style.paddingLeft).toBe('12px')
    expect(header).toHaveAttribute('aria-label', 'Site header')
  })

  it('applies Header variants', () => {
    const { container } = render(<Header variant="blur">Header</Header>)
    const header = container.querySelector('header')
    expect(header).toHaveClass('backdrop-blur-[var(--tiger-blur-glass-strong,24px)]')
    expect(header).toHaveClass('backdrop-saturate-[var(--tiger-header-saturate,1.8)]')
    expect(header).toHaveClass('shadow-[var(--tiger-header-shadow,0_1px_2px_0_rgb(0_0_0/0.05))]')
  })

  it('handles Sidebar collapsed width', () => {
    const { container, rerender } = render(<Sidebar width="300px">Sidebar</Sidebar>)

    const aside = container.querySelector('aside') as HTMLElement | null
    expect(aside).toBeTruthy()
    expect(aside?.style.width).toBe('300px')
    expect(container.textContent).toContain('Sidebar')

    rerender(
      <Sidebar width="300px" collapsed>
        Sidebar
      </Sidebar>
    )
    expect(aside?.style.width).toBe('64px')
    expect(container.textContent).toContain('Sidebar')
  })

  it('Content renders semantic main and forwards className', () => {
    const { container } = render(<Content className="custom-content">Content</Content>)

    const main = container.querySelector('main')
    expect(main).toBeTruthy()
    expect(main?.className).toContain('tiger-content')
    expect(main?.className).toContain('custom-content')
  })

  it('supports configurable Content padding', () => {
    const noPadding = render(<Content padding={false}>Content</Content>)
    expect(noPadding.container.querySelector('main')).not.toHaveClass('p-6')
    noPadding.unmount()

    const customPadding = render(<Content padding="p-4">Content</Content>)
    expect(customPadding.container.querySelector('main')).toHaveClass('p-4')
    expect(customPadding.container.querySelector('main')).not.toHaveClass('p-6')
  })

  it('uses default Footer height', () => {
    const { container } = render(<Footer>Footer</Footer>)
    const footer = container.querySelector('footer') as HTMLElement | null
    expect(footer).toBeTruthy()
    expect(footer?.style.height).toBe('auto')
  })

  it('should have no basic accessibility violations', async () => {
    const { container } = render(
      <Layout>
        <Header>Header</Header>
        <Content>Content</Content>
        <Footer>Footer</Footer>
      </Layout>
    )

    await expectNoA11yViolationsIsolated(container)
  })
})
