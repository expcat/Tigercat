/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { Comment, Fragment, h } from 'vue'
import { Card } from '@expcat/tigercat-vue/Card'
import { Input } from '@expcat/tigercat-vue/Input'
import { expectNoA11yViolationsIsolated } from '../utils'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-tiger-card]') as HTMLElement
}

describe('Card', () => {
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
    expect(getRoot(def).className).toContain('border')
    expect(getRoot(def).className).not.toContain('border-2')

    const { container: bordered } = render(Card, {
      props: { variant: 'bordered' },
      slots: { default: 'body' }
    })
    expect(getRoot(bordered).className).toContain('border-2')

    const { container: transparent } = render(Card, {
      props: { variant: 'transparent' },
      slots: { default: 'body' }
    })
    expect(getRoot(transparent).className).toContain('bg-transparent')
    expect(getRoot(transparent).className).toContain('border-0')
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
      slots: { default: () => h('span', 'Content') }
    })
    const card = getRoot(container)
    expect(card).toHaveAttribute('role', 'button')
    expect(card.tabIndex).toBe(0)
    await fireEvent.keyDown(screen.getByText('Content'), { key: 'Enter' })
    await fireEvent.keyDown(screen.getByText('Content'), { key: ' ' })
    expect(onClick).not.toHaveBeenCalled()
    card.focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('keeps the title heading inside a separate link beside controls', async () => {
    const { container } = render(Card, {
      props: { href: '/project', title: 'Project', titleLevel: 4 },
      slots: { default: () => h('button', 'Action') }
    })
    const link = screen.getByRole('link', { name: 'Project' })
    expect(link).toContainElement(screen.getByRole('heading', { level: 4, name: 'Project' }))
    expect(link).not.toContainElement(screen.getByRole('button', { name: 'Action' }))
    await expectNoA11yViolationsIsolated(container)
  })

  it.each([
    ['text', () => 'Project', 'Project'],
    ['heading', () => h('h3', 'Project'), 'Project'],
    ['unnamed node', () => h('span', { 'aria-hidden': true }, 'Decoration'), '/project']
  ] as const)('names the separate link from a %s header slot', async (_, header, name) => {
    const { container } = render(Card, {
      props: { href: '/project' },
      slots: { header, default: () => h('button', 'Action') }
    })
    expect(screen.getByRole('link', { name })).toBeInTheDocument()
    await expectNoA11yViolationsIsolated(container)
  })

  it.each([
    ['library', () => h(Input, { 'aria-label': 'Project name' })],
    ['native', () => h('input', { 'aria-label': 'Project name' })]
  ] as const)('keeps %s input events independent of the card', async (_, inputNode) => {
    const onClick = vi.fn()
    const { container } = render(Card, {
      attrs: { onClick },
      slots: { default: inputNode }
    })
    const input = screen.getByRole('textbox', { name: 'Project name' })
    await fireEvent.keyDown(input, { key: 'Enter' })
    await fireEvent.keyDown(input, { key: ' ' })
    await fireEvent.click(input)
    expect(onClick).not.toHaveBeenCalled()
    expect(getRoot(container)).not.toHaveAttribute('role')
    expect(getRoot(container)).not.toHaveAttribute('tabindex')
    await expectNoA11yViolationsIsolated(container)
  })

  it('keeps a library input outside the navigation link', async () => {
    const { container } = render(Card, {
      props: { href: '/project', title: 'Project' },
      slots: { default: () => h(Input, { 'aria-label': 'Project name' }) }
    })
    expect(getRoot(container).tagName).toBe('DIV')
    expect(screen.getByRole('link', { name: 'Project' })).not.toContainElement(
      screen.getByRole('textbox', { name: 'Project name' })
    )
    await expectNoA11yViolationsIsolated(container)
  })

  it('keeps the padded content column beside a horizontal cover and separate link', () => {
    const { container } = render(Card, {
      props: { href: '/project', title: 'Project', cover: '/cover.jpg', orientation: 'horizontal' },
      slots: { default: () => h('button', 'Action') }
    })
    const body = container.querySelector('[data-tiger-card-body]')
    expect(body).toHaveClass('p-4')
    expect(body).toContainElement(screen.getByRole('button', { name: 'Action' }))
  })

  it.each([
    ['false', () => false],
    ['empty array', () => []],
    ['empty Fragment', () => h(Fragment, [])],
    ['comment in Fragment', () => h(Fragment, [h(Comment)])]
  ] as const)('ignores %s actions without disabling activation', async (_, actions) => {
    const onClick = vi.fn()
    const { container } = render(Card, {
      attrs: { onClick },
      slots: { default: 'Body', actions }
    })
    const card = getRoot(container)
    expect(container.querySelector('.tiger-card-actions')).toBeNull()
    expect(card).toHaveAttribute('role', 'button')
    expect(card.tabIndex).toBe(0)
    await fireEvent.keyDown(card, { key: 'Enter' })
    await fireEvent.keyDown(card, { key: ' ' })
    await fireEvent.click(card)
    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it('omits the cover shell for a conditionally empty slot', () => {
    const { container } = render(Card, {
      slots: { default: 'Body', cover: () => false }
    })
    expect(container.querySelector('[data-tiger-card-cover]')).toBeNull()
    expect(getRoot(container)).toHaveClass('p-4')
  })

  it('preserves numeric zero actions and cover content', () => {
    const { container } = render(Card, {
      attrs: { onClick: vi.fn() },
      slots: { default: 'Body', actions: () => 0, cover: () => 0 }
    })
    expect(container.querySelector('.tiger-card-actions')).toHaveTextContent('0')
    expect(container.querySelector('[data-tiger-card-cover]')).toHaveTextContent('0')
    expect(getRoot(container)).not.toHaveAttribute('role')
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
        '<div dir="rtl"><Card orientation="horizontal" cover="https://example.com/image.jpg">Body</Card></div>',
      components: { Card }
    })
    const root = getRoot(container)
    expect(root.className).toContain('tiger-flex-row')
    expect(root.className).not.toContain('flex-row-reverse')
    const cover = container.querySelector('[data-tiger-card-cover]') as HTMLElement
    expect(cover.className).toContain('tiger-card-cover-horizontal')
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
