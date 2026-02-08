/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/vue'
import { defineComponent, h, ref } from 'vue'
import { Tabs, TabPane } from '@expcat/tigercat-vue'

describe('Tabs', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Tabs, {
        props: { defaultActiveKey: '1' },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2')
          ]
        }
      })

      expect(screen.getByText('Tab 1')).toBeInTheDocument()
      expect(screen.getByText('Tab 2')).toBeInTheDocument()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    it('should render with line type by default', () => {
      const { container } = render(Tabs, {
        slots: {
          default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1')]
        }
      })

      const tabNav = container.querySelector('[role="tablist"]')
      expect(tabNav).toBeInTheDocument()
    })

    it('should render with card type', () => {
      render(Tabs, {
        props: { type: 'card' },
        slots: {
          default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1')]
        }
      })

      const tab = screen.getByRole('tab', { name: 'Tab 1' })
      expect(tab).toHaveClass('border')
      expect(tab).toHaveClass('rounded-t')
    })

    it('should render with editable-card type', () => {
      render(Tabs, {
        props: { type: 'editable-card' },
        slots: {
          default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1')]
        }
      })

      const tab = screen.getByRole('tab', { name: 'Tab 1' })
      expect(tab).toHaveClass('border')
      expect(tab).toHaveClass('rounded-t')
    })

    it('should render dynamic v-for children (Fragment flattening)', async () => {
      const Wrapper = defineComponent({
        setup() {
          const tabs = ref([
            { key: '1', label: 'A' },
            { key: '2', label: 'B' },
            { key: '3', label: 'C' }
          ])
          const activeKey = ref('1')
          const handleEdit = ({ targetKey, action }: { targetKey?: string | number; action: 'add' | 'remove' }) => {
            if (action === 'add') {
              const k = `${tabs.value.length + 1}`
              tabs.value.push({ key: k, label: `New ${k}` })
              activeKey.value = k
            } else if (action === 'remove' && targetKey != null) {
              tabs.value = tabs.value.filter(t => t.key !== String(targetKey))
            }
          }
          return () =>
            h(
              Tabs,
              {
                activeKey: activeKey.value,
                'onUpdate:activeKey': (k: string | number) => { activeKey.value = k },
                type: 'editable-card',
                closable: true,
                onEdit: handleEdit
              },
              {
                default: () =>
                  tabs.value.map(tab =>
                    h(TabPane, { tabKey: tab.key, label: tab.label, key: tab.key }, () => `Content ${tab.key}`)
                  )
              }
            )
        }
      })

      render(Wrapper)

      // All 3 initial tabs should be visible
      expect(screen.getByRole('tab', { name: 'A' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'B' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'C' })).toBeInTheDocument()

      // Click add button should create a new tab
      await fireEvent.click(screen.getByRole('button', { name: 'Add tab' }))
      expect(screen.getByRole('tab', { name: 'New 4' })).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should respect activeKey prop', () => {
      render(Tabs, {
        props: { activeKey: '2' },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2')
          ]
        }
      })

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })

      expect(tab1).toHaveAttribute('aria-selected', 'false')
      expect(tab2).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText('Content 2')).toBeVisible()
    })

    it('should respect defaultActiveKey prop in uncontrolled mode', () => {
      render(Tabs, {
        props: { defaultActiveKey: '2' },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2')
          ]
        }
      })

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      expect(tab2).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText('Content 2')).toBeVisible()
    })

    it('should render centered tabs', () => {
      const { container } = render(Tabs, {
        props: { centered: true },
        slots: {
          default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1')]
        }
      })

      const navList = container.querySelector('[role="tablist"] > div')
      expect(navList).toHaveClass('justify-center')
    })

    it('should render tabs in different positions', () => {
      const positions: Array<'top' | 'bottom' | 'left' | 'right'> = [
        'top',
        'bottom',
        'left',
        'right'
      ]

      positions.forEach((position) => {
        const { container } = render(Tabs, {
          props: { tabPosition: position },
          slots: {
            default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1')]
          }
        })

        const tabContainer = container.firstChild
        if (position === 'left' || position === 'right') {
          expect(tabContainer).toHaveClass('flex')
        }
      })
    })

    it('should render tabs in different sizes', () => {
      const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large']

      sizes.forEach((size) => {
        render(Tabs, {
          props: { size },
          slots: {
            default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1')]
          }
        })

        expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument()
        cleanup()
      })
    })
  })

  describe('Events', () => {
    it('should emit update:activeKey when tab is clicked', async () => {
      const onUpdateActiveKey = vi.fn()

      render(Tabs, {
        props: {
          'onUpdate:activeKey': onUpdateActiveKey
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2')
          ]
        }
      })

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      await fireEvent.click(tab2)

      expect(onUpdateActiveKey).toHaveBeenCalledWith('2')
    })

    it('should emit change when tab is clicked', async () => {
      const onChange = vi.fn()

      render(Tabs, {
        props: {
          onChange
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2')
          ]
        }
      })

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      await fireEvent.click(tab2)

      expect(onChange).toHaveBeenCalledWith('2')
    })

    it('should emit tab-click when tab is clicked', async () => {
      const onTabClick = vi.fn()

      render(Tabs, {
        props: {
          'onTab-click': onTabClick
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2')
          ]
        }
      })

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      await fireEvent.click(tab2)

      expect(onTabClick).toHaveBeenCalledWith('2')
    })

    it('should emit edit event when close button is clicked', async () => {
      const onEdit = vi.fn()

      render(Tabs, {
        props: {
          type: 'editable-card',
          closable: true,
          onEdit
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2')
          ]
        }
      })

      const closeButton = screen.getByRole('button', { name: 'Close Tab 1' })
      await fireEvent.click(closeButton)

      expect(onEdit).toHaveBeenCalledWith({ targetKey: '1', action: 'remove' })
    })

    it('should emit edit remove when Delete/Backspace is pressed on a closable tab', async () => {
      const onEdit = vi.fn()

      render(Tabs, {
        props: {
          type: 'editable-card',
          closable: true,
          defaultActiveKey: '1',
          onEdit
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2')
          ]
        }
      })

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      tab1.focus()

      await fireEvent.keyDown(tab1, { key: 'Delete' })
      expect(onEdit).toHaveBeenCalledWith({ targetKey: '1', action: 'remove' })
    })

    it('should emit edit add when add button is clicked', async () => {
      const onEdit = vi.fn()

      render(Tabs, {
        props: {
          type: 'editable-card',
          onEdit
        },
        slots: {
          default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1')]
        }
      })

      const addButton = screen.getByRole('button', { name: 'Add tab' })
      await fireEvent.click(addButton)

      expect(onEdit).toHaveBeenCalledWith({
        targetKey: undefined,
        action: 'add'
      })
    })

    it('should not emit change when clicking the active tab', async () => {
      const onChange = vi.fn()

      render(Tabs, {
        props: {
          defaultActiveKey: '1',
          onChange
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2')
          ]
        }
      })

      await fireEvent.click(screen.getByRole('tab', { name: 'Tab 1' }))
      expect(onChange).not.toHaveBeenCalled()
    })

    it('should support keyboard navigation and skip disabled tabs', async () => {
      render(Tabs, {
        props: {
          defaultActiveKey: '1'
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2', disabled: true }, () => 'Content 2'),
            h(TabPane, { tabKey: '3', label: 'Tab 3' }, () => 'Content 3')
          ]
        }
      })

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      const tab3 = screen.getByRole('tab', { name: 'Tab 3' })

      tab1.focus()
      expect(tab1).toHaveFocus()

      await fireEvent.keyDown(tab1, { key: 'ArrowRight' })
      expect(tab3).toHaveFocus()
      expect(screen.getByText('Content 3')).toBeVisible()
    })

    it('should link tabs and panels with aria attributes', () => {
      render(Tabs, {
        props: {
          defaultActiveKey: '1'
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2')
          ]
        }
      })

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      const panel1 = screen.getByRole('tabpanel', { name: 'Tab 1' })

      expect(tab1.getAttribute('id')).toBeTruthy()
      expect(panel1.getAttribute('id')).toBeTruthy()
      expect(tab1).toHaveAttribute('aria-controls', panel1.getAttribute('id')!)
      expect(panel1).toHaveAttribute('aria-labelledby', tab1.getAttribute('id')!)
    })

    it('should set aria-orientation based on tabPosition', () => {
      render(Tabs, {
        props: {
          tabPosition: 'left'
        },
        slots: {
          default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'C1')]
        }
      })

      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
    })

    it('should set aria-orientation to horizontal for top/bottom', () => {
      render(Tabs, {
        slots: {
          default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'C1')]
        }
      })

      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal')
    })
  })

  describe('TabPane', () => {
    it('should render tab pane with content', () => {
      render(Tabs, {
        slots: {
          default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Test Content')]
        }
      })

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render disabled tab pane', () => {
      render(Tabs, {
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1', disabled: true }, () => 'Content 1')
          ]
        }
      })

      const tab = screen.getByRole('tab', { name: 'Tab 1' })
      expect(tab).toHaveAttribute('aria-disabled', 'true')
      expect(tab).toHaveClass('opacity-50')
      expect(tab).toHaveClass('cursor-not-allowed')
    })

    it('should not switch to disabled tab when clicked', async () => {
      const onChange = vi.fn()

      render(Tabs, {
        props: {
          activeKey: '1',
          onChange
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2', disabled: true }, () => 'Content 2')
          ]
        }
      })

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      await fireEvent.click(tab2)

      expect(onChange).not.toHaveBeenCalled()
    })

    it('should show close button when closable is true', () => {
      render(Tabs, {
        props: {
          type: 'editable-card',
          closable: true
        },
        slots: {
          default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1')]
        }
      })

      const tab = screen.getByRole('tab', { name: 'Tab 1' })
      const closeButton = tab?.querySelector('svg')
      expect(closeButton).toBeInTheDocument()
    })

    it('should destroy inactive pane when destroyInactiveTabPane is true', async () => {
      const { rerender } = render(Tabs, {
        props: {
          activeKey: '1',
          destroyInactiveTabPane: true
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2')
          ]
        }
      })

      // Content 2 should not be in the document
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument()

      // Switch to tab 2
      await rerender({
        activeKey: '2',
        destroyInactiveTabPane: true
      })

      // Now Content 2 should be visible and Content 1 destroyed
      expect(screen.getByText('Content 2')).toBeInTheDocument()
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    })

    it('should render tab with icon', () => {
      render(Tabs, {
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1', icon: h('span', { 'data-testid': 'test-icon' }, 'Icon') }, () => 'Content 1')
          ]
        }
      })

      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })

    it('should override closable prop per tab', () => {
      render(Tabs, {
        props: {
          type: 'editable-card',
          closable: true
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1', closable: false }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2')
          ]
        }
      })

      const tabs = screen.getAllByRole('tab')

      // First tab should not have close button
      const tab1CloseButtons = tabs[0].querySelectorAll('svg')
      expect(tab1CloseButtons.length).toBe(0)

      // Second tab should have close button
      const tab2CloseButtons = tabs[1].querySelectorAll('svg')
      expect(tab2CloseButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      const { container } = render(Tabs, {
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2')
          ]
        }
      })

      const tablist = container.querySelector('[role="tablist"]')
      expect(tablist).toBeInTheDocument()

      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(2)

      const tabpanels = screen.getAllByRole('tabpanel', { hidden: true })
      expect(tabpanels).toHaveLength(2)
    })

    it('should have proper aria-selected attributes', () => {
      render(Tabs, {
        props: { activeKey: '1' },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2')
          ]
        }
      })

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })

      expect(tab1).toHaveAttribute('aria-selected', 'true')
      expect(tab2).toHaveAttribute('aria-selected', 'false')
    })

    it('should have proper aria-hidden attributes for tab panels', () => {
      render(Tabs, {
        props: { activeKey: '1' },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2')
          ]
        }
      })

      const panels = screen.getAllByRole('tabpanel', { hidden: true })
      expect(panels[0]).toHaveAttribute('aria-hidden', 'false')
      expect(panels[1]).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have proper aria-disabled attributes', () => {
      render(Tabs, {
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2', disabled: true }, () => 'Content 2')
          ]
        }
      })

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })

      expect(tab1).toHaveAttribute('aria-disabled', 'false')
      expect(tab2).toHaveAttribute('aria-disabled', 'true')
    })
  })
})
