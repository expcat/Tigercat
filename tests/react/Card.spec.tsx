/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Card } from '@expcat/tigercat-react/Card'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-tiger-card]') as HTMLElement
}

describe('Card', () => {
  it('renders children and merges className', () => {
    const { container } = render(<Card className="custom-class">Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
    expect(getRoot(container).className).toContain('custom-class')
  })

  it('forwards the ref to the root', () => {
    const ref = React.createRef<HTMLElement>()
    const { container } = render(<Card ref={ref}>Body</Card>)
    expect(ref.current).toBe(getRoot(container))
  })

  it('applies size-based padding on the root without a cover', () => {
    const { container: def } = render(<Card>Body</Card>)
    expect(getRoot(def).className).toMatch(/\bp-4\b/)

    const { container: custom } = render(<Card padding="p-8">Body</Card>)
    expect(getRoot(custom).className).toMatch(/\bp-8\b/)
    expect(getRoot(custom).className).not.toMatch(/\bp-4\b/)

    const { container: none } = render(<Card padding={false}>Body</Card>)
    expect(getRoot(none).className).not.toMatch(/\bp-4\b/)
  })

  it('puts cover padding on the body column, not the image', () => {
    const { container } = render(
      <Card cover="https://example.com/cover.jpg" size="md">
        Body
      </Card>
    )
    const cover = container.querySelector('[data-tiger-card-cover]') as HTMLElement
    const body = container.querySelector('[data-tiger-card-body]') as HTMLElement
    expect(getRoot(container).className).not.toMatch(/\bp-4\b/)
    expect(cover.className).not.toMatch(/\bp-4\b/)
    expect(body.className).toMatch(/\bp-4\b/)
    expect(getComputedStyle(cover).padding).toMatch(/^(0px)?$/)
  })

  it('renders header/footer/actions', () => {
    render(
      <Card header="Header" footer="Footer" actions={<button>Action</button>}>
        Body
      </Card>
    )

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('resolves variants as exclusive surfaces', () => {
    const { container: def } = render(<Card variant="default">body</Card>)
    expect(getComputedStyle(getRoot(def)).borderWidth).toBe('1px')

    const { container: bordered } = render(<Card variant="bordered">body</Card>)
    expect(getComputedStyle(getRoot(bordered)).borderWidth).toBe('2px')

    const { container: transparent } = render(<Card variant="transparent">body</Card>)
    expect(getComputedStyle(getRoot(transparent)).backgroundColor).toMatch(
      /transparent|rgba\(0, 0, 0, 0\)/
    )
  })

  it('does not fake a button when hoverable has no click', () => {
    const { container } = render(
      <Card hoverable data-testid="card">
        Content
      </Card>
    )
    const card = getRoot(container)
    expect(card.tagName).toBe('DIV')
    expect(card).not.toHaveAttribute('role')
    expect(card.className).not.toContain('cursor-pointer')
  })

  it('becomes a keyboard control when onClick is set', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    const { container } = render(
      <Card hoverable onClick={onClick} aria-label="Open project">
        Content
      </Card>
    )
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
    render(
      <Card onClick={onClick} actions={<button onClick={onAction}>View</button>}>
        Body
      </Card>
    )
    await user.click(screen.getByRole('button', { name: 'View' }))
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders a decorative cover by default and accepts a node', () => {
    const { container, rerender } = render(<Card cover="https://example.com/image.jpg">Body</Card>)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('alt', '')

    rerender(
      <Card cover={<span data-testid="custom-cover">photo</span>} coverAlt="Custom alt">
        Body
      </Card>
    )
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByTestId('custom-cover')).toBeInTheDocument()
  })

  it('places a horizontal cover at inline-start, including rtl', () => {
    const { container } = render(
      <div dir="rtl">
        <Card direction="horizontal" cover="https://example.com/image.jpg">
          Body
        </Card>
      </div>
    )
    const root = getRoot(container)
    expect(getComputedStyle(root).flexDirection).toBe('row-reverse')
    const cover = container.querySelector('[data-tiger-card-cover]') as HTMLElement
    expect(parseFloat(getComputedStyle(cover).width)).toBe(192)
    expect(root.firstElementChild).toBe(cover)
  })

  it('does not clip inner focus rings', () => {
    const { container } = render(<Card actions={<button>Action</button>}>Body</Card>)
    expect(getComputedStyle(getRoot(container)).overflow).not.toBe('hidden')
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Card>Accessible Card</Card>)
      await expectNoA11yViolationsIsolated(container)
    })

    it('has no a11y violations when clickable with a cover and actions', async () => {
      const { container } = render(
        <Card
          hoverable
          onClick={() => undefined}
          aria-label="Project card"
          cover="https://example.com/cover.jpg"
          actions={<button>View</button>}>
          Body
        </Card>
      )
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
