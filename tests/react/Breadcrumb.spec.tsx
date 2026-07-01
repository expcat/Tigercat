/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
      expect(container.querySelectorAll('ol > li')).toHaveLength(3)
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
      expect(container.querySelector('.ml-auto')).toBeInTheDocument()
    })
  })

  describe('Separator', () => {
    it.each([
      [undefined, '/'],
      ['arrow', '→'],
      ['chevron', '›'],
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

    it('allows an item-level separator override', () => {
      const { container } = render(
        <Breadcrumb separator="/">
          <BreadcrumbItem href="/" separator="arrow">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )
      expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('→')
    })
  })

  describe('BreadcrumbItem', () => {
    it('renders a link with target/rel when href is set and not current', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="https://example.com" target="_blank">
            External
          </BreadcrumbItem>
        </Breadcrumb>
      )
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
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
    it('calls onClick when a link item is clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      render(
        <Breadcrumb>
          <BreadcrumbItem href="/home" onClick={handleClick}>
            Home
          </BreadcrumbItem>
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
      expect(container.querySelectorAll('li')).toHaveLength(4)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('C')).toBeInTheDocument()
      expect(screen.queryByText('A')).not.toBeInTheDocument()
    })

    it('expands all items when the ellipsis is clicked', async () => {
      const user = userEvent.setup()
      const { container } = renderItems(3)
      await user.click(ellipsis(container)!)
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('B')).toBeInTheDocument()
      expect(ellipsis(container)).toBeNull()
    })

    it('does not collapse when maxItems is >= the item count', () => {
      const { container } = renderItems(10)
      expect(ellipsis(container)).toBeNull()
      expect(container.querySelectorAll('li')).toHaveLength(5)
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
      const { container } = render(<Breadcrumb />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
