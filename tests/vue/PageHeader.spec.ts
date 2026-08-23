/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { h } from 'vue'
import { PageHeader } from '@expcat/tigercat-vue/PageHeader'
import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-vue/Breadcrumb'
import { Button } from '@expcat/tigercat-vue/Button'
import { Link } from '@expcat/tigercat-vue/Link'
import { expectNoA11yViolationsIsolated } from '../utils'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-page-header]') as HTMLElement
}

describe('PageHeader', () => {
  describe('Rendering', () => {
    it('renders a header landmark with title and subtitle', () => {
      const { container } = render(PageHeader, {
        props: { title: '订单详情', subTitle: 'SO-1001' }
      })
      const root = getRoot(container)
      expect(root.tagName).toBe('HEADER')
      expect(screen.getByText('订单详情')).toBeInTheDocument()
      expect(screen.getByText('SO-1001')).toBeInTheDocument()
      expect(root.querySelector('[role="menubar"]')).toBeNull()
    })

    it('does not render a back control by default', () => {
      render(PageHeader, { props: { title: '列表' } })
      expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
    })

    it('renders extra body content from the default slot', () => {
      render(PageHeader, {
        props: { title: '详情' },
        slots: { default: () => h('p', '说明文案') }
      })
      expect(screen.getByText('说明文案')).toBeInTheDocument()
    })
  })

  describe('Back control', () => {
    it('renders an accessible button when showBack is true', async () => {
      const onBack = vi.fn()
      render(PageHeader, {
        props: { title: '详情', showBack: true, onBack }
      })
      const back = screen.getByRole('button', { name: 'Back' })
      await userEvent.click(back)
      expect(onBack).toHaveBeenCalledTimes(1)
    })

    it('shows the control when a back listener is provided without showBack', () => {
      render(PageHeader, {
        props: { title: '详情', onBack: vi.fn() }
      })
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    })

    it('hides the control when showBack is false even with a listener', () => {
      render(PageHeader, {
        props: { title: '详情', showBack: false, onBack: vi.fn() }
      })
      expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
    })

    it('renders a link when backHref is set', async () => {
      const onBack = vi.fn()
      render(PageHeader, {
        props: { title: '详情', backHref: '/orders', onBack }
      })
      const back = screen.getByRole('link', { name: 'Back' })
      expect(back).toHaveAttribute('href', '/orders')
      await userEvent.click(back)
      expect(onBack).toHaveBeenCalledTimes(1)
    })

    it('activates the default button from the keyboard', async () => {
      const onBack = vi.fn()
      render(PageHeader, {
        props: { title: '详情', showBack: true, onBack }
      })
      const back = screen.getByRole('button', { name: 'Back' })
      back.focus()
      await userEvent.keyboard('{Enter}')
      expect(onBack).toHaveBeenCalled()
      await userEvent.keyboard(' ')
      expect(onBack.mock.calls.length).toBeGreaterThanOrEqual(2)
    })

    it('lets a back slot replace the default control', async () => {
      const onSlotBack = vi.fn()
      render(PageHeader, {
        props: { title: '详情' },
        slots: {
          back: () =>
            h(Link, { href: '/list', underline: false, onClick: onSlotBack }, () => '返回列表')
        }
      })
      expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
      await userEvent.click(screen.getByRole('link', { name: '返回列表' }))
      expect(onSlotBack).toHaveBeenCalledTimes(1)
    })

    it('uses a custom back aria-label', () => {
      render(PageHeader, {
        props: { title: '详情', showBack: true, backAriaLabel: '返回上一级' }
      })
      expect(screen.getByRole('button', { name: '返回上一级' })).toBeInTheDocument()
    })
  })

  describe('Slots', () => {
    it('renders breadcrumb, title, subtitle, and actions slots', () => {
      render(PageHeader, {
        slots: {
          breadcrumb: () =>
            h(Breadcrumb, null, () => [
              h(BreadcrumbItem, { href: '/' }, () => '首页'),
              h(BreadcrumbItem, { current: true }, () => '详情')
            ]),
          title: () => h('span', '自定义标题'),
          subTitle: () => h('span', '自定义副标题'),
          actions: () => h(Button, { size: 'sm' }, () => '保存')
        }
      })
      expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument()
      expect(screen.getByText('自定义标题')).toBeInTheDocument()
      expect(screen.getByText('自定义副标题')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument()
    })
  })

  describe('attrs integration', () => {
    it('merges class and style onto the root header', () => {
      const { container } = render(PageHeader, {
        props: { title: '详情', className: 'from-prop', style: { color: 'red' } },
        attrs: { id: 'page-head', class: 'from-attr' }
      })
      const root = getRoot(container)
      expect(root.id).toBe('page-head')
      expect(root.className).toContain('from-prop')
      expect(root.className).toContain('from-attr')
      expect(root.style.color).toBe('red')
    })
  })

  describe('a11y', () => {
    it('exposes a banner landmark and an accessible back control', async () => {
      const { container } = render(PageHeader, {
        props: { title: '订单详情', subTitle: '可访问页头', showBack: true },
        slots: {
          actions: () => h(Button, { size: 'sm' }, () => '编辑')
        }
      })
      expect(screen.getByRole('banner')).toBe(getRoot(container))
      expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled()
      expect(container.querySelector('[role="menubar"]')).toBeNull()
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
