/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-react'

describe('Breadcrumb', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/products">Products</BreadcrumbItem>
          <BreadcrumbItem current>Details</BreadcrumbItem>
        </Breadcrumb>
      )

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Products')).toBeInTheDocument()
      expect(screen.getByText('Details')).toBeInTheDocument()
    })

    it('should render with proper ARIA attributes', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
        </Breadcrumb>
      )

      const nav = container.querySelector('nav')
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb')
    })

    it('should render breadcrumb items in ordered list', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )

      const ol = container.querySelector('ol')
      expect(ol).toBeInTheDocument()
      expect(ol?.querySelectorAll('li')).toHaveLength(2)
    })

    it('should render extra content', () => {
      const { container } = render(
        <Breadcrumb extra={<button>Action</button>}>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )

      expect(screen.getByText('Action')).toBeInTheDocument()
      const extraDiv = container.querySelector('.ml-auto')
      expect(extraDiv).toBeInTheDocument()
    })
  })

  describe('Separator', () => {
    it('should render with default separator', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )

      const separator = container.querySelector('[aria-hidden="true"]')
      expect(separator).toHaveTextContent('/')
    })

    it('should render with arrow separator', () => {
      const { container } = render(
        <Breadcrumb separator="arrow">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )

      const separator = container.querySelector('[aria-hidden="true"]')
      expect(separator).toHaveTextContent('→')
    })

    it('should render with chevron separator', () => {
      const { container } = render(
        <Breadcrumb separator="chevron">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )

      const separator = container.querySelector('[aria-hidden="true"]')
      expect(separator).toHaveTextContent('›')
    })

    it('should render with custom separator', () => {
      const { container } = render(
        <Breadcrumb separator=">">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )

      const separator = container.querySelector('[aria-hidden="true"]')
      expect(separator).toHaveTextContent('>')
    })

    it('should not render separator for current/last item', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )

      const items = container.querySelectorAll('li')
      const lastItem = items[items.length - 1]
      expect(lastItem?.querySelector('[aria-hidden="true"]')).toBeNull()
    })

    it('should allow item-level separator override', () => {
      const { container } = render(
        <Breadcrumb separator="/">
          <BreadcrumbItem href="/" separator="arrow">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )

      const separator = container.querySelector('[aria-hidden="true"]')
      expect(separator).toHaveTextContent('→')
    })
  })

  describe('BreadcrumbItem', () => {
    it('should render as link when href is provided and not current', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="/home">Home</BreadcrumbItem>
        </Breadcrumb>
      )

      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', '/home')
    })

    it('should render as span when current is true', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="/current" current>
            Current
          </BreadcrumbItem>
        </Breadcrumb>
      )

      const span = container.querySelector('span')
      expect(span).toBeInTheDocument()
      expect(span).toHaveTextContent('Current')
      expect(container.querySelector('a')).toBeNull()
    })

    it('should have aria-current="page" for current item', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )

      const span = container.querySelector('[aria-current="page"]')
      expect(span).toBeInTheDocument()
    })

    it('should support target attribute', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="https://example.com" target="_blank">
            External
          </BreadcrumbItem>
        </Breadcrumb>
      )

      const link = container.querySelector('a')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should render icon when provided', () => {
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
    it('should call onClick when item is clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(
        <Breadcrumb>
          <BreadcrumbItem href="/home" onClick={handleClick}>
            Home
          </BreadcrumbItem>
        </Breadcrumb>
      )

      const link = screen.getByText('Home')
      await user.click(link)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when current item is clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(
        <Breadcrumb>
          <BreadcrumbItem current onClick={handleClick}>
            Current
          </BreadcrumbItem>
        </Breadcrumb>
      )

      const item = screen.getByText('Current')
      await user.click(item)

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )

      expect(container.querySelector('nav')).toBeInTheDocument()
      expect(container.querySelector('ol')).toBeInTheDocument()
      expect(container.querySelectorAll('li')).toHaveLength(2)
    })

    it('should hide separators from screen readers', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem current>Current</BreadcrumbItem>
        </Breadcrumb>
      )

      const separator = container.querySelector('[aria-hidden="true"]')
      expect(separator).toBeInTheDocument()
    })
  })

  describe('Custom Classes and Styles', () => {
    it('should apply custom className to container', () => {
      const { container } = render(
        <Breadcrumb className="custom-breadcrumb">
          <BreadcrumbItem>Home</BreadcrumbItem>
        </Breadcrumb>
      )

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('custom-breadcrumb')
    })

    it('should apply custom className to item', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem className="custom-item">Home</BreadcrumbItem>
        </Breadcrumb>
      )

      const item = container.querySelector('li')
      expect(item).toHaveClass('custom-item')
    })

    it('should apply custom style to container', () => {
      const { container } = render(
        <Breadcrumb style={{ fontSize: '20px' }}>
          <BreadcrumbItem>Home</BreadcrumbItem>
        </Breadcrumb>
      )

      const nav = container.querySelector('nav')
      expect(nav).toHaveStyle({ fontSize: '20px' })
    })

    it('should apply custom style to item', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbItem style={{ color: 'red' }}>Home</BreadcrumbItem>
        </Breadcrumb>
      )

      const item = container.querySelector('li')
      expect(item).toHaveStyle({ color: 'red' })
    })
  })
})
