/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Card } from '@expcat/tigercat-vue'
import { expectNoA11yViolations } from '../utils'

describe('Card', () => {
  it('renders default slot content', () => {
    render(Card, {
      slots: {
        default: 'Card content'
      }
    })

    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders header/footer/actions slots', () => {
    render(Card, {
      slots: {
        header: 'Header',
        default: 'Body',
        footer: 'Footer',
        actions: '<button>Action</button>'
      }
    })

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('merges props.className with attrs.class and forwards attrs', () => {
    const { container } = render(Card, {
      props: {
        className: 'from-props'
      },
      attrs: {
        id: 'card-id',
        class: 'from-attrs',
        'data-testid': 'card'
      },
      slots: {
        default: 'Body'
      }
    })

    const root = container.querySelector('#card-id')
    expect(root).toBeInTheDocument()
    expect(root?.className).toContain('from-props')
    expect(root?.className).toContain('from-attrs')
    expect(screen.getByTestId('card')).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    const variants = [
      { variant: 'default', expected: 'border ' },
      { variant: 'bordered', expected: 'border-2' },
      { variant: 'shadow', expected: 'shadow-md' },
      { variant: 'elevated', expected: 'shadow-lg' }
    ] as const

    for (const { variant, expected } of variants) {
      const { container, unmount } = render(Card, {
        props: { variant },
        slots: { default: 'body' }
      })
      expect(container.firstElementChild?.className).toContain(expected)
      unmount()
    }
  })

  it('applies size classes', () => {
    const sizes = [
      { size: 'sm', expected: 'p-3' },
      { size: 'md', expected: 'p-4' },
      { size: 'lg', expected: 'p-6' }
    ] as const

    for (const { size, expected } of sizes) {
      const { container, unmount } = render(Card, {
        props: { size },
        slots: { default: 'body' }
      })
      expect(container.firstElementChild?.className).toContain(expected)
      unmount()
    }
  })

  it('supports hoverable', () => {
    const { container } = render(Card, {
      props: {
        hoverable: true
      },
      slots: {
        default: 'Hoverable'
      }
    })

    expect(container.firstElementChild?.className).toContain('cursor-pointer')
  })

  it('renders cover image with default and custom alt', async () => {
    const { container, rerender } = render(Card, {
      props: {
        cover: 'https://example.com/image.jpg'
      },
      slots: {
        default: 'Body'
      }
    })

    expect(container.querySelector('img')).toHaveAttribute('alt', 'Card cover image')

    await rerender({
      cover: 'https://example.com/image.jpg',
      coverAlt: 'Custom alt'
    })
    expect(container.querySelector('img')).toHaveAttribute('alt', 'Custom alt')
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Card, {
        slots: {
          default: 'Accessible Card'
        }
      })

      await expectNoA11yViolations(container)
    })
  })
})
