/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import { Dropdown, DropdownItem, DropdownMenu } from '@expcat/tigercat-vue/Dropdown'
import { expectNoA11yViolations } from '../utils'

function dropdownMenu(): HTMLElement | null {
  return document.querySelector('[data-tiger-dropdown-menu]')
}

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
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Item 2')).not.toBeInTheDocument()
  })

  it('keeps a disabled child button disabled', () => {
    for (const disabled of [true, ''] as const) {
      const view = render(Dropdown, {
        slots: {
          default: () => [
            h('button', { disabled: disabled as boolean }, 'Unavailable'),
            h(DropdownMenu, null, () => h(DropdownItem, null, () => 'Item 1'))
          ]
        }
      })

      expect(view.getByRole('button', { name: 'Unavailable' })).toBeDisabled()
      view.unmount()
    }
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

    expect(document.querySelector('[data-tiger-dropdown-menu]')).toBeNull()
  })

  it('supports offset prop', () => {
    render(Dropdown, {
      props: { placement: 'top-end', offset: 12, defaultOpen: true },
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

    const menu = () => document.querySelector('[data-tiger-dropdown-menu]')
    expect(menu()).toBeNull()

    await fireEvent.click(screen.getByText('Trigger'))
    expect(menu()).toBeTruthy()

    await fireEvent.click(screen.getByText('Item 1'))
    expect(menu()).toBeNull()

    await fireEvent.click(screen.getByText('Trigger'))
    expect(menu()).toBeTruthy()
    await fireEvent.click(screen.getByText('Disabled Item'))
    expect(menu()).toBeTruthy()

    await new Promise((r) => setTimeout(r, 10))
    await fireEvent.click(document.body)
    expect(menu()).toBeNull()

    await fireEvent.click(screen.getByText('Trigger'))
    expect(menu()).toBeTruthy()
    await fireEvent.keyDown(document, { key: 'Escape' })
    expect(menu()).toBeNull()
  })

  it('renders chevron indicator by default on a self-rendered button', () => {
    const { container } = render(Dropdown, {
      slots: {
        default: () => [
          'Trigger',
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
          'Trigger',
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

      const trigger = screen.getByRole('button', { name: 'Trigger' })
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(document.querySelectorAll('[aria-haspopup]')).toHaveLength(1)
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

      const trigger = screen.getByRole('button', { name: 'Trigger' })
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

    it('should have no accessibility violations when open', async () => {
      render(Dropdown, {
        props: { trigger: 'click', defaultOpen: true },
        slots: {
          default: () => [
            'Trigger',
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Item 1'),
              h(DropdownItem, { disabled: true }, () => 'Item 2')
            ])
          ]
        }
      })
      await expectNoA11yViolations(screen.getByRole('menu'))
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
      expect(dropdownMenu()).toBeNull()
    })
  })

  it('opens a hover menu on focus and stays closed after Escape restores focus', async () => {
    render(Dropdown, {
      props: { trigger: 'hover', portal: false, items: [{ key: 'a', label: 'Action' }] },
      slots: { default: () => h('button', null, 'Trigger') }
    })

    const trigger = screen.getByRole('button', { name: 'Trigger' })
    trigger.focus()
    await nextTick()
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(trigger).toHaveFocus()
    await fireEvent.click(trigger)
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    const action = screen.getByRole('menuitem', { name: 'Action' })
    await waitFor(() => expect(action).toHaveFocus())
    await fireEvent.keyDown(action, { key: 'Escape' })
    expect(trigger).toHaveFocus()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
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

  describe('dynamic class', () => {
    it('updates Dropdown class from attr-before to attr-after', async () => {
      const rootClass = ref('attr-before')
      const { container } = render(
        defineComponent({
          setup() {
            return () =>
              h(
                Dropdown,
                { class: rootClass.value },
                {
                  default: () => [
                    h('button', null, 'Trigger'),
                    h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
                  ]
                }
              )
          }
        })
      )

      const root = container.querySelector('.tiger-dropdown-container')
      expect(root?.className).toContain('attr-before')
      rootClass.value = 'attr-after'
      await nextTick()
      expect(root?.className).toContain('attr-after')
      expect(root?.className).not.toContain('attr-before')
    })

    it('updates DropdownItem class from attr-before to attr-after', async () => {
      const itemClass = ref('attr-before')
      render(
        defineComponent({
          setup() {
            return () =>
              h(
                Dropdown,
                { defaultOpen: true },
                {
                  default: () => [
                    h('button', null, 'Trigger'),
                    h(DropdownMenu, null, () => [
                      h(DropdownItem, { class: itemClass.value }, () => 'Item 1')
                    ])
                  ]
                }
              )
          }
        })
      )

      const item = screen.getByRole('menuitem', { name: 'Item 1' })
      expect(item.className).toContain('attr-before')
      itemClass.value = 'attr-after'
      await nextTick()
      expect(item.className).toContain('attr-after')
      expect(item.className).not.toContain('attr-before')
    })

    it('updates DropdownMenu class from attr-before to attr-after', async () => {
      const menuClass = ref('attr-before')
      render(
        defineComponent({
          setup() {
            return () =>
              h(
                Dropdown,
                { defaultOpen: true },
                {
                  default: () => [
                    h('button', null, 'Trigger'),
                    h(DropdownMenu, { class: menuClass.value }, () => [
                      h(DropdownItem, null, () => 'Item 1')
                    ])
                  ]
                }
              )
          }
        })
      )

      const menu = screen.getByRole('menu')
      expect(menu.className).toContain('attr-before')
      menuClass.value = 'attr-after'
      await nextTick()
      expect(menu.className).toContain('attr-after')
      expect(menu.className).not.toContain('attr-before')
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
      expect(wrapper?.closest('[data-tiger-overlay-layer]')?.parentElement).toBe(document.body)
      expect(container.querySelector('[data-tiger-dropdown-menu]')).toBeNull()
    })

    it('renders the menu into the nearest overlay-host', async () => {
      const { getByTestId } = render({
        setup() {
          return () =>
            h('div', { 'data-tiger-overlay-layer': '' }, [
              h(Dropdown, { defaultOpen: true }, () => [
                h('button', null, 'Trigger'),
                h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
              ]),
              h('div', { 'data-tiger-overlay-host': '', 'data-testid': 'overlay-host' })
            ])
        }
      })

      await waitFor(() => {
        const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
        expect(wrapper?.closest('[data-tiger-overlay-layer]')?.parentElement).toBe(
          getByTestId('overlay-host')
        )
      })
    })

    it('renders the menu into the ConfigProvider root when there is no overlay-host', async () => {
      const { getByTestId } = render({
        setup() {
          return () =>
            h('div', { 'data-tiger-config-root': '', 'data-testid': 'config-root' }, [
              h(Dropdown, { defaultOpen: true }, () => [
                h('button', null, 'Trigger'),
                h(DropdownMenu, null, () => [h(DropdownItem, null, () => 'Item 1')])
              ])
            ])
        }
      })

      await waitFor(() => {
        const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
        expect(wrapper?.closest('[data-tiger-overlay-layer]')?.parentElement).toBe(
          getByTestId('config-root')
        )
      })
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
    it('honors closeOnClick false for schema actions without closing checkbox or radio items', async () => {
      const { emitted } = render(Dropdown, {
        props: {
          defaultOpen: true,
          portal: false,
          closeOnClick: false,
          items: [
            { key: 'a', label: 'Action' },
            { key: 'c', type: 'checkbox', label: 'Check', checked: false },
            { key: 'r', type: 'radio', label: 'Radio', group: 'group', checked: false }
          ]
        },
        slots: { default: () => 'Trigger' }
      })

      await fireEvent.click(screen.getByRole('menuitem', { name: 'Action' }))
      expect(emitted().select?.[0]).toEqual([{ key: 'a', label: 'Action' }])
      expect(screen.getByRole('menu')).toBeInTheDocument()
      await fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Check' }))
      await fireEvent.click(screen.getByRole('menuitemradio', { name: 'Radio' }))
      expect(emitted().check).toEqual([
        [{ key: 'c', checked: true }],
        [{ key: 'r', checked: true, group: 'group' }]
      ])
      expect(screen.getByRole('menu')).toBeInTheDocument()
      expect(emitted()['open-change']).toBeUndefined()
    })

    it('keeps disabled schema submenus disabled and closed', async () => {
      render(Dropdown, {
        props: {
          defaultOpen: true,
          portal: false,
          items: [
            {
              key: 'more',
              label: 'More',
              disabled: true,
              children: [{ key: 'n', label: 'Nested' }]
            }
          ]
        },
        slots: { default: () => 'Trigger' }
      })

      const more = screen.getByRole('button', { name: 'More' })
      expect(more).toBeDisabled()
      await fireEvent.click(more)
      expect(screen.queryByText('Nested')).not.toBeInTheDocument()
      expect(more).toHaveAttribute('aria-expanded', 'false')
    })

    it.each([
      ['item', true],
      ['item', false],
      ['checkbox', true],
      ['radio', true]
    ] as const)(
      'forwards nested schema %s events with closeOnClick %s',
      async (type, closeOnClick) => {
        const nested = { key: 'n', type, label: 'Nested', checked: false, group: 'group' }
        const { emitted } = render(Dropdown, {
          props: {
            defaultOpen: true,
            portal: false,
            closeOnClick,
            items: [{ key: 'more', label: 'More', children: [nested] }]
          },
          slots: { default: () => 'Trigger' }
        })

        await fireEvent.click(screen.getByRole('button', { name: 'More' }))
        await fireEvent.click(screen.getByText('Nested'))
        expect(emitted().select).toEqual([[nested]])
        if (type === 'item' && closeOnClick) {
          expect(emitted()['open-change']).toEqual([[false]])
          expect(screen.queryByRole('menu')).not.toBeInTheDocument()
        } else {
          if (type !== 'item') {
            expect(emitted().check).toEqual([
              [{ key: 'n', checked: true, ...(type === 'radio' ? { group: 'group' } : {}) }]
            ])
          }
          expect(emitted()['open-change']).toBeUndefined()
          expect(screen.getAllByRole('menu')).toHaveLength(2)
        }
      }
    )

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

      await fireEvent.click(screen.getByText('Trigger'))
      expect(dropdownMenu()).toBeTruthy()

      await fireEvent.click(screen.getByText('Item 1'))
      expect(dropdownMenu()).toBeTruthy()
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

      await fireEvent.click(screen.getByText('Trigger'))
      await fireEvent.click(screen.getByText('Item 1'))
      expect(dropdownMenu()).toBeTruthy()

      await rerender({ trigger: 'click', closeOnClick: true })
      await fireEvent.click(screen.getByText('Item 1'))
      expect(dropdownMenu()).toBeNull()
    })

    it('keeps the menu open when an item sets closeOnClick false under parent default true', async () => {
      render(Dropdown, {
        props: { trigger: 'click' },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, { closeOnClick: false }, () => 'Stay open'),
              h(DropdownItem, null, () => 'Close sibling')
            ])
          ]
        }
      })

      await fireEvent.click(screen.getByText('Trigger'))
      expect(dropdownMenu()).toBeTruthy()

      await fireEvent.click(screen.getByText('Stay open'))
      expect(dropdownMenu()).toBeTruthy()

      await fireEvent.click(screen.getByText('Close sibling'))
      expect(dropdownMenu()).toBeNull()
    })

    it('closes when an item sets closeOnClick true under parent closeOnClick false', async () => {
      render(Dropdown, {
        props: { trigger: 'click', closeOnClick: false },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Inherit stay'),
              h(DropdownItem, { closeOnClick: true }, () => 'Force close')
            ])
          ]
        }
      })

      await fireEvent.click(screen.getByText('Trigger'))
      expect(dropdownMenu()).toBeTruthy()

      await fireEvent.click(screen.getByText('Inherit stay'))
      expect(dropdownMenu()).toBeTruthy()

      await fireEvent.click(screen.getByText('Force close'))
      expect(dropdownMenu()).toBeNull()
    })

    it('does not emit or close when a disabled item sets closeOnClick false', async () => {
      const onClick = vi.fn()
      render(Dropdown, {
        props: { trigger: 'click' },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(
                DropdownItem,
                { disabled: true, closeOnClick: false, onClick },
                () => 'Disabled stay'
              )
            ])
          ]
        }
      })

      await fireEvent.click(screen.getByText('Trigger'))
      expect(dropdownMenu()).toBeTruthy()

      await fireEvent.click(screen.getByText('Disabled stay'))
      expect(onClick).not.toHaveBeenCalled()
      expect(dropdownMenu()).toBeTruthy()
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
