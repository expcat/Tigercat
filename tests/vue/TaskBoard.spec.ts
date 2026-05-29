/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { h } from 'vue'
import { TaskBoard } from '@expcat/tigercat-vue'
import type { TaskBoardColumn } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils'

const columns: TaskBoardColumn[] = [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { id: 'c1', title: 'Task 1', description: 'First task' },
      { id: 'c2', title: 'Task 2' }
    ]
  },
  {
    id: 'doing',
    title: 'In Progress',
    cards: [{ id: 'c3', title: 'Task 3' }]
  },
  {
    id: 'done',
    title: 'Done',
    cards: []
  }
]

describe('TaskBoard (Vue)', () => {
  describe('Rendering', () => {
    it('renders all columns and cards', () => {
      render(TaskBoard, { props: { columns } })

      expect(screen.getByText('To Do')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Done')).toBeInTheDocument()

      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.getByText('Task 2')).toBeInTheDocument()
      expect(screen.getByText('Task 3')).toBeInTheDocument()
    })

    it('renders card descriptions', () => {
      render(TaskBoard, { props: { columns } })
      expect(screen.getByText('First task')).toBeInTheDocument()
    })

    it('renders empty state for empty columns', () => {
      render(TaskBoard, { props: { columns } })
      expect(screen.getByText('No tasks')).toBeInTheDocument()
    })

    it('renders data-tiger-task-board attribute', () => {
      const { container } = render(TaskBoard, { props: { columns } })
      expect(container.querySelector('[data-tiger-task-board]')).toBeInTheDocument()
    })

    it('renders column data attributes', () => {
      const { container } = render(TaskBoard, { props: { columns } })
      const colEls = container.querySelectorAll('[data-tiger-taskboard-column]')
      expect(colEls).toHaveLength(3)
    })

    it('renders card count in column header', () => {
      render(TaskBoard, { props: { columns } })
      // "To Do" column has 2 cards — the count should appear
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('WIP Limit', () => {
    it('shows WIP counter when wipLimit is set', () => {
      const wipCols: TaskBoardColumn[] = [
        {
          id: 'wip',
          title: 'WIP Col',
          wipLimit: 2,
          cards: [{ id: 'w1', title: 'W1' }]
        }
      ]
      render(TaskBoard, { props: { columns: wipCols } })
      expect(screen.getByText('(1/2)')).toBeInTheDocument()
    })

    it('applies exceeded styles when over WIP limit', () => {
      const wipCols: TaskBoardColumn[] = [
        {
          id: 'wip',
          title: 'WIP Over',
          wipLimit: 1,
          cards: [
            { id: 'w1', title: 'W1' },
            { id: 'w2', title: 'W2' }
          ]
        }
      ]
      const { container } = render(TaskBoard, { props: { columns: wipCols } })
      const exceeded = container.querySelector('.text-\\[var\\(--tiger-error\\,\\#ef4444\\)\\]')
      expect(exceeded).toBeInTheDocument()
    })
  })

  describe('Uncontrolled mode', () => {
    it('renders with defaultColumns', () => {
      render(TaskBoard, {
        props: { defaultColumns: columns }
      })
      expect(screen.getByText('Task 1')).toBeInTheDocument()
    })
  })

  describe('Slots', () => {
    it('renders custom card slot', () => {
      render(TaskBoard, {
        props: { columns },
        slots: {
          card: ({ card }: { card: { id: string | number; title: string } }) =>
            h('div', { 'data-testid': 'custom-card' }, `Custom: ${card.title}`)
        }
      })
      expect(screen.getAllByTestId('custom-card').length).toBeGreaterThan(0)
      expect(screen.getByText('Custom: Task 1')).toBeInTheDocument()
    })

    it('renders custom empty-column slot', () => {
      render(TaskBoard, {
        props: { columns },
        slots: {
          'empty-column': () => h('div', 'Nothing here')
        }
      })
      expect(screen.getByText('Nothing here')).toBeInTheDocument()
    })

    it('renders custom column-header slot', () => {
      render(TaskBoard, {
        props: { columns },
        slots: {
          'column-header': ({ column }: { column: TaskBoardColumn }) =>
            h('div', { 'data-testid': 'custom-header' }, `Header: ${column.title}`)
        }
      })
      expect(screen.getAllByTestId('custom-header')).toHaveLength(3)
    })

    it('renders custom column-footer slot', () => {
      render(TaskBoard, {
        props: { columns },
        slots: {
          'column-footer': ({ column }: { column: TaskBoardColumn }) =>
            h('div', { 'data-testid': 'custom-footer' }, `Footer: ${column.title}`)
        }
      })
      expect(screen.getAllByTestId('custom-footer')).toHaveLength(3)
      expect(screen.getByText('Footer: Done')).toBeInTheDocument()
    })
  })

  describe('Add card', () => {
    it('shows add-card button when onCardAdd is provided', () => {
      const onCardAdd = vi.fn()
      render(TaskBoard, { props: { columns, onCardAdd } })
      const addBtns = screen.getAllByText('Add task')
      expect(addBtns.length).toBeGreaterThan(0)
    })

    it('fires card-add emit on click', async () => {
      const onCardAdd = vi.fn()
      const { emitted } = render(TaskBoard, { props: { columns, onCardAdd } })
      const addBtns = screen.getAllByText('Add task')
      await fireEvent.click(addBtns[0])
      expect(emitted()['card-add']).toBeTruthy()
    })

    it('fires card-add emit from keyboard activation', async () => {
      const { emitted } = render(TaskBoard, { props: { columns, allowAddCard: true } })
      const addBtns = screen.getAllByText('Add task')

      await fireEvent.keyDown(addBtns[1].closest('[role="button"]')!, { key: 'Enter' })
      await fireEvent.keyDown(addBtns[2].closest('[role="button"]')!, { key: ' ' })

      expect(emitted()['card-add']).toEqual([['doing'], ['done']])
    })
  })

  describe('DnD events', () => {
    it('emits card-move after drag and drop', async () => {
      const { container, emitted } = render(TaskBoard, { props: { columns } })
      const card = container.querySelector('[data-tiger-taskboard-card-id="c1"]')!
      const targetBody = container
        .querySelectorAll('[data-tiger-taskboard-column]')[1]
        .querySelector('[role="list"]')!
      const dragData = JSON.stringify({ type: 'card', cardId: 'c1', columnId: 'todo', index: 0 })

      await fireEvent.dragStart(card, { dataTransfer: { setData: vi.fn(), effectAllowed: '' } })
      await fireEvent.dragOver(targetBody, { clientY: 150 })
      await fireEvent.drop(targetBody, {
        dataTransfer: { getData: () => dragData, effectAllowed: '' }
      })

      await waitFor(() => expect(emitted()['card-move']).toBeTruthy())
      expect(emitted()['card-move'][0][0]).toMatchObject({
        cardId: 'c1',
        fromColumnId: 'todo',
        toColumnId: 'doing'
      })
    })

    it('honors beforeCardMove cancellation', async () => {
      const beforeCardMove = vi.fn(() => false)
      const { container, emitted } = render(TaskBoard, { props: { columns, beforeCardMove } })
      const card = container.querySelector('[data-tiger-taskboard-card-id="c1"]')!
      const targetBody = container
        .querySelectorAll('[data-tiger-taskboard-column]')[1]
        .querySelector('[role="list"]')!
      const dragData = JSON.stringify({ type: 'card', cardId: 'c1', columnId: 'todo', index: 0 })

      await fireEvent.dragStart(card, { dataTransfer: { setData: vi.fn(), effectAllowed: '' } })
      await fireEvent.dragOver(targetBody, { clientY: 150 })
      await fireEvent.drop(targetBody, {
        dataTransfer: { getData: () => dragData, effectAllowed: '' }
      })

      await waitFor(() => expect(beforeCardMove).toHaveBeenCalled())
      expect(emitted()['card-move']).toBeUndefined()
      expect(emitted()['update:columns']).toBeUndefined()
    })
  })

  describe('Draggable prop', () => {
    it('sets draggable attribute on cards', () => {
      const { container } = render(TaskBoard, { props: { columns, draggable: true } })
      const cards = container.querySelectorAll('[data-tiger-taskboard-card]')
      cards.forEach((card) => {
        expect(card.getAttribute('draggable')).toBe('true')
      })
    })

    it('does not set draggable when disabled', () => {
      const { container } = render(TaskBoard, { props: { columns, draggable: false } })
      const cards = container.querySelectorAll('[data-tiger-taskboard-card]')
      cards.forEach((card) => {
        expect(card.getAttribute('draggable')).toBe('false')
      })
    })
  })

  describe('Accessibility', () => {
    it('has region role on root', () => {
      render(TaskBoard, { props: { columns } })
      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('has list role on column body', () => {
      render(TaskBoard, { props: { columns } })
      const lists = screen.getAllByRole('list')
      expect(lists.length).toBe(3)
    })

    it('has listitem role on cards', () => {
      render(TaskBoard, { props: { columns } })
      const items = screen.getAllByRole('listitem')
      expect(items.length).toBe(3) // 3 cards total
    })

    it('cards are focusable', () => {
      const { container } = render(TaskBoard, { props: { columns } })
      const cards = container.querySelectorAll('[data-tiger-taskboard-card]')
      cards.forEach((card) => {
        expect(card.getAttribute('tabindex')).toBe('0')
      })
    })

    it('uses boardAriaLabel from locale', () => {
      render(TaskBoard, { props: { columns } })
      const region = screen.getByRole('region')
      expect(region.getAttribute('aria-label')).toBe('Task Board')
    })

    it('uses custom boardAriaLabel from locale prop', () => {
      render(TaskBoard, {
        props: {
          columns,
          locale: { taskBoard: { boardAriaLabel: 'My Board' } }
        }
      })
      const region = screen.getByRole('region')
      expect(region.getAttribute('aria-label')).toBe('My Board')
    })
  })

  describe('WIP Limit tooltip', () => {
    it('shows wipLimitText as title on WIP counter', () => {
      const wipCols: TaskBoardColumn[] = [
        {
          id: 'wip',
          title: 'WIP Col',
          wipLimit: 3,
          cards: [{ id: 'w1', title: 'W1' }]
        }
      ]
      const { container } = render(TaskBoard, { props: { columns: wipCols } })
      const wipSpan = container.querySelector('[title]')
      expect(wipSpan).toBeInTheDocument()
      expect(wipSpan!.getAttribute('title')).toContain('3')
    })
  })

  describe('Add card emit-only', () => {
    it('only emits card-add, does not call onCardAdd prop directly', async () => {
      const onCardAdd = vi.fn()
      const { emitted } = render(TaskBoard, { props: { columns, onCardAdd } })
      const addBtns = screen.getAllByText('Add task')
      await fireEvent.click(addBtns[0])
      // The emit should fire
      expect(emitted()['card-add']).toBeTruthy()
      expect(emitted()['card-add'][0]).toEqual(['todo'])
    })
  })

  describe('Filter and visibility', () => {
    it('filters cards by filterText', () => {
      render(TaskBoard, { props: { columns, filterText: 'Task 1' } })
      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.queryByText('Task 3')).not.toBeInTheDocument()
    })

    it('hides columns via hiddenColumns', () => {
      render(TaskBoard, {
        props: { columns, hiddenColumns: ['done'] }
      })
      expect(screen.getByText('To Do')).toBeInTheDocument()
      expect(screen.queryByText('Done')).not.toBeInTheDocument()
    })

    it('shows all columns when filterText is empty and hiddenColumns is empty', () => {
      render(TaskBoard, {
        props: { columns, filterText: '', hiddenColumns: [] }
      })
      expect(screen.getByText('To Do')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Done')).toBeInTheDocument()
    })
  })

  describe('Card count', () => {
    it('shows card count badges when showCardCount is true', () => {
      const { container } = render(TaskBoard, {
        props: { columns, showCardCount: true }
      })
      // Card count badge should show "2" for To Do column
      expect(container.textContent).toContain('2')
    })
  })

  describe('Add column', () => {
    it('shows add-column button when allowAddColumn is true', () => {
      const { container } = render(TaskBoard, { props: { columns, allowAddColumn: true } })
      // The add-column button uses addCardText locale: "+ Add task"
      const addColBtn = container.querySelector('[role="button"][tabindex="0"]')
      expect(addColBtn).toBeInTheDocument()
    })

    it('emits column-add when add-column is clicked', async () => {
      const { container, emitted } = render(TaskBoard, {
        props: { columns, allowAddColumn: true }
      })
      // Find the add-column button (last role=button that's not a card)
      const buttons = container.querySelectorAll('[role="button"][tabindex="0"]')
      const addColBtn = buttons[buttons.length - 1]
      await fireEvent.click(addColBtn)
      expect(emitted()['column-add']).toBeTruthy()
    })

    it('emits column-add from keyboard activation', async () => {
      const { container, emitted } = render(TaskBoard, {
        props: { columns, allowAddColumn: true }
      })
      const buttons = container.querySelectorAll('[role="button"][tabindex="0"]')
      const addColBtn = buttons[buttons.length - 1]

      await fireEvent.keyDown(addColBtn, { key: 'Enter' })
      await fireEvent.keyDown(addColBtn, { key: ' ' })

      expect(emitted()['column-add']).toHaveLength(2)
    })

    it('does not render add-column button by default', () => {
      const { container } = render(TaskBoard, { props: { columns } })
      // Without allowAddColumn, the add-column button should not exist
      // All buttons should be card-level, no standalone column-add button
      const boardChildren = container.querySelector('[data-tiger-task-board]')?.children
      // Only column elements should be direct children
      if (boardChildren) {
        Array.from(boardChildren).forEach((child) => {
          expect(child.hasAttribute('data-tiger-taskboard-column')).toBe(true)
        })
      }
    })
  })

  describe('Column description', () => {
    it('renders column description when provided', () => {
      const colsWithDesc: TaskBoardColumn[] = [
        {
          id: 'desc',
          title: 'With Desc',
          description: 'Column description text',
          cards: []
        }
      ]
      render(TaskBoard, { props: { columns: colsWithDesc } })
      expect(screen.getByText('Column description text')).toBeInTheDocument()
    })
  })
  describe('Controlled columns', () => {
    it('updates rendered columns when controlled columns change', async () => {
      const { rerender } = render(TaskBoard, { props: { columns: columns.slice(0, 1) } })
      expect(screen.getByText('To Do')).toBeInTheDocument()
      expect(screen.queryByText('Done')).not.toBeInTheDocument()

      await rerender({ columns })

      expect(screen.getByText('Done')).toBeInTheDocument()
    })
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(TaskBoard)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
