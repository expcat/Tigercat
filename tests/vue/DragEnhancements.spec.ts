/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { List } from '@expcat/tigercat-vue/List'
import { Modal } from '@expcat/tigercat-vue/Modal'
import { Tree } from '@expcat/tigercat-vue/Tree'
import { expectNoA11yViolationsIsolated } from '../utils'

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

  it('puts a reorder handle on each row instead of HTML5-dragging the row', () => {
    render(List, {
      props: { dataSource: sampleListData, draggable: true }
    })
    const listItems = screen.getAllByRole('listitem')
    expect(listItems[0]).not.toHaveAttribute('draggable')
    expect(screen.getAllByRole('button', { name: 'Reorder' })).toHaveLength(3)
  })

  it('emits reorder from Alt+Arrow on the handle', async () => {
    const { emitted } = render(List, {
      props: { dataSource: sampleListData, draggable: true }
    })
    await fireEvent.keyDown(screen.getAllByRole('button', { name: 'Reorder' })[0], {
      key: 'ArrowDown',
      altKey: true
    })

    expect(emitted()).toHaveProperty('reorder')
    const reorderPayload = emitted()['reorder'][0] as unknown[]
    expect(reorderPayload[1]).toBe(0)
    expect(reorderPayload[2]).toBe(1)
  })

  it('does not emit reorder when Alt+Arrow would leave the list', async () => {
    const { emitted } = render(List, {
      props: { dataSource: sampleListData, draggable: true }
    })
    await fireEvent.keyDown(screen.getAllByRole('button', { name: 'Reorder' })[0], {
      key: 'ArrowUp',
      altKey: true
    })

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
    expect(dropPayload[0]).toEqual(
      expect.objectContaining({ dragKey: '1', dropKey: '2', dropPosition: 'inside' })
    )
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
      props: { open: true, title: 'Test Modal' }
    })
    const header = document.querySelector('[data-tiger-modal] > div:first-child')
    expect(header).toBeTruthy()
    expect((header as HTMLElement).style.cursor).not.toBe('grab')
  })

  it('adds grab cursor to header when draggable is true', () => {
    render(Modal, {
      props: { open: true, title: 'Draggable Modal', draggable: true }
    })
    const header = document.querySelector('[data-tiger-modal] > div:first-child')
    expect(header).toBeTruthy()
    expect((header as HTMLElement).style.cursor).toBe('grab')
  })

  it('applies transform on drag', async () => {
    render(Modal, {
      props: { open: true, title: 'Draggable Modal', draggable: true }
    })
    const header = document.querySelector('[data-tiger-modal] > div:first-child') as HTMLElement
    const dialog = document.querySelector('[data-tiger-modal]') as HTMLElement

    await fireEvent.pointerDown(header, { clientX: 100, clientY: 100, button: 0 })
    await fireEvent.pointerMove(document, { clientX: 150, clientY: 120 })
    await fireEvent.pointerUp(document)

    expect(dialog.style.transform).toBe('translate(50px, 48px)')
  })

  it('resets position when modal closes and reopens', async () => {
    const { rerender } = render(Modal, {
      props: { open: true, title: 'Draggable Modal', draggable: true }
    })
    const header = document.querySelector('[data-tiger-modal] > div:first-child') as HTMLElement

    await fireEvent.pointerDown(header, { clientX: 100, clientY: 100, button: 0 })
    await fireEvent.pointerMove(document, { clientX: 200, clientY: 200 })
    await fireEvent.pointerUp(document)

    // Close and reopen
    await rerender({
      open: false,
      title: 'Draggable Modal',
      draggable: true
    })
    await rerender({ open: true, title: 'Draggable Modal', draggable: true })

    const dialog = document.querySelector('[data-tiger-modal]') as HTMLElement
    // Position should be reset
    expect(dialog.style.transform).toBe('')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Modal, {
        props: { open: true, title: 'Test Modal' }
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(List, { props: { dataSource: sampleListData } })
      expect(container.firstChild).toBeTruthy()
    })
  })
})
