/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { PageHeader } from '@expcat/tigercat-react/PageHeader'
import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-react/Breadcrumb'
import { Button } from '@expcat/tigercat-react/Button'
import { Link } from '@expcat/tigercat-react/Link'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-page-header]') as HTMLElement
}

describe('PageHeader', () => {
  describe('Rendering', () => {
    it('renders a header landmark with title and subtitle', () => {
      const { container } = render(<PageHeader title="订单详情" subTitle="SO-1001" />)
      const root = getRoot(container)
      expect(root.tagName).toBe('HEADER')
      expect(screen.getByText('订单详情')).toBeInTheDocument()
      expect(screen.getByText('SO-1001')).toBeInTheDocument()
      expect(root.querySelector('[role="menubar"]')).toBeNull()
    })

    it('does not render a back control by default', () => {
      render(<PageHeader title="列表" />)
      expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
    })

    it('renders extra body content from children', () => {
      render(
        <PageHeader title="详情">
          <p>说明文案</p>
        </PageHeader>
      )
      expect(screen.getByText('说明文案')).toBeInTheDocument()
    })

    it('forwards extra props and the ref to the root element', () => {
      const rootRef = React.createRef<HTMLElement>()
      const { container } = render(
        <PageHeader ref={rootRef} id="page-head" title="详情">
          body
        </PageHeader>
      )
      expect(rootRef.current).toBe(getRoot(container))
      expect(getRoot(container).id).toBe('page-head')
    })
  })

  describe('Back control', () => {
    it('renders an accessible button when showBack is true', async () => {
      const onBack = vi.fn()
      render(<PageHeader title="详情" showBack onBack={onBack} />)
      await userEvent.click(screen.getByRole('button', { name: 'Back' }))
      expect(onBack).toHaveBeenCalledTimes(1)
    })

    it('shows the control when onBack is provided without showBack', () => {
      render(<PageHeader title="详情" onBack={() => undefined} />)
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    })

    it('hides the control when showBack is false even with onBack', () => {
      render(<PageHeader title="详情" showBack={false} onBack={() => undefined} />)
      expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
    })

    it('renders a link when backHref is set', async () => {
      const onBack = vi.fn()
      render(<PageHeader title="详情" backHref="/orders" onBack={onBack} />)
      const back = screen.getByRole('link', { name: 'Back' })
      expect(back).toHaveAttribute('href', '/orders')
      await userEvent.click(back)
      expect(onBack).toHaveBeenCalledTimes(1)
    })

    it('activates the default button from the keyboard', async () => {
      const onBack = vi.fn()
      render(<PageHeader title="详情" showBack onBack={onBack} />)
      const back = screen.getByRole('button', { name: 'Back' })
      back.focus()
      await userEvent.keyboard('{Enter}')
      expect(onBack).toHaveBeenCalled()
      await userEvent.keyboard(' ')
      expect(onBack.mock.calls.length).toBeGreaterThanOrEqual(2)
    })

    it('lets a back node replace the default control', async () => {
      const onSlotBack = vi.fn()
      render(
        <PageHeader
          title="详情"
          back={
            <Link href="/list" underline={false} onClick={onSlotBack}>
              返回列表
            </Link>
          }
        />
      )
      expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
      await userEvent.click(screen.getByRole('link', { name: '返回列表' }))
      expect(onSlotBack).toHaveBeenCalledTimes(1)
    })

    it('uses a custom back aria-label', () => {
      render(<PageHeader title="详情" showBack backAriaLabel="返回上一级" />)
      expect(screen.getByRole('button', { name: '返回上一级' })).toBeInTheDocument()
    })
  })

  describe('Slots', () => {
    it('renders breadcrumb, title, subtitle, and actions nodes', () => {
      render(
        <PageHeader
          breadcrumb={
            <Breadcrumb>
              <BreadcrumbItem href="/">首页</BreadcrumbItem>
              <BreadcrumbItem current>详情</BreadcrumbItem>
            </Breadcrumb>
          }
          title={<span>自定义标题</span>}
          subTitle={<span>自定义副标题</span>}
          actions={
            <Button size="sm" htmlType="button">
              保存
            </Button>
          }
        />
      )
      expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument()
      expect(screen.getByText('自定义标题')).toBeInTheDocument()
      expect(screen.getByText('自定义副标题')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument()
    })
  })

  describe('style integration', () => {
    it('merges className and style onto the root header', () => {
      const { container } = render(
        <PageHeader title="详情" className="from-prop" style={{ color: 'red' }} />
      )
      const root = getRoot(container)
      expect(root.className).toContain('from-prop')
      expect(root.style.color).toBe('red')
    })
  })

  describe('a11y', () => {
    it('exposes a banner landmark and an accessible back control', async () => {
      const { container } = render(
        <PageHeader
          title="订单详情"
          subTitle="可访问页头"
          showBack
          actions={
            <Button size="sm" htmlType="button">
              编辑
            </Button>
          }
        />
      )
      expect(screen.getByRole('banner')).toBe(getRoot(container))
      expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled()
      expect(container.querySelector('[role="menubar"]')).toBeNull()
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
