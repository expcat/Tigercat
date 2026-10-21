import type { TaskBoardCardMoveEvent, TaskBoardColumn } from '../types/task-board'

/**
 * Capture only what an awaited move can overwrite. Column reorders reuse every
 * column object; card moves clone the source/destination columns and card arrays.
 */
export function createTaskBoardMoveGuard(
  columns: TaskBoardColumn[],
  cardMove?: Pick<TaskBoardCardMoveEvent, 'fromColumnId' | 'toColumnId'>
): (currentColumns: TaskBoardColumn[]) => boolean {
  const columnOrder = [...columns]
  const copiedState = cardMove
    ? (() => {
        const fromColumn = columns.find((column) => column.id === cardMove.fromColumnId)!
        const toColumn = columns.find((column) => column.id === cardMove.toColumnId)!
        const copiedColumns = fromColumn === toColumn ? [fromColumn] : [fromColumn, toColumn]
        return copiedColumns.map((column) => ({
          column,
          fields: { ...column } as Record<string, unknown>,
          cards: [...column.cards]
        }))
      })()
    : []

  return (currentColumns) => {
    const orderIsCurrent =
      currentColumns.length === columnOrder.length &&
      currentColumns.every((column, index) => Object.is(column, columnOrder[index]))
    if (!orderIsCurrent) return false

    return copiedState.every(({ column, fields, cards }) => {
      const currentFields = column as unknown as Record<string, unknown>
      const fieldKeys = Object.keys(fields)
      return (
        Object.keys(currentFields).length === fieldKeys.length &&
        fieldKeys.every(
          (key) =>
            Object.prototype.hasOwnProperty.call(currentFields, key) &&
            Object.is(currentFields[key], fields[key])
        ) &&
        column.cards.length === cards.length &&
        column.cards.every((card, index) => Object.is(card, cards[index]))
      )
    })
  }
}
