/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { h } from 'vue'
import { SplitButton } from '@expcat/tigercat-vue/SplitButton'
import { DropdownItem } from '@expcat/tigercat-vue/DropdownItem'
import { DropdownMenu } from '@expcat/tigercat-vue/DropdownMenu'
import { expectNoA11yViolationsIsolated } from '../utils'

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
  props: Record<string, unknown> = {},
  slots: Record<string, unknown> = {}
) {
  return render(SplitButton, {
    props,
    slots: {
      default: () => [
        'Save',
        h(DropdownMenu, null, {
          default: () => [
            h(DropdownItem, null, () => 'Save as draft'),
            h(DropdownItem, { divided: true }, () => 'Save and publish')
          ]
        })
      ],
      ...slots
    }
  })
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

    it('accepts DropdownMenu from the menu slot', () => {
      render(SplitButton, {
        slots: {
          default: () => 'Export',
          menu: () =>
            h(DropdownMenu, null, {
              default: () => [h(DropdownItem, null, () => 'CSV')]
            })
        }
      })
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
      expect(screen.getByText('CSV')).toBeInTheDocument()
    })
  })

  describe('primary action vs menu', () => {
    it('fires click on the primary button without opening the menu', async () => {
      const { container, emitted } = renderSplitButton()
      const wrapper = getMenuWrapper()
      expect(wrapper).toHaveAttribute('hidden')

      await userEvent.click(getPrimary(container))
      expect(emitted().click).toHaveLength(1)
      expect(wrapper).toHaveAttribute('hidden')
    })

    it('opens the dropdown from the chevron trigger without firing the primary click', async () => {
      const { container, emitted } = renderSplitButton()
      const wrapper = getMenuWrapper()

      await userEvent.click(getTrigger(container))
      expect(emitted().click).toBeUndefined()
      expect(wrapper).not.toHaveAttribute('hidden')
      expect(getTrigger(container)).toHaveAttribute('aria-expanded', 'true')
    })

    it('keeps primary click separate from menu item selection', async () => {
      const onItem = vi.fn()
      const { container, emitted } = render(SplitButton, {
        slots: {
          default: () => [
            'Save',
            h(DropdownMenu, null, {
              default: () => [h(DropdownItem, { onClick: onItem }, () => 'Draft')]
            })
          ]
        }
      })

      await userEvent.click(getTrigger(container))
      await userEvent.click(screen.getByRole('menuitem', { name: 'Draft' }))
      expect(onItem).toHaveBeenCalledTimes(1)
      expect(emitted().click).toBeUndefined()
    })
  })

  describe('button props', () => {
    it('disables both the primary action and the menu trigger', async () => {
      const { container, emitted } = renderSplitButton({ disabled: true })
      expect(getPrimary(container)).toBeDisabled()
      expect(getTrigger(container)).toBeDisabled()
      await userEvent.click(getPrimary(container))
      await userEvent.click(getTrigger(container))
      expect(emitted().click).toBeUndefined()
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

  describe('attrs integration', () => {
    it('merges attrs class, className, and style onto the root group', () => {
      const { container } = render(SplitButton, {
        props: { className: 'from-prop', style: { color: 'red' } },
        attrs: { class: 'from-attr' },
        slots: {
          default: () => [
            'Save',
            h(DropdownMenu, null, { default: () => [h(DropdownItem, null, () => 'Draft')] })
          ]
        }
      })
      const root = getRoot(container)
      expect(root.className).toContain('from-prop')
      expect(root.className).toContain('from-attr')
      expect(root.className).toContain('tiger-split-button')
      expect(root.style.color).toBe('red')
    })

    it('forwards native attributes onto the root group', () => {
      const { container } = render(SplitButton, {
        attrs: { id: 'save-split', 'aria-label': 'Save actions' },
        slots: {
          default: () => [
            'Save',
            h(DropdownMenu, null, { default: () => [h(DropdownItem, null, () => 'Draft')] })
          ]
        }
      })
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
      const { container } = render(SplitButton, {
        slots: { default: () => 'Save' }
      })
      expect(getPrimary(container)).toHaveTextContent('Save')
      expect(getTrigger(container)).toBeNull()
    })

    it('does not open the menu when the trigger is loading-disabled', async () => {
      const { container } = renderSplitButton({ loading: true })
      await fireEvent.click(getTrigger(container))
      expect(getMenuWrapper()).toHaveAttribute('hidden')
    })
  })
})
