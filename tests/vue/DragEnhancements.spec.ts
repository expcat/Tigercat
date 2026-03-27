/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { List, Tree, Modal } from '@expcat/tigercat-vue'

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
    render(List, {
      props: { dataSource: sampleListData }
    })
    const listItems = screen.getAllByRole('listitem')
    expect(listItems[0]).not.toHaveAttribute('draggable')
  })

  it('adds draggable attribute when draggable is true', () => {
    render(List, {
      props: { dataSource: sampleListData, draggable: true }
    })
    const listItems = screen.getAllByRole('listitem')
    expect(listItems[0]).toHaveAttribute('draggable', 'true')
  })

  it('emits reorder event on drag and drop', async () => {
    const { emitted } = render(List, {
      props: { dataSource: sampleListData, draggable: true }
    })
    const listItems = screen.getAllByRole('listitem')

    await fireEvent.dragStart(listItems[0])
    await fireEvent.dragOver(listItems[2])
    await fireEvent.drop(listItems[2])

    expect(emitted()).toHaveProperty('reorder')
    const reorderPayload = emitted()['reorder'][0] as unknown[]
    // Should contain the reordered items array, fromIndex, toIndex
    expect(reorderPayload[1]).toBe(0) // fromIndex
    expect(reorderPayload[2]).toBe(2) // toIndex
  })

  it('does not emit reorder when dropping on same position', async () => {
    const { emitted } = render(List, {
      props: { dataSource: sampleListData, draggable: true }
    })
    const listItems = screen.getAllByRole('listitem')

    await fireEvent.dragStart(listItems[0])
    await fireEvent.drop(listItems[0])

    expect(emitted()['reorder']).toBeUndefined()
  })
})

describe('Tree - Drag Enhancements', () => {
  it('does not add draggable attribute when draggable is false', () => {
    render(Tree, {
      props: { treeData: sampleTreeData, defaultExpandAll: true }
    })
    const treeItem = screen.getByText('Node 1').closest('[role="treeitem"]')
    expect(treeItem).not.toHaveAttribute('draggable')
  })

  it('adds draggable attribute when draggable is true', () => {
    render(Tree, {
      props: { treeData: sampleTreeData, defaultExpandAll: true, draggable: true }
    })
    const treeItem = screen.getByText('Node 1').closest('[role="treeitem"]')
    expect(treeItem).toHaveAttribute('draggable', 'true')
  })

  it('emits drop event on drag and drop between nodes', async () => {
    const { emitted } = render(Tree, {
      props: { treeData: sampleTreeData, defaultExpandAll: true, draggable: true }
    })
    const node1 = screen.getByText('Node 1').closest('[role="treeitem"]')!
    const node2 = screen.getByText('Node 2').closest('[role="treeitem"]')!

    await fireEvent.dragStart(node1)
    await fireEvent.dragOver(node2)
    await fireEvent.drop(node2)

    expect(emitted()).toHaveProperty('drop')
    const dropPayload = emitted()['drop'][0] as unknown[]
    expect(dropPayload[0]).toEqual({ dragKey: '1', dropKey: '2' })
  })

  it('does not emit drop when dropping on same node', async () => {
    const { emitted } = render(Tree, {
      props: { treeData: sampleTreeData, defaultExpandAll: true, draggable: true }
    })
    const node1 = screen.getByText('Node 1').closest('[role="treeitem"]')!

    await fireEvent.dragStart(node1)
    await fireEvent.drop(node1)

    expect(emitted()['drop']).toBeUndefined()
  })

  it('does not make disabled nodes draggable', () => {
    const treeDataWithDisabled = [
      { key: '1', label: 'Normal Node' },
      { key: '2', label: 'Disabled Node', disabled: true }
    ]
    render(Tree, {
      props: { treeData: treeDataWithDisabled, draggable: true }
    })
    const disabledItem = screen.getByText('Disabled Node').closest('[role="treeitem"]')
    expect(disabledItem).not.toHaveAttribute('draggable')
  })
})

describe('Modal - Drag Enhancements', () => {
  it('does not add drag cursor when draggable is false', () => {
    render(Modal, {
      props: { open: true, title: 'Test Modal', disableTeleport: true }
    })
    const header = document.querySelector('[data-tiger-modal] > div:first-child')
    expect(header).toBeTruthy()
    expect((header as HTMLElement).style.cursor).not.toBe('grab')
  })

  it('adds grab cursor to header when draggable is true', () => {
    render(Modal, {
      props: { open: true, title: 'Draggable Modal', draggable: true, disableTeleport: true }
    })
    const header = document.querySelector('[data-tiger-modal] > div:first-child')
    expect(header).toBeTruthy()
    expect((header as HTMLElement).style.cursor).toBe('grab')
  })

  it('applies transform on drag', async () => {
    render(Modal, {
      props: { open: true, title: 'Draggable Modal', draggable: true, disableTeleport: true }
    })
    const header = document.querySelector('[data-tiger-modal] > div:first-child') as HTMLElement
    const dialog = document.querySelector('[data-tiger-modal]') as HTMLElement

    await fireEvent.mouseDown(header, { clientX: 100, clientY: 100 })
    await fireEvent.mouseMove(document, { clientX: 150, clientY: 120 })
    await fireEvent.mouseUp(document)

    expect(dialog.style.transform).toBe('translate(50px, 20px)')
  })

  it('resets position when modal closes and reopens', async () => {
    const { rerender } = render(Modal, {
      props: { open: true, title: 'Draggable Modal', draggable: true, disableTeleport: true }
    })
    const header = document.querySelector('[data-tiger-modal] > div:first-child') as HTMLElement

    await fireEvent.mouseDown(header, { clientX: 100, clientY: 100 })
    await fireEvent.mouseMove(document, { clientX: 200, clientY: 200 })
    await fireEvent.mouseUp(document)

    // Close and reopen
    await rerender({
      open: false,
      title: 'Draggable Modal',
      draggable: true,
      disableTeleport: true
    })
    await rerender({ open: true, title: 'Draggable Modal', draggable: true, disableTeleport: true })

    const dialog = document.querySelector('[data-tiger-modal]') as HTMLElement
    // Position should be reset
    expect(dialog.style.transform).toBe('')
  })
})
