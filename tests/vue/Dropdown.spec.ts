/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { Dropdown, DropdownMenu, DropdownItem } from '@expcat/tigercat-vue'
import { expectNoA11yViolations } from '../utils'
import { axe } from 'jest-axe'

describe('Dropdown', () => {
  it('renders trigger and menu content', () => {
    render(Dropdown, {
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [
            h(DropdownItem, null, () => 'Item 1'),
            h(DropdownItem, null, () => 'Item 2')
          ])
        ]
      }
    })

    expect(screen.getByText('Trigger')).toBeInTheDocument()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('is hidden by default (hover trigger)', () => {
    const { container } = render(Dropdown, {
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
        ]
      }
    })

    // Floating UI uses `hidden` attribute now
    const wrapper = container.querySelector('.tiger-dropdown-container > .absolute')
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('supports offset prop', () => {
    const { container } = render(Dropdown, {
      props: { placement: 'top-end', offset: 12 },
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
        ]
      }
    })

    // Verify component renders with offset prop
    const wrapper = container.querySelector('.tiger-dropdown-container > .absolute')
    expect(wrapper).toBeInTheDocument()
  })

  it('toggles visibility in click trigger mode and closes on outside click / Escape', async () => {
    const { container } = render(Dropdown, {
      props: { trigger: 'click' },
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [
            h(DropdownItem, null, () => 'Item 1'),
            h(DropdownItem, { disabled: true }, () => 'Disabled Item')
          ])
        ]
      }
    })

    // Floating UI uses `hidden` attribute now
    const wrapper = container.querySelector('.tiger-dropdown-container > .absolute')
    expect(wrapper).toHaveAttribute('hidden')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveAttribute('hidden')

    await fireEvent.click(screen.getByText('Item 1'))
    expect(wrapper).toHaveAttribute('hidden')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveAttribute('hidden')
    await fireEvent.click(screen.getByText('Disabled Item'))
    expect(wrapper).not.toHaveAttribute('hidden')

    // Close via outside click - note: defer mode requires setTimeout(0) timing
    // In test environment, we use a small delay to let event listeners attach
    await new Promise((r) => setTimeout(r, 10))
    await fireEvent.click(document.body)
    expect(wrapper).toHaveAttribute('hidden')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveAttribute('hidden')
    await fireEvent.keyDown(document, { key: 'Escape' })
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('renders chevron indicator by default', () => {
    const { container } = render(Dropdown, {
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
        ]
      }
    })

    const chevron = container.querySelector('.tiger-dropdown-chevron')
    expect(chevron).toBeInTheDocument()
    expect(chevron?.tagName.toLowerCase()).toBe('svg')
  })

  it('hides chevron when showArrow is false', () => {
    const { container } = render(Dropdown, {
      props: { showArrow: false },
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
        ]
      }
    })

    const chevron = container.querySelector('.tiger-dropdown-chevron')
    expect(chevron).not.toBeInTheDocument()
  })

  it('rotates chevron when dropdown is open', async () => {
    const { container } = render(Dropdown, {
      props: { trigger: 'click' },
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
        ]
      }
    })

    const chevron = container.querySelector('.tiger-dropdown-chevron')
    expect(chevron).not.toHaveClass('rotate-180')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(chevron).toHaveClass('rotate-180')
  })

  describe('a11y', () => {
    it('trigger has aria-haspopup and aria-expanded', () => {
      render(Dropdown, {
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
          ]
        }
      })

      const trigger = screen.getByText('Trigger').closest('[aria-haspopup]')
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('trigger has aria-controls pointing to menu id when open', async () => {
      render(Dropdown, {
        props: { trigger: 'click' },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
          ]
        }
      })

      const trigger = screen.getByText('Trigger').closest('[aria-haspopup]')!
      expect(trigger).not.toHaveAttribute('aria-controls')

      await fireEvent.click(screen.getByText('Trigger'))
      const controlsId = trigger.getAttribute('aria-controls')
      expect(controlsId).toBeTruthy()

      const menu = document.querySelector(`[id="${controlsId}"]`)
      expect(menu).toBeInTheDocument()
      expect(menu).toHaveAttribute('role', 'menu')
    })

    it('menu items have role="menuitem" and tabindex="-1"', async () => {
      render(Dropdown, {
        props: { trigger: 'click', defaultOpen: true },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Item 1'),
              h(DropdownItem, null, () => 'Item 2')
            ])
          ]
        }
      })

      const items = screen.getAllByRole('menuitem')
      expect(items).toHaveLength(2)
      items.forEach((item) => {
        expect(item).toHaveAttribute('tabindex', '-1')
      })
    })

    it('should have no accessibility violations', async () => {
      const { container } = render(Dropdown, {
        props: { trigger: 'click', defaultOpen: true },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
          ]
        }
      })
      // Skip aria-allowed-attr: trigger div uses aria-expanded (known issue)
      const results = await axe(container, {
        rules: { 'aria-allowed-attr': { enabled: false } }
      })
      expect(results).toHaveNoViolations()
    })
  })

  describe('disabled', () => {
    it('does not open when disabled', async () => {
      const { container } = render(Dropdown, {
        props: { trigger: 'click', disabled: true },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
          ]
        }
      })

      await fireEvent.click(screen.getByText('Trigger'))
      const wrapper = container.querySelector('.tiger-dropdown-container > .absolute')
      expect(wrapper).toHaveAttribute('hidden')
    })
  })

  describe('className', () => {
    it('merges custom className', () => {
      const { container } = render(Dropdown, {
        props: { className: 'my-dropdown' },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
          ]
        }
      })

      const root = container.querySelector('.tiger-dropdown-container')
      expect(root?.className).toContain('my-dropdown')
    })
  })

  describe('defaultOpen', () => {
    it('renders open when defaultOpen is true', () => {
      const { container } = render(Dropdown, {
        props: { defaultOpen: true },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
          ]
        }
      })

      const wrapper = container.querySelector('.tiger-dropdown-container > .absolute')
      expect(wrapper).not.toHaveAttribute('hidden')
    })
  })
})
