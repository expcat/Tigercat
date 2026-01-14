import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoA11yViolations } from '../utils/a11y-helpers'
import { Layout, Header, Footer, Sidebar, Content } from '@tigercat/react'

describe('Layout Sections', () => {
  it('Layout merges className and forwards attrs', () => {
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

  it('Header applies height and merges style', () => {
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

  it('Sidebar respects collapsed and width', () => {
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
    expect(aside?.style.width).toBe('0px')
    expect(container.textContent).not.toContain('Sidebar')
  })

  it('Content renders semantic main and forwards className', () => {
    const { container } = render(<Content className="custom-content">Content</Content>)

    const main = container.querySelector('main')
    expect(main).toBeTruthy()
    expect(main?.className).toContain('tiger-content')
    expect(main?.className).toContain('custom-content')
  })

  it('Footer applies default height', () => {
    const { container } = render(<Footer>Footer</Footer>)
    const footer = container.querySelector('footer') as HTMLElement | null
    expect(footer).toBeTruthy()
    expect(footer?.style.height).toBe('auto')
  })

  it('has no basic accessibility violations', async () => {
    const { container } = render(
      <Layout>
        <Header>Header</Header>
        <Content>Content</Content>
        <Footer>Footer</Footer>
      </Layout>
    )

    await expectNoA11yViolations(container)
  })
})
