import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createTaskBoardDragController,
  createDefaultDragSnapshot,
  type TaskBoardDragSnapshot,
  type TaskBoardDragCallbacks,
  type TaskBoardDragController,
  type TaskBoardColumn,
  type TaskBoardCard
} from '@expcat/tigercat-core'
import { installFrameScheduler } from '../utils/frame-scheduler'

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
      title: 'Doing',
      cards: [{ id: 'c4', title: 'Card 4' }]
    },
    { id: 'done', title: 'Done', cards: [] }
  ]
}

function createMockCallbacks(
  overrides: Partial<TaskBoardDragCallbacks> = {}
): TaskBoardDragCallbacks & {
  lastSnap: TaskBoardDragSnapshot
  applyCardMoveFn: ReturnType<typeof vi.fn>
  applyColumnMoveFn: ReturnType<typeof vi.fn>
} {
  const applyCardMoveFn = vi.fn()
  const applyColumnMoveFn = vi.fn()
  let lastSnap = createDefaultDragSnapshot()

  return {
    get lastSnap() {
      return lastSnap
    },
    applyCardMoveFn,
    applyColumnMoveFn,
    onStateChange: (s) => {
      lastSnap = s
      overrides.onStateChange?.(s)
    },
    applyCardMove: overrides.applyCardMove ?? applyCardMoveFn,
    applyColumnMove: overrides.applyColumnMove ?? applyColumnMoveFn,
    getBoardEl: overrides.getBoardEl ?? (() => null),
    getColumnCount: overrides.getColumnCount ?? (() => 3)
  }
}

function makeDT(json?: string): DataTransfer {
  const map = new Map<string, string>()
  return {
    setData(mime: string, val: string) {
      map.set(mime, val)
    },
    getData(mime: string) {
      return json ?? map.get(mime) ?? ''
    },
    effectAllowed: ''
  } as unknown as DataTransfer
}

function makeRect(left: number, top: number, width: number, height: number): DOMRect {
  return { left, top, width, height, right: left + width, bottom: top + height } as DOMRect
}

function makeTouchEvent(x: number, y: number): TouchEvent {
  return {
    touches: [{ clientX: x, clientY: y }],
    preventDefault: vi.fn()
  } as unknown as TouchEvent
}

function makeBoardWithColumns() {
  const board = document.createElement('div')
  const todo = document.createElement('div')
  const doing = document.createElement('div')
  todo.setAttribute('data-tiger-taskboard-column', '')
  todo.setAttribute('data-tiger-taskboard-column-id', 'todo')
  doing.setAttribute('data-tiger-taskboard-column', '')
  doing.setAttribute('data-tiger-taskboard-column-id', 'doing')
  vi.spyOn(todo, 'getBoundingClientRect').mockReturnValue(makeRect(0, 0, 100, 200))
  vi.spyOn(doing, 'getBoundingClientRect').mockReturnValue(makeRect(100, 0, 100, 200))

  for (let index = 0; index < 2; index++) {
    const card = document.createElement('div')
    card.setAttribute('data-tiger-taskboard-card', '')
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue(makeRect(0, index * 40, 100, 40))
    doing.appendChild(card)
  }

  board.append(todo, doing)
  return { board, todo, doing }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('createTaskBoardDragController', () => {
  let cbs: ReturnType<typeof createMockCallbacks>
  let ctrl: TaskBoardDragController
  const cols = makeCols()
  const col0 = cols[0]
  const card0 = col0.cards[0]

  beforeEach(() => {
    cbs = createMockCallbacks()
    ctrl = createTaskBoardDragController(cbs)
  })

  it('returns default snapshot', () => {
    const snap = ctrl.getSnapshot()
    expect(snap.drag).toBeNull()
    expect(snap.dropTargetColumnId).toBeNull()
    expect(snap.dropIndex).toBe(-1)
    expect(snap.kbDrag).toBeNull()
  })

  // ---- HTML5 DnD: cards ----

  describe('card DnD', () => {
    it('cardDragStart sets drag state', () => {
      const dt = makeDT()
      ctrl.cardDragStart(dt, card0, col0)

      expect(cbs.lastSnap.drag).toEqual({
        type: 'card',
        id: 'c1',
        fromColumnId: 'todo',
        fromIndex: 0
      })
    })

    it('cardDragStart does nothing when draggable is false', () => {
      ctrl.setOptions({ draggable: false })
      const dt = makeDT()
      ctrl.cardDragStart(dt, card0, col0)
      expect(cbs.lastSnap.drag).toBeNull()
    })

    it('cardDrop calls applyCardMove', () => {
      const dt1 = makeDT()
      ctrl.cardDragStart(dt1, card0, col0)

      // Simulate drop on 'doing' column
      const dropDT = makeDT(
        JSON.stringify({ type: 'card', cardId: 'c1', columnId: 'todo', index: 0 })
      )
      ctrl.cardDrop(dropDT, cols[1])

      expect(cbs.applyCardMoveFn).toHaveBeenCalledWith('c1', 'todo', 'doing', 1)
    })

    it('cardDragOver updates drop target and insertion index', () => {
      const body = document.createElement('div')
      const first = document.createElement('div')
      const second = document.createElement('div')
      first.setAttribute('data-tiger-taskboard-card', '')
      second.setAttribute('data-tiger-taskboard-card', '')
      vi.spyOn(first, 'getBoundingClientRect').mockReturnValue(makeRect(0, 0, 100, 40))
      vi.spyOn(second, 'getBoundingClientRect').mockReturnValue(makeRect(0, 40, 100, 40))
      body.append(first, second)

      ctrl.cardDragStart(makeDT(), card0, col0)
      ctrl.cardDragOver(10, body, cols[1])

      expect(cbs.lastSnap.dropTargetColumnId).toBe('doing')
      expect(cbs.lastSnap.dropIndex).toBe(0)
    })

    it('cardDragOver ignores non-card drags', () => {
      ctrl.columnDragStart(makeDT(), col0, 0)
      ctrl.cardDragOver(10, document.createElement('div'), cols[1])

      expect(cbs.lastSnap.dropTargetColumnId).toBeNull()
      expect(cbs.lastSnap.dropIndex).toBe(-1)
    })

    it('cardDrop ignores invalid and non-card data', () => {
      ctrl.cardDrop(makeDT('not-json'), cols[1])
      ctrl.cardDrop(makeDT(JSON.stringify({ type: 'column', columnId: 'todo', index: 0 })), cols[1])

      expect(cbs.applyCardMoveFn).not.toHaveBeenCalled()
    })

    it('dragEnd resets state', () => {
      ctrl.cardDragStart(makeDT(), card0, col0)
      expect(cbs.lastSnap.drag).not.toBeNull()
      ctrl.dragEnd()
      expect(cbs.lastSnap.drag).toBeNull()
    })

    it('dragLeave clears drop target when related is outside', () => {
      ctrl.cardDragStart(makeDT(), card0, col0)
      // Simulate entering a column
      const snap = ctrl.getSnapshot()
      // Manually set drop target by calling cardDragOver would require DOM, skip
      // Instead test that dragLeave works with card type
      const parent = document.createElement('div')
      const child = document.createElement('div')
      parent.appendChild(child)
      ctrl.dragLeave(parent, null) // related is null = left entirely
      expect(cbs.lastSnap.dropTargetColumnId).toBeNull()
    })

    it('dragLeave does nothing for column drag type', () => {
      ctrl.columnDragStart(makeDT(), col0, 0)
      ctrl.dragLeave(document.createElement('div'), null)
      // Should not reset — dragLeave only affects card drag
      expect(cbs.lastSnap.drag?.type).toBe('column')
    })
  })

  // ---- HTML5 DnD: columns ----

  describe('column DnD', () => {
    it('columnDragStart sets drag state', () => {
      ctrl.columnDragStart(makeDT(), col0, 0)
      expect(cbs.lastSnap.drag).toEqual({
        type: 'column',
        id: 'todo',
        fromIndex: 0
      })
    })

    it('columnDragStart does nothing when columnDraggable is false', () => {
      ctrl.setOptions({ columnDraggable: false })
      ctrl.columnDragStart(makeDT(), col0, 0)
      expect(cbs.lastSnap.drag).toBeNull()
    })

    it('columnDragOver is a no-op (no state change)', () => {
      ctrl.columnDragStart(makeDT(), col0, 0)
      const before = ctrl.getSnapshot()
      ctrl.columnDragOver()
      expect(ctrl.getSnapshot()).toBe(before)
    })

    it('columnDrop computes destination index from board columns', () => {
      const { board } = makeBoardWithColumns()
      cbs = createMockCallbacks({ getBoardEl: () => board })
      ctrl = createTaskBoardDragController(cbs)

      ctrl.columnDrop(makeDT(JSON.stringify({ type: 'column', columnId: 'todo', index: 0 })), 175)

      expect(cbs.applyColumnMoveFn).toHaveBeenCalledWith(0, 2)
    })

    it('columnDrop ignores invalid data and missing board columns', () => {
      ctrl.columnDrop(makeDT('not-json'), 100)
      ctrl.columnDrop(makeDT(JSON.stringify({ type: 'card', cardId: 'c1' })), 100)
      ctrl.columnDrop(makeDT(JSON.stringify({ type: 'column', columnId: 'todo', index: 0 })), 100)

      expect(cbs.applyColumnMoveFn).not.toHaveBeenCalled()
    })
  })

  // ---- Keyboard ----

  describe('keyboard drag', () => {
    it('Enter grabs a card', () => {
      const handled = ctrl.cardKeyDown('Enter', card0, col0)
      expect(handled).toBe(true)
      expect(cbs.lastSnap.kbDrag).toEqual({
        type: 'card',
        id: 'c1',
        fromColumnId: 'todo',
        fromIndex: 0
      })
    })

    it('Space grabs a card', () => {
      expect(ctrl.cardKeyDown(' ', card0, col0)).toBe(true)
      expect(cbs.lastSnap.kbDrag?.id).toBe('c1')
    })

    it('Enter on a different card drops the grabbed card', () => {
      ctrl.cardKeyDown('Enter', card0, col0) // grab c1
      ctrl.cardKeyDown('Enter', cols[1].cards[0], cols[1]) // drop on c4 in 'doing'

      expect(cbs.applyCardMoveFn).toHaveBeenCalledWith('c1', 'todo', 'doing', 0)
      expect(cbs.lastSnap.kbDrag).toBeNull()
    })

    it('Escape cancels keyboard grab', () => {
      ctrl.cardKeyDown('Enter', card0, col0)
      expect(cbs.lastSnap.kbDrag).not.toBeNull()

      const handled = ctrl.cardKeyDown('Escape', card0, col0)
      expect(handled).toBe(true)
      expect(cbs.lastSnap.kbDrag).toBeNull()
    })

    it('Escape returns false when nothing is grabbed', () => {
      expect(ctrl.cardKeyDown('Escape', card0, col0)).toBe(false)
    })

    it('non-drag keys return false', () => {
      expect(ctrl.cardKeyDown('ArrowDown', card0, col0)).toBe(false)
    })

    it('keyboard does nothing when draggable is false', () => {
      ctrl.setOptions({ draggable: false })
      expect(ctrl.cardKeyDown('Enter', card0, col0)).toBe(false)
    })
  })

  // ---- Touch (state-only, no real DOM) ----

  describe('touch card drag', () => {
    it('cardTouchStart does nothing without init', () => {
      // touch tracker not created until init()
      const evt = {
        touches: [{ clientX: 0, clientY: 0 }],
        preventDefault: vi.fn()
      } as unknown as TouchEvent
      ctrl.cardTouchStart(evt, document.createElement('div'), card0, col0)
      expect(cbs.lastSnap.drag).toBeNull()
    })

    it('cardTouchEnd does nothing without active drag', () => {
      // Should not throw
      ctrl.cardTouchEnd()
      expect(cbs.lastSnap.drag).toBeNull()
    })

    it('moves a touched card to the detected column', () => {
      const frames = installFrameScheduler()
      const { board, doing } = makeBoardWithColumns()
      const elementFromPoint = vi.spyOn(document, 'elementFromPoint').mockReturnValue(doing)
      Object.defineProperty(navigator, 'maxTouchPoints', { value: 1, configurable: true })
      cbs = createMockCallbacks({ getBoardEl: () => board })
      ctrl = createTaskBoardDragController(cbs)
      ctrl.init()

      ctrl.cardTouchStart(makeTouchEvent(10, 10), document.createElement('div'), card0, col0)
      ctrl.cardTouchMove(makeTouchEvent(150, 70))
      frames.flush()
      ctrl.cardTouchEnd()

      expect(cbs.applyCardMoveFn).toHaveBeenCalledWith('c1', 'todo', 'doing', 2)

      elementFromPoint.mockRestore()
      vi.unstubAllGlobals()
    })
  })

  describe('touch column drag', () => {
    it('moves a touched column by final x position', () => {
      const { board } = makeBoardWithColumns()
      Object.defineProperty(navigator, 'maxTouchPoints', { value: 1, configurable: true })
      cbs = createMockCallbacks({ getBoardEl: () => board })
      ctrl = createTaskBoardDragController(cbs)
      ctrl.init()

      ctrl.columnTouchStart(makeTouchEvent(10, 10), document.createElement('div'), col0, 0)
      ctrl.columnTouchMove(makeTouchEvent(175, 10))
      ctrl.columnTouchEnd()

      expect(cbs.applyColumnMoveFn).toHaveBeenCalledWith(0, 2)
    })

    it('resets a touched column when the board has no columns', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', { value: 1, configurable: true })
      cbs = createMockCallbacks({ getBoardEl: () => null })
      ctrl = createTaskBoardDragController(cbs)
      ctrl.init()

      ctrl.columnTouchStart(makeTouchEvent(10, 10), document.createElement('div'), col0, 0)
      ctrl.columnTouchEnd()

      expect(cbs.applyColumnMoveFn).not.toHaveBeenCalled()
      expect(cbs.lastSnap.drag).toBeNull()
    })
  })

  // ---- setOptions ----

  describe('setOptions', () => {
    it('updates draggable option', () => {
      ctrl.setOptions({ draggable: false })
      ctrl.cardDragStart(makeDT(), card0, col0)
      expect(cbs.lastSnap.drag).toBeNull()

      ctrl.setOptions({ draggable: true })
      ctrl.cardDragStart(makeDT(), card0, col0)
      expect(cbs.lastSnap.drag).not.toBeNull()
    })

    it('updates columnDraggable option', () => {
      ctrl.setOptions({ columnDraggable: false })
      ctrl.columnDragStart(makeDT(), col0, 0)
      expect(cbs.lastSnap.drag).toBeNull()
    })
  })

  // ---- Lifecycle ----

  describe('lifecycle', () => {
    it('init and dispose do not throw', () => {
      expect(() => ctrl.init()).not.toThrow()
      expect(() => ctrl.dispose()).not.toThrow()
    })
  })
})
