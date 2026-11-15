/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-react/Breadcrumb'
import { expectNoA11yViolations } from '../utils/react'

describe('Breadcrumb', () => {
  describe('Rendering', () => {
    it('renders items inside a labelled nav and ordered list', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/products">Products</BreadcrumbItem>
          <BreadcrumbItem current>Details</BreadcrumbItem>
        </Breadcrumb>
      )
      expect(container.querySelector('nav')).toHaveAttribute('aria-label', 'Breadcrumb')
      expect(container.querySelectorAll('ol > li:not([aria-hidden])')).toHaveLength(3)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Details')).toBeInTheDocument()
    })

    it('renders extra content', () => {
      const { container } = render(
        <Breadcrumb extra={<button>Action</button>}>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(container.querySelector('nav')?.contains(screen.getByText('Action'))).toBe(false)
    })
  })

  describe('Separator', () => {
    it.each([
      [undefined, '/'],
      ['>', '>']
    ])('renders the %s separator as "%s"', (separator, expected) => {
      const { container } = render(
        <Breadcrumb separator={separator as never}>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )
      expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent(expected)
    })

    it('lets an item separator override the parent separator', () => {
      const { container } = render(
        <Breadcrumb separator="/">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/docs" separator="|">
            Docs
          </BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )
      const separators = Array.from(container.querySelectorAll('[aria-hidden="true"]'))
      expect(separators.map((node) => node.textContent)).toEqual(['/', '|'])
    })

    it('renders directional separators as graphics that flip with dir', () => {
      const { container } = render(
        <Breadcrumb separator="chevron">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem>Current</BreadcrumbItem>
        </Breadcrumb>
      )
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('renders one li per item with the separator inside the item', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )
      const items = container.querySelectorAll('ol > li')
      expect(items).toHaveLength(3)
      expect(items[0].querySelector('[aria-hidden="true"]')).toHaveTextContent('/')
      expect(items[2].querySelector('[aria-hidden="true"]')).toBeNull()
    })

    it('does not render a separator after the last item', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )
      const items = container.querySelectorAll('li')
      expect(items[items.length - 1]?.querySelector('[aria-hidden="true"]')).toBeNull()
    })

    it('treats the last item as current when current is omitted', () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem>Here</BreadcrumbItem>
        </Breadcrumb>
      )
      expect(screen.getByText('Here')).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('BreadcrumbItem', () => {
    it.each([
      ['_blank', 'nofollow noopener noreferrer'],
      ['_self', 'nofollow']
    ] as const)('preserves caller rel and secures target %s', (target, rel) => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="https://example.com" target={target} rel="nofollow" current={false}>
            External
          </BreadcrumbItem>
        </Breadcrumb>
      )
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(link).toHaveAttribute('target', target)
      expect(link).toHaveAttribute('rel', rel)
      expect(container.querySelector('li')).not.toHaveAttribute('rel')
    })

    it('renders the current item as a span with aria-current="page"', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="/current" current>
            Current
          </BreadcrumbItem>
        </Breadcrumb>
      )
      expect(container.querySelector('a')).toBeNull()
      expect(container.querySelector('[aria-current="page"]')).toHaveTextContent('Current')
    })

    it('renders an icon alongside the label', () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem href="/" icon="🏠">
            Home
          </BreadcrumbItem>
        </Breadcrumb>
      )
      expect(screen.getByText('🏠')).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
    })
  })

  describe('Events', () => {
    it('activates onClick without href via a button', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      render(
        <Breadcrumb>
          <BreadcrumbItem onClick={handleClick}>Home</BreadcrumbItem>
          <BreadcrumbItem>Here</BreadcrumbItem>
        </Breadcrumb>
      )
      await user.click(screen.getByRole('button', { name: 'Home' }))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('calls onClick when a link item is clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      render(
        <Breadcrumb>
          <BreadcrumbItem href="/home" onClick={handleClick} current={false}>
            Home
          </BreadcrumbItem>
          <BreadcrumbItem>Here</BreadcrumbItem>
        </Breadcrumb>
      )
      await user.click(screen.getByText('Home'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick on the current item', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      render(
        <Breadcrumb>
          <BreadcrumbItem current onClick={handleClick}>
            Current
          </BreadcrumbItem>
        </Breadcrumb>
      )
      await user.click(screen.getByText('Current'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Custom classes and styles', () => {
    it('applies custom className to the container and items', () => {
      const { container } = render(
        <Breadcrumb className="custom-breadcrumb">
          <BreadcrumbItem className="custom-item">Home</BreadcrumbItem>
        </Breadcrumb>
      )
      expect(container.querySelector('nav')).toHaveClass('custom-breadcrumb')
      expect(container.querySelector('li')).toHaveClass('custom-item')
    })

    it('applies custom style to the container and items', () => {
      const { container } = render(
        <Breadcrumb style={{ fontSize: '20px' }}>
          <BreadcrumbItem style={{ color: 'red' }}>Home</BreadcrumbItem>
        </Breadcrumb>
      )
      expect(container.querySelector('nav')).toHaveStyle({ fontSize: '20px' })
      expect(container.querySelector('li')).toHaveStyle({ color: 'red' })
    })
  })

  describe('maxItems collapse', () => {
    const renderItems = (maxItems?: number) =>
      render(
        <Breadcrumb maxItems={maxItems}>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/a">A</BreadcrumbItem>
          <BreadcrumbItem href="/b">B</BreadcrumbItem>
          <BreadcrumbItem href="/c">C</BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )
    const ellipsis = (container: HTMLElement) =>
      container.querySelector('button[aria-label="Show collapsed breadcrumb items"]')

    it('collapses middle items into an ellipsis when maxItems is set', () => {
      const { container } = renderItems(3)
      expect(ellipsis(container)).toBeInTheDocument()
      expect(ellipsis(container)).toHaveAttribute('aria-expanded', 'false')
      expect(container.querySelectorAll('li:not([aria-hidden])')).toHaveLength(4)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('C')).toBeInTheDocument()
      expect(screen.queryByText('A')).not.toBeInTheDocument()
    })

    it('opens collapsed items in a menu and can collapse again', async () => {
      const user = userEvent.setup()
      const { container } = renderItems(3)
      await user.click(ellipsis(container)!)
      expect(screen.getByRole('menu')).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'A' })).toHaveFocus()
      await user.click(ellipsis(container)!)
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('moves focus into the menu, navigates items and returns focus on Escape', async () => {
      const user = userEvent.setup()
      renderItems(3)
      const trigger = screen.getByRole('button', { name: 'Show collapsed breadcrumb items' })
      trigger.focus()
      await user.keyboard('{Enter}')
      expect(screen.getByRole('menuitem', { name: 'A' })).toHaveFocus()
      await user.keyboard('{ArrowDown}')
      expect(screen.getByRole('menuitem', { name: 'B' })).toHaveFocus()
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveFocus()
      await user.keyboard('{ArrowUp}')
      expect(screen.getByRole('menuitem', { name: 'B' })).toHaveFocus()
      await user.tab({ shift: true })
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      expect(trigger).toHaveFocus()
      await user.keyboard('{ArrowDown}')
      expect(screen.getByRole('menuitem', { name: 'A' })).toHaveFocus()
      await user.tab()
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'C' })).toHaveFocus()
    })

    it('preserves collapsed item clicks and link targets before bubbling to body', async () => {
      const user = userEvent.setup()
      const stay = vi.fn((event: React.MouseEvent) => event.preventDefault())
      const prevented: boolean[] = []
      const observeClick = (event: MouseEvent) => {
        if (!(event.target instanceof Element) || !event.target.closest('a')) return
        prevented.push(event.defaultPrevented)
        event.preventDefault()
      }
      const { container } = render(
        <Breadcrumb maxItems={3}>
          <BreadcrumbItem href="/" onClick={stay}>
            Home
          </BreadcrumbItem>
          <BreadcrumbItem href="/a" target="_blank" rel="nofollow" onClick={stay}>
            A
          </BreadcrumbItem>
          <BreadcrumbItem href="/b">B</BreadcrumbItem>
          <BreadcrumbItem>Current</BreadcrumbItem>
        </Breadcrumb>
      )
      document.body.addEventListener('click', observeClick)
      try {
        await user.click(screen.getByText('Home'))
        await user.click(ellipsis(container)!)
        const item = screen.getByRole('menuitem', { name: 'A' })
        await user.click(item)
        expect(prevented).toEqual([true, true])
        expect(stay).toHaveBeenCalledTimes(2)
        expect(item).toHaveAttribute('href', '/a')
        expect(item).toHaveAttribute('target', '_blank')
        expect(item).toHaveAttribute('rel', 'nofollow noopener noreferrer')
      } finally {
        document.body.removeEventListener('click', observeClick)
      }
    })

    it('does not collapse when maxItems is >= the item count', () => {
      const { container } = renderItems(10)
      expect(ellipsis(container)).toBeNull()
      expect(container.querySelectorAll('li:not([aria-hidden])')).toHaveLength(5)
    })

    it('does not leak maxItems to the DOM', () => {
      const { container } = renderItems(3)
      expect(container.querySelector('nav')?.hasAttribute('maxitems')).toBe(false)
    })
  })

  describe('Accessibility', () => {
    it('hides separators from screen readers', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    })

    it('has no accessibility violations', async () => {
      const { container } = render(
        <Breadcrumb extra={<button type="button">Action</button>} maxItems={3}>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/a">A</BreadcrumbItem>
          <BreadcrumbItem href="/b">B</BreadcrumbItem>
          <BreadcrumbItem>Here</BreadcrumbItem>
        </Breadcrumb>
      )
      await expectNoA11yViolations(container)
    })
  })
})
