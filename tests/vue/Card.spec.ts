/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { h } from 'vue'
import { Card } from '@expcat/tigercat-vue/Card'
import { expectNoA11yViolationsIsolated } from '../utils'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-tiger-card]') as HTMLElement
}

describe('Card', () => {
  it('applies size-based padding by default', () => {
    const { container } = render(Card, { slots: { default: 'Body' } })
    expect(getRoot(container).className).toMatch(/\bp-4\b/)
  })

  it('overrides padding with a custom class', () => {
    const { container } = render(Card, {
      props: { padding: 'p-8' },
      slots: { default: 'Body' }
    })
    expect(getRoot(container).className).toMatch(/\bp-8\b/)
    expect(getRoot(container).className).not.toMatch(/\bp-4\b/)
  })

  it('removes padding when padding is false', () => {
    const { container } = render(Card, {
      props: { padding: false },
      slots: { default: 'Body' }
    })
    expect(getRoot(container).className).not.toMatch(/\bp-4\b/)
  })

  it('puts cover padding on the body column, not the image', () => {
    const { container } = render(Card, {
      props: { cover: 'https://example.com/cover.jpg', size: 'md' },
      slots: { default: 'Body' }
    })
    const cover = container.querySelector('[data-tiger-card-cover]') as HTMLElement
    const body = container.querySelector('[data-tiger-card-body]') as HTMLElement
    expect(getRoot(container).className).not.toMatch(/\bp-4\b/)
    expect(cover.className).not.toMatch(/\bp-4\b/)
    expect(body.className).toMatch(/\bp-4\b/)
  })

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

  it('resolves variants as exclusive surfaces', () => {
    const { container: def } = render(Card, {
      props: { variant: 'default' },
      slots: { default: 'body' }
    })
    expect(getComputedStyle(getRoot(def)).borderWidth).toBe('1px')

    const { container: bordered } = render(Card, {
      props: { variant: 'bordered' },
      slots: { default: 'body' }
    })
    expect(getComputedStyle(getRoot(bordered)).borderWidth).toBe('2px')

    const { container: transparent } = render(Card, {
      props: { variant: 'transparent' },
      slots: { default: 'body' }
    })
    expect(getComputedStyle(getRoot(transparent)).backgroundColor).toMatch(
      /transparent|rgba\(0, 0, 0, 0\)/
    )
  })

  it('does not fake a button when hoverable has no click', () => {
    const { container } = render(Card, {
      props: { hoverable: true },
      slots: { default: 'Hoverable' }
    })
    const card = getRoot(container)
    expect(card.tagName).toBe('DIV')
    expect(card).not.toHaveAttribute('role')
    expect(card.className).not.toContain('cursor-pointer')
  })

  it('becomes a keyboard control when onClick is set', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    const { container } = render(Card, {
      props: { hoverable: true },
      attrs: { onClick, 'aria-label': 'Open project' },
      slots: { default: 'Content' }
    })
    const card = getRoot(container)
    expect(card).toHaveAttribute('role', 'button')
    expect(card.tabIndex).toBe(0)
    card.focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire the card click from nested actions', async () => {
    const onClick = vi.fn()
    const onAction = vi.fn()
    const user = userEvent.setup()
    render(Card, {
      attrs: { onClick },
      slots: {
        default: 'Body',
        actions: () => h('button', { onClick: onAction }, 'View')
      }
    })
    await user.click(screen.getByRole('button', { name: 'View' }))
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders a decorative cover by default', () => {
    const { container } = render(Card, {
      props: { cover: 'https://example.com/image.jpg' },
      slots: { default: 'Body' }
    })
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('renders the cover slot instead of the URL image', () => {
    const { container } = render(Card, {
      props: { cover: 'https://example.com/image.jpg' },
      slots: {
        default: 'Body',
        cover: () => h('span', { 'data-testid': 'custom-cover' }, 'photo')
      }
    })
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByTestId('custom-cover')).toBeInTheDocument()
  })

  it('places a horizontal cover at inline-start, including rtl', () => {
    const { container } = render({
      template:
        '<div dir="rtl"><Card direction="horizontal" cover="https://example.com/image.jpg">Body</Card></div>',
      components: { Card }
    })
    const root = getRoot(container)
    expect(getComputedStyle(root).flexDirection).toBe('row-reverse')
    const cover = container.querySelector('[data-tiger-card-cover]') as HTMLElement
    expect(parseFloat(getComputedStyle(cover).width)).toBe(192)
    expect(root.firstElementChild).toBe(cover)
  })

  it('does not clip inner focus rings', () => {
    const { container } = render(Card, {
      slots: { default: 'Body', actions: '<button>Action</button>' }
    })
    expect(getComputedStyle(getRoot(container)).overflow).not.toBe('hidden')
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Card, {
        slots: {
          default: 'Accessible Card'
        }
      })

      await expectNoA11yViolationsIsolated(container)
    })

    it('has no a11y violations when clickable with a cover and actions', async () => {
      const { container } = render(Card, {
        props: { hoverable: true, cover: 'https://example.com/cover.jpg' },
        attrs: { onClick: () => undefined, 'aria-label': 'Project card' },
        slots: {
          default: 'Body',
          actions: '<button>View</button>'
        }
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
