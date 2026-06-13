/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { expectNoA11yViolationsIsolated } from '../utils/a11y-helpers'
import { Layout, Header, Footer, Sidebar, Content } from '@expcat/tigercat-vue'

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

  it('renders composed layout sections', () => {
    render(Layout, {
      slots: {
        default: () => [
          h(Header, null, () => 'Header'),
          h(Content, null, () => 'Content'),
          h(Footer, null, () => 'Footer')
        ]
      }
    })

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('Header applies height and merges style', () => {
    const { container } = render(Header, {
      props: { height: '80px', style: { paddingLeft: '12px' } },
      attrs: { 'aria-label': 'Site header' },
      slots: { default: () => 'Header' }
    })

    const header = container.querySelector('header') as HTMLElement | null
    expect(header).toBeTruthy()
    expect(header?.style.height).toBe('80px')
    expect(header?.style.paddingLeft).toBe('12px')
    expect(header).toHaveAttribute('aria-label', 'Site header')
  })

  it('applies Header variants', () => {
    const { container } = render(Header, {
      props: { variant: 'blur' },
      slots: { default: () => 'Header' }
    })
    const header = container.querySelector('header')
    expect(header).toHaveClass('backdrop-blur-[var(--tiger-blur-glass-strong,24px)]')
    expect(header).toHaveClass('backdrop-saturate-[var(--tiger-header-saturate,1.8)]')
    expect(header).toHaveClass('shadow-[var(--tiger-header-shadow,0_1px_2px_0_rgb(0_0_0/0.05))]')
    expect(header).toHaveClass('border-[color:var(--tiger-header-border,var(--tiger-border,#e5e7eb))]')
  })

  it('Sidebar respects collapsed and width', async () => {
    const { container, rerender } = render(Sidebar, {
      props: { width: '300px' },
      slots: { default: () => 'Sidebar' }
    })

    const aside = container.querySelector('aside') as HTMLElement | null
    expect(aside).toBeTruthy()
    expect(aside?.style.width).toBe('300px')
    expect(screen.getByText('Sidebar')).toBeInTheDocument()

    await rerender({ collapsed: true, width: '300px' })
    expect(aside?.style.width).toBe('64px')
    expect(screen.getByText('Sidebar')).toBeInTheDocument()
  })

  it('Content renders semantic main', () => {
    const { container } = render(Content, {
      props: { className: 'custom-content' },
      slots: { default: () => 'Main' }
    })

    const main = container.querySelector('main')
    expect(main).toBeTruthy()
    expect(main?.className).toContain('tiger-content')
    expect(main?.className).toContain('custom-content')
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

  it('Footer applies default height', () => {
    const { container } = render(Footer, {
      slots: { default: () => 'Footer' }
    })
    const footer = container.querySelector('footer') as HTMLElement | null
    expect(footer).toBeTruthy()
    expect(footer?.style.height).toBe('auto')
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
