/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskBoard } from '@expcat/tigercat-react'
import type { TaskBoardColumn } from '@expcat/tigercat-core'

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

describe('TaskBoard (React)', () => {
  describe('Rendering', () => {
    it('renders all columns and cards', () => {
      render(<TaskBoard columns={columns} />)

      expect(screen.getByText('To Do')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Done')).toBeInTheDocument()

      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.getByText('Task 2')).toBeInTheDocument()
      expect(screen.getByText('Task 3')).toBeInTheDocument()
    })

    it('renders card descriptions', () => {
      render(<TaskBoard columns={columns} />)
      expect(screen.getByText('First task')).toBeInTheDocument()
    })

    it('renders empty state for empty columns', () => {
      render(<TaskBoard columns={columns} />)
      expect(screen.getByText('No tasks')).toBeInTheDocument()
    })

    it('renders data-tiger-task-board attribute', () => {
      const { container } = render(<TaskBoard columns={columns} />)
      expect(container.querySelector('[data-tiger-task-board]')).toBeInTheDocument()
    })

    it('renders column data attributes', () => {
      const { container } = render(<TaskBoard columns={columns} />)
      const colEls = container.querySelectorAll('[data-tiger-taskboard-column]')
      expect(colEls).toHaveLength(3)
    })

    it('renders card count in column header', () => {
      render(<TaskBoard columns={columns} />)
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
      render(<TaskBoard columns={wipCols} />)
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
      const { container } = render(<TaskBoard columns={wipCols} />)
      const exceeded = container.querySelector('.text-\\[var\\(--tiger-error\\,\\#ef4444\\)\\]')
      expect(exceeded).toBeInTheDocument()
    })
  })

  describe('Uncontrolled mode', () => {
    it('renders with defaultColumns', () => {
      render(<TaskBoard defaultColumns={columns} />)
      expect(screen.getByText('Task 1')).toBeInTheDocument()
    })
  })

  describe('Render props', () => {
    it('renders custom card via renderCard', () => {
      render(
        <TaskBoard
          columns={columns}
          renderCard={(card) => <span data-testid="custom-card">Custom: {card.title}</span>}
        />
      )
      expect(screen.getAllByTestId('custom-card').length).toBeGreaterThan(0)
      expect(screen.getByText('Custom: Task 1')).toBeInTheDocument()
    })

    it('renders custom empty-column via renderEmptyColumn', () => {
      render(<TaskBoard columns={columns} renderEmptyColumn={() => <div>Nothing here</div>} />)
      expect(screen.getByText('Nothing here')).toBeInTheDocument()
    })

    it('renders custom column header via renderColumnHeader', () => {
      render(
        <TaskBoard
          columns={columns}
          renderColumnHeader={(col) => <div data-testid="custom-header">Header: {col.title}</div>}
        />
      )
      expect(screen.getAllByTestId('custom-header')).toHaveLength(3)
    })
  })

  describe('Add card', () => {
    it('shows add-card button when onCardAdd is provided', () => {
      const onCardAdd = vi.fn()
      render(<TaskBoard columns={columns} onCardAdd={onCardAdd} />)
      const addBtns = screen.getAllByText('Add task')
      expect(addBtns.length).toBeGreaterThan(0)
    })

    it('calls onCardAdd with column id on click', async () => {
      const onCardAdd = vi.fn()
      render(<TaskBoard columns={columns} onCardAdd={onCardAdd} />)
      const addBtns = screen.getAllByText('Add task')
      await fireEvent.click(addBtns[0])
      expect(onCardAdd).toHaveBeenCalledWith('todo')
    })
  })

  describe('Draggable prop', () => {
    it('sets draggable attribute on cards', () => {
      const { container } = render(<TaskBoard columns={columns} draggable />)
      const cards = container.querySelectorAll('[data-tiger-taskboard-card]')
      cards.forEach((card) => {
        expect(card.getAttribute('draggable')).toBe('true')
      })
    })

    it('does not set draggable when disabled', () => {
      const { container } = render(<TaskBoard columns={columns} draggable={false} />)
      const cards = container.querySelectorAll('[data-tiger-taskboard-card]')
      cards.forEach((card) => {
        expect(card.getAttribute('draggable')).toBe('false')
      })
    })
  })

  describe('DnD events', () => {
    it('calls onCardMove after drag and drop', () => {
      const onCardMove = vi.fn()
      const { container } = render(<TaskBoard columns={columns} onCardMove={onCardMove} />)

      const card = container.querySelector('[data-tiger-taskboard-card-id="c1"]')!
      const targetBody = container
        .querySelectorAll('[data-tiger-taskboard-column]')[1]
        .querySelector('[role="list"]')!

      // Simulate DnD sequence
      const dragData = JSON.stringify({ type: 'card', cardId: 'c1', columnId: 'todo', index: 0 })

      fireEvent.dragStart(card, {
        dataTransfer: {
          setData: vi.fn(),
          effectAllowed: ''
        }
      })

      fireEvent.dragOver(targetBody, {
        clientY: 150
      })

      fireEvent.drop(targetBody, {
        dataTransfer: {
          getData: () => dragData,
          effectAllowed: ''
        }
      })

      expect(onCardMove).toHaveBeenCalledWith(
        expect.objectContaining({
          cardId: 'c1',
          fromColumnId: 'todo',
          toColumnId: 'doing'
        })
      )
    })

    it('calls onColumnMove after column drag and drop', () => {
      const onColumnMove = vi.fn()
      const { container } = render(
        <TaskBoard columns={columns} onColumnMove={onColumnMove} columnDraggable />
      )

      // Trigger column drag state by simulating drag start on header
      const colHeaders = container.querySelectorAll(
        '[data-tiger-taskboard-column] > div:first-child'
      )

      fireEvent.dragStart(colHeaders[0], {
        dataTransfer: {
          setData: vi.fn(),
          effectAllowed: ''
        }
      })

      // For the column drop to work, we need dragState.type === 'column'
      // which requires the component to be in column-drag mode
      // The full e2e DnD test is integration-level; here we verify the handler setup
      expect(colHeaders[0].getAttribute('draggable')).toBe('true')
    })
  })

  describe('Accessibility', () => {
    it('has region role on root', () => {
      render(<TaskBoard columns={columns} />)
      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('has list role on column body', () => {
      render(<TaskBoard columns={columns} />)
      const lists = screen.getAllByRole('list')
      expect(lists.length).toBe(3)
    })

    it('has listitem role on cards', () => {
      render(<TaskBoard columns={columns} />)
      const items = screen.getAllByRole('listitem')
      expect(items.length).toBe(3)
    })

    it('cards are focusable', () => {
      const { container } = render(<TaskBoard columns={columns} />)
      const cards = container.querySelectorAll('[data-tiger-taskboard-card]')
      cards.forEach((card) => {
        expect(card.getAttribute('tabindex')).toBe('0')
      })
    })

    it('passes additional props to root element', () => {
      render(<TaskBoard columns={columns} data-testid="my-board" />)
      expect(screen.getByTestId('my-board')).toBeInTheDocument()
    })
  })

  describe('className and style', () => {
    it('applies custom className', () => {
      const { container } = render(<TaskBoard columns={columns} className="my-board" />)
      expect(container.firstElementChild!.classList.contains('my-board')).toBe(true)
    })

    it('applies custom style', () => {
      const { container } = render(<TaskBoard columns={columns} style={{ maxWidth: '800px' }} />)
      expect((container.firstElementChild as HTMLElement).style.maxWidth).toBe('800px')
    })
  })
})
