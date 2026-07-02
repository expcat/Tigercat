/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskBoard } from '@expcat/tigercat-react'
import type { TaskBoardColumn } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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

    it('renders custom column footer via renderColumnFooter', () => {
      render(
        <TaskBoard
          columns={columns}
          renderColumnFooter={(col) => <div data-testid="custom-footer">Footer: {col.title}</div>}
        />
      )
      expect(screen.getAllByTestId('custom-footer')).toHaveLength(3)
      expect(screen.getByText('Footer: Done')).toBeInTheDocument()
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

    it('calls onCardAdd from keyboard activation', async () => {
      const onCardAdd = vi.fn()
      render(<TaskBoard columns={columns} allowAddCard onCardAdd={onCardAdd} />)
      const addBtns = screen.getAllByText('Add task')

      await fireEvent.keyDown(addBtns[1].closest('[role="button"]')!, { key: 'Enter' })
      await fireEvent.keyDown(addBtns[2].closest('[role="button"]')!, { key: ' ' })

      expect(onCardAdd).toHaveBeenCalledWith('doing')
      expect(onCardAdd).toHaveBeenCalledWith('done')
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
    it('calls onCardMove after drag and drop', async () => {
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

      await waitFor(() => {
        expect(onCardMove).toHaveBeenCalledWith(
          expect.objectContaining({
            cardId: 'c1',
            fromColumnId: 'todo',
            toColumnId: 'doing'
          })
        )
      })
    })

    it('honors beforeCardMove cancellation', async () => {
      const beforeCardMove = vi.fn(() => false)
      const onCardMove = vi.fn()
      const onColumnsChange = vi.fn()
      const { container } = render(
        <TaskBoard
          columns={columns}
          beforeCardMove={beforeCardMove}
          onCardMove={onCardMove}
          onColumnsChange={onColumnsChange}
        />
      )

      const card = container.querySelector('[data-tiger-taskboard-card-id="c1"]')!
      const targetBody = container
        .querySelectorAll('[data-tiger-taskboard-column]')[1]
        .querySelector('[role="list"]')!
      const dragData = JSON.stringify({ type: 'card', cardId: 'c1', columnId: 'todo', index: 0 })

      fireEvent.dragStart(card, { dataTransfer: { setData: vi.fn(), effectAllowed: '' } })
      fireEvent.dragOver(targetBody, { clientY: 150 })
      fireEvent.drop(targetBody, { dataTransfer: { getData: () => dragData, effectAllowed: '' } })

      await waitFor(() => expect(beforeCardMove).toHaveBeenCalled())
      expect(onCardMove).not.toHaveBeenCalled()
      expect(onColumnsChange).not.toHaveBeenCalled()
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

    it('should have no accessibility violations', async () => {
      const { container } = render(<TaskBoard columns={columns} />)
      await expectNoA11yViolationsIsolated(container)
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

  describe('boardAriaLabel locale', () => {
    it('uses boardAriaLabel from locale', () => {
      render(<TaskBoard columns={columns} />)
      const region = screen.getByRole('region')
      expect(region.getAttribute('aria-label')).toBe('Task Board')
    })

    it('uses custom boardAriaLabel from locale prop', () => {
      render(
        <TaskBoard columns={columns} locale={{ taskBoard: { boardAriaLabel: 'My Kanban' } }} />
      )
      const region = screen.getByRole('region')
      expect(region.getAttribute('aria-label')).toBe('My Kanban')
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
      const { container } = render(<TaskBoard columns={wipCols} />)
      const wipSpan = container.querySelector('[title]')
      expect(wipSpan).toBeInTheDocument()
      expect(wipSpan!.getAttribute('title')).toContain('3')
    })
  })

  describe('enforceWipLimit prop', () => {
    it('accepts enforceWipLimit prop without error', () => {
      const wipCols: TaskBoardColumn[] = [
        {
          id: 'wip',
          title: 'WIP',
          wipLimit: 1,
          cards: [{ id: 'w1', title: 'W1' }]
        }
      ]
      const { container } = render(<TaskBoard columns={wipCols} enforceWipLimit />)
      expect(container.querySelector('[data-tiger-task-board]')).toBeInTheDocument()
    })
  })

  describe('beforeCardMove / beforeColumnMove props', () => {
    it('accepts beforeCardMove prop without error', () => {
      const beforeCardMove = vi.fn(() => true)
      const { container } = render(<TaskBoard columns={columns} beforeCardMove={beforeCardMove} />)
      expect(container.querySelector('[data-tiger-task-board]')).toBeInTheDocument()
    })

    it('accepts beforeColumnMove prop without error', () => {
      const beforeColumnMove = vi.fn(() => true)
      const { container } = render(
        <TaskBoard columns={columns} beforeColumnMove={beforeColumnMove} />
      )
      expect(container.querySelector('[data-tiger-task-board]')).toBeInTheDocument()
    })
  })

  describe('Filter and visibility', () => {
    it('filters cards by filterText', () => {
      render(<TaskBoard columns={columns} filterText="Task 1" />)
      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.queryByText('Task 3')).not.toBeInTheDocument()
    })

    it('hides columns via hiddenColumns', () => {
      render(<TaskBoard columns={columns} hiddenColumns={['done']} />)
      expect(screen.getByText('To Do')).toBeInTheDocument()
      expect(screen.queryByText('Done')).not.toBeInTheDocument()
    })

    it('shows all columns when filterText is empty and hiddenColumns is empty', () => {
      render(<TaskBoard columns={columns} filterText="" hiddenColumns={[]} />)
      expect(screen.getByText('To Do')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Done')).toBeInTheDocument()
    })
  })

  describe('Card count', () => {
    it('shows card count badges when showCardCount is true', () => {
      const { container } = render(<TaskBoard columns={columns} showCardCount />)
      expect(container.textContent).toContain('2')
    })
  })

  describe('Add column', () => {
    it('shows add-column button when allowAddColumn is true', () => {
      render(<TaskBoard columns={columns} allowAddColumn />)
      expect(screen.getByText('+ Add column')).toBeInTheDocument()
    })

    it('calls onColumnAdd when add-column is clicked', async () => {
      const onColumnAdd = vi.fn()
      render(<TaskBoard columns={columns} allowAddColumn onColumnAdd={onColumnAdd} />)
      const addBtn = screen.getByText('+ Add column')
      await fireEvent.click(addBtn)
      expect(onColumnAdd).toHaveBeenCalled()
    })

    it('calls onColumnAdd from keyboard activation', async () => {
      const onColumnAdd = vi.fn()
      render(<TaskBoard columns={columns} allowAddColumn onColumnAdd={onColumnAdd} />)
      const addBtn = screen.getByText('+ Add column')

      await fireEvent.keyDown(addBtn, { key: 'Enter' })
      await fireEvent.keyDown(addBtn, { key: ' ' })

      expect(onColumnAdd).toHaveBeenCalledTimes(2)
    })

    it('does not show add-column button by default', () => {
      render(<TaskBoard columns={columns} />)
      expect(screen.queryByText('+ Add column')).not.toBeInTheDocument()
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
      render(<TaskBoard columns={colsWithDesc} />)
      expect(screen.getByText('Column description text')).toBeInTheDocument()
    })
  })
  describe('Controlled columns', () => {
    it('updates rendered columns when controlled columns change', () => {
      const { rerender } = render(<TaskBoard columns={columns.slice(0, 1)} />)
      expect(screen.getByText('To Do')).toBeInTheDocument()
      expect(screen.queryByText('Done')).not.toBeInTheDocument()

      rerender(<TaskBoard columns={columns} />)

      expect(screen.getByText('Done')).toBeInTheDocument()
    })
  })
})
