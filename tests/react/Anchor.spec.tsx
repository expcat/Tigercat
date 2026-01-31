/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Anchor, AnchorLink } from '@expcat/tigercat-react'

describe('Anchor', () => {
  let scrollContainer: HTMLDivElement

  beforeEach(() => {
    scrollContainer = document.createElement('div')
    scrollContainer.style.height = '200px'
    scrollContainer.style.overflow = 'auto'
    scrollContainer.innerHTML = `
      <div style="height: 2000px">
        <div id="section1" style="margin-top: 100px">Content 1</div>
        <div id="section2" style="margin-top: 500px">Content 2</div>
      </div>
    `
    document.body.appendChild(scrollContainer)
  })

  afterEach(() => {
    document.body.removeChild(scrollContainer)
  })

  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(
        <Anchor getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Link 1" />
          <AnchorLink href="#section2" title="Link 2" />
        </Anchor>
      )

      expect(screen.getByText('Link 1')).toBeInTheDocument()
      expect(screen.getByText('Link 2')).toBeInTheDocument()
      expect(container.firstChild).toHaveClass('relative')
    })

    it('should render with affix class when affix is true', () => {
      const { container } = render(
        <Anchor affix getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Link 1" />
        </Anchor>
      )

      expect(container.firstChild).toHaveClass('fixed')
    })

    it('should not render with affix class when affix is false', () => {
      const { container } = render(
        <Anchor affix={false} getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Link 1" />
        </Anchor>
      )

      expect(container.firstChild).not.toHaveClass('fixed')
    })

    it('should render with vertical direction by default', () => {
      const { container } = render(
        <Anchor getContainer={() => scrollContainer} affix={false}>
          <AnchorLink href="#section1" title="Link 1" />
        </Anchor>
      )

      const anchorEl = container.firstChild as HTMLElement
      const children = anchorEl.querySelectorAll(':scope > div')
      const linkList = children[children.length - 1]
      expect(linkList).toHaveClass('pl-4')
      expect(linkList).toHaveClass('space-y-2')
    })

    it('should render with horizontal direction', () => {
      const { container } = render(
        <Anchor direction="horizontal" getContainer={() => scrollContainer} affix={false}>
          <AnchorLink href="#section1" title="Link 1" />
        </Anchor>
      )

      const anchorEl = container.firstChild as HTMLElement
      const children = anchorEl.querySelectorAll(':scope > div')
      const linkList = children[children.length - 1]
      expect(linkList).toHaveClass('flex')
      expect(linkList).toHaveClass('space-x-4')
    })

    it('should apply custom className', () => {
      const { container } = render(
        <Anchor className="custom-class" getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Link 1" />
        </Anchor>
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should apply offsetTop style when affix and offsetTop are set', () => {
      const { container } = render(
        <Anchor affix offsetTop={100} getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Link 1" />
        </Anchor>
      )

      expect(container.firstChild).toHaveStyle({ top: '100px' })
    })
  })

  describe('AnchorLink', () => {
    it('should render link with title prop', () => {
      render(
        <Anchor getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="My Title" />
        </Anchor>
      )

      const link = screen.getByText('My Title')
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
    })

    it('should render link with children content', () => {
      render(
        <Anchor getContainer={() => scrollContainer}>
          <AnchorLink href="#section1">
            <span>Custom Content</span>
          </AnchorLink>
        </Anchor>
      )

      expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })

    it('should have correct href attribute', () => {
      render(
        <Anchor getContainer={() => scrollContainer}>
          <AnchorLink href="#my-section" title="Link" />
        </Anchor>
      )

      const link = screen.getByText('Link')
      expect(link).toHaveAttribute('href', '#my-section')
    })

    it('should have data-anchor-href attribute', () => {
      render(
        <Anchor getContainer={() => scrollContainer}>
          <AnchorLink href="#my-section" title="Link" />
        </Anchor>
      )

      const link = screen.getByText('Link')
      expect(link).toHaveAttribute('data-anchor-href', '#my-section')
    })

    it('should have target attribute when provided', () => {
      render(
        <Anchor getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Link" target="_blank" />
        </Anchor>
      )

      const link = screen.getByText('Link')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('should apply custom className', () => {
      render(
        <Anchor getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Link" className="my-link" />
        </Anchor>
      )

      const link = screen.getByText('Link')
      expect(link).toHaveClass('my-link')
    })
  })

  describe('Events', () => {
    it('should call onClick when link is clicked', async () => {
      const onClick = vi.fn()

      render(
        <Anchor onClick={onClick} getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Link" />
        </Anchor>
      )

      const link = screen.getByText('Link')
      await fireEvent.click(link)

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick).toHaveBeenCalledWith(expect.any(Object), '#section1')
    })

    it('should prevent default behavior on link click', async () => {
      render(
        <Anchor getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Link" />
        </Anchor>
      )

      const link = screen.getByText('Link')
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      link.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Ink Indicator', () => {
    it('should show ink indicator when affix is false', () => {
      const { container } = render(
        <Anchor affix={false} getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Link 1" />
        </Anchor>
      )

      // Ink container should be present
      const inkContainer = container.querySelector('.bg-gray-200')
      expect(inkContainer).toBeInTheDocument()
    })

    it('should not show ink indicator when affix is true and showInkInFixed is false', () => {
      const { container } = render(
        <Anchor affix showInkInFixed={false} getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Link 1" />
        </Anchor>
      )

      // Ink container should not be present
      const inkContainer = container.querySelector('.bg-gray-200')
      expect(inkContainer).not.toBeInTheDocument()
    })

    it('should show ink indicator when affix is true and showInkInFixed is true', () => {
      const { container } = render(
        <Anchor affix showInkInFixed getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Link 1" />
        </Anchor>
      )

      // Ink container should be present
      const inkContainer = container.querySelector('.bg-gray-200')
      expect(inkContainer).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should respect bounds prop', () => {
      const { container } = render(
        <Anchor bounds={10} getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Link" />
        </Anchor>
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should respect targetOffset prop', () => {
      const { container } = render(
        <Anchor targetOffset={50} getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Link" />
        </Anchor>
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should use custom getContainer', () => {
      const customContainer = document.createElement('div')
      const getContainer = vi.fn(() => customContainer)

      render(
        <Anchor getContainer={getContainer}>
          <AnchorLink href="#section1" title="Link" />
        </Anchor>
      )

      expect(getContainer).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should render links as anchor elements', () => {
      render(
        <Anchor getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Link 1" />
          <AnchorLink href="#section2" title="Link 2" />
        </Anchor>
      )

      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(2)
    })

    it('should have correct link text', () => {
      render(
        <Anchor getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Go to Section" />
        </Anchor>
      )

      const link = screen.getByRole('link', { name: 'Go to Section' })
      expect(link).toBeInTheDocument()
    })
  })

  describe('Context', () => {
    it('should provide context to AnchorLink children', () => {
      render(
        <Anchor direction="horizontal" getContainer={() => scrollContainer}>
          <AnchorLink href="#section1" title="Link" />
        </Anchor>
      )

      // Link should render properly when context is provided
      expect(screen.getByText('Link')).toBeInTheDocument()
    })
  })
})
