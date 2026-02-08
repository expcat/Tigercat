/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { h } from 'vue'
import { Anchor, AnchorLink } from '@expcat/tigercat-vue'

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
      const { container } = render(Anchor, {
        props: {
          getContainer: () => scrollContainer
        },
        slots: {
          default: () => [
            h(AnchorLink, { href: '#section1', title: 'Link 1' }),
            h(AnchorLink, { href: '#section2', title: 'Link 2' })
          ]
        }
      })

      expect(screen.getByText('Link 1')).toBeInTheDocument()
      expect(screen.getByText('Link 2')).toBeInTheDocument()
      expect(container.firstChild).toHaveClass('relative')
    })

    it('should render with affix class when affix is true', () => {
      const { container } = render(Anchor, {
        props: { affix: true, getContainer: () => scrollContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1', title: 'Link 1' })]
        }
      })

      expect(container.firstChild).toHaveClass('fixed')
    })

    it('should not render with affix class when affix is false', () => {
      const { container } = render(Anchor, {
        props: { affix: false, getContainer: () => scrollContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1', title: 'Link 1' })]
        }
      })

      expect(container.firstChild).not.toHaveClass('fixed')
    })

    it('should render with vertical direction by default', () => {
      const { container } = render(Anchor, {
        props: { getContainer: () => scrollContainer, affix: false },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1', title: 'Link 1' })]
        }
      })

      // First child of anchor is the ink container when affix=false
      // Second child is the link list
      const anchorEl = container.firstChild as HTMLElement
      const children = anchorEl.querySelectorAll(':scope > div')
      const linkList = children[children.length - 1]
      expect(linkList).toHaveClass('pl-4')
      expect(linkList).toHaveClass('space-y-2')
    })

    it('should render with horizontal direction', () => {
      const { container } = render(Anchor, {
        props: { direction: 'horizontal', getContainer: () => scrollContainer, affix: false },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1', title: 'Link 1' })]
        }
      })

      const anchorEl = container.firstChild as HTMLElement
      const children = anchorEl.querySelectorAll(':scope > div')
      const linkList = children[children.length - 1]
      expect(linkList).toHaveClass('flex')
      expect(linkList).toHaveClass('space-x-4')
    })

    it('should apply custom className', () => {
      const { container } = render(Anchor, {
        props: { className: 'custom-class', getContainer: () => scrollContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1', title: 'Section 1' })]
        }
      })

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should apply offsetTop style when affix and offsetTop are set', () => {
      const { container } = render(Anchor, {
        props: { affix: true, offsetTop: 100, getContainer: () => scrollContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1', title: 'Section 1' })]
        }
      })

      expect(container.firstChild).toHaveStyle({ top: '100px' })
    })
  })

  describe('AnchorLink', () => {
    it('should render link with title prop', () => {
      render(Anchor, {
        props: { getContainer: () => scrollContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1', title: 'My Title' })]
        }
      })

      const link = screen.getByText('My Title')
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
    })

    it('should render link with slot content', () => {
      render(Anchor, {
        props: { getContainer: () => scrollContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1' }, () => h('span', 'Custom Content'))]
        }
      })

      expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })

    it('should have correct href attribute', () => {
      render(Anchor, {
        props: { getContainer: () => scrollContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#my-section', title: 'Link' })]
        }
      })

      const link = screen.getByText('Link')
      expect(link).toHaveAttribute('href', '#my-section')
    })

    it('should have data-anchor-href attribute', () => {
      render(Anchor, {
        props: { getContainer: () => scrollContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#my-section', title: 'Link' })]
        }
      })

      const link = screen.getByText('Link')
      expect(link).toHaveAttribute('data-anchor-href', '#my-section')
    })

    it('should have target attribute when provided', () => {
      render(Anchor, {
        props: { getContainer: () => scrollContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1', title: 'Link', target: '_blank' })]
        }
      })

      const link = screen.getByText('Link')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('should apply custom className', () => {
      render(Anchor, {
        props: { getContainer: () => scrollContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1', title: 'Link', className: 'my-link' })]
        }
      })

      const link = screen.getByText('Link')
      expect(link).toHaveClass('my-link')
    })
  })

  describe('Events', () => {
    it('should emit click event when link is clicked', async () => {
      const onClick = vi.fn()

      render(Anchor, {
        props: { onClick, getContainer: () => scrollContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1', title: 'Link' })]
        }
      })

      const link = screen.getByText('Link')
      await fireEvent.click(link)

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick).toHaveBeenCalledWith(expect.any(Event), '#section1')
    })

    it('should prevent default behavior on link click', async () => {
      render(Anchor, {
        props: { getContainer: () => scrollContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1', title: 'Link' })]
        }
      })

      const link = screen.getByText('Link')
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      link.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Ink Indicator', () => {
    it('should show ink indicator when affix is false', () => {
      const { container } = render(Anchor, {
        props: { affix: false, getContainer: () => scrollContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1', title: 'Section 1' })]
        }
      })

      // Ink container should be present
      const inkContainer = container.querySelector('.bg-gray-200')
      expect(inkContainer).toBeInTheDocument()
    })

    it('should not show ink indicator when affix is true and showInkInFixed is false', () => {
      const { container } = render(Anchor, {
        props: { affix: true, showInkInFixed: false, getContainer: () => scrollContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1', title: 'Section 1' })]
        }
      })

      // Ink container should not be present
      const inkContainer = container.querySelector('.bg-gray-200')
      expect(inkContainer).not.toBeInTheDocument()
    })

    it('should show ink indicator when affix is true and showInkInFixed is true', () => {
      const { container } = render(Anchor, {
        props: { affix: true, showInkInFixed: true, getContainer: () => scrollContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1', title: 'Section 1' })]
        }
      })

      // Ink container should be present
      const inkContainer = container.querySelector('.bg-gray-200')
      expect(inkContainer).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should use custom getContainer', async () => {
      const customContainer = document.createElement('div')
      const getContainer = vi.fn(() => customContainer)

      render(Anchor, {
        props: { getContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1', title: 'Link' })]
        }
      })

      await waitFor(() => {
        expect(getContainer).toHaveBeenCalled()
      })
    })

    it('should emit change event when active link is detected on scroll', async () => {
      const onChange = vi.fn()

      render(Anchor, {
        props: {
          getContainer: () => scrollContainer,
          onChange
        },
        slots: {
          default: () => [
            h(AnchorLink, { href: '#section1', title: 'Link 1' }),
            h(AnchorLink, { href: '#section2', title: 'Link 2' })
          ]
        }
      })

      // The scroll handler fires on mount and should detect the initial active link
      await waitFor(() => {
        expect(onChange).toHaveBeenCalled()
      })
    })
  })

  describe('Accessibility', () => {
    it('should render links as anchor elements', () => {
      render(Anchor, {
        props: { getContainer: () => scrollContainer },
        slots: {
          default: () => [
            h(AnchorLink, { href: '#section1', title: 'Section 1' }),
            h(AnchorLink, { href: '#section2', title: 'Section 2' })
          ]
        }
      })

      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(2)
    })

    it('should have correct link text', () => {
      render(Anchor, {
        props: { getContainer: () => scrollContainer },
        slots: {
          default: () => [h(AnchorLink, { href: '#section1', title: 'Go to Section' })]
        }
      })

      const link = screen.getByRole('link', { name: 'Go to Section' })
      expect(link).toBeInTheDocument()
    })
  })
})
