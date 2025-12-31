/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tree } from '@tigercat/react'
import {
  renderWithProps,
  expectNoA11yViolations,
} from '../utils'
import React from 'react'

const sampleTreeData = [
  {
    key: '1',
    label: 'Parent 1',
    children: [
      { key: '1-1', label: 'Child 1-1' },
      { key: '1-2', label: 'Child 1-2' },
    ],
  },
  {
    key: '2',
    label: 'Parent 2',
    children: [
      { key: '2-1', label: 'Child 2-1' },
    ],
  },
]

describe('Tree', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Tree treeData={sampleTreeData} />)

      expect(screen.getByText('Parent 1')).toBeInTheDocument()
      expect(screen.getByText('Parent 2')).toBeInTheDocument()
    })

    it('should render empty state when no data', () => {
      const { getByText } = renderWithProps(Tree, {
        treeData: [],
      })

      expect(getByText('No data')).toBeInTheDocument()
    })

    it('should render custom empty text', () => {
      const { getByText } = renderWithProps(Tree, {
        treeData: [],
        emptyText: 'No tree data available',
      })

      expect(getByText('No tree data available')).toBeInTheDocument()
    })

    it('should not show children by default', () => {
      render(<Tree treeData={sampleTreeData} />)

      expect(screen.getByText('Parent 1')).toBeInTheDocument()
      expect(screen.queryByText('Child 1-1')).not.toBeInTheDocument()
    })

    it('should show all children when defaultExpandAll is true', () => {
      render(<Tree treeData={sampleTreeData} defaultExpandAll />)

      expect(screen.getByText('Parent 1')).toBeInTheDocument()
      expect(screen.getByText('Child 1-1')).toBeInTheDocument()
      expect(screen.getByText('Child 1-2')).toBeInTheDocument()
      expect(screen.getByText('Child 2-1')).toBeInTheDocument()
    })
  })

  describe('Expand/Collapse', () => {
    it('should expand node when clicking expand icon', async () => {
      const user = userEvent.setup()
      const { getByText, queryByText } = render(<Tree treeData={sampleTreeData} />)

      expect(queryByText('Child 1-1')).not.toBeInTheDocument()

      const parent1 = getByText('Parent 1')
      const expandIcon = parent1.parentElement?.querySelector('svg')
      
      if (expandIcon) {
        await user.click(expandIcon)
      }

      await waitFor(() => {
        expect(getByText('Child 1-1')).toBeInTheDocument()
      })
    })

    it('should collapse expanded node when clicking expand icon again', async () => {
      const user = userEvent.setup()
      const { getByText, queryByText } = render(
        <Tree treeData={sampleTreeData} defaultExpandAll />
      )

      expect(getByText('Child 1-1')).toBeInTheDocument()

      const parent1 = getByText('Parent 1')
      const expandIcon = parent1.parentElement?.querySelector('svg')
      
      if (expandIcon) {
        await user.click(expandIcon)
      }

      await waitFor(() => {
        expect(queryByText('Child 1-1')).not.toBeInTheDocument()
      })
    })

    it('should emit onExpand event when node expands', async () => {
      const user = userEvent.setup()
      const onExpand = vi.fn()
      
      const { getByText } = render(<Tree treeData={sampleTreeData} onExpand={onExpand} />)

      const parent1 = getByText('Parent 1')
      const expandIcon = parent1.parentElement?.querySelector('svg')
      
      if (expandIcon) {
        await user.click(expandIcon)
      }

      await waitFor(() => {
        expect(onExpand).toHaveBeenCalled()
      })
    })
  })

  describe('Selection', () => {
    it('should select node when selectable is true', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      
      const { getByText } = render(
        <Tree treeData={sampleTreeData} selectable onSelect={onSelect} />
      )

      await user.click(getByText('Parent 1'))

      await waitFor(() => {
        expect(onSelect).toHaveBeenCalled()
      })
    })

    it('should not select node when selectable is false', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      
      const { getByText } = render(
        <Tree treeData={sampleTreeData} selectable={false} onSelect={onSelect} />
      )

      await user.click(getByText('Parent 1'))

      // Wait a bit to ensure callback is not called
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('should not select disabled node', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      const dataWithDisabled = [
        { key: '1', label: 'Node 1', disabled: true },
        { key: '2', label: 'Node 2' },
      ]
      
      const { getByText } = render(
        <Tree treeData={dataWithDisabled} selectable onSelect={onSelect} />
      )

      await user.click(getByText('Node 1'))

      await new Promise(resolve => setTimeout(resolve, 100))
      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  describe('Checkable', () => {
    it('should render checkboxes when checkable is true', () => {
      const { container } = render(<Tree treeData={sampleTreeData} checkable />)

      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('should check node when clicking checkbox', async () => {
      const user = userEvent.setup()
      const onCheck = vi.fn()
      
      const { container } = render(
        <Tree treeData={sampleTreeData} checkable onCheck={onCheck} />
      )

      const checkbox = container.querySelector('input[type="checkbox"]')
      
      if (checkbox) {
        await user.click(checkbox)
      }

      await waitFor(() => {
        expect(onCheck).toHaveBeenCalled()
      })
    })

    it('should check all children when checking parent (cascade mode)', async () => {
      const user = userEvent.setup()
      const onCheck = vi.fn()
      
      const { container } = render(
        <Tree
          treeData={sampleTreeData}
          checkable
          checkStrictly={false}
          defaultExpandAll
          onCheck={onCheck}
        />
      )

      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      const parentCheckbox = checkboxes[0] as HTMLInputElement
      
      await user.click(parentCheckbox)

      await waitFor(() => {
        expect(onCheck).toHaveBeenCalled()
        // In cascade mode, checking parent should include children
        const checkedKeys = onCheck.mock.calls[0][0]
        expect(checkedKeys.length).toBeGreaterThan(1)
      })
    })

    it('should only check parent when checkStrictly is true', async () => {
      const user = userEvent.setup()
      const onCheck = vi.fn()
      
      const { container } = render(
        <Tree treeData={sampleTreeData} checkable checkStrictly onCheck={onCheck} />
      )

      const checkbox = container.querySelector('input[type="checkbox"]')
      
      if (checkbox) {
        await user.click(checkbox)
      }

      await waitFor(() => {
        expect(onCheck).toHaveBeenCalled()
        const checkedKeys = onCheck.mock.calls[0][0]
        expect(checkedKeys).toHaveLength(1)
      })
    })

    it('should not check disabled node', async () => {
      const user = userEvent.setup()
      const onCheck = vi.fn()
      const dataWithDisabled = [
        { key: '1', label: 'Node 1', disabled: true },
        { key: '2', label: 'Node 2' },
      ]
      
      const { container } = render(
        <Tree treeData={dataWithDisabled} checkable onCheck={onCheck} />
      )

      const checkbox = container.querySelector('input[type="checkbox"][disabled]')
      
      if (checkbox) {
        await user.click(checkbox)
      }

      await new Promise(resolve => setTimeout(resolve, 100))
      expect(onCheck).not.toHaveBeenCalled()
    })
  })

  describe('Filter', () => {
    it('should filter nodes based on filter value', async () => {
      const { getByText, queryByText, rerender } = render(
        <Tree treeData={sampleTreeData} defaultExpandAll filterValue="" />
      )

      expect(getByText('Parent 1')).toBeInTheDocument()
      expect(getByText('Parent 2')).toBeInTheDocument()

      rerender(<Tree treeData={sampleTreeData} defaultExpandAll filterValue="Parent 1" />)

      await waitFor(() => {
        expect(getByText('Parent 1')).toBeInTheDocument()
        expect(queryByText('Parent 2')).not.toBeInTheDocument()
      })
    })

    it('should highlight matched nodes', async () => {
      const { getByText } = render(
        <Tree treeData={sampleTreeData} filterValue="Parent 1" />
      )

      await waitFor(() => {
        const matchedNode = getByText('Parent 1')
        expect(matchedNode.className).toContain('font-semibold')
      })
    })
  })

  describe('Block Node', () => {
    it('should apply block node styles when blockNode is true', () => {
      const { getByText } = render(<Tree treeData={sampleTreeData} blockNode />)

      const node = getByText('Parent 1').parentElement
      expect(node?.className).toContain('w-full')
    })
  })

  describe('Events', () => {
    it('should emit onNodeClick event when node is clicked', async () => {
      const user = userEvent.setup()
      const onNodeClick = vi.fn()
      
      const { getByText } = render(
        <Tree treeData={sampleTreeData} onNodeClick={onNodeClick} />
      )

      await user.click(getByText('Parent 1'))

      await waitFor(() => {
        expect(onNodeClick).toHaveBeenCalled()
      })
    })

    it('should emit onNodeExpand event when node expands', async () => {
      const user = userEvent.setup()
      const onNodeExpand = vi.fn()
      
      const { getByText } = render(
        <Tree treeData={sampleTreeData} onNodeExpand={onNodeExpand} />
      )

      const parent1 = getByText('Parent 1')
      const expandIcon = parent1.parentElement?.querySelector('svg')
      
      if (expandIcon) {
        await user.click(expandIcon)
      }

      await waitFor(() => {
        expect(onNodeExpand).toHaveBeenCalled()
      })
    })

    it('should emit onNodeCollapse event when node collapses', async () => {
      const user = userEvent.setup()
      const onNodeCollapse = vi.fn()
      
      const { getByText } = render(
        <Tree treeData={sampleTreeData} defaultExpandAll onNodeCollapse={onNodeCollapse} />
      )

      const parent1 = getByText('Parent 1')
      const expandIcon = parent1.parentElement?.querySelector('svg')
      
      if (expandIcon) {
        await user.click(expandIcon)
      }

      await waitFor(() => {
        expect(onNodeCollapse).toHaveBeenCalled()
      })
    })
  })

  describe('Controlled Mode', () => {
    it('should work in controlled mode for expanded keys', async () => {
      const user = userEvent.setup()
      const onExpand = vi.fn()
      
      const { getByText, rerender } = render(
        <Tree treeData={sampleTreeData} expandedKeys={[]} onExpand={onExpand} />
      )

      expect(screen.queryByText('Child 1-1')).not.toBeInTheDocument()

      const parent1 = getByText('Parent 1')
      const expandIcon = parent1.parentElement?.querySelector('svg')
      
      if (expandIcon) {
        await user.click(expandIcon)
      }

      await waitFor(() => {
        expect(onExpand).toHaveBeenCalled()
      })

      // Manually update expandedKeys
      rerender(<Tree treeData={sampleTreeData} expandedKeys={['1']} onExpand={onExpand} />)

      await waitFor(() => {
        expect(getByText('Child 1-1')).toBeInTheDocument()
      })
    })

    it('should work in controlled mode for checked keys', async () => {
      const user = userEvent.setup()
      const onCheck = vi.fn()
      
      const { container, rerender } = render(
        <Tree treeData={sampleTreeData} checkable checkedKeys={[]} onCheck={onCheck} />
      )

      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      await user.click(checkbox)

      await waitFor(() => {
        expect(onCheck).toHaveBeenCalled()
      })

      // Manually update checkedKeys
      rerender(
        <Tree treeData={sampleTreeData} checkable checkedKeys={['1']} onCheck={onCheck} />
      )

      await waitFor(() => {
        expect(checkbox.checked).toBe(true)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Tree treeData={sampleTreeData} />)

      await expectNoA11yViolations(container)
    })

    it('should have no accessibility violations with checkboxes', async () => {
      const { container } = render(<Tree treeData={sampleTreeData} checkable />)

      await expectNoA11yViolations(container)
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for basic tree', () => {
      const { container } = renderWithProps(Tree, {
        treeData: sampleTreeData,
      })

      expect(container).toMatchSnapshot()
    })

    it('should match snapshot for checkable tree', () => {
      const { container } = renderWithProps(Tree, {
        treeData: sampleTreeData,
        checkable: true,
      })

      expect(container).toMatchSnapshot()
    })

    it('should match snapshot for expanded tree', () => {
      const { container } = renderWithProps(Tree, {
        treeData: sampleTreeData,
        defaultExpandAll: true,
      })

      expect(container).toMatchSnapshot()
    })
  })
})
