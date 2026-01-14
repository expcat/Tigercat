/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { nextTick } from 'vue'
import { Tree } from '@tigercat/vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

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
    it('should render with default props', () => {
      render(Tree, {
        props: {
          treeData: sampleTreeData
        }
      })

      expect(screen.getByText('Parent 1')).toBeInTheDocument()
      expect(screen.getByText('Parent 2')).toBeInTheDocument()
    })

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

    it('should render custom empty text', () => {
      const { getByText } = renderWithProps(Tree, {
        treeData: [],
        emptyText: 'No tree data available'
      })

      expect(getByText('No tree data available')).toBeInTheDocument()
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

    it('should collapse expanded node when clicking expand icon again', async () => {
      const { getByText, queryByText } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          defaultExpandAll: true
        }
      })

      expect(getByText('Child 1-1')).toBeInTheDocument()

      const parent1 = getByText('Parent 1')
      const expandIcon = parent1.parentElement?.querySelector('svg')

      if (expandIcon) {
        await fireEvent.click(expandIcon)
        await nextTick()
      }

      expect(queryByText('Child 1-1')).not.toBeInTheDocument()
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

    it('should highlight matched nodes', async () => {
      const { getByText, rerender } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          filterValue: 'Parent 1'
        }
      })

      await nextTick()

      const matchedNode = getByText('Parent 1')
      expect(matchedNode.className).toContain('font-semibold')
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
          treeData: sampleTreeData
        }
      })

      await expectNoA11yViolations(container)
    })

    it('should have no accessibility violations with checkboxes', async () => {
      const { container } = render(Tree, {
        props: {
          treeData: sampleTreeData,
          checkable: true
        }
      })

      await expectNoA11yViolations(container)
    })
  })

  describe('Snapshots', () => {
    it('should render consistently with key props', () => {
      const { getByText, queryByText } = renderWithProps(Tree, {
        treeData: sampleTreeData,
        defaultExpandAll: true,
        checkable: true
      })

      expect(getByText('Parent 1')).toBeInTheDocument()
      expect(getByText('Child 1-1')).toBeInTheDocument()
      expect(queryByText('No data')).not.toBeInTheDocument()
    })
  })
})
