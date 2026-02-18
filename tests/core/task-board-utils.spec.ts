import { describe, it, expect } from 'vitest'
import {
  moveCard,
  reorderColumns,
  isWipExceeded,
  getDropIndex,
  getColumnDropIndex,
  createCardDragData,
  createColumnDragData,
  parseDragData,
  setDragData,
  createTouchDragTracker,
  type TaskBoardColumn
} from '@expcat/tigercat-core'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCols(): TaskBoardColumn[] {
  return [
    {
      id: 'todo',
      title: 'To Do',
      cards: [
        { id: 'c1', title: 'Card 1' },
        { id: 'c2', title: 'Card 2' },
        { id: 'c3', title: 'Card 3' }
      ]
    },
    {
      id: 'doing',
      title: 'In Progress',
      cards: [{ id: 'c4', title: 'Card 4' }]
    },
    {
      id: 'done',
      title: 'Done',
      cards: []
    }
  ]
}

function makeRect(top: number, height: number): DOMRect {
  return {
    top,
    height,
    bottom: top + height,
    left: 0,
    right: 100,
    width: 100,
    x: 0,
    y: top,
    toJSON() {}
  }
}

function makeRectX(left: number, width: number): DOMRect {
  return {
    top: 0,
    height: 100,
    bottom: 100,
    left,
    right: left + width,
    width,
    x: left,
    y: 0,
    toJSON() {}
  }
}

// ---------------------------------------------------------------------------
// moveCard
// ---------------------------------------------------------------------------

describe('moveCard', () => {
  it('moves a card across columns', () => {
    const cols = makeCols()
    const result = moveCard(cols, 'c1', 'todo', 'doing', 0)
    expect(result).not.toBeNull()
    expect(result!.columns[0].cards).toHaveLength(2)
    expect(result!.columns[1].cards).toHaveLength(2)
    expect(result!.columns[1].cards[0].id).toBe('c1')
    expect(result!.event).toEqual({
      cardId: 'c1',
      fromColumnId: 'todo',
      toColumnId: 'doing',
      fromIndex: 0,
      toIndex: 0
    })
  })

  it('moves a card to an empty column', () => {
    const cols = makeCols()
    const result = moveCard(cols, 'c2', 'todo', 'done', 0)
    expect(result).not.toBeNull()
    expect(result!.columns[2].cards).toHaveLength(1)
    expect(result!.columns[2].cards[0].id).toBe('c2')
  })

  it('reorders a card within the same column', () => {
    const cols = makeCols()
    const result = moveCard(cols, 'c1', 'todo', 'todo', 2)
    expect(result).not.toBeNull()
    expect(result!.columns[0].cards.map((c) => c.id)).toEqual(['c2', 'c3', 'c1'])
    expect(result!.event.fromIndex).toBe(0)
    expect(result!.event.toIndex).toBe(2)
  })

  it('returns null when card position does not change', () => {
    const cols = makeCols()
    const result = moveCard(cols, 'c1', 'todo', 'todo', 0)
    expect(result).toBeNull()
  })

  it('returns null for invalid column ids', () => {
    const cols = makeCols()
    expect(moveCard(cols, 'c1', 'nope', 'todo', 0)).toBeNull()
    expect(moveCard(cols, 'c1', 'todo', 'nope', 0)).toBeNull()
  })

  it('returns null for non-existent card', () => {
    const cols = makeCols()
    expect(moveCard(cols, 'nope', 'todo', 'doing', 0)).toBeNull()
  })

  it('clamps toIndex to column bounds', () => {
    const cols = makeCols()
    const result = moveCard(cols, 'c1', 'todo', 'doing', 999)
    expect(result).not.toBeNull()
    expect(result!.columns[1].cards[result!.columns[1].cards.length - 1].id).toBe('c1')
  })

  it('does not mutate the original array', () => {
    const cols = makeCols()
    const original = JSON.parse(JSON.stringify(cols))
    moveCard(cols, 'c1', 'todo', 'doing', 0)
    expect(cols).toEqual(original)
  })
})

// ---------------------------------------------------------------------------
// reorderColumns
// ---------------------------------------------------------------------------

describe('reorderColumns', () => {
  it('moves a column forward', () => {
    const cols = makeCols()
    const result = reorderColumns(cols, 0, 2)
    expect(result).not.toBeNull()
    expect(result!.columns.map((c) => c.id)).toEqual(['doing', 'done', 'todo'])
    expect(result!.event).toEqual({ columnId: 'todo', fromIndex: 0, toIndex: 2 })
  })

  it('moves a column backward', () => {
    const cols = makeCols()
    const result = reorderColumns(cols, 2, 0)
    expect(result).not.toBeNull()
    expect(result!.columns.map((c) => c.id)).toEqual(['done', 'todo', 'doing'])
  })

  it('returns null when from === to', () => {
    expect(reorderColumns(makeCols(), 1, 1)).toBeNull()
  })

  it('returns null for out-of-range indices', () => {
    const cols = makeCols()
    expect(reorderColumns(cols, -1, 2)).toBeNull()
    expect(reorderColumns(cols, 0, 5)).toBeNull()
  })

  it('does not mutate the original array', () => {
    const cols = makeCols()
    const original = JSON.parse(JSON.stringify(cols))
    reorderColumns(cols, 0, 2)
    expect(cols).toEqual(original)
  })
})

// ---------------------------------------------------------------------------
// isWipExceeded
// ---------------------------------------------------------------------------

describe('isWipExceeded', () => {
  it('returns true when cards exceed wipLimit', () => {
    expect(
      isWipExceeded({
        id: 'a',
        title: 'A',
        wipLimit: 2,
        cards: [
          { id: '1', title: '' },
          { id: '2', title: '' },
          { id: '3', title: '' }
        ]
      })
    ).toBe(true)
  })

  it('returns false when cards equal wipLimit', () => {
    expect(
      isWipExceeded({
        id: 'a',
        title: 'A',
        wipLimit: 2,
        cards: [
          { id: '1', title: '' },
          { id: '2', title: '' }
        ]
      })
    ).toBe(false)
  })

  it('returns false when no wipLimit set', () => {
    expect(isWipExceeded({ id: 'a', title: 'A', cards: [{ id: '1', title: '' }] })).toBe(false)
  })

  it('returns false when wipLimit is 0', () => {
    expect(
      isWipExceeded({ id: 'a', title: 'A', wipLimit: 0, cards: [{ id: '1', title: '' }] })
    ).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getDropIndex / getColumnDropIndex
// ---------------------------------------------------------------------------

describe('getDropIndex', () => {
  it('returns 0 when pointer is above all cards', () => {
    const rects = [makeRect(100, 40), makeRect(150, 40)]
    expect(getDropIndex(80, rects)).toBe(0)
  })

  it('returns length when pointer is below all cards', () => {
    const rects = [makeRect(100, 40), makeRect(150, 40)]
    expect(getDropIndex(300, rects)).toBe(2)
  })

  it('returns correct index between cards', () => {
    const rects = [makeRect(100, 40), makeRect(150, 40), makeRect(200, 40)]
    // between card 0 (mid=120) and card 1 (mid=170)
    expect(getDropIndex(140, rects)).toBe(1)
  })

  it('returns 0 for empty array', () => {
    expect(getDropIndex(100, [])).toBe(0)
  })
})

describe('getColumnDropIndex', () => {
  it('returns correct horizontal index', () => {
    const rects = [makeRectX(0, 200), makeRectX(210, 200), makeRectX(420, 200)]
    expect(getColumnDropIndex(50, rects)).toBe(0)
    expect(getColumnDropIndex(250, rects)).toBe(1)
    expect(getColumnDropIndex(600, rects)).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// Drag data serialisation
// ---------------------------------------------------------------------------

describe('drag data serialisation', () => {
  it('round-trips card drag data', () => {
    const json = createCardDragData('c1', 'todo', 2)
    const map = new Map<string, string>()
    const dt = {
      setData(mime: string, val: string) {
        map.set(mime, val)
      },
      getData(mime: string) {
        return map.get(mime) ?? ''
      },
      effectAllowed: '' as string
    } as unknown as DataTransfer

    setDragData(dt, json)
    const parsed = parseDragData(dt)
    expect(parsed).toEqual({ type: 'card', cardId: 'c1', columnId: 'todo', index: 2 })
  })

  it('round-trips column drag data', () => {
    const json = createColumnDragData('doing', 1)
    const map = new Map<string, string>()
    const dt = {
      setData(mime: string, val: string) {
        map.set(mime, val)
      },
      getData(mime: string) {
        return map.get(mime) ?? ''
      },
      effectAllowed: '' as string
    } as unknown as DataTransfer

    setDragData(dt, json)
    const parsed = parseDragData(dt)
    expect(parsed).toEqual({ type: 'column', columnId: 'doing', index: 1 })
  })

  it('returns null for invalid data', () => {
    const dt = {
      getData() {
        return 'not json{'
      },
      effectAllowed: ''
    } as unknown as DataTransfer
    expect(parseDragData(dt)).toBeNull()
  })

  it('returns null for empty data', () => {
    const dt = {
      getData() {
        return ''
      },
      effectAllowed: ''
    } as unknown as DataTransfer
    expect(parseDragData(dt)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Touch drag tracker
// ---------------------------------------------------------------------------

describe('createTouchDragTracker', () => {
  const makeTouch = (x: number, y: number): TouchEvent =>
    ({ touches: [{ clientX: x, clientY: y }], preventDefault() {} }) as unknown as TouchEvent

  it('tracks touch movement', () => {
    const tracker = createTouchDragTracker()
    const el = document.createElement('div')
    tracker.onTouchStart(makeTouch(10, 20), el)

    expect(tracker.getState().active).toBe(true)
    expect(tracker.getState().startX).toBe(10)

    tracker.onTouchMove(makeTouch(50, 60))
    expect(tracker.getState().currentX).toBe(50)
    expect(tracker.getState().currentY).toBe(60)

    const final = tracker.onTouchEnd()
    expect(final.active).toBe(false)
    expect(final.currentX).toBe(50)
  })

  it('cancel resets state', () => {
    const tracker = createTouchDragTracker()
    tracker.onTouchStart(makeTouch(0, 0), document.createElement('div'))
    expect(tracker.getState().active).toBe(true)
    tracker.cancel()
    expect(tracker.getState().active).toBe(false)
  })
})
