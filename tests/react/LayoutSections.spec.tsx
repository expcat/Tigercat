/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoA11yViolationsIsolated } from '../utils/a11y-helpers'
import { Content } from '@expcat/tigercat-react/Content'
import { Footer } from '@expcat/tigercat-react/Footer'
import { Header } from '@expcat/tigercat-react/Header'
import { Layout } from '@expcat/tigercat-react/Layout'
import { Sidebar } from '@expcat/tigercat-react/Sidebar'
import { Menu } from '@expcat/tigercat-react/Menu'
import { Button } from '@expcat/tigercat-react/Button'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { menuCollapsedClasses } from '@expcat/tigercat-core'

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

  it('places Sidebar beside Content instead of stacking them', () => {
    const { container } = render(
      <Layout data-testid="shell">
        <Sidebar>Side</Sidebar>
        <Content as="div">Main</Content>
      </Layout>
    )
    const shell = screen.getByTestId('shell')
    expect(getComputedStyle(shell).flexDirection).toBe('row')
    expect(shell.querySelector('aside')).toBeTruthy()
    expect(shell.querySelector('.tiger-content')).toBeTruthy()
  })

  it('does not stack a second viewport height on a nested Layout', () => {
    const { container } = render(
      <Layout fullHeight data-testid="outer">
        <Header>Top</Header>
        <Layout data-testid="inner">
          <Sidebar>Side</Sidebar>
          <Content as="div">Main</Content>
        </Layout>
      </Layout>
    )
    const outer = screen.getByTestId('outer')
    const inner = screen.getByTestId('inner')
    expect(outer.className).toContain('tiger-layout-full')
    expect(inner.className).toContain('tiger-layout-nested')
    expect(inner.className).not.toContain('tiger-layout-full')
    expect(getComputedStyle(inner).flexDirection).toBe('row')
    expect(container.querySelectorAll('main').length).toBe(0)
  })

  it('lets caller style.height win when Header height is omitted', () => {
    const { container } = render(
      <Header style={{ height: '80px' }} aria-label="Site header">
        Header
      </Header>
    )
    const header = container.querySelector('header') as HTMLElement
    expect(header.style.height).toBe('80px')
  })

  it('lets the height prop win over style.height', () => {
    const { container } = render(
      <Header height="80px" style={{ height: '40px', paddingLeft: 12 }}>
        Header
      </Header>
    )
    const header = container.querySelector('header') as HTMLElement
    expect(header.style.height).toBe('80px')
    expect(header.style.paddingLeft).toBe('12px')
  })

  it('uses an opaque default Header and a translucent overlay with lower alpha', () => {
    const { container, rerender } = render(<Header>Header</Header>)
    const header = container.querySelector('header') as HTMLElement
    expect(header.className).toContain('tiger-header-default')
    const defaultBg = getComputedStyle(header).backgroundColor

    rerender(<Header variant="translucent">Header</Header>)
    expect(header.className).toContain('tiger-header-translucent')
    expect(getComputedStyle(header).position).toBe('sticky')
    const glassBg = getComputedStyle(header).backgroundColor
    expect(glassBg).not.toBe(defaultBg)
  })

  it('handles Sidebar collapsed width and drops 0-width items from tab order', () => {
    const { container, rerender } = render(
      <Sidebar width="300px">
        <Button>Nav</Button>
      </Sidebar>
    )

    const aside = container.querySelector('aside') as HTMLElement
    expect(aside.style.width).toBe('300px')
    expect(aside).toHaveAttribute('aria-label')

    rerender(
      <Sidebar width="300px" collapsed collapsedWidth="80px">
        <Button>Nav</Button>
      </Sidebar>
    )
    expect(aside.style.width).toBe('80px')
    expect(aside.hasAttribute('inert')).toBe(false)

    rerender(
      <Sidebar width="300px" collapsed collapsedWidth="0px">
        <Button>Nav</Button>
      </Sidebar>
    )
    expect(aside.style.width).toBe('0px')
    expect(aside.getAttribute('aria-hidden')).toBe('true')
    expect(aside.hasAttribute('inert')).toBe(true)
    screen.getByRole('button', { hidden: true }).focus()
    expect(document.activeElement).not.toBe(screen.getByRole('button', { hidden: true }))
  })

  it('lets caller style.width win when Sidebar width is omitted', () => {
    const { container } = render(<Sidebar style={{ width: '192px' }}>Side</Sidebar>)
    const aside = container.querySelector('aside') as HTMLElement
    expect(aside.style.width).toBe('192px')
  })

  it('follows Sidebar collapsed for a nested Menu that omitted collapsed', () => {
    const { container, rerender } = render(
      <Sidebar>
        <Menu items={[{ key: 'a', label: 'A' }]} />
      </Sidebar>
    )
    expect(container.querySelector('[data-tiger-menu-root]')?.className).not.toContain(
      menuCollapsedClasses
    )

    rerender(
      <Sidebar collapsed>
        <Menu items={[{ key: 'a', label: 'A' }]} />
      </Sidebar>
    )
    expect(container.querySelector('[data-tiger-menu-root]')?.className).toContain(
      menuCollapsedClasses
    )
  })

  it('uses the official locale object for the Sidebar landmark name', () => {
    const { container } = render(
      <ConfigProvider locale={zhCN}>
        <Sidebar>Side</Sidebar>
      </ConfigProvider>
    )
    expect(container.querySelector('aside')).toHaveAttribute(
      'aria-label',
      zhCN.common?.sidebarAriaLabel
    )
  })

  it('Content defaults to main, as=div is not a main, and React ref is the scroller', () => {
    const ref = React.createRef<HTMLElement>()
    const { container } = render(
      <Layout style={{ height: 120 }} className="overflow-hidden">
        <Content ref={ref} className="custom-content">
          <div style={{ height: 400 }}>tall</div>
        </Content>
      </Layout>
    )
    const main = container.querySelector('main')
    expect(main).toBeTruthy()
    expect(main?.className).toContain('tiger-content')
    expect(ref.current).toBe(main)

    const nested = render(<Content as="div">Nested</Content>)
    expect(nested.container.querySelector('main')).toBeNull()
    expect(nested.container.querySelector('div.tiger-content')).toBeTruthy()
  })

  it('supports configurable Content padding', () => {
    const noPadding = render(<Content padding={false}>Content</Content>)
    expect(noPadding.container.querySelector('main')).not.toHaveClass('p-6')
    noPadding.unmount()

    const customPadding = render(<Content padding="p-4">Content</Content>)
    expect(customPadding.container.querySelector('main')).toHaveClass('p-4')
    expect(customPadding.container.querySelector('main')).not.toHaveClass('p-6')
  })

  it('does not write Footer height until a height prop is passed', () => {
    const { container, rerender } = render(<Footer>Footer</Footer>)
    const footer = container.querySelector('footer') as HTMLElement
    expect(footer.style.height).toBe('')

    rerender(<Footer style={{ height: '48px' }}>Footer</Footer>)
    expect(footer.style.height).toBe('48px')

    rerender(
      <Footer height="32px" style={{ height: '48px' }}>
        Footer
      </Footer>
    )
    expect(footer.style.height).toBe('32px')
  })

  it('forwards Layout ref to the root node', () => {
    const ref = React.createRef<HTMLDivElement>()
    const { container } = render(<Layout ref={ref}>Shell</Layout>)
    expect(ref.current).toBe(container.firstElementChild)
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
