/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { h, defineComponent, ref } from 'vue'
import { TaskBoard } from '@expcat/tigercat-vue/TaskBoard'
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

    it('hides the plain card count when showCardCount is false', () => {
      render(TaskBoard, { props: { columns } })
      expect(screen.queryByText('2')).not.toBeInTheDocument()
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
      const addBtns = screen.getAllByRole('button', { name: /\+ Add task/ })

      await fireEvent.click(addBtns[1])
      await fireEvent.click(addBtns[2])

      expect(emitted()['card-add']).toEqual([['doing'], ['done']])
    })

    it('inserts a default card when allowAddCard is on and no handler is provided', async () => {
      const Wrapper = defineComponent({
        setup() {
          const cols = ref(columns)
          return () =>
            h(TaskBoard, {
              columns: cols.value,
              allowAddCard: true,
              'onUpdate:columns': (next: TaskBoardColumn[]) => {
                cols.value = next
              }
            })
        }
      })
      const { container } = render(Wrapper)
      expect(container.querySelectorAll('[data-tiger-taskboard-card]')).toHaveLength(3)
      await fireEvent.click(screen.getAllByText('Add task')[0])
      expect(container.querySelectorAll('[data-tiger-taskboard-card]')).toHaveLength(4)
      expect(screen.getByText('New task')).toBeInTheDocument()
    })

    it('does not insert a default card when onCardAdd is provided', async () => {
      const onCardAdd = vi.fn()
      const Wrapper = defineComponent({
        setup() {
          const cols = ref(columns)
          return () =>
            h(TaskBoard, {
              columns: cols.value,
              allowAddCard: true,
              onCardAdd,
              'onUpdate:columns': (next: TaskBoardColumn[]) => {
                cols.value = next
              }
            })
        }
      })
      const { container } = render(Wrapper)
      await fireEvent.click(screen.getAllByText('Add task')[0])
      expect(container.querySelectorAll('[data-tiger-taskboard-card]')).toHaveLength(3)
      expect(screen.queryByText('New task')).not.toBeInTheDocument()
    })

    it('inserts a default card from inner state when only defaultColumns is provided', async () => {
      const { container } = render(TaskBoard, {
        props: { defaultColumns: columns, allowAddCard: true }
      })
      expect(container.querySelectorAll('[data-tiger-taskboard-card]')).toHaveLength(3)
      await fireEvent.click(screen.getAllByText('Add task')[0])
      expect(container.querySelectorAll('[data-tiger-taskboard-card]')).toHaveLength(4)
      expect(screen.getByText('New task')).toBeInTheDocument()
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

    const filterDropColumns: TaskBoardColumn[] = [
      {
        id: 'todo',
        title: 'To Do',
        cards: [
          { id: 'a', title: '发布设计' },
          { id: 'b', title: '开发任务' },
          { id: 'c', title: '发布文档' },
          { id: 'd', title: '测试计划' }
        ]
      },
      {
        id: 'doing',
        title: 'In Progress',
        // description matches filterText so the source card stays in the DOM
        cards: [{ id: 'e', title: '代码审查', description: '发布' }]
      }
    ]

    it('maps a filterText drop index back to the source column', async () => {
      const { container, emitted } = render(TaskBoard, {
        props: { defaultColumns: filterDropColumns, filterText: '发布' }
      })
      const card = container.querySelector('[data-tiger-taskboard-card-id="e"]')!
      const targetBody = container
        .querySelectorAll('[data-tiger-taskboard-column]')[0]
        .querySelector('[role="list"]')!
      const dragData = JSON.stringify({ type: 'card', cardId: 'e', columnId: 'doing', index: 0 })

      await fireEvent.dragStart(card, { dataTransfer: { setData: vi.fn(), effectAllowed: '' } })
      await fireEvent.dragOver(targetBody, { clientY: 150 })
      await fireEvent.drop(targetBody, {
        dataTransfer: { getData: () => dragData, effectAllowed: '' }
      })

      await waitFor(() => expect(emitted()['card-move']).toBeTruthy())
      expect(emitted()['card-move'][0][0]).toMatchObject({
        cardId: 'e',
        fromColumnId: 'doing',
        toColumnId: 'todo',
        toIndex: 3
      })
      const next = emitted()['update:columns'][0][0] as TaskBoardColumn[]
      expect(next[0].cards.map((c) => c.id)).toEqual(['a', 'b', 'c', 'e', 'd'])
    })

    it('appends at the source length when dropping last without filterText', async () => {
      const { container, emitted } = render(TaskBoard, {
        props: { defaultColumns: filterDropColumns }
      })
      const card = container.querySelector('[data-tiger-taskboard-card-id="e"]')!
      const targetBody = container
        .querySelectorAll('[data-tiger-taskboard-column]')[0]
        .querySelector('[role="list"]')!
      const dragData = JSON.stringify({ type: 'card', cardId: 'e', columnId: 'doing', index: 0 })

      await fireEvent.dragStart(card, { dataTransfer: { setData: vi.fn(), effectAllowed: '' } })
      await fireEvent.dragOver(targetBody, { clientY: 150 })
      await fireEvent.drop(targetBody, {
        dataTransfer: { getData: () => dragData, effectAllowed: '' }
      })

      await waitFor(() => expect(emitted()['card-move']).toBeTruthy())
      expect(emitted()['card-move'][0][0]).toMatchObject({
        cardId: 'e',
        fromColumnId: 'doing',
        toColumnId: 'todo',
        toIndex: 4
      })
      const next = emitted()['update:columns'][0][0] as TaskBoardColumn[]
      expect(next[0].cards.map((c) => c.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
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

    it('should have no accessibility violations', async () => {
      const wipCols: TaskBoardColumn[] = [
        {
          id: 'todo',
          title: 'To Do',
          wipLimit: 1,
          cards: [
            { id: 'c1', title: 'Task 1' },
            { id: 'c2', title: 'Task 2' }
          ]
        },
        { id: 'done', title: 'Done', cards: [] }
      ]
      const { container } = render(TaskBoard, {
        props: { columns: wipCols, allowAddCard: true, showCardCount: true }
      })
      const card = container.querySelector('[data-tiger-taskboard-card]')!
      await fireEvent.keyDown(card, { key: 'Enter' })
      await expectNoA11yViolationsIsolated(container)
    })

    it('drops a grabbed card into an empty column from the keyboard', async () => {
      const Wrapper = defineComponent({
        setup() {
          const cols = ref(columns)
          return () =>
            h(TaskBoard, {
              columns: cols.value,
              'onUpdate:columns': (next: TaskBoardColumn[]) => {
                cols.value = next
              }
            })
        }
      })
      const { container } = render(Wrapper)
      const card = container.querySelector('[data-tiger-taskboard-card-id="c1"]')!
      await fireEvent.keyDown(card, { key: 'Enter' })
      const emptyList = container.querySelectorAll('[role="list"]')[2]
      await fireEvent.keyDown(emptyList, { key: 'Enter' })
      await waitFor(() => {
        expect(
          container
            .querySelectorAll('[data-tiger-taskboard-column]')[2]
            .querySelector('[data-tiger-taskboard-card-id="c1"]')
        ).toBeTruthy()
      })
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

  describe('Add card callback', () => {
    it('calls onCardAdd and does not insert a default card', async () => {
      const onCardAdd = vi.fn()
      const { container, emitted } = render(TaskBoard, { props: { columns, onCardAdd } })
      const addBtns = screen.getAllByText('Add task')
      await fireEvent.click(addBtns[0])
      expect(onCardAdd).toHaveBeenCalledWith('todo')
      expect(emitted()['card-add']).toBeTruthy()
      expect(emitted()['update:columns']).toBeFalsy()
      expect(container.querySelectorAll('[data-tiger-taskboard-card]')).toHaveLength(3)
    })
  })

  describe('Filter and visibility', () => {
    it('filters cards by filterText without changing source WIP counts', () => {
      const wipCols: TaskBoardColumn[] = [
        {
          id: 'todo',
          title: 'To Do',
          wipLimit: 5,
          cards: [
            { id: 'a', title: 'foo' },
            { id: 'b', title: 'bar' },
            { id: 'c', title: 'baz' }
          ]
        }
      ]
      render(TaskBoard, { props: { columns: wipCols, filterText: 'foo', showCardCount: true } })
      expect(screen.getByText('foo')).toBeInTheDocument()
      expect(screen.getByText('3/5')).toBeInTheDocument()
      expect(screen.queryByText('bar')).not.toBeInTheDocument()
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
      render(TaskBoard, { props: { columns, allowAddColumn: true } })
      expect(screen.getByRole('button', { name: '+ Add column' })).toBeInTheDocument()
    })

    it('emits column-add when add-column is clicked', async () => {
      const { emitted } = render(TaskBoard, {
        props: { columns, allowAddColumn: true }
      })
      await fireEvent.click(screen.getByRole('button', { name: '+ Add column' }))
      expect(emitted()['column-add']).toBeTruthy()
    })

    it('emits column-add from keyboard activation', async () => {
      const { emitted } = render(TaskBoard, {
        props: { columns, allowAddColumn: true }
      })
      const addColBtn = screen.getByRole('button', { name: '+ Add column' })
      await fireEvent.click(addColBtn)
      expect(emitted()['column-add']).toHaveLength(1)
    })

    it('does not render add-column button by default', () => {
      render(TaskBoard, { props: { columns } })
      expect(screen.queryByRole('button', { name: '+ Add column' })).not.toBeInTheDocument()
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
})
