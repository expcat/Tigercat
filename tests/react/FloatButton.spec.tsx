/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { floatButtonPlusIconPath } from '@expcat/tigercat-core'
import { FloatButton, FloatButtonGroup } from '@expcat/tigercat-react/FloatButton'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('FloatButton (React)', () => {
  describe('Rendering', () => {
    it('renders a button element', () => {
      render(<FloatButton>Click</FloatButton>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(<FloatButton>Action</FloatButton>)
      expect(screen.getByText('Action')).toBeInTheDocument()
    })

    it('renders a plus SVG when children are omitted', () => {
      const { container } = render(<FloatButton />)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(svg?.querySelector('path')?.getAttribute('d')).toBe(floatButtonPlusIconPath)
    })

    it('does not render the plus path when children are provided', () => {
      const { container } = render(<FloatButton>Action</FloatButton>)
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(container.querySelector('path')?.getAttribute('d')).not.toBe(floatButtonPlusIconPath)
    })

    it('has type="button"', () => {
      render(<FloatButton />)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('applies circle shape class by default', () => {
      render(<FloatButton />)
      expect(screen.getByRole('button').className).toContain('rounded-full')
    })

    it('applies square shape class', () => {
      render(<FloatButton shape="square" />)
      expect(screen.getByRole('button').className).toContain('rounded-')
      expect(screen.getByRole('button').className).not.toContain('rounded-full')
    })
  })

  describe('Tooltip', () => {
    it('sets title from tooltip prop', () => {
      render(<FloatButton tooltip="Help" />)
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Help')
    })

    it('uses tooltip as aria-label when ariaLabel is not set', () => {
      render(<FloatButton tooltip="Help" />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Help')
    })

    it('uses ariaLabel over tooltip for aria-label', () => {
      render(<FloatButton tooltip="Help" ariaLabel="Custom" />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom')
    })
  })

  describe('Disabled', () => {
    it('sets disabled attribute', () => {
      render(<FloatButton disabled />)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('does not call onClick when disabled', async () => {
      const onClick = vi.fn()
      render(<FloatButton disabled onClick={onClick} />)
      await fireEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })

    it('calls onClick when enabled', async () => {
      const onClick = vi.fn()
      render(<FloatButton onClick={onClick} />)
      await fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Type variants', () => {
    it('applies primary type classes by default', () => {
      render(<FloatButton />)
      expect(screen.getByRole('button').className).toContain('bg-')
    })

    it('applies default type classes', () => {
      render(<FloatButton type="default" />)
      expect(screen.getByRole('button').className).toContain('bg-')
    })
  })

  describe('className', () => {
    it('merges className prop', () => {
      render(<FloatButton className="my-btn" />)
      expect(screen.getByRole('button')).toHaveClass('my-btn')
    })

    it('does not apply fixed positioning by default', () => {
      render(<FloatButton />)
      expect(screen.getByRole('button')).not.toHaveClass('fixed')
    })

    it('supports standalone floating placement', () => {
      render(<FloatButton floating placement="bottom-left" offset={{ x: 32, y: '3rem' }} />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('fixed')
      expect(button).toHaveClass('bottom-0')
      expect(button).toHaveClass('left-0')
      expect(button.style.left).toBe('32px')
      expect(button.style.bottom).toBe('3rem')
    })
  })
})

describe('FloatButtonGroup (React)', () => {
  it('renders trigger node', () => {
    render(
      <FloatButtonGroup triggerNode={<button>Open</button>}>
        <button>Child</button>
      </FloatButtonGroup>
    )
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('does not show children when closed', () => {
    render(
      <FloatButtonGroup triggerNode={<button>Open</button>}>
        <button>Child</button>
      </FloatButtonGroup>
    )
    expect(screen.queryByText('Child')).not.toBeInTheDocument()
  })

  it('shows children when open is true', () => {
    render(
      <FloatButtonGroup open triggerNode={<button>Open</button>}>
        <button>Child</button>
      </FloatButtonGroup>
    )
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  it('toggles on trigger click', async () => {
    const onOpenChange = vi.fn()
    render(
      <FloatButtonGroup
        trigger="click"
        triggerNode={<button>Toggle</button>}
        onOpenChange={onOpenChange}>
        <button>Child</button>
      </FloatButtonGroup>
    )
    await fireEvent.click(screen.getByText('Toggle'))
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('opens on hover when trigger=hover', async () => {
    const onOpenChange = vi.fn()
    const { container } = render(
      <FloatButtonGroup
        trigger="hover"
        triggerNode={<button>Hover</button>}
        onOpenChange={onOpenChange}>
        <button>Child</button>
      </FloatButtonGroup>
    )
    const group = container.querySelector('[class]')
    if (group) {
      await fireEvent.mouseEnter(group)
      expect(onOpenChange).toHaveBeenCalledWith(true)
    }
  })

  it('merges className prop', () => {
    render(
      <FloatButtonGroup open className="custom-group">
        <button>A</button>
      </FloatButtonGroup>
    )
    const group = document.querySelector('.custom-group')
    expect(group).toBeInTheDocument()
  })

  it('portals to document.body as fixed when portal is omitted', () => {
    render(
      <FloatButtonGroup className="portal-default-group" triggerNode={<button>Open</button>} />
    )
    const group = document.body.querySelector('.portal-default-group')
    expect(group).toBeTruthy()
    expect(group).toHaveClass('fixed')
    expect(group?.parentElement).toBe(document.body)
  })

  it('renders in place with absolute when portal is false', () => {
    const { container } = render(
      <div className="relative" data-testid="shell">
        <FloatButtonGroup
          portal={false}
          className="in-place-group"
          triggerNode={<button>Open</button>}
        />
      </div>
    )
    const shell = container.querySelector('[data-testid="shell"]')
    const group = shell?.querySelector('.in-place-group')
    expect(group).toBeTruthy()
    expect(group).toHaveClass('absolute')
    expect(group).not.toHaveClass('fixed')
    expect(group?.parentElement).not.toBe(document.body)
  })

  it('applies placement and offset styles', () => {
    render(
      <FloatButtonGroup
        portal={false}
        placement="bottom-left"
        offset={{ x: 32, y: '3rem' }}
        className="placed-group"
        triggerNode={<button>Open</button>}
      />
    )
    const group = document.querySelector('.placed-group') as HTMLElement | null
    expect(group).toHaveClass('bottom-0')
    expect(group).toHaveClass('left-0')
    expect(group?.style.left).toBe('32px')
    expect(group?.style.bottom).toBe('3rem')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<FloatButton />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
