/**
 * Form history utilities for undo/redo support
 */

import type { FormValues } from '../types/form'

export interface FormHistoryState {
  /** History stack of past states */
  past: FormValues[]
  /** Current state */
  present: FormValues
  /** Stack of undone states for redo */
  future: FormValues[]
  /** Maximum history size */
  maxSize: number
}

/**
 * Create initial history state
 */
export function createFormHistory(
  initialValues: FormValues,
  maxSize: number = 50
): FormHistoryState {
  return {
    past: [],
    present: { ...initialValues },
    future: [],
    maxSize
  }
}

/**
 * Push a new state to history (called on value change)
 */
export function pushFormHistory(
  history: FormHistoryState,
  newValues: FormValues
): FormHistoryState {
  const past = [...history.past, history.present]
  // Trim history if exceeded
  if (past.length > history.maxSize) {
    past.splice(0, past.length - history.maxSize)
  }

  return {
    past,
    present: { ...newValues },
    future: [],
    maxSize: history.maxSize
  }
}

/**
 * Undo: move back to previous state
 * Returns null if there's nothing to undo
 */
export function undoFormHistory(history: FormHistoryState): FormHistoryState | null {
  if (history.past.length === 0) return null

  const past = [...history.past]
  const previous = past.pop()!

  return {
    past,
    present: previous,
    future: [history.present, ...history.future],
    maxSize: history.maxSize
  }
}

/**
 * Redo: move forward to next state
 * Returns null if there's nothing to redo
 */
export function redoFormHistory(history: FormHistoryState): FormHistoryState | null {
  if (history.future.length === 0) return null

  const future = [...history.future]
  const next = future.shift()!

  return {
    past: [...history.past, history.present],
    present: next,
    future,
    maxSize: history.maxSize
  }
}

/**
 * Check if undo is available
 */
export function canUndo(history: FormHistoryState): boolean {
  return history.past.length > 0
}

/**
 * Check if redo is available
 */
export function canRedo(history: FormHistoryState): boolean {
  return history.future.length > 0
}
