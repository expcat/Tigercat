/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { Kanban } from '@expcat/tigercat-vue'
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
  return render(Kanban, {
    props: {
      columns,
      ...props
    }
  })
}

describe('Kanban', () => {
  describe('Rendering', () => {
    it('should render the board', () => {
      const { container } = renderKanban()
      expect(container.querySelector('[role="region"]')).toBeTruthy()
    })

    it('should render all columns', () => {
      const { container } = renderKanban()
      const cols = container.querySelectorAll('[data-kanban-column]')
      expect(cols.length).toBe(3)
    })

    it('should render cards', () => {
      const { container } = renderKanban()
      const cards = container.querySelectorAll('[data-kanban-card]')
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
      expect(text).toContain('2') // todo
      expect(text).toContain('1/3') // doing with WIP limit
    })

    it('should hide card count when showCardCount is false', () => {
      const { container } = renderKanban({ showCardCount: false })
      const text = container.textContent
      expect(text).not.toContain('1/3')
    })
  })

  describe('Filtering', () => {
    it('should filter cards by filterText', () => {
      const { container } = renderKanban({ filterText: 'Task 1' })
      const cards = container.querySelectorAll('[data-kanban-card]')
      expect(cards.length).toBe(1)
    })

    it('should show all cards when filterText is empty', () => {
      const { container } = renderKanban({ filterText: '' })
      const cards = container.querySelectorAll('[data-kanban-card]')
      expect(cards.length).toBe(3)
    })
  })

  describe('Hidden columns', () => {
    it('should hide specified columns', () => {
      const { container } = renderKanban({ hiddenColumns: ['done'] })
      const cols = container.querySelectorAll('[data-kanban-column]')
      expect(cols.length).toBe(2)
    })
  })

  describe('Add card', () => {
    it('should show add card button when allowAddCard is true', () => {
      const { container } = renderKanban({ allowAddCard: true })
      const addBtns = container.querySelectorAll('[role="button"]')
      // Each column gets an add button
      expect(addBtns.length).toBeGreaterThanOrEqual(3)
    })

    it('should emit card-add when add card is clicked', async () => {
      const { container, emitted } = renderKanban({ allowAddCard: true })
      const addBtns = container.querySelectorAll('[role="button"]')
      await fireEvent.click(addBtns[0])
      const events = emitted()['card-add']
      expect(events).toBeTruthy()
      expect(events[0][0]).toBe('todo')
    })

    it('should hide add card button when allowAddCard is false', () => {
      const { container } = renderKanban({ allowAddCard: false })
      // No add buttons (unless allowAddColumn is true)
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

    it('should emit column-add when add column is clicked', async () => {
      const { container, emitted } = renderKanban({ allowAddColumn: true, allowAddCard: false })
      const addBtns = container.querySelectorAll('[role="button"]')
      await fireEvent.click(addBtns[0])
      const events = emitted()['column-add']
      expect(events).toBeTruthy()
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
      expect(board?.getAttribute('aria-label')).toBe('Kanban board')
    })

    it('should set draggable on cards', () => {
      const { container } = renderKanban()
      const cards = container.querySelectorAll('[data-kanban-card]')
      cards.forEach((card) => {
        expect(card.getAttribute('draggable')).toBe('true')
      })
    })

    it('should set draggable on columns', () => {
      const { container } = renderKanban()
      const cols = container.querySelectorAll('[data-kanban-column]')
      cols.forEach((col) => {
        expect(col.getAttribute('draggable')).toBe('true')
      })
    })
  })
})
