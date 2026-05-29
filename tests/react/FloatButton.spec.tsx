/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { FloatButton, FloatButtonGroup } from '@expcat/tigercat-react'
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
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<FloatButton />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
