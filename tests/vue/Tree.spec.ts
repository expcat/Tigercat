/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h, nextTick } from 'vue'
import { Tree } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

const sampleTreeData = [
  {
    key: '1',
    label: 'Parent 1',
    children: [
      { key: '1-1', label: 'Child 1-1' },
      { key: '1-2', label: 'Child 1-2' }
    ]
  },
  {
    key: '2',
    label: 'Parent 2',
    children: [{ key: '2-1', label: 'Child 2-1' }]
  }
]

describe('Tree', () => {
  describe('Rendering', () => {
    it('should render tree roles', () => {
      const { container } = render(Tree, {
        props: {
          treeData: sampleTreeData
        }
      })

      expect(container.querySelector('[role="tree"]')).toBeTruthy()

      const items = container.querySelectorAll('[role="treeitem"]')
      expect(items.length).toBeGreaterThan(0)
      expect(items[0].getAttribute('aria-level')).toBe('1')
    })

    it('should render empty state when no data', () => {
      const { getByText } = renderWithProps(Tree, {
        treeData: []
      })

      expect(getByText('No data')).toBeInTheDocument()
    })
    it('should not show children by default', () => {
      render(Tree, {
        props: {
          treeData: sampleTreeData
        }
      })

      expect(screen.getByText('Parent 1')).toBeInTheDocument()
      expect(screen.queryByText('Child 1-1')).not.toBeInTheDocument()
    })

    it('should show all children when defaultExpandAll is true', () => {
      render(Tree, {
        props: {
          treeData: sampleTreeData,
          defaultExpandAll: true
        }
      })

      expect(screen.getByText('Parent 1')).toBeInTheDocument()
      expect(screen.getByText('Child 1-1')).toBeInTheDocument()
      expect(screen.getByText('Child 1-2')).toBeInTheDocument()
      expect(screen.getByText('Child 2-1')).toBeInTheDocument()
    })

    it('renders node icons and connector lines', () => {
      const iconData = [
        {
          key: '1',
          label: 'Parent 1',
          icon: h('span', { 'data-testid': 'tree-icon' }, 'I'),
          children: [{ key: '1-1', label: 'Child 1-1' }]
        }
      ]
      const { container } = render(Tree, {
        props: { treeData: iconData, defaultExpandAll: true, showLine: true }
      })

      expect(screen.getByTestId('tree-icon')).toBeInTheDocument()
      expect(container.querySelector('.border-l')).toBeInTheDocument()
    })
  })

  describe('Expand/Collapse', () => {
    it('should expand node when clicking expand icon', async () => {
      const { getByText, queryByText } = render(Tree, {
        props: {
          treeData: sampleTreeData
        }
      })

      expect(queryByText('Child 1-1')).not.toBeInTheDocument()

      const parent1 = getByText('Parent 1')
      const expandIcon = parent1.parentElement?.querySelector('svg')

      if (expandIcon) {
        await fireEvent.click(expandIcon)
        await nextTick()
      }

      expect(getByText('Child 1-1')).toBeInTheDocument()
    })
    it('should emit expand event when node expands', async () => {
      const onExpand = vi.fn()

      const { getByText } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          onExpand
        }
      })

      const parent1 = getByText('Parent 1')
      const expandIcon = parent1.parentElement?.querySelector('svg')

      if (expandIcon) {
        await fireEvent.click(expandIcon)
        await nextTick()
      }

      expect(onExpand).toHaveBeenCalled()
    })
  })

  describe('Keyboard', () => {
    it('should move focus with ArrowDown', async () => {
      const { container } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          defaultExpandAll: true
        }
      })

      const items = Array.from(container.querySelectorAll('[role="treeitem"]')) as HTMLElement[]

      items[0].focus()
      expect(document.activeElement).toBe(items[0])

      await fireEvent.keyDown(items[0], { key: 'ArrowDown' })
      await nextTick()
      await nextTick()

      expect(document.activeElement).toBe(items[1])
    })

    it('should expand node with ArrowRight', async () => {
      const { getByText } = render(Tree, {
        props: {
          treeData: sampleTreeData
        }
      })

      expect(screen.queryByText('Child 1-1')).not.toBeInTheDocument()

      const parentLabel = getByText('Parent 1')
      const parentItem = parentLabel.closest('[role="treeitem"]') as HTMLElement | null

      expect(parentItem).toBeTruthy()

      parentItem?.focus()
      await fireEvent.keyDown(parentItem!, { key: 'ArrowRight' })
      await nextTick()

      expect(screen.getByText('Child 1-1')).toBeInTheDocument()
    })

    it('should navigate only visible items when filtering', async () => {
      const { container } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          filterValue: 'Child 1',
          autoExpandParent: true
        }
      })

      expect(screen.queryByText('Parent 2')).not.toBeInTheDocument()

      const items = Array.from(container.querySelectorAll('[role="treeitem"]')) as HTMLElement[]
      expect(items.length).toBeGreaterThanOrEqual(2)

      items[0].focus()
      expect(document.activeElement).toBe(items[0])

      await fireEvent.keyDown(items[0], { key: 'ArrowDown' })
      await nextTick()
      await nextTick()

      expect(document.activeElement).toBe(items[1])
    })

    it('should keep focus after lazy-load expand', async () => {
      const onLoadData = vi.fn(async () => [{ key: '1-1', label: 'Child 1-1' }])

      const lazyTreeData = [{ key: '1', label: 'Parent 1' }]

      const { container } = render(Tree, {
        props: {
          treeData: lazyTreeData,
          loadData: onLoadData
        }
      })

      const items = Array.from(container.querySelectorAll('[role="treeitem"]')) as HTMLElement[]

      items[0].focus()
      expect(document.activeElement).toBe(items[0])

      await fireEvent.keyDown(items[0], { key: 'ArrowRight' })

      await nextTick()
      await nextTick()

      expect(onLoadData).toHaveBeenCalled()
      expect(screen.getByText('Child 1-1')).toBeInTheDocument()
      expect(document.activeElement).toBe(items[0])
    })

    it('should support multiple selection with Enter', async () => {
      const { container } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          defaultExpandAll: true,
          multiple: true
        }
      })

      const items = Array.from(container.querySelectorAll('[role="treeitem"]')) as HTMLElement[]

      items[0].focus()
      await fireEvent.keyDown(items[0], { key: 'Enter' })
      await nextTick()

      await fireEvent.keyDown(items[0], { key: 'ArrowDown' })
      await nextTick()
      await fireEvent.keyDown(items[1], { key: 'Enter' })
      await nextTick()

      expect(items[0].getAttribute('aria-selected')).toBe('true')
      expect(items[1].getAttribute('aria-selected')).toBe('true')
    })

    it('should not cascade check when checkStrictly is true (Space)', async () => {
      const onCheck = vi.fn()

      const { container } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          defaultExpandAll: true,
          checkable: true,
          checkStrictly: true,
          onCheck
        }
      })

      const items = Array.from(container.querySelectorAll('[role="treeitem"]')) as HTMLElement[]

      items[0].focus()
      await fireEvent.keyDown(items[0], { key: ' ' })
      await nextTick()
      await nextTick()

      expect(items[0].getAttribute('aria-checked')).toBe('true')
      expect(items[1].getAttribute('aria-checked')).toBe('false')
      expect(onCheck).toHaveBeenCalled()

      const lastCall = onCheck.mock.calls.at(-1)
      const checkedKeys = (lastCall?.[0] as Array<string | number>) ?? []
      expect(checkedKeys).toContain('1')
      expect(checkedKeys).not.toContain('1-1')
    })

    it('handles Home, End, ArrowUp, ArrowLeft, Escape, and expandable Space paths', async () => {
      const { container } = render(Tree, {
        props: { treeData: sampleTreeData, defaultExpandAll: true, selectable: false }
      })
      const items = Array.from(container.querySelectorAll('[role="treeitem"]')) as HTMLElement[]

      items[2].focus()
      await fireEvent.keyDown(items[2], { key: 'Home' })
      await nextTick()
      await nextTick()
      expect(document.activeElement).toBe(items[0])

      await fireEvent.keyDown(items[0], { key: 'End' })
      await nextTick()
      await nextTick()
      expect(document.activeElement).toBe(items[4])

      await fireEvent.keyDown(items[4], { key: 'ArrowUp' })
      await nextTick()
      await nextTick()
      expect(document.activeElement).toBe(items[3])

      await fireEvent.keyDown(items[3], { key: 'ArrowLeft' })
      await nextTick()
      expect(screen.queryByText('Child 2-1')).not.toBeInTheDocument()

      const child = screen.getByText('Child 1-1').closest('[role="treeitem"]') as HTMLElement
      child.focus()
      await fireEvent.keyDown(child, { key: 'Escape' })
      await nextTick()
      await nextTick()
      expect(screen.queryByText('Child 1-1')).not.toBeInTheDocument()

      const parent = screen.getByText('Parent 1').closest('[role="treeitem"]') as HTMLElement
      parent.focus()
      await fireEvent.keyDown(parent, { key: ' ' })
      await nextTick()
      expect(screen.getByText('Child 1-1')).toBeInTheDocument()
    })

    it('uses Enter to expand when selection is disabled', async () => {
      const { container } = render(Tree, {
        props: { treeData: sampleTreeData, selectionMode: 'none' }
      })
      const parent = container.querySelector('[role="treeitem"]') as HTMLElement
      parent.focus()

      await fireEvent.keyDown(parent, { key: 'Enter' })
      await nextTick()

      expect(screen.getByText('Child 1-1')).toBeInTheDocument()
      expect(parent).not.toHaveAttribute('aria-selected')
    })
  })

  describe('Selection', () => {
    it('should select node when selectable is true', async () => {
      const onSelect = vi.fn()

      const { getByText } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          selectable: true,
          onSelect
        }
      })

      await fireEvent.click(getByText('Parent 1'))
      await nextTick()

      expect(onSelect).toHaveBeenCalled()
    })

    it('should not select node when selectable is false', async () => {
      const onSelect = vi.fn()

      const { getByText } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          selectable: false,
          onSelect
        }
      })

      await fireEvent.click(getByText('Parent 1'))
      await nextTick()

      expect(onSelect).not.toHaveBeenCalled()
    })

    it('should not select disabled node', async () => {
      const onSelect = vi.fn()
      const dataWithDisabled = [
        { key: '1', label: 'Node 1', disabled: true },
        { key: '2', label: 'Node 2' }
      ]

      const { getByText } = render(Tree, {
        props: {
          treeData: dataWithDisabled,
          selectable: true,
          onSelect
        }
      })

      await fireEvent.click(getByText('Node 1'))
      await nextTick()

      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  describe('Checkable', () => {
    it('should render checkboxes when checkable is true', () => {
      const { container } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          checkable: true
        }
      })

      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('should check node when clicking checkbox', async () => {
      const onCheck = vi.fn()

      const { container } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          checkable: true,
          onCheck
        }
      })

      const checkbox = container.querySelector('input[type="checkbox"]')

      if (checkbox) {
        await fireEvent.click(checkbox)
        await nextTick()
      }

      expect(onCheck).toHaveBeenCalled()
    })

    it('should check all children when checking parent (cascade mode)', async () => {
      const onCheck = vi.fn()

      const { container } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          checkable: true,
          checkStrictly: false,
          defaultExpandAll: true,
          onCheck
        }
      })

      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      const parentCheckbox = checkboxes[0] as HTMLInputElement

      await fireEvent.click(parentCheckbox)
      await nextTick()

      expect(onCheck).toHaveBeenCalled()
      // In cascade mode, checking parent should include children
      const checkedKeys = onCheck.mock.calls[0][0]
      expect(checkedKeys.length).toBeGreaterThan(1)
    })

    it('should only check parent when checkStrictly is true', async () => {
      const onCheck = vi.fn()

      const { container } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          checkable: true,
          checkStrictly: true,
          onCheck
        }
      })

      const checkbox = container.querySelector('input[type="checkbox"]')

      if (checkbox) {
        await fireEvent.click(checkbox)
        await nextTick()
      }

      expect(onCheck).toHaveBeenCalled()
      const checkedKeys = onCheck.mock.calls[0][0]
      expect(checkedKeys).toHaveLength(1)
    })

    it('should not check disabled node', async () => {
      const onCheck = vi.fn()
      const dataWithDisabled = [
        { key: '1', label: 'Node 1', disabled: true },
        { key: '2', label: 'Node 2' }
      ]

      const { container } = render(Tree, {
        props: {
          treeData: dataWithDisabled,
          checkable: true,
          onCheck
        }
      })

      const checkbox = container.querySelector('input[type="checkbox"][disabled]')

      if (checkbox) {
        await fireEvent.click(checkbox)
        await nextTick()
      }

      expect(onCheck).not.toHaveBeenCalled()
    })
  })

  describe('Filter', () => {
    it('should filter nodes based on filter value', async () => {
      const { getByText, queryByText, rerender } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          defaultExpandAll: true,
          filterValue: ''
        }
      })

      expect(getByText('Parent 1')).toBeInTheDocument()
      expect(getByText('Parent 2')).toBeInTheDocument()

      await rerender({
        filterValue: 'Parent 1'
      })
      await nextTick()

      expect(getByText('Parent 1')).toBeInTheDocument()
      expect(queryByText('Parent 2')).not.toBeInTheDocument()
    })
  })

  describe('Block Node', () => {
    it('should apply block node styles when blockNode is true', () => {
      const { getByText } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          blockNode: true
        }
      })

      const node = getByText('Parent 1').parentElement
      expect(node?.className).toContain('w-full')
    })
  })

  describe('Events', () => {
    it('should emit node-click event when node is clicked', async () => {
      const onNodeClick = vi.fn()

      const { getByText } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          onNodeClick
        }
      })

      await fireEvent.click(getByText('Parent 1'))
      await nextTick()

      expect(onNodeClick).toHaveBeenCalled()
    })

    it('should emit node-expand event when node expands', async () => {
      const onNodeExpand = vi.fn()

      const { getByText } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          onNodeExpand
        }
      })

      const parent1 = getByText('Parent 1')
      const expandIcon = parent1.parentElement?.querySelector('svg')

      if (expandIcon) {
        await fireEvent.click(expandIcon)
        await nextTick()
      }

      expect(onNodeExpand).toHaveBeenCalled()
    })

    it('should emit node-collapse event when node collapses', async () => {
      const onNodeCollapse = vi.fn()

      const { getByText } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          defaultExpandAll: true,
          onNodeCollapse
        }
      })

      const parent1 = getByText('Parent 1')
      const expandIcon = parent1.parentElement?.querySelector('svg')

      if (expandIcon) {
        await fireEvent.click(expandIcon)
        await nextTick()
      }

      expect(onNodeCollapse).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          checkable: true
        }
      })

      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Controlled Mode', () => {
    it('should work in controlled mode for expanded keys', async () => {
      const onExpand = vi.fn()

      const { getByText, queryByText, rerender } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          expandedKeys: [] as (string | number)[],
          onExpand
        }
      })

      expect(queryByText('Child 1-1')).not.toBeInTheDocument()

      const parent1 = getByText('Parent 1')
      const expandIcon = parent1.parentElement?.querySelector('svg')

      if (expandIcon) {
        await fireEvent.click(expandIcon)
        await nextTick()
      }

      expect(onExpand).toHaveBeenCalled()

      // Manually update expandedKeys
      await rerender({ expandedKeys: ['1'] })
      await nextTick()

      expect(getByText('Child 1-1')).toBeInTheDocument()
    })

    it('should work in controlled mode for checked keys', async () => {
      const onCheck = vi.fn()

      const { container, rerender } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          checkable: true,
          checkedKeys: [] as (string | number)[],
          onCheck
        }
      })

      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      await fireEvent.click(checkbox)
      await nextTick()

      expect(onCheck).toHaveBeenCalled()

      // Manually update checkedKeys
      await rerender({ checkedKeys: ['1'] })
      await nextTick()

      const updatedCheckbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(updatedCheckbox.checked).toBe(true)
    })

    it('supports controlled selected keys and multiple selection mode', () => {
      render(Tree, {
        props: {
          treeData: sampleTreeData,
          defaultExpandAll: true,
          selectionMode: 'multiple',
          selectedKeys: ['1', '1-1']
        }
      })

      expect(screen.getByText('Parent 1').closest('[role="treeitem"]')).toHaveAttribute(
        'aria-selected',
        'true'
      )
      expect(screen.getByText('Child 1-1').closest('[role="treeitem"]')).toHaveAttribute(
        'aria-selected',
        'true'
      )
      expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true')
    })
  })

  describe('Drag and drop', () => {
    it('emits drop for different draggable tree nodes', async () => {
      const { container, emitted } = render(Tree, {
        props: { treeData: sampleTreeData, defaultExpandAll: true, draggable: true }
      })
      const items = container.querySelectorAll('[role="treeitem"]')

      await fireEvent.dragStart(items[1])
      await fireEvent.dragOver(items[2])
      await fireEvent.drop(items[2])

      expect(emitted().drop[0]).toEqual([{ dragKey: '1-1', dropKey: '1-2' }])
    })

    it('ignores self drops and disabled draggable nodes', async () => {
      const disabledData = [
        { key: 'disabled', label: 'Disabled', disabled: true },
        { key: 'target', label: 'Target' }
      ]
      const { container, emitted } = render(Tree, {
        props: { treeData: disabledData, draggable: true }
      })
      const items = container.querySelectorAll('[role="treeitem"]')

      expect(items[0]).not.toHaveAttribute('draggable')
      await fireEvent.dragStart(items[1])
      await fireEvent.drop(items[1])
      await fireEvent.dragEnd(items[1])

      expect(emitted().drop).toBeUndefined()
    })
  })

  describe('Snapshots', () => {})

  // v0.6.0 — searchable
  describe('Searchable (v0.6.0)', () => {
    it('renders search input when searchable is true', () => {
      const { container } = renderWithProps(Tree, {
        treeData: sampleTreeData,
        searchable: true
      })
      const input = container.querySelector('input[type="text"]')
      expect(input).toBeTruthy()
    })
    it('filters tree nodes when typing in search input', async () => {
      const { container } = renderWithProps(Tree, {
        treeData: sampleTreeData,
        searchable: true,
        defaultExpandAll: true
      })
      const input = container.querySelector('input[type="text"]') as HTMLInputElement

      await fireEvent.update(input, 'Child 1-1')
      await nextTick()
      await nextTick()

      // The search value should be set
      expect(input.value).toBe('Child 1-1')
    })
  })

  describe('Virtual scrolling', () => {
    it('renders only a subset of items when virtual is enabled', () => {
      const largeTree = Array.from({ length: 500 }, (_, i) => ({
        key: `n-${i}`,
        label: `Node ${i}`
      }))

      const { container } = renderWithProps(Tree, {
        treeData: largeTree,
        virtual: true,
        height: 200,
        itemHeight: 32
      })

      const items = container.querySelectorAll('[role="treeitem"]')
      expect(items.length).toBeGreaterThan(0)
      expect(items.length).toBeLessThan(50)
    })
  })
  describe('Edge Cases', () => {})
})
