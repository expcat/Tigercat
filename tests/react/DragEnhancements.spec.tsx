/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { List, Tree, Modal } from '@expcat/tigercat-react'

const sampleListData = [
  { key: 1, title: 'Item 1' },
  { key: 2, title: 'Item 2' },
  { key: 3, title: 'Item 3' }
]

const sampleTreeData = [
  {
    key: '1',
    label: 'Node 1',
    children: [
      { key: '1-1', label: 'Child 1-1' },
      { key: '1-2', label: 'Child 1-2' }
    ]
  },
  { key: '2', label: 'Node 2' }
]

describe('List - Drag Enhancements', () => {
  it('does not add draggable attribute when draggable is false', () => {
    render(<List dataSource={sampleListData} />)
    const listItems = screen.getAllByRole('listitem')
    expect(listItems[0]).not.toHaveAttribute('draggable')
  })

  it('adds draggable attribute when draggable is true', () => {
    render(<List dataSource={sampleListData} draggable />)
    const listItems = screen.getAllByRole('listitem')
    expect(listItems[0]).toHaveAttribute('draggable', 'true')
  })

  it('calls onReorder on drag and drop', () => {
    const onReorder = vi.fn()
    render(<List dataSource={sampleListData} draggable onReorder={onReorder} />)
    const listItems = screen.getAllByRole('listitem')

    fireEvent.dragStart(listItems[0])
    fireEvent.dragOver(listItems[2])
    fireEvent.drop(listItems[2])

    expect(onReorder).toHaveBeenCalledTimes(1)
    const [reorderedItems, fromIndex, toIndex] = onReorder.mock.calls[0]
    expect(fromIndex).toBe(0)
    expect(toIndex).toBe(2)
  })

  it('does not call onReorder when dropping on same position', () => {
    const onReorder = vi.fn()
    render(<List dataSource={sampleListData} draggable onReorder={onReorder} />)
    const listItems = screen.getAllByRole('listitem')

    fireEvent.dragStart(listItems[0])
    fireEvent.drop(listItems[0])

    expect(onReorder).not.toHaveBeenCalled()
  })
})

describe('Tree - Drag Enhancements', () => {
  it('does not add draggable attribute when draggable is false', () => {
    render(<Tree treeData={sampleTreeData} defaultExpandAll />)
    const treeItem = screen.getByText('Node 1').closest('[role="treeitem"]')
    expect(treeItem).not.toHaveAttribute('draggable')
  })

  it('adds draggable attribute when draggable is true', () => {
    render(<Tree treeData={sampleTreeData} defaultExpandAll draggable />)
    const treeItem = screen.getByText('Node 1').closest('[role="treeitem"]')
    expect(treeItem).toHaveAttribute('draggable', 'true')
  })

  it('calls onDrop on drag and drop between nodes', () => {
    const onDrop = vi.fn()
    render(<Tree treeData={sampleTreeData} defaultExpandAll draggable onDrop={onDrop} />)
    const node1 = screen.getByText('Node 1').closest('[role="treeitem"]')!
    const node2 = screen.getByText('Node 2').closest('[role="treeitem"]')!

    fireEvent.dragStart(node1)
    fireEvent.dragOver(node2)
    fireEvent.drop(node2)

    expect(onDrop).toHaveBeenCalledWith({ dragKey: '1', dropKey: '2' })
  })

  it('does not call onDrop when dropping on same node', () => {
    const onDrop = vi.fn()
    render(<Tree treeData={sampleTreeData} defaultExpandAll draggable onDrop={onDrop} />)
    const node1 = screen.getByText('Node 1').closest('[role="treeitem"]')!

    fireEvent.dragStart(node1)
    fireEvent.drop(node1)

    expect(onDrop).not.toHaveBeenCalled()
  })

  it('does not make disabled nodes draggable', () => {
    const treeDataWithDisabled = [
      { key: '1', label: 'Normal Node' },
      { key: '2', label: 'Disabled Node', disabled: true }
    ]
    render(<Tree treeData={treeDataWithDisabled} draggable />)
    const disabledItem = screen.getByText('Disabled Node').closest('[role="treeitem"]')
    expect(disabledItem).not.toHaveAttribute('draggable')
  })
})

describe('Modal - Drag Enhancements', () => {
  it('does not add drag cursor when draggable is false', () => {
    render(<Modal open title="Test Modal" />)
    const header = document.querySelector('[data-tiger-modal] > div:first-child')
    expect(header).toBeTruthy()
    expect((header as HTMLElement).style.cursor).not.toBe('grab')
  })

  it('adds grab cursor to header when draggable is true', () => {
    render(<Modal open title="Draggable Modal" draggable />)
    const header = document.querySelector('[data-tiger-modal] > div:first-child')
    expect(header).toBeTruthy()
    expect((header as HTMLElement).style.cursor).toBe('grab')
  })

  it('applies transform on drag', async () => {
    render(<Modal open title="Draggable Modal" draggable />)
    const header = document.querySelector('[data-tiger-modal] > div:first-child') as HTMLElement
    const dialog = document.querySelector('[data-tiger-modal]') as HTMLElement

    fireEvent.mouseDown(header, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(document, { clientX: 150, clientY: 120 })
    fireEvent.mouseUp(document)

    expect(dialog.style.transform).toBe('translate(50px, 20px)')
  })

  it('resets position when modal closes and reopens', () => {
    const { rerender } = render(<Modal open title="Draggable Modal" draggable />)
    const header = document.querySelector('[data-tiger-modal] > div:first-child') as HTMLElement

    fireEvent.mouseDown(header, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(document, { clientX: 200, clientY: 200 })
    fireEvent.mouseUp(document)

    // Close and reopen
    rerender(<Modal open={false} title="Draggable Modal" draggable />)
    rerender(<Modal open title="Draggable Modal" draggable />)

    const dialog = document.querySelector('[data-tiger-modal]') as HTMLElement
    expect(dialog.style.transform).toBe('')
  })
})
