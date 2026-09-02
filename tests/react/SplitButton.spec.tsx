/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { act, render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { SplitButton } from '@expcat/tigercat-react/SplitButton'
import { DropdownItem } from '@expcat/tigercat-react/DropdownItem'
import { DropdownMenu } from '@expcat/tigercat-react/DropdownMenu'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-split-button]') as HTMLElement
}

function getPrimary(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-split-button-primary]') as HTMLElement
}

function getTrigger(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-split-button-trigger]') as HTMLElement
}

function getMenuWrapper(): HTMLElement | null {
  return document.querySelector('[data-tiger-dropdown-menu]')
}

function renderSplitButton(
  props: Partial<React.ComponentProps<typeof SplitButton>> = {},
  menu: React.ReactNode = (
    <DropdownMenu>
      <DropdownItem>Save as draft</DropdownItem>
      <DropdownItem divided>Save and publish</DropdownItem>
    </DropdownMenu>
  )
) {
  return render(
    <SplitButton {...props}>
      Save
      {menu}
    </SplitButton>
  )
}

describe('SplitButton', () => {
  describe('Rendering', () => {
    it('renders a group with a primary action and a chevron trigger', () => {
      const { container } = renderSplitButton()
      const root = getRoot(container)
      expect(root).toHaveAttribute('role', 'group')
      expect(getPrimary(container)).toHaveTextContent('Save')
      expect(getTrigger(container)).toHaveAttribute('aria-label', 'More options')
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'More options' })).toBeInTheDocument()
    })

    it('renders menu items via the existing Dropdown API', () => {
      renderSplitButton()
      expect(screen.getByText('Save as draft')).toBeInTheDocument()
      expect(screen.getByText('Save and publish')).toBeInTheDocument()
    })

    it('accepts DropdownMenu from the menu prop', () => {
      render(
        <SplitButton
          menu={
            <DropdownMenu>
              <DropdownItem>CSV</DropdownItem>
            </DropdownMenu>
          }>
          Export
        </SplitButton>
      )
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
      expect(screen.getByText('CSV')).toBeInTheDocument()
    })
  })

  describe('primary action vs menu', () => {
    it('fires onClick on the primary button without opening the menu', async () => {
      const onClick = vi.fn()
      const { container } = renderSplitButton({ onClick })
      const wrapper = getMenuWrapper()
      expect(wrapper).toHaveAttribute('hidden')

      await userEvent.click(getPrimary(container))
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(wrapper).toHaveAttribute('hidden')
    })

    it('opens the dropdown from the chevron trigger without firing the primary click', async () => {
      const onClick = vi.fn()
      const { container } = renderSplitButton({ onClick })
      const wrapper = getMenuWrapper()

      await userEvent.click(getTrigger(container))
      expect(onClick).not.toHaveBeenCalled()
      expect(wrapper).not.toHaveAttribute('hidden')
      expect(getTrigger(container)).toHaveAttribute('aria-expanded', 'true')
    })

    it('keeps primary click separate from menu item selection', async () => {
      const onClick = vi.fn()
      const onItem = vi.fn()
      const { container } = render(
        <SplitButton onClick={onClick}>
          Save
          <DropdownMenu>
            <DropdownItem onClick={onItem}>Draft</DropdownItem>
          </DropdownMenu>
        </SplitButton>
      )

      await userEvent.click(getTrigger(container))
      await userEvent.click(screen.getByRole('menuitem', { name: 'Draft' }))
      expect(onItem).toHaveBeenCalledTimes(1)
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('button props', () => {
    it('disables both the primary action and the menu trigger', async () => {
      const onClick = vi.fn()
      const { container } = renderSplitButton({ disabled: true, onClick })
      expect(getPrimary(container)).toBeDisabled()
      expect(getTrigger(container)).toBeDisabled()
      await userEvent.click(getPrimary(container))
      await userEvent.click(getTrigger(container))
      expect(onClick).not.toHaveBeenCalled()
      expect(getMenuWrapper()).toHaveAttribute('hidden')
    })

    it('puts the primary action into a loading state without disabling the trigger', () => {
      const { container } = renderSplitButton({ loading: true })
      expect(getPrimary(container)).toHaveAttribute('aria-busy', 'true')
      expect(getPrimary(container)).not.toBeDisabled()
      expect(getTrigger(container)).not.toBeDisabled()
      expect(getTrigger(container)).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('style integration', () => {
    it('merges className and style onto the root group', () => {
      const { container } = renderSplitButton({
        className: 'from-prop',
        style: { color: 'red' }
      })
      const root = getRoot(container)
      expect(root.className).toContain('from-prop')
      expect(root.className).toContain('tiger-split-button')
      expect(root.style.color).toBe('red')
    })

    it('forwards native attributes onto the root group', () => {
      const { container } = render(
        <SplitButton id="save-split" aria-label="Save actions">
          Save
          <DropdownMenu>
            <DropdownItem>Draft</DropdownItem>
          </DropdownMenu>
        </SplitButton>
      )
      const root = getRoot(container)
      expect(root.id).toBe('save-split')
      expect(root).toHaveAttribute('aria-label', 'Save actions')
    })
  })

  describe('a11y', () => {
    it('exposes a primary button and a menu trigger with aria-expanded', async () => {
      const { container } = renderSplitButton()
      const primary = screen.getByRole('button', { name: 'Save' })
      const trigger = screen.getByRole('button', { name: 'More options' })
      expect(primary).toHaveAttribute('data-split-button-primary')
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await userEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expectNoA11yViolationsIsolated(container)
    })

    it('uses a custom trigger aria-label', () => {
      renderSplitButton({ triggerAriaLabel: 'More save options' })
      expect(screen.getByRole('button', { name: 'More save options' })).toBeInTheDocument()
    })

    it('passes a11y checks when disabled', async () => {
      const { container } = renderSplitButton({ disabled: true })
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('boundary', () => {
    it('does not render the chevron trigger when no menu is provided', () => {
      const { container } = render(<SplitButton>Save</SplitButton>)
      expect(getPrimary(container)).toHaveTextContent('Save')
      expect(getTrigger(container)).toBeNull()
    })

    it('does not open the menu when the trigger is loading-disabled', () => {
      const { container } = renderSplitButton({ loading: true })
      act(() => {
        fireEvent.click(getTrigger(container))
      })
      expect(getMenuWrapper()).toHaveAttribute('hidden')
    })
  })
})
