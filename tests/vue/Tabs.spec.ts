/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { Tabs, TabPane } from '@tigercat/vue'

describe('Tabs', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Tabs, {
        props: { defaultActiveKey: '1' },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2'),
          ],
        },
      })

      expect(screen.getByText('Tab 1')).toBeInTheDocument()
      expect(screen.getByText('Tab 2')).toBeInTheDocument()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    it('should render with line type by default', () => {
      const { container } = render(Tabs, {
        slots: {
          default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1')],
        },
      })

      const tabNav = container.querySelector('[role="tablist"]')
      expect(tabNav).toBeInTheDocument()
    })

    it('should render with card type', () => {
      const { container } = render(Tabs, {
        props: { type: 'card' },
        slots: {
          default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1')],
        },
      })

      const tab = screen.getByText('Tab 1')
      expect(tab).toHaveClass('border')
      expect(tab).toHaveClass('rounded-t')
    })

    it('should render with editable-card type', () => {
      const { container } = render(Tabs, {
        props: { type: 'editable-card' },
        slots: {
          default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1')],
        },
      })

      const tab = screen.getByText('Tab 1')
      expect(tab).toHaveClass('border')
      expect(tab).toHaveClass('rounded-t')
    })
  })

  describe('Props', () => {
    it('should respect activeKey prop', () => {
      render(Tabs, {
        props: { activeKey: '2' },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2'),
          ],
        },
      })

      const tab1 = screen.getByText('Tab 1')
      const tab2 = screen.getByText('Tab 2')

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
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2'),
          ],
        },
      })

      const tab2 = screen.getByText('Tab 2')
      expect(tab2).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText('Content 2')).toBeVisible()
    })

    it('should render centered tabs', () => {
      const { container } = render(Tabs, {
        props: { centered: true },
        slots: {
          default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1')],
        },
      })

      const navList = container.querySelector('[role="tablist"] > div')
      expect(navList).toHaveClass('justify-center')
    })

    it('should render tabs in different positions', () => {
      const positions: Array<'top' | 'bottom' | 'left' | 'right'> = ['top', 'bottom', 'left', 'right']

      positions.forEach((position) => {
        const { container } = render(Tabs, {
          props: { tabPosition: position },
          slots: {
            default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1')],
          },
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
        const { container } = render(Tabs, {
          props: { size },
          slots: {
            default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1')],
          },
        })

        const tab = screen.getByText('Tab 1')
        expect(tab).toBeInTheDocument()
      })
    })
  })

  describe('Events', () => {
    it('should emit update:activeKey when tab is clicked', async () => {
      const onUpdateActiveKey = vi.fn()

      render(Tabs, {
        props: {
          'onUpdate:activeKey': onUpdateActiveKey,
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2'),
          ],
        },
      })

      const tab2 = screen.getByText('Tab 2')
      await fireEvent.click(tab2)

      expect(onUpdateActiveKey).toHaveBeenCalledWith('2')
    })

    it('should emit change when tab is clicked', async () => {
      const onChange = vi.fn()

      render(Tabs, {
        props: {
          onChange,
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2'),
          ],
        },
      })

      const tab2 = screen.getByText('Tab 2')
      await fireEvent.click(tab2)

      expect(onChange).toHaveBeenCalledWith('2')
    })

    it('should emit tab-click when tab is clicked', async () => {
      const onTabClick = vi.fn()

      render(Tabs, {
        props: {
          'onTab-click': onTabClick,
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2'),
          ],
        },
      })

      const tab2 = screen.getByText('Tab 2')
      await fireEvent.click(tab2)

      expect(onTabClick).toHaveBeenCalledWith('2')
    })

    it('should emit edit event when close button is clicked', async () => {
      const onEdit = vi.fn()

      render(Tabs, {
        props: {
          type: 'editable-card',
          closable: true,
          onEdit,
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2'),
          ],
        },
      })

      const closeButtons = screen.getAllByRole('tab')[0].querySelectorAll('svg')
      expect(closeButtons.length).toBeGreaterThan(0)

      const closeButton = closeButtons[0].parentElement
      if (closeButton) {
        await fireEvent.click(closeButton)
        expect(onEdit).toHaveBeenCalledWith({ targetKey: '1', action: 'remove' })
      }
    })
  })

  describe('TabPane', () => {
    it('should render tab pane with content', () => {
      render(Tabs, {
        slots: {
          default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Test Content')],
        },
      })

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render disabled tab pane', () => {
      render(Tabs, {
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1', disabled: true }, () => 'Content 1'),
          ],
        },
      })

      const tab = screen.getByText('Tab 1')
      expect(tab).toHaveAttribute('aria-disabled', 'true')
      expect(tab).toHaveClass('opacity-50')
      expect(tab).toHaveClass('cursor-not-allowed')
    })

    it('should not switch to disabled tab when clicked', async () => {
      const onChange = vi.fn()

      render(Tabs, {
        props: {
          activeKey: '1',
          onChange,
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2', disabled: true }, () => 'Content 2'),
          ],
        },
      })

      const tab2 = screen.getByText('Tab 2')
      await fireEvent.click(tab2)

      expect(onChange).not.toHaveBeenCalled()
    })

    it('should show close button when closable is true', () => {
      render(Tabs, {
        props: {
          type: 'editable-card',
          closable: true,
        },
        slots: {
          default: () => [h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1')],
        },
      })

      const tab = screen.getByText('Tab 1').parentElement
      const closeButton = tab?.querySelector('svg')
      expect(closeButton).toBeInTheDocument()
    })

    it('should destroy inactive pane when destroyInactiveTabPane is true', () => {
      const { rerender } = render(Tabs, {
        props: {
          activeKey: '1',
          destroyInactiveTabPane: true,
        },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2'),
          ],
        },
      })

      // Content 2 should not be in the document
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument()

      // Switch to tab 2
      rerender({
        activeKey: '2',
        destroyInactiveTabPane: true,
      })

      // Now Content 2 should be visible and Content 1 destroyed
      expect(screen.getByText('Content 2')).toBeInTheDocument()
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      const { container } = render(Tabs, {
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2'),
          ],
        },
      })

      const tablist = container.querySelector('[role="tablist"]')
      expect(tablist).toBeInTheDocument()

      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(2)

      const tabpanels = screen.getAllByRole('tabpanel')
      expect(tabpanels).toHaveLength(2)
    })

    it('should have proper aria-selected attributes', () => {
      render(Tabs, {
        props: { activeKey: '1' },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2'),
          ],
        },
      })

      const tab1 = screen.getByText('Tab 1')
      const tab2 = screen.getByText('Tab 2')

      expect(tab1).toHaveAttribute('aria-selected', 'true')
      expect(tab2).toHaveAttribute('aria-selected', 'false')
    })

    it('should have proper aria-hidden attributes for tab panels', () => {
      render(Tabs, {
        props: { activeKey: '1' },
        slots: {
          default: () => [
            h(TabPane, { tabKey: '1', label: 'Tab 1' }, () => 'Content 1'),
            h(TabPane, { tabKey: '2', label: 'Tab 2' }, () => 'Content 2'),
          ],
        },
      })

      const panels = screen.getAllByRole('tabpanel')
      expect(panels[0]).toHaveAttribute('aria-hidden', 'false')
      expect(panels[1]).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
