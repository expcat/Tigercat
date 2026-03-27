import { describe, it, expect } from 'vitest'
import {
  filterCards,
  filterColumns,
  groupBySwimlane,
  getColumnCardCount,
  getKanbanContainerClasses,
  kanbanBoardClasses,
  kanbanCardCountClasses,
  kanbanAddColumnClasses,
  type TaskBoardColumn,
  type TaskBoardCard,
  type KanbanSwimlane
} from '@expcat/tigercat-core'

// ─── Test data ────────────────────────────────────────────────────

const cards: TaskBoardCard[] = [
  { id: '1', title: 'Fix login bug', description: 'Users cannot sign in' },
  { id: '2', title: 'Add dashboard', description: 'New analytics dashboard' },
  { id: '3', title: 'Update docs', description: 'API reference update' }
]

const columns: TaskBoardColumn[] = [
  { id: 'todo', title: 'To Do', cards: [cards[0], cards[1]] },
  { id: 'doing', title: 'In Progress', cards: [cards[2]], wipLimit: 3 },
  { id: 'done', title: 'Done', cards: [] }
]

// ─── filterCards ──────────────────────────────────────────────────

describe('filterCards', () => {
  it('returns all cards when filter is empty', () => {
    expect(filterCards(cards, '')).toEqual(cards)
  })

  it('returns all cards when filter is whitespace', () => {
    expect(filterCards(cards, '   ')).toEqual(cards)
  })

  it('filters by title', () => {
    const result = filterCards(cards, 'login')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('filters by description', () => {
    const result = filterCards(cards, 'analytics')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('is case-insensitive', () => {
    const result = filterCards(cards, 'LOGIN')
    expect(result).toHaveLength(1)
  })

  it('returns empty when no match', () => {
    expect(filterCards(cards, 'nonexistent')).toHaveLength(0)
  })
})

// ─── filterColumns ────────────────────────────────────────────────

describe('filterColumns', () => {
  it('applies filter to all columns', () => {
    const result = filterColumns(columns, 'login')
    expect(result[0].cards).toHaveLength(1) // todo column: only "Fix login bug"
    expect(result[1].cards).toHaveLength(0) // doing column: no match
  })

  it('hides specified columns', () => {
    const result = filterColumns(columns, '', ['done'])
    expect(result).toHaveLength(2)
    expect(result.map((c) => c.id)).toEqual(['todo', 'doing'])
  })

  it('combines filter and hidden columns', () => {
    const result = filterColumns(columns, 'docs', ['todo'])
    expect(result).toHaveLength(2) // doing + done
    expect(result[0].cards).toHaveLength(1) // doing: "Update docs"
  })

  it('returns all when no filter or hidden', () => {
    const result = filterColumns(columns, '')
    expect(result).toHaveLength(3)
  })
})

// ─── groupBySwimlane ──────────────────────────────────────────────

describe('groupBySwimlane', () => {
  const swimlanes: KanbanSwimlane[] = [
    { id: 'bug', label: 'Bugs', color: 'red' },
    { id: 'feature', label: 'Features', color: 'blue' }
  ]

  const taggedCards = [
    { id: '1', title: 'Bug 1', type: 'bug' },
    { id: '2', title: 'Feature 1', type: 'feature' },
    { id: '3', title: 'No type' }
  ] as unknown as TaskBoardCard[]

  it('groups cards by field', () => {
    const result = groupBySwimlane(taggedCards, swimlanes, 'type')
    expect(result).toHaveLength(3) // bugs, features, unassigned
    expect(result[0].swimlane.id).toBe('bug')
    expect(result[0].cards).toHaveLength(1)
    expect(result[1].swimlane.id).toBe('feature')
    expect(result[1].cards).toHaveLength(1)
    expect(result[2].swimlane.id).toBe('__unassigned')
    expect(result[2].cards).toHaveLength(1)
  })

  it('handles empty cards', () => {
    const result = groupBySwimlane([], swimlanes, 'type')
    expect(result).toHaveLength(2) // just the two swimlanes, no unassigned
    expect(result[0].cards).toHaveLength(0)
    expect(result[1].cards).toHaveLength(0)
  })

  it('all cards unassigned when field does not exist', () => {
    const result = groupBySwimlane(taggedCards, swimlanes, 'priority')
    expect(result[0].cards).toHaveLength(0) // bug lane empty
    expect(result[1].cards).toHaveLength(0) // feature lane empty
    expect(result[2].swimlane.id).toBe('__unassigned')
    expect(result[2].cards).toHaveLength(3) // all unassigned
  })
})

// ─── getColumnCardCount ───────────────────────────────────────────

describe('getColumnCardCount', () => {
  it('returns count without limit', () => {
    const result = getColumnCardCount(columns[0])
    expect(result.count).toBe(2)
    expect(result.limit).toBeUndefined()
    expect(result.exceeded).toBe(false)
  })

  it('returns count with limit', () => {
    const result = getColumnCardCount(columns[1])
    expect(result.count).toBe(1)
    expect(result.limit).toBe(3)
    expect(result.exceeded).toBe(false)
  })

  it('detects exceeded WIP', () => {
    const col: TaskBoardColumn = {
      id: 'x',
      title: 'X',
      cards: [
        { id: 'a', title: 'A' },
        { id: 'b', title: 'B' },
        { id: 'c', title: 'C' }
      ],
      wipLimit: 2
    }
    const result = getColumnCardCount(col)
    expect(result.exceeded).toBe(true)
  })

  it('handles zero/no WIP limit', () => {
    const col: TaskBoardColumn = { id: 'y', title: 'Y', cards: [], wipLimit: 0 }
    const result = getColumnCardCount(col)
    expect(result.limit).toBeUndefined()
    expect(result.exceeded).toBe(false)
  })
})

// ─── getKanbanContainerClasses ────────────────────────────────────

describe('getKanbanContainerClasses', () => {
  it('returns base classes', () => {
    const result = getKanbanContainerClasses()
    expect(result).toContain(kanbanBoardClasses)
  })

  it('appends custom className', () => {
    const result = getKanbanContainerClasses('my-class')
    expect(result).toContain('my-class')
  })
})

// ─── Class constants exported ─────────────────────────────────────

describe('class constants', () => {
  it('exports card count classes', () => {
    expect(kanbanCardCountClasses).toBeTruthy()
  })

  it('exports add column classes', () => {
    expect(kanbanAddColumnClasses).toBeTruthy()
  })
})
