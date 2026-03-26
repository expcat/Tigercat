import { describe, expect, it } from 'vitest'
import {
  createFormHistory,
  pushFormHistory,
  undoFormHistory,
  redoFormHistory,
  canUndo,
  canRedo
} from '@expcat/tigercat-core'

describe('form-history-utils', () => {
  describe('createFormHistory', () => {
    it('creates history with initial values', () => {
      const history = createFormHistory({ name: 'John' })
      expect(history.present).toEqual({ name: 'John' })
      expect(history.past).toHaveLength(0)
      expect(history.future).toHaveLength(0)
    })

    it('respects maxSize parameter', () => {
      const history = createFormHistory({}, 10)
      expect(history.maxSize).toBe(10)
    })
  })

  describe('pushFormHistory', () => {
    it('pushes current state to past', () => {
      const history = createFormHistory({ name: '' })
      const next = pushFormHistory(history, { name: 'John' })
      expect(next.present).toEqual({ name: 'John' })
      expect(next.past).toHaveLength(1)
      expect(next.past[0]).toEqual({ name: '' })
    })

    it('clears future on new push', () => {
      let h = createFormHistory({ v: 1 })
      h = pushFormHistory(h, { v: 2 })
      h = pushFormHistory(h, { v: 3 })
      h = undoFormHistory(h)!
      // Now future has { v: 3 }
      expect(h.future).toHaveLength(1)
      h = pushFormHistory(h, { v: 4 })
      expect(h.future).toHaveLength(0)
      expect(h.present).toEqual({ v: 4 })
    })

    it('trims past when exceeding maxSize', () => {
      let h = createFormHistory({ v: 0 }, 3)
      for (let i = 1; i <= 5; i++) {
        h = pushFormHistory(h, { v: i })
      }
      expect(h.past.length).toBeLessThanOrEqual(3)
      expect(h.present).toEqual({ v: 5 })
    })
  })

  describe('undoFormHistory', () => {
    it('restores previous state', () => {
      let h = createFormHistory({ v: 1 })
      h = pushFormHistory(h, { v: 2 })
      const undone = undoFormHistory(h)
      expect(undone).not.toBeNull()
      expect(undone!.present).toEqual({ v: 1 })
      expect(undone!.future).toHaveLength(1)
      expect(undone!.future[0]).toEqual({ v: 2 })
    })

    it('returns null when no past entries', () => {
      const h = createFormHistory({ v: 1 })
      expect(undoFormHistory(h)).toBeNull()
    })
  })

  describe('redoFormHistory', () => {
    it('restores next state from future', () => {
      let h = createFormHistory({ v: 1 })
      h = pushFormHistory(h, { v: 2 })
      h = undoFormHistory(h)!
      const redone = redoFormHistory(h)
      expect(redone).not.toBeNull()
      expect(redone!.present).toEqual({ v: 2 })
      expect(redone!.future).toHaveLength(0)
    })

    it('returns null when no future entries', () => {
      const h = createFormHistory({ v: 1 })
      expect(redoFormHistory(h)).toBeNull()
    })
  })

  describe('canUndo / canRedo', () => {
    it('canUndo is false initially', () => {
      expect(canUndo(createFormHistory({}))).toBe(false)
    })

    it('canUndo is true after push', () => {
      let h = createFormHistory({ v: 1 })
      h = pushFormHistory(h, { v: 2 })
      expect(canUndo(h)).toBe(true)
    })

    it('canRedo is false initially', () => {
      expect(canRedo(createFormHistory({}))).toBe(false)
    })

    it('canRedo is true after undo', () => {
      let h = createFormHistory({ v: 1 })
      h = pushFormHistory(h, { v: 2 })
      h = undoFormHistory(h)!
      expect(canRedo(h)).toBe(true)
    })
  })
})
