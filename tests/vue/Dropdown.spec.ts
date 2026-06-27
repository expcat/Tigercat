/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { Dropdown, DropdownMenu, DropdownItem } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

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

  it('exposes data-state on the trigger reflecting open state', async () => {
    const { container } = render(Dropdown, {
      props: { trigger: 'click' },
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
        ]
      }
    })

    const trigger = container.querySelector('[data-state]')
    expect(trigger).toHaveAttribute('data-state', 'closed')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(trigger).toHaveAttribute('data-state', 'open')
  })

  it('passes open state to the #trigger scoped slot', async () => {
    const { container } = render(Dropdown, {
      props: { trigger: 'click' },
      slots: {
        trigger: (p: { open: boolean }) => h('button', null, `open:${p.open}`),
        default: () => [h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])]
      }
    })

    expect(screen.getByText('open:false')).toBeInTheDocument()
    await fireEvent.click(container.querySelector('[data-state]') as HTMLElement)
    expect(screen.getByText('open:true')).toBeInTheDocument()
  })

  it('is hidden by default (hover trigger)', () => {
    render(Dropdown, {
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
        ]
      }
    })

    // Floating UI uses `hidden` attribute now
    const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('supports offset prop', () => {
    render(Dropdown, {
      props: { placement: 'top-end', offset: 12 },
      slots: {
        default: () => [
          h('button', null, 'Trigger'),
          h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
        ]
      }
    })

    // Verify component renders with offset prop
    const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
    expect(wrapper).toBeInTheDocument()
  })

  it('toggles visibility in click trigger mode and closes on outside click / Escape', async () => {
    render(Dropdown, {
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
    const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
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
      await expectNoA11yViolationsIsolated(container, {
        rules: { 'aria-allowed-attr': { enabled: false } }
      })
    })
  })

  describe('disabled', () => {
    it('does not open when disabled', async () => {
      render(Dropdown, {
        props: { trigger: 'click', disabled: true },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
          ]
        }
      })

      await fireEvent.click(screen.getByText('Trigger'))
      const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
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
      render(Dropdown, {
        props: { defaultOpen: true },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
          ]
        }
      })

      const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
      expect(wrapper).not.toHaveAttribute('hidden')
    })
  })
  describe('portal', () => {
    it('renders the menu into document.body by default', () => {
      const { container } = render(Dropdown, {
        props: { defaultOpen: true },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
          ]
        }
      })

      const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
      expect(wrapper?.parentElement).toBe(document.body)
      expect(container.querySelector('[data-tiger-dropdown-menu]')).toBeNull()
    })

    it('renders the menu in place when portal is false', () => {
      const { container } = render(Dropdown, {
        props: { defaultOpen: true, portal: false },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
          ]
        }
      })

      const wrapper = container.querySelector(
        '.tiger-dropdown-container [data-tiger-dropdown-menu]'
      )
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).not.toHaveAttribute('hidden')
    })
  })

  describe('Edge Cases', () => {
    it('does not close on item click when closeOnClick is false', async () => {
      render(Dropdown, {
        props: { trigger: 'click', closeOnClick: false },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
          ]
        }
      })

      const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
      await fireEvent.click(screen.getByText('Trigger'))
      expect(wrapper).not.toHaveAttribute('hidden')

      await fireEvent.click(screen.getByText('Item 1'))
      expect(wrapper).not.toHaveAttribute('hidden')
    })

    it('closes on item click after closeOnClick is toggled from false to true', async () => {
      const { rerender } = render(Dropdown, {
        props: { trigger: 'click', closeOnClick: false },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
          ]
        }
      })

      const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
      await fireEvent.click(screen.getByText('Trigger'))
      await fireEvent.click(screen.getByText('Item 1'))
      expect(wrapper).not.toHaveAttribute('hidden')

      // Reactively flip closeOnClick to true; the item must see the live value
      await rerender({ trigger: 'click', closeOnClick: true })
      await fireEvent.click(screen.getByText('Item 1'))
      expect(wrapper).toHaveAttribute('hidden')
    })

    it('emits open-change event', async () => {
      const { emitted } = render(Dropdown, {
        props: { trigger: 'click' },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
          ]
        }
      })

      await fireEvent.click(screen.getByText('Trigger'))
      expect(emitted()['open-change']?.[0]).toEqual([true])

      await fireEvent.click(screen.getByText('Trigger'))
      expect(emitted()['open-change']?.[1]).toEqual([false])
    })

    it('emits update:open event', async () => {
      const { emitted } = render(Dropdown, {
        props: { trigger: 'click' },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
          ]
        }
      })

      await fireEvent.click(screen.getByText('Trigger'))
      expect(emitted()['update:open']?.[0]).toEqual([true])
    })

    it('renders disabled item with aria-disabled', () => {
      render(Dropdown, {
        props: { defaultOpen: true },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [h(DropdownItem, { disabled: true }, () => 'Disabled')])
          ]
        }
      })

      const item = screen.getByText('Disabled').closest('[role="menuitem"]')
      expect(item).toHaveAttribute('aria-disabled', 'true')
    })

    it('updates aria-expanded when toggling', async () => {
      render(Dropdown, {
        props: { trigger: 'click' },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
          ]
        }
      })

      const trigger = screen.getByText('Trigger').closest('[aria-haspopup]')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await fireEvent.click(screen.getByText('Trigger'))
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      await fireEvent.click(screen.getByText('Trigger'))
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('renders with empty DropdownMenu', () => {
      const { container } = render(Dropdown, {
        slots: {
          default: () => [h('button', null, 'Trigger'), h(DropdownMenu, null, () => [])]
        }
      })

      expect(container.querySelector('.tiger-dropdown-container')).toBeInTheDocument()
    })
  })
})
