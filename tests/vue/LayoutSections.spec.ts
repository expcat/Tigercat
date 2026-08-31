/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { expectNoA11yViolationsIsolated } from '../utils/a11y-helpers'
import { Content } from '@expcat/tigercat-vue/Content'
import { Footer } from '@expcat/tigercat-vue/Footer'
import { Header } from '@expcat/tigercat-vue/Header'
import { Layout } from '@expcat/tigercat-vue/Layout'
import { Sidebar } from '@expcat/tigercat-vue/Sidebar'
import { Menu } from '@expcat/tigercat-vue/Menu'
import { Button } from '@expcat/tigercat-vue/Button'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { menuCollapsedClasses } from '@expcat/tigercat-core'

describe('Layout Sections', () => {
  it('Layout merges props.className with attrs.class and forwards attrs', () => {
    const { container } = render(Layout, {
      props: { className: 'from-props' },
      attrs: { id: 'layout-id', class: 'from-attrs', 'data-testid': 'layout' },
      slots: { default: () => 'Layout content' }
    })

    const layout = container.querySelector('#layout-id')
    expect(layout).toBeTruthy()
    expect(layout?.className).toContain('tiger-layout')
    expect(layout?.className).toContain('from-props')
    expect(layout?.className).toContain('from-attrs')
    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })

  it('places Sidebar beside Content instead of stacking them', () => {
    const { container } = render({
      setup() {
        return () =>
          h(Layout, { 'data-testid': 'shell' }, () => [
            h(Sidebar, null, () => 'Side'),
            h(Content, { as: 'div' }, () => 'Main')
          ])
      }
    })
    const shell = screen.getByTestId('shell')
    expect(getComputedStyle(shell).flexDirection).toBe('row')
    expect(container.querySelector('aside')).toBeTruthy()
    expect(container.querySelector('.tiger-content')).toBeTruthy()
  })

  it('does not stack a second viewport height on a nested Layout', () => {
    render({
      setup() {
        return () =>
          h(Layout, { fullHeight: true, 'data-testid': 'outer' }, () => [
            h(Header, null, () => 'Top'),
            h(Layout, { 'data-testid': 'inner' }, () => [
              h(Sidebar, null, () => 'Side'),
              h(Content, { as: 'div' }, () => 'Main')
            ])
          ])
      }
    })
    const outer = screen.getByTestId('outer')
    const inner = screen.getByTestId('inner')
    expect(outer.className).toContain('tiger-layout-full')
    expect(inner.className).toContain('tiger-layout-nested')
    expect(inner.className).not.toContain('tiger-layout-full')
    expect(getComputedStyle(inner).flexDirection).toBe('row')
  })

  it('lets caller style.height win when Header height is omitted', () => {
    const { container } = render(Header, {
      props: { style: { height: '80px' } },
      attrs: { 'aria-label': 'Site header' },
      slots: { default: () => 'Header' }
    })
    const header = container.querySelector('header') as HTMLElement
    expect(header.style.height).toBe('80px')
  })

  it('lets the height prop win over style.height', () => {
    const { container } = render(Header, {
      props: { height: '80px', style: { height: '40px', paddingLeft: '12px' } },
      slots: { default: () => 'Header' }
    })
    const header = container.querySelector('header') as HTMLElement
    expect(header.style.height).toBe('80px')
    expect(header.style.paddingLeft).toBe('12px')
  })

  it('uses an opaque default Header and a translucent overlay', () => {
    const { container } = render(Header, { slots: { default: () => 'Header' } })
    const header = container.querySelector('header') as HTMLElement
    expect(header.className).toContain('tiger-header-default')
    const defaultBg = getComputedStyle(header).backgroundColor

    const glass = render(Header, {
      props: { variant: 'translucent' },
      slots: { default: () => 'Header' }
    })
    const glassHeader = glass.container.querySelector('header') as HTMLElement
    expect(glassHeader.className).toContain('tiger-header-translucent')
    expect(getComputedStyle(glassHeader).position).toBe('sticky')
    expect(getComputedStyle(glassHeader).backgroundColor).not.toBe(defaultBg)
  })

  it('Sidebar collapsed 0-width is inert and out of tab order', async () => {
    const { container, rerender } = render(Sidebar, {
      props: { width: '300px' },
      slots: { default: () => h(Button, null, () => 'Nav') }
    })
    const aside = container.querySelector('aside') as HTMLElement
    expect(aside.style.width).toBe('300px')

    await rerender({ width: '300px', collapsed: true, collapsedWidth: '80px' })
    expect(aside.style.width).toBe('80px')
    expect(aside.hasAttribute('inert')).toBe(false)

    await rerender({ width: '300px', collapsed: true, collapsedWidth: '0px' })
    expect(aside.style.width).toBe('0px')
    expect(aside.getAttribute('aria-hidden')).toBe('true')
    expect(aside.hasAttribute('inert')).toBe(true)
  })

  it('follows Sidebar collapsed for a nested Menu that omitted collapsed', async () => {
    const view = render({
      setup() {
        return () =>
          h(Sidebar, { collapsed: false }, () => h(Menu, { items: [{ key: 'a', label: 'A' }] }))
      }
    })
    expect(view.container.querySelector('[data-tiger-menu]')?.className).not.toContain(
      menuCollapsedClasses
    )
    view.unmount()

    const collapsed = render({
      setup() {
        return () =>
          h(Sidebar, { collapsed: true }, () => h(Menu, { items: [{ key: 'a', label: 'A' }] }))
      }
    })
    expect(collapsed.container.querySelector('[data-tiger-menu]')?.className).toContain(
      menuCollapsedClasses
    )
  })

  it('uses the official locale object for the Sidebar landmark name', () => {
    const { container } = render({
      setup() {
        return () => h(ConfigProvider, { locale: zhCN }, () => h(Sidebar, null, () => 'Side'))
      }
    })
    expect(container.querySelector('aside')).toHaveAttribute(
      'aria-label',
      zhCN.common?.sidebarAriaLabel
    )
  })

  it('Content defaults to main and as=div is not a main', () => {
    const { container } = render(Content, {
      props: { className: 'custom-content' },
      slots: { default: () => 'Main' }
    })
    const main = container.querySelector('main')
    expect(main).toBeTruthy()
    expect(main?.className).toContain('tiger-content')
    expect(main?.className).toContain('custom-content')

    const nested = render(Content, {
      props: { as: 'div' },
      slots: { default: () => 'Nested' }
    })
    expect(nested.container.querySelector('main')).toBeNull()
    expect(nested.container.querySelector('div.tiger-content')).toBeTruthy()
  })

  it('supports configurable Content padding', () => {
    const noPadding = render(Content, {
      props: { padding: false },
      slots: { default: () => 'Main' }
    })
    expect(noPadding.container.querySelector('main')).not.toHaveClass('p-6')
    noPadding.unmount()

    const customPadding = render(Content, {
      props: { padding: 'p-4' },
      slots: { default: () => 'Main' }
    })
    expect(customPadding.container.querySelector('main')).toHaveClass('p-4')
    expect(customPadding.container.querySelector('main')).not.toHaveClass('p-6')
  })

  it('does not write Footer height until a height prop is passed', async () => {
    const { container, rerender } = render(Footer, {
      slots: { default: () => 'Footer' }
    })
    const footer = container.querySelector('footer') as HTMLElement
    expect(footer.style.height).toBe('')

    await rerender({ style: { height: '48px' } })
    expect(footer.style.height).toBe('48px')

    await rerender({ height: '32px', style: { height: '48px' } })
    expect(footer.style.height).toBe('32px')
  })

  it('has no basic accessibility violations', async () => {
    const { container } = render(Layout, {
      slots: {
        default: () => [
          h(Header, null, () => 'Header'),
          h(Content, null, () => 'Content'),
          h(Footer, null, () => 'Footer')
        ]
      }
    })

    await expectNoA11yViolationsIsolated(container)
  })
})
