import { describe, expect, it } from 'vitest'
import {
  mapVisibleColumnIndexToSource,
  moveCard,
  moveTaskBoardKeyboardDrop,
  reorderColumns,
  resolveCardDropSourceIndex,
  resolveColumnReorder,
  resolveTaskBoardView,
  type TaskBoardColumn
} from '@expcat/tigercat-core'

function makeCols(): TaskBoardColumn[] {
  return [
    {
      id: 'todo',
      title: 'To Do',
      wipLimit: 5,
      cards: Array.from({ length: 10 }, (_, i) => ({
        id: `c${i}`,
        title: i === 0 ? 'foo task' : `card ${i}`
      }))
    },
    {
      id: 'doing',
      title: 'Doing',
      cards: [{ id: 'd1', title: 'in progress' }]
    },
    { id: 'done', title: 'Done', cards: [] }
  ]
}

describe('resolveTaskBoardView', () => {
  it('keeps source card counts when filterText hides most cards', () => {
    const view = resolveTaskBoardView({ columns: makeCols(), filterText: 'foo' })
    expect(view.columns[0].visibleCards).toHaveLength(1)
    expect(view.columns[0].source.cards).toHaveLength(10)
  })

  it('omits hidden columns from the view but not from source', () => {
    const columns = makeCols()
    const view = resolveTaskBoardView({ columns, hiddenColumns: ['todo'] })
    expect(view.columns.map((col) => col.source.id)).toEqual(['doing', 'done'])
    expect(view.columns[0].sourceIndex).toBe(1)
  })

  it('orders visible cards by swimlane definition, not source order', () => {
    const columns: TaskBoardColumn[] = [
      {
        id: 'todo',
        title: 'To Do',
        cards: [
          { id: 'bug', title: 'Bug', type: 'bug' },
          { id: 'feature', title: 'Feature', type: 'feature' },
          { id: 'bug2', title: 'Bug 2', type: 'bug' }
        ]
      }
    ]
    const view = resolveTaskBoardView({
      columns,
      swimlanes: [
        { id: 'feature', label: 'Features' },
        { id: 'bug', label: 'Bugs' }
      ],
      swimlaneField: 'type'
    })
    expect(view.columns[0].visibleCards.map((card) => card.id)).toEqual(['feature', 'bug', 'bug2'])
  })

  it('omits collapsed swimlane cards from visibleCards', () => {
    const columns: TaskBoardColumn[] = [
      {
        id: 'todo',
        title: 'To Do',
        cards: [
          { id: 'bug', title: 'Bug', type: 'bug' },
          { id: 'feature', title: 'Feature', type: 'feature' }
        ]
      }
    ]
    const view = resolveTaskBoardView({
      columns,
      swimlanes: [
        { id: 'feature', label: 'Features' },
        { id: 'bug', label: 'Bugs', collapsed: true }
      ],
      swimlaneField: 'type'
    })
    expect(view.columns[0].visibleCards.map((card) => card.id)).toEqual(['feature'])
  })
})

describe('resolveCardDropSourceIndex', () => {
  it('maps a swimlane-reordered first slot to the visible first card', () => {
    const columns: TaskBoardColumn[] = [
      {
        id: 'todo',
        title: 'To Do',
        cards: [
          { id: 'bug', title: 'Bug', type: 'bug' },
          { id: 'feature', title: 'Feature', type: 'feature' },
          { id: 'bug2', title: 'Bug 2', type: 'bug' }
        ]
      },
      { id: 'doing', title: 'Doing', cards: [{ id: 'other', title: 'Other' }] }
    ]
    const view = resolveTaskBoardView({
      columns,
      swimlanes: [
        { id: 'feature', label: 'Features' },
        { id: 'bug', label: 'Bugs' }
      ],
      swimlaneField: 'type'
    })
    const mapped = resolveCardDropSourceIndex(view, 'todo', 0)
    expect(mapped).toBe(1)
    const result = moveCard(columns, 'other', 'doing', 'todo', mapped)
    expect(result?.columns[0].cards.map((card) => card.id)).toEqual([
      'bug',
      'other',
      'feature',
      'bug2'
    ])
  })
})

describe('resolveColumnReorder', () => {
  it('maps a hidden first column so dragging the visible first column moves source index 1', () => {
    const columns = makeCols()
    const mapped = resolveColumnReorder(columns, 'doing', ['doing', 'done'], 2)
    expect(mapped).toEqual({ fromIndex: 1, toIndex: 2 })
    const result = reorderColumns(columns, mapped!.fromIndex, mapped!.toIndex)
    expect(result?.columns.map((col) => col.id)).toEqual(['todo', 'done', 'doing'])
  })
})

describe('mapVisibleColumnIndexToSource', () => {
  it('inserts after the last visible column in source', () => {
    const columns = makeCols()
    expect(mapVisibleColumnIndexToSource(columns, ['doing', 'done'], 2)).toBe(3)
  })
})

describe('moveTaskBoardKeyboardDrop', () => {
  it('moves into an empty column', () => {
    const view = resolveTaskBoardView({ columns: makeCols() })
    const next = moveTaskBoardKeyboardDrop(view, { columnId: 'doing', dropIndex: 1 }, 'down')
    expect(next).toEqual({ columnId: 'done', dropIndex: 0 })
  })
})
