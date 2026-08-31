/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tree } from '@expcat/tigercat-react/Tree'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { expectNoA11yViolations } from '../utils/react'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import React from 'react'

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
      render(<Tree treeData={sampleTreeData} />)

      expect(screen.getByRole('tree')).toBeInTheDocument()
      expect(screen.getAllByRole('treeitem').length).toBeGreaterThan(0)
    })

    it('should render empty state when no data', () => {
      const { getByText } = render(<Tree treeData={[]} />)

      expect(getByText('No data')).toBeInTheDocument()
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

    it('renders node icons and connector lines', () => {
      const iconData = [
        {
          key: '1',
          label: 'Parent 1',
          icon: <span data-testid="tree-icon">I</span>,
          children: [{ key: '1-1', label: 'Child 1-1' }]
        }
      ]
      const { container } = render(<Tree treeData={iconData} defaultExpandAll showLine />)

      expect(screen.getByTestId('tree-icon')).toBeInTheDocument()
      expect(container.querySelector('[class*="border-s"]')).toBeTruthy()
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

  describe('Keyboard', () => {
    it('should move focus with ArrowDown', async () => {
      const user = userEvent.setup()

      render(<Tree treeData={sampleTreeData} defaultExpandAll />)

      const items = screen.getAllByRole('treeitem')
      act(() => {
        items[0].focus()
      })
      expect(document.activeElement).toBe(items[0])

      await user.keyboard('{ArrowDown}')

      await waitFor(() => {
        expect(document.activeElement).toBe(items[1])
      })
    })

    it('should expand node with ArrowRight', async () => {
      const user = userEvent.setup()

      render(<Tree treeData={sampleTreeData} />)
      expect(screen.queryByText('Child 1-1')).not.toBeInTheDocument()

      const items = screen.getAllByRole('treeitem')
      act(() => {
        items[0].focus()
      })
      expect(document.activeElement).toBe(items[0])

      await user.keyboard('{ArrowRight}')

      await waitFor(() => {
        expect(screen.getByText('Child 1-1')).toBeInTheDocument()
      })
    })

    it('should navigate only visible items when filtering', async () => {
      const user = userEvent.setup()

      render(<Tree treeData={sampleTreeData} filterValue="Child 1" autoExpandParent />)

      expect(screen.queryByText('Parent 2')).not.toBeInTheDocument()

      const items = screen.getAllByRole('treeitem')
      expect(items.length).toBeGreaterThanOrEqual(2)

      act(() => {
        items[0].focus()
      })
      expect(document.activeElement).toBe(items[0])

      await user.keyboard('{ArrowDown}')

      await waitFor(() => {
        expect(document.activeElement).toBe(items[1])
      })
    })

    it('should keep focus after lazy-load expand', async () => {
      const user = userEvent.setup()
      const onLoadData = vi.fn(async () => [{ key: '1-1', label: 'Child 1-1' }])

      const lazyTreeData = [{ key: '1', label: 'Parent 1' }]

      render(<Tree treeData={lazyTreeData} loadData={onLoadData} defaultExpandedKeys={[]} />)

      const parentItem = screen.getAllByRole('treeitem')[0]
      act(() => {
        parentItem.focus()
      })
      expect(document.activeElement).toBe(parentItem)

      await user.keyboard('{ArrowRight}')

      await waitFor(() => {
        expect(onLoadData).toHaveBeenCalled()
        expect(screen.getByText('Child 1-1')).toBeInTheDocument()
      })

      expect(document.activeElement).toBe(parentItem)
    })

    it('should support multiple selection with Enter', async () => {
      const user = userEvent.setup()

      render(<Tree treeData={sampleTreeData} defaultExpandAll multiple />)

      const items = screen.getAllByRole('treeitem')
      act(() => {
        items[0].focus()
      })
      await user.keyboard('{Enter}')

      await user.keyboard('{ArrowDown}{Enter}')

      await waitFor(() => {
        expect(items[0]).toHaveAttribute('aria-selected', 'true')
        expect(items[1]).toHaveAttribute('aria-selected', 'true')
      })
    })

    it('should not cascade check when checkStrictly is true (Space)', async () => {
      const user = userEvent.setup()
      const onCheck = vi.fn()

      render(
        <Tree
          treeData={sampleTreeData}
          defaultExpandAll
          checkable
          checkStrictly
          onCheck={onCheck}
        />
      )

      const items = screen.getAllByRole('treeitem')
      act(() => {
        items[0].focus()
      })
      await user.keyboard(' ')

      await waitFor(() => {
        expect(items[0]).toHaveAttribute('aria-checked', 'true')
        expect(items[1]).toHaveAttribute('aria-checked', 'false')
        expect(onCheck).toHaveBeenCalled()
      })

      const last = onCheck.mock.calls.at(-1)
      const checkedKeys = last?.[0] as Array<string | number>
      expect(checkedKeys).toContain('1')
      expect(checkedKeys).not.toContain('1-1')
    })

    it('handles Home, End, ArrowUp, ArrowLeft, Escape, and expandable Space paths', async () => {
      const user = userEvent.setup()

      render(<Tree treeData={sampleTreeData} defaultExpandAll selectable={false} />)

      const items = screen.getAllByRole('treeitem')
      act(() => {
        items[2].focus()
      })

      await user.keyboard('{Home}')
      await waitFor(() => expect(document.activeElement).toBe(items[0]))

      await user.keyboard('{End}')
      await waitFor(() => expect(document.activeElement).toBe(items[4]))

      await user.keyboard('{ArrowUp}')
      await waitFor(() => expect(document.activeElement).toBe(items[3]))

      await user.keyboard('{ArrowLeft}')
      await waitFor(() => expect(screen.queryByText('Child 2-1')).not.toBeInTheDocument())

      const child = screen.getByText('Child 1-1').closest('[role="treeitem"]') as HTMLElement
      act(() => {
        child.focus()
      })
      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByText('Child 1-1')).not.toBeInTheDocument())

      const parent = screen.getByText('Parent 1').closest('[role="treeitem"]') as HTMLElement
      act(() => {
        parent.focus()
      })
      await user.keyboard(' ')
      await waitFor(() => expect(screen.getByText('Child 1-1')).toBeInTheDocument())
    })

    it('uses Enter to expand when selection is disabled', async () => {
      const user = userEvent.setup()

      render(<Tree treeData={sampleTreeData} selectionMode="none" />)
      const parent = screen.getAllByRole('treeitem')[0]
      act(() => {
        parent.focus()
      })

      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText('Child 1-1')).toBeInTheDocument()
        expect(parent).not.toHaveAttribute('aria-selected')
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
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('should not select disabled node', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      const dataWithDisabled = [
        { key: '1', label: 'Node 1', disabled: true },
        { key: '2', label: 'Node 2' }
      ]

      const { getByText } = render(
        <Tree treeData={dataWithDisabled} selectable onSelect={onSelect} />
      )

      await user.click(getByText('Node 1'))
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

      const { container } = render(<Tree treeData={sampleTreeData} checkable onCheck={onCheck} />)

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
        { key: '2', label: 'Node 2' }
      ]

      const { container } = render(<Tree treeData={dataWithDisabled} checkable onCheck={onCheck} />)

      const checkbox = container.querySelector('input[type="checkbox"][disabled]')

      if (checkbox) {
        await user.click(checkbox)
      }
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
  })

  describe('Block Node', () => {
    it('should apply block node styles when blockNode is true', () => {
      const { getByText } = render(<Tree treeData={sampleTreeData} blockNode />)

      const node = getByText('Parent 1').closest('[role="treeitem"]')
      expect(node).toBeTruthy()
    })
  })

  describe('Events', () => {
    it('should emit onNodeClick event when node is clicked', async () => {
      const user = userEvent.setup()
      const onNodeClick = vi.fn()

      const { getByText } = render(<Tree treeData={sampleTreeData} onNodeClick={onNodeClick} />)

      await user.click(getByText('Parent 1'))

      await waitFor(() => {
        expect(onNodeClick).toHaveBeenCalled()
      })
    })

    it('should emit onNodeExpand event when node expands', async () => {
      const user = userEvent.setup()
      const onNodeExpand = vi.fn()

      const { getByText } = render(<Tree treeData={sampleTreeData} onNodeExpand={onNodeExpand} />)

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
      rerender(<Tree treeData={sampleTreeData} checkable checkedKeys={['1']} onCheck={onCheck} />)

      await waitFor(() => {
        const updatedCheckbox = container.querySelector(
          'input[type="checkbox"]'
        ) as HTMLInputElement
        expect(updatedCheckbox.checked).toBe(true)
      })
    })

    it('supports controlled selected keys and multiple selection mode', () => {
      render(
        <Tree
          treeData={sampleTreeData}
          defaultExpandAll
          selectionMode="multiple"
          selectedKeys={['1', '1-1']}
        />
      )

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
    it('emits onDrop for different draggable tree nodes', () => {
      const onDrop = vi.fn()
      const { container } = render(
        <Tree treeData={sampleTreeData} defaultExpandAll draggable onDrop={onDrop} />
      )
      const items = container.querySelectorAll('[role="treeitem"]')

      fireEvent.dragStart(items[1])
      fireEvent.dragOver(items[2])
      fireEvent.drop(items[2])

      expect(onDrop.mock.calls[0][0]).toMatchObject({ dragKey: '1-1', dropKey: '1-2' })
    })

    it('ignores self drops and disabled draggable nodes', () => {
      const onDrop = vi.fn()
      const disabledData = [
        { key: 'disabled', label: 'Disabled', disabled: true },
        { key: 'target', label: 'Target' }
      ]
      const { container } = render(<Tree treeData={disabledData} draggable onDrop={onDrop} />)
      const items = container.querySelectorAll('[role="treeitem"]')

      expect(items[0]).not.toHaveAttribute('draggable')
      fireEvent.dragStart(items[1])
      fireEvent.drop(items[1])
      fireEvent.dragEnd(items[1])

      expect(onDrop).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Tree treeData={sampleTreeData} checkable defaultExpandAll searchable />
      )

      await expectNoA11yViolations(container)
    })

    it('names the tree from locale objects, not a hardcoded English fallback', () => {
      const { rerender } = render(
        <ConfigProvider locale={zhCN}>
          <Tree treeData={sampleTreeData} />
        </ConfigProvider>
      )
      expect(screen.getByRole('tree')).toHaveAttribute('aria-label', '树')

      rerender(
        <ConfigProvider locale={zhTW}>
          <Tree treeData={sampleTreeData} />
        </ConfigProvider>
      )
      expect(screen.getByRole('tree')).toHaveAttribute('aria-label', '樹')
    })
  })

  // v0.6.0 — searchable
  describe('Searchable (v0.6.0)', () => {
    it('renders search input when searchable is true', () => {
      render(<Tree treeData={sampleTreeData} searchable />)
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })
    it('filters when typing in search input', async () => {
      const user = userEvent.setup()
      render(<Tree treeData={sampleTreeData} searchable defaultExpandAll />)
      const input = screen.getByRole('searchbox')

      await user.type(input, 'Child 1-1')

      await waitFor(() => {
        expect(input).toHaveValue('Child 1-1')
        expect(screen.getByText('Child 1-1')).toBeInTheDocument()
        expect(screen.queryByText('Parent 2')).not.toBeInTheDocument()
      })
    })
  })

  describe('Virtual scrolling', () => {
    it('renders only a subset of items when virtual is enabled', () => {
      const largeTree = Array.from({ length: 500 }, (_, i) => ({
        key: `n-${i}`,
        label: `Node ${i}`
      }))

      const { container } = render(
        <Tree treeData={largeTree} virtual height={200} itemHeight={32} />
      )

      const items = container.querySelectorAll('[role="treeitem"]')
      expect(items.length).toBeGreaterThan(0)
      expect(items.length).toBeLessThan(50)
    })

    it('moves focus to the last virtual row with End', async () => {
      const user = userEvent.setup()
      const largeTree = Array.from({ length: 40 }, (_, i) => ({
        key: `n-${i}`,
        label: `Node ${i}`
      }))
      render(<Tree treeData={largeTree} virtual height={200} itemHeight={32} />)
      const first = screen.getByText('Node 0').closest('[role="treeitem"]') as HTMLElement
      act(() => {
        first.focus()
      })
      await user.keyboard('{End}')
      await waitFor(() => {
        expect(document.activeElement).toHaveTextContent('Node 39')
      })
    })
  })

  describe('Controller bindings', () => {
    it('treats 1 and "1" as the same expanded node', async () => {
      const user = userEvent.setup()
      render(
        <Tree
          treeData={[{ key: 1, label: 'One', children: [{ key: '1-1', label: 'Nested' }] }]}
          expandedKeys={['1']}
        />
      )
      expect(screen.getByText('Nested')).toBeInTheDocument()
      await user.click(screen.getByText('One'))
    })

    it('keeps a user-expanded node after treeData identity changes', async () => {
      const user = userEvent.setup()
      const first = [
        { key: '1', label: 'Parent 1', children: [{ key: '1-1', label: 'Child 1-1' }] }
      ]
      const { rerender } = render(<Tree treeData={first} />)
      const expand = screen.getByText('Parent 1').closest('[role="treeitem"]')?.querySelector('svg')
      if (expand) await user.click(expand)
      await waitFor(() => expect(screen.getByText('Child 1-1')).toBeInTheDocument())
      rerender(
        <Tree
          treeData={[
            { key: '1', label: 'Parent 1', children: [{ key: '1-1', label: 'Child 1-1' }] }
          ]}
        />
      )
      expect(screen.getByText('Child 1-1')).toBeInTheDocument()
    })

    it('expands a late tree with defaultExpandAll', async () => {
      const { rerender } = render(<Tree defaultExpandAll />)
      rerender(
        <Tree
          defaultExpandAll
          treeData={[{ key: '1', label: 'Parent', children: [{ key: '1-1', label: 'Leaf' }] }]}
        />
      )
      await waitFor(() => expect(screen.getByText('Leaf')).toBeInTheDocument())
    })

    it('clears loading when loadData rejects', async () => {
      const user = userEvent.setup()
      const loadData = vi.fn(() => Promise.reject(new Error('nope')))
      render(
        <Tree treeData={[{ key: '1', label: 'Parent 1', isLeaf: false }]} loadData={loadData} />
      )
      const expand = screen.getByText('Parent 1').closest('[role="treeitem"]')?.querySelector('svg')
      if (expand) await user.click(expand)
      await waitFor(() => expect(loadData).toHaveBeenCalled())
      await waitFor(() => {
        expect(
          screen
            .getByText('Parent 1')
            .closest('[role="treeitem"]')
            ?.querySelector('svg.animate-spin')
        ).toBeNull()
      })
    })

    it('keeps a roving tab stop after clicking a disabled node', async () => {
      const user = userEvent.setup()
      render(
        <Tree
          treeData={[
            { key: '1', label: 'On' },
            { key: '2', label: 'Off', disabled: true }
          ]}
        />
      )
      await user.click(screen.getByText('Off'))
      const enabled = screen.getByText('On').closest('[role="treeitem"]')
      expect(enabled).toHaveAttribute('tabindex', '0')
    })

    it('emits leaf keys for checkStrategy child when only a grandchild is checked', async () => {
      const user = userEvent.setup()
      const onCheckedKeysChange = vi.fn()
      render(
        <Tree
          treeData={sampleTreeData}
          defaultExpandAll
          checkable
          checkStrategy="child"
          checkedKeys={['1-1']}
          onCheckedKeysChange={onCheckedKeysChange}
        />
      )
      const leaf = screen.getByText('Child 1-1').closest('[role="treeitem"]')
      expect(leaf).toHaveAttribute('aria-checked', 'true')
      const boxes = document.querySelectorAll('input[type="checkbox"]')
      await user.click(boxes[0] as HTMLInputElement)
      await waitFor(() => expect(onCheckedKeysChange).toHaveBeenCalled())
      const keys = onCheckedKeysChange.mock.calls.at(-1)?.[0] as Array<string | number>
      expect(keys).toEqual(expect.arrayContaining(['1-1', '1-2']))
    })

    it('shows children after searching a parent label', async () => {
      render(<Tree treeData={sampleTreeData} defaultExpandAll filterValue="Parent 1" />)
      expect(screen.getByText('Parent 1')).toBeInTheDocument()
      expect(screen.getByText('Child 1-1')).toBeInTheDocument()
      expect(screen.queryByText('Parent 2')).not.toBeInTheDocument()
    })

    it('swaps ArrowRight/Left in rtl', async () => {
      const user = userEvent.setup()
      render(
        <ConfigProvider direction="rtl">
          <Tree treeData={sampleTreeData} />
        </ConfigProvider>
      )
      const parent = screen.getAllByRole('treeitem')[0]
      act(() => {
        parent.focus()
      })
      await user.keyboard('{ArrowLeft}')
      await waitFor(() => expect(screen.getByText('Child 1-1')).toBeInTheDocument())
    })
  })
})
