/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Kanban } from '@expcat/tigercat-react/Kanban'
import type { TaskBoardColumn } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils/react'

const columns: TaskBoardColumn[] = [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { id: '1', title: 'Task 1', description: 'First task' },
      { id: '2', title: 'Task 2' }
    ]
  },
  {
    id: 'doing',
    title: 'In Progress',
    cards: [{ id: '3', title: 'Task 3' }],
    wipLimit: 3
  },
  {
    id: 'done',
    title: 'Done',
    cards: []
  }
]

function renderKanban(props: Record<string, unknown> = {}) {
  return render(<Kanban columns={columns} {...props} />)
}

describe('Kanban', () => {
  describe('Rendering', () => {
    it('should render the board', () => {
      const { container } = renderKanban()
      expect(container.querySelector('[role="region"]')).toBeTruthy()
    })

    it('should render all columns', () => {
      const { container } = renderKanban()
      const cols = container.querySelectorAll('[data-tiger-taskboard-column]')
      expect(cols.length).toBe(3)
    })

    it('should render cards', () => {
      const { container } = renderKanban()
      const cards = container.querySelectorAll('[data-tiger-taskboard-card]')
      expect(cards.length).toBe(3)
    })

    it('should render card titles', () => {
      const { getByText } = renderKanban()
      expect(getByText('Task 1')).toBeTruthy()
      expect(getByText('Task 2')).toBeTruthy()
      expect(getByText('Task 3')).toBeTruthy()
    })

    it('should render column headers', () => {
      const { getByText } = renderKanban()
      expect(getByText('To Do')).toBeTruthy()
      expect(getByText('In Progress')).toBeTruthy()
      expect(getByText('Done')).toBeTruthy()
    })
  })

  describe('Card count', () => {
    it('should show card count when showCardCount is true', () => {
      const { container } = renderKanban({ showCardCount: true })
      const text = container.textContent
      expect(text).toContain('2')
      expect(text).toContain('1/3')
    })

    it('should hide card count badge when showCardCount is false', () => {
      const { container } = renderKanban({ showCardCount: false })
      // With showCardCount disabled, the badge-style count is hidden
      // but the inline WIP display (1/3) still appears for WIP-limited columns
      const badges = container.querySelectorAll('.inline-flex.items-center.justify-center')
      expect(badges.length).toBe(0)
    })
  })

  describe('Filtering', () => {
    it('should filter cards by filterText', () => {
      const { container } = renderKanban({ filterText: 'Task 1' })
      const cards = container.querySelectorAll('[data-tiger-taskboard-card]')
      expect(cards.length).toBe(1)
    })

    it('should show all cards when filterText is empty', () => {
      const { container } = renderKanban({ filterText: '' })
      const cards = container.querySelectorAll('[data-tiger-taskboard-card]')
      expect(cards.length).toBe(3)
    })
  })

  describe('Hidden columns', () => {
    it('should hide specified columns', () => {
      const { container } = renderKanban({ hiddenColumns: ['done'] })
      const cols = container.querySelectorAll('[data-tiger-taskboard-column]')
      expect(cols.length).toBe(2)
    })
  })

  describe('Swimlanes', () => {
    const swimlaneColumns: TaskBoardColumn[] = [
      {
        id: 'todo',
        title: 'To Do',
        cards: [
          { id: '1', title: 'Bug task', type: 'bug' },
          { id: '2', title: 'Feature task', type: 'feature' },
          { id: '3', title: 'Unassigned task' }
        ]
      }
    ]

    it('groups cards by swimlane field', () => {
      const { container, getByText } = render(
        <Kanban
          columns={swimlaneColumns}
          swimlaneField="type"
          swimlanes={[
            { id: 'bug', label: 'Bugs', color: '#ef4444' },
            { id: 'feature', label: 'Features' }
          ]}
        />
      )

      expect(container.querySelectorAll('[data-tiger-kanban-swimlane]').length).toBe(3)
      expect(getByText('Bugs')).toBeTruthy()
      expect(getByText('Features')).toBeTruthy()
      expect(getByText('Unassigned')).toBeTruthy()
      expect(getByText('Bug task')).toBeTruthy()
      expect(getByText('Feature task')).toBeTruthy()
      expect(getByText('Unassigned task')).toBeTruthy()
    })

    it('hides cards for collapsed swimlanes', () => {
      const { container, queryByText } = render(
        <Kanban
          columns={swimlaneColumns}
          swimlaneField="type"
          swimlanes={[{ id: 'bug', label: 'Bugs', collapsed: true }]}
        />
      )
      const lane = container.querySelector('[data-tiger-kanban-swimlane-id="bug"]')
      expect(lane?.querySelector('[data-tiger-taskboard-card]')).toBeNull()
      expect(queryByText('Bug task')).not.toBeInTheDocument()
    })
  })

  describe('Add card', () => {
    it('should show add card button when allowAddCard is true', () => {
      const { container } = renderKanban({ allowAddCard: true })
      expect(container.querySelectorAll('button').length).toBeGreaterThanOrEqual(3)
    })

    it('should call onCardAdd when add card is clicked', () => {
      const onCardAdd = vi.fn()
      renderKanban({ allowAddCard: true, onCardAdd })
      fireEvent.click(screen.getAllByRole('button', { name: /\+ Add task/ })[0])
      expect(onCardAdd).toHaveBeenCalledWith('todo')
    })

    it('should hide add card button when allowAddCard is false', () => {
      const { container } = renderKanban({ allowAddCard: false })
      expect(container.querySelectorAll('button').length).toBe(0)
    })

    it('inserts a default card when allowAddCard is on and no handler is provided', () => {
      function Bound() {
        const [cols, setCols] = React.useState(columns)
        return <Kanban columns={cols} onColumnsChange={setCols} allowAddCard />
      }
      const { container } = render(<Bound />)
      expect(container.querySelectorAll('[data-tiger-taskboard-card]')).toHaveLength(3)
      fireEvent.click(screen.getAllByRole('button', { name: /\+ Add task/ })[0])
      expect(container.querySelectorAll('[data-tiger-taskboard-card]')).toHaveLength(4)
      expect(container.textContent).toContain('New task')
    })

    it('does not insert a default card when onCardAdd is provided', () => {
      const onCardAdd = vi.fn()
      function Bound() {
        const [cols, setCols] = React.useState(columns)
        return (
          <Kanban columns={cols} onColumnsChange={setCols} allowAddCard onCardAdd={onCardAdd} />
        )
      }
      const { container } = render(<Bound />)
      fireEvent.click(screen.getAllByRole('button', { name: /\+ Add task/ })[0])
      expect(onCardAdd).toHaveBeenCalledWith('todo')
      expect(container.querySelectorAll('[data-tiger-taskboard-card]')).toHaveLength(3)
      expect(container.textContent).not.toContain('New task')
    })

    it('inserts a default card from inner state when only defaultColumns is provided', () => {
      const { container } = render(<Kanban defaultColumns={columns} allowAddCard />)
      expect(container.querySelectorAll('[data-tiger-taskboard-card]')).toHaveLength(3)
      fireEvent.click(screen.getAllByRole('button', { name: /\+ Add task/ })[0])
      expect(container.querySelectorAll('[data-tiger-taskboard-card]')).toHaveLength(4)
      expect(container.textContent).toContain('New task')
    })
  })

  describe('Add column', () => {
    it('should show add column button when allowAddColumn is true', () => {
      renderKanban({ allowAddColumn: true, allowAddCard: false })
      expect(screen.getByRole('button', { name: '+ Add column' })).toBeInTheDocument()
    })

    it('should call onColumnAdd when add column is clicked', () => {
      const onColumnAdd = vi.fn()
      renderKanban({ allowAddColumn: true, allowAddCard: false, onColumnAdd })
      fireEvent.click(screen.getByRole('button', { name: '+ Add column' }))
      expect(onColumnAdd).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have role="region" on the board', () => {
      const { container } = renderKanban()
      expect(container.querySelector('[role="region"]')).toBeTruthy()
    })

    it('should have aria-label on the board', () => {
      const { container } = renderKanban()
      const board = container.querySelector('[role="region"]')
      expect(board?.getAttribute('aria-label')).toBe('Task Board')
    })

    it('should set draggable on cards', () => {
      const { container } = renderKanban()
      const cards = container.querySelectorAll('[data-tiger-taskboard-card]')
      cards.forEach((card) => {
        expect(card.getAttribute('draggable')).toBe('true')
      })
    })

    it('should set draggable on columns', () => {
      const { container } = renderKanban()
      // TaskBoard sets draggable on the column header, not the column container
      const headers = container.querySelectorAll('[data-tiger-taskboard-column] > div:first-child')
      headers.forEach((header) => {
        expect(header.getAttribute('draggable')).toBe('true')
      })
    })

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Kanban
          columns={columns}
          swimlanes={[
            { id: 'bug', label: 'Bugs' },
            { id: 'feature', label: 'Features' }
          ]}
          swimlaneField="type"
          allowAddCard
          showCardCount
        />
      )
      await expectNoA11yViolationsIsolated(container)
    })

    it('accepts locale and labels like TaskBoard', () => {
      render(
        <Kanban
          columns={columns}
          allowAddColumn
          locale={{ taskBoard: { addColumnText: '新增欄' } }}
        />
      )
      expect(screen.getByRole('button', { name: '+ 新增欄' })).toBeInTheDocument()
    })
  })

  describe('Custom renderers', () => {
    it('should use renderCard when provided', () => {
      const { getByText } = renderKanban({
        renderCard: (card: { title: string }) => <div data-custom>{card.title} (custom)</div>
      })
      expect(getByText('Task 1 (custom)')).toBeTruthy()
    })

    it('should use renderColumnHeader when provided', () => {
      const { getByText } = renderKanban({
        renderColumnHeader: (col: { title: string }) => <span>{col.title} ★</span>
      })
      expect(getByText('To Do ★')).toBeTruthy()
    })
  })
})
