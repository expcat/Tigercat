import { describe, it, expect } from 'vitest'
import {
  filterCards,
  resolveTaskBoardView,
  groupBySwimlane,
  getColumnCardCount,
  kanbanCardCountClasses,
  kanbanAddColumnClasses,
  UNASSIGNED_SWIMLANE_ID,
  type TaskBoardColumn,
  type TaskBoardCard,
  type TaskBoardSwimlane
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

describe('resolveTaskBoardView', () => {
  it('filters visible cards and keeps the source column', () => {
    const view = resolveTaskBoardView({ columns, filterText: 'login' })
    expect(view.columns[0].visibleCards).toHaveLength(1)
    expect(view.columns[0].source.cards).toHaveLength(2)
    expect(view.columns[1].visibleCards).toHaveLength(0)
  })

  it('hides specified columns by string identity', () => {
    const view = resolveTaskBoardView({ columns, hiddenColumns: ['done'] })
    expect(view.columns.map((column) => column.source.id)).toEqual(['todo', 'doing'])
  })

  it('combines filter and hidden columns', () => {
    const view = resolveTaskBoardView({ columns, filterText: 'docs', hiddenColumns: ['todo'] })
    expect(view.columns.map((column) => column.source.id)).toEqual(['doing', 'done'])
    expect(view.columns[0].visibleCards).toHaveLength(1)
    expect(view.columns[0].source.cards).toHaveLength(1)
  })

  it('returns every column when nothing is filtered', () => {
    const view = resolveTaskBoardView({ columns })
    expect(view.columns).toHaveLength(3)
  })
})

// ─── groupBySwimlane ──────────────────────────────────────────────

describe('groupBySwimlane', () => {
  const swimlanes: TaskBoardSwimlane[] = [
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
    expect(result[2].swimlane.id).toBe(UNASSIGNED_SWIMLANE_ID)
    expect(result[2].swimlane.label).toBe('Unassigned')
    expect(result[2].cards).toHaveLength(1)
  })

  it('uses the provided unassigned label', () => {
    const result = groupBySwimlane(taggedCards, swimlanes, 'type', '未分组')
    expect(result[2].swimlane.label).toBe('未分组')
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
    expect(result[2].swimlane.id).toBe(UNASSIGNED_SWIMLANE_ID)
    expect(result[2].cards).toHaveLength(3)
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

// ─── Class constants exported ─────────────────────────────────────

describe('class constants', () => {
  it('exports card count classes', () => {
    expect(kanbanCardCountClasses).toBeTruthy()
  })

  it('exports add column classes', () => {
    expect(kanbanAddColumnClasses).toBeTruthy()
  })
})
