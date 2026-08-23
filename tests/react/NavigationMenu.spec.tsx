/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, it, expect, vi } from 'vitest'
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@expcat/tigercat-react/NavigationMenu'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function Demo(props: React.ComponentProps<typeof NavigationMenu>) {
  return (
    <NavigationMenu delayDuration={0} skipDelayDuration={0} {...props}>
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink>Overview</NavigationMenuLink>
            <NavigationMenuLink disabled>Disabled</NavigationMenuLink>
            <NavigationMenuLink>Pricing</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="docs">
          <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink>Guide</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/about">About</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function getPanel(name: 'Products' | 'Docs' = 'Products') {
  const trigger = screen.getByRole('menuitem', { name })
  const controls = trigger.getAttribute('aria-controls')
  if (!controls) {
    return document.querySelector('[data-tiger-navigation-menu-content]')
  }
  return document.getElementById(controls)?.closest('[data-tiger-navigation-menu-content]')
}

describe('NavigationMenu', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a menubar with triggers and a top-level link', () => {
    render(<Demo />)

    expect(screen.getByRole('menubar')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Products' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByText('Overview')).toBeInTheDocument()
  })

  it('keeps panels hidden by default', () => {
    render(<Demo />)
    const wrapper = document.querySelector('[data-tiger-navigation-menu-content]')
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('opens on hover and records data-state', () => {
    render(<Demo />)
    const trigger = screen.getByRole('menuitem', { name: 'Products' })
    expect(trigger).toHaveAttribute('data-state', 'closed')

    fireEvent.mouseEnter(trigger)
    expect(trigger).toHaveAttribute('data-state', 'open')
    expect(getPanel()).not.toHaveAttribute('hidden')
  })

  it('opens on focus and ArrowDown, then restores focus on Escape', async () => {
    render(<Demo />)
    const trigger = screen.getByRole('menuitem', { name: 'Products' })

    fireEvent.focus(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(getPanel()).not.toHaveAttribute('hidden')
    await waitFor(() => {
      expect(document.activeElement).toHaveTextContent('Overview')
    })
  })

  it('moves across top-level items with arrow keys', () => {
    render(<Demo />)
    const products = screen.getByRole('menuitem', { name: 'Products' })
    products.focus()
    fireEvent.keyDown(products, { key: 'ArrowRight' })
    expect(document.activeElement).toHaveTextContent('Docs')

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' })
    expect(document.activeElement).toHaveTextContent('About')
  })

  it('closes on item click, outside click, and Escape', () => {
    render(<Demo defaultValue="products" />)
    expect(getPanel()).not.toHaveAttribute('hidden')

    fireEvent.click(screen.getByText('Overview'))
    expect(getPanel()).toHaveAttribute('hidden')

    fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Products' }))
    fireEvent.click(screen.getByText('Disabled'))
    expect(getPanel()).not.toHaveAttribute('hidden')

    fireEvent.click(document.body)
    expect(getPanel()).toHaveAttribute('hidden')

    fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Products' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(getPanel()).toHaveAttribute('hidden')
  })

  it('does not open when disabled', () => {
    render(<Demo disabled />)
    const trigger = screen.getByRole('menuitem', { name: 'Products' })
    fireEvent.mouseEnter(trigger)
    expect(getPanel()).toHaveAttribute('hidden')
  })

  it('renders open when defaultValue is set', () => {
    render(<Demo defaultValue="products" />)
    expect(getPanel()).not.toHaveAttribute('hidden')
    expect(screen.getByRole('menuitem', { name: 'Products' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })

  it('calls onValueChange and onOpenChange', () => {
    const onValueChange = vi.fn()
    const onOpenChange = vi.fn()
    render(<Demo onValueChange={onValueChange} onOpenChange={onOpenChange} />)
    fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Products' }))
    expect(onValueChange).toHaveBeenCalledWith('products')
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('does not close on item click when closeOnClick is false', () => {
    render(<Demo defaultValue="products" closeOnClick={false} />)
    fireEvent.click(screen.getByText('Overview'))
    expect(getPanel()).not.toHaveAttribute('hidden')
  })

  it('does not dismiss a later keyboard-opened panel after a pending hover close', () => {
    vi.useFakeTimers()
    render(<Demo delayDuration={0} skipDelayDuration={200} />)
    const products = screen.getByRole('menuitem', { name: 'Products' })
    const docs = screen.getByRole('menuitem', { name: 'Docs' })

    fireEvent.mouseEnter(products)
    expect(products).toHaveAttribute('aria-expanded', 'true')

    fireEvent.mouseLeave(products)
    fireEvent.focus(docs)
    fireEvent.keyDown(docs, { key: 'Enter' })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(docs).toHaveAttribute('aria-expanded', 'true')
    expect(products).toHaveAttribute('aria-expanded', 'false')
    expect(getPanel('Docs')).not.toHaveAttribute('hidden')
  })

  it('closes the open panel when focus moves to a top-level link without content', () => {
    render(<Demo defaultValue="products" />)
    const products = screen.getByRole('menuitem', { name: 'Products' })
    const about = screen.getByRole('menuitem', { name: 'About' })
    expect(products).toHaveAttribute('aria-expanded', 'true')

    about.focus()
    fireEvent.focus(about)

    expect(about).toHaveFocus()
    expect(products).toHaveAttribute('aria-expanded', 'false')
    expect(products).not.toHaveAttribute('aria-controls')
    expect(getPanel()).toHaveAttribute('hidden')
  })

  it('closes the open panel when focus leaves the menubar', () => {
    render(
      <>
        <Demo defaultValue="products" />
        <button type="button">Outside</button>
      </>
    )
    const products = screen.getByRole('menuitem', { name: 'Products' })
    const outside = screen.getByRole('button', { name: 'Outside' })
    expect(products).toHaveAttribute('aria-expanded', 'true')

    fireEvent.focusOut(products, { relatedTarget: outside })
    outside.focus()

    expect(outside).toHaveFocus()
    expect(products).toHaveAttribute('aria-expanded', 'false')
    expect(getPanel()).toHaveAttribute('hidden')
  })

  it('moves ArrowDown focus into the matching item panel, not another open panel', async () => {
    render(
      <>
        <Demo defaultValue="products" />
        <Demo />
      </>
    )

    const docsTriggers = screen.getAllByRole('menuitem', { name: 'Docs' })
    const secondDocs = docsTriggers[1]
    secondDocs.focus()
    fireEvent.focus(secondDocs)
    fireEvent.keyDown(secondDocs, { key: 'ArrowDown' })

    await waitFor(() => {
      expect(document.activeElement).toHaveTextContent('Guide')
    })
    expect(document.activeElement).not.toHaveTextContent('Overview')
    expect(screen.getAllByRole('menuitem', { name: 'Products' })[0]).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })

  describe('portal', () => {
    it('renders the panel into document.body by default', () => {
      const { container } = render(<Demo defaultValue="products" />)
      const wrapper = document.querySelector('[data-tiger-navigation-menu-content]')
      expect(wrapper?.closest('[data-tiger-overlay-layer]')?.parentElement).toBe(document.body)
      expect(container.querySelector('[data-tiger-navigation-menu-content]')).toBeNull()
    })

    it('renders the panel in place when portal is false', () => {
      const { container } = render(<Demo defaultValue="products" portal={false} />)
      const wrapper = container.querySelector(
        '.tiger-navigation-menu [data-tiger-navigation-menu-content]'
      )
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).not.toHaveAttribute('hidden')
    })
  })

  describe('a11y', () => {
    it('exposes menubar semantics and aria-expanded on triggers', () => {
      render(<Demo />)
      expect(screen.getByRole('menubar')).toBeInTheDocument()

      const trigger = screen.getByRole('menuitem', { name: 'Products' })
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      fireEvent.mouseEnter(trigger)
      const controlsId = trigger.getAttribute('aria-controls')
      expect(controlsId).toBeTruthy()
      const menu = document.querySelector(`[id="${controlsId}"]`)
      expect(menu).toHaveAttribute('role', 'menu')
    })

    it('should have no accessibility violations', async () => {
      const { container } = render(<Demo defaultValue="products" />)
      await expectNoA11yViolationsIsolated(container, {
        rules: { 'aria-allowed-attr': { enabled: false } }
      })
    })
  })

  describe('className', () => {
    it('merges custom className', () => {
      const { container } = render(<Demo className="my-navigation-menu" />)
      const root = container.querySelector('.tiger-navigation-menu')
      expect(root?.className).toContain('my-navigation-menu')
    })
  })
})
