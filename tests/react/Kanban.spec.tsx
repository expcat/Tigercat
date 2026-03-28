/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { Kanban } from '@expcat/tigercat-react'
import type { TaskBoardColumn } from '@expcat/tigercat-core'

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
      const badges = container.querySelectorAll(
        '.inline-flex.items-center.justify-center'
      )
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

  describe('Add card', () => {
    it('should show add card button when allowAddCard is true', () => {
      const { container } = renderKanban({ allowAddCard: true })
      const addBtns = container.querySelectorAll('[role="button"]')
      expect(addBtns.length).toBeGreaterThanOrEqual(3)
    })

    it('should call onCardAdd when add card is clicked', () => {
      const onCardAdd = vi.fn()
      const { container } = renderKanban({ allowAddCard: true, onCardAdd })
      const addBtns = container.querySelectorAll('[role="button"]')
      fireEvent.click(addBtns[0])
      expect(onCardAdd).toHaveBeenCalledWith('todo')
    })

    it('should hide add card button when allowAddCard is false', () => {
      const { container } = renderKanban({ allowAddCard: false })
      const addBtns = container.querySelectorAll('[role="button"]')
      expect(addBtns.length).toBe(0)
    })
  })

  describe('Add column', () => {
    it('should show add column button when allowAddColumn is true', () => {
      const { container } = renderKanban({ allowAddColumn: true, allowAddCard: false })
      const addBtns = container.querySelectorAll('[role="button"]')
      expect(addBtns.length).toBe(1)
    })

    it('should call onColumnAdd when add column is clicked', () => {
      const onColumnAdd = vi.fn()
      const { container } = renderKanban({ allowAddColumn: true, allowAddCard: false, onColumnAdd })
      const addBtns = container.querySelectorAll('[role="button"]')
      fireEvent.click(addBtns[0])
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
