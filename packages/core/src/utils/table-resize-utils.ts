/**
 * Table ResizeObserver utilities.
 *
 * Measurements are batched to animation frames so resize bursts do not trigger
 * repeated synchronous column/row reads.
 */

export type TableResizeFrameCallback = (timestamp: number) => void
export type TableResizeFrameRequest = (callback: TableResizeFrameCallback) => number
export type TableResizeFrameCancel = (handle: number) => void

export interface TableResizeObserverLike {
  observe: (target: Element) => void
  disconnect: () => void
}

export type TableResizeObserverFactory = (
  callback: ResizeObserverCallback
) => TableResizeObserverLike

export interface TableResizeSnapshot {
  containerWidth: number
  containerHeight: number
  tableWidth: number
  tableHeight: number
  columnWidths: Record<string, number>
  rowHeights: number[]
}

export interface TableResizeObserverControllerOptions {
  onResize: (snapshot: TableResizeSnapshot) => void
  requestFrame?: TableResizeFrameRequest
  cancelFrame?: TableResizeFrameCancel
  createResizeObserver?: TableResizeObserverFactory
}

export interface TableResizeObserverController {
  observe: (container: HTMLElement, table?: HTMLTableElement | null) => void
  disconnect: () => void
}

function requestDefaultFrame(callback: TableResizeFrameCallback): number {
  if (typeof requestAnimationFrame === 'function') {
    return requestAnimationFrame(callback)
  }

  return setTimeout(() => callback(Date.now()), 16) as unknown as number
}

function cancelDefaultFrame(handle: number): void {
  if (typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(handle)
    return
  }

  clearTimeout(handle)
}

function createDefaultResizeObserver(callback: ResizeObserverCallback): TableResizeObserverLike {
  return new ResizeObserver(callback)
}

function readElementSize(element?: Element | null): { width: number; height: number } {
  if (!element) {
    return { width: 0, height: 0 }
  }

  const rect = element.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height
  }
}

export function measureTableResizeSnapshot(
  container: HTMLElement,
  table: HTMLTableElement | null = container.querySelector('table')
): TableResizeSnapshot {
  const containerSize = readElementSize(container)
  const tableSize = readElementSize(table)
  const columnWidths: Record<string, number> = {}
  const rowHeights: number[] = []

  table?.querySelectorAll<HTMLElement>('thead th[data-tiger-table-column-key]').forEach((cell) => {
    const columnKey = cell.dataset.tigerTableColumnKey
    if (columnKey) {
      columnWidths[columnKey] = readElementSize(cell).width
    }
  })

  table?.querySelectorAll<HTMLElement>('tbody tr[data-tiger-table-row-index]').forEach((row) => {
    rowHeights.push(readElementSize(row).height)
  })

  return {
    containerWidth: containerSize.width,
    containerHeight: containerSize.height,
    tableWidth: tableSize.width,
    tableHeight: tableSize.height,
    columnWidths,
    rowHeights
  }
}

export function createTableResizeObserverController(
  options: TableResizeObserverControllerOptions
): TableResizeObserverController {
  const requestFrame = options.requestFrame ?? requestDefaultFrame
  const cancelFrame = options.cancelFrame ?? cancelDefaultFrame
  const createResizeObserver = options.createResizeObserver ?? createDefaultResizeObserver

  let container: HTMLElement | undefined
  let table: HTMLTableElement | null | undefined
  let observer: TableResizeObserverLike | undefined
  let frameHandle: number | undefined

  function flush() {
    frameHandle = undefined
    if (!container) {
      return
    }

    options.onResize(measureTableResizeSnapshot(container, table ?? null))
  }

  function schedule() {
    if (frameHandle !== undefined) {
      return
    }

    frameHandle = requestFrame(flush)
  }

  function disconnect() {
    observer?.disconnect()
    observer = undefined

    if (frameHandle !== undefined) {
      cancelFrame(frameHandle)
      frameHandle = undefined
    }
  }

  function observe(nextContainer: HTMLElement, nextTable?: HTMLTableElement | null) {
    disconnect()

    container = nextContainer
    table = nextTable ?? nextContainer.querySelector('table')
    observer = createResizeObserver(schedule)
    observer.observe(nextContainer)

    if (table && table !== nextContainer) {
      observer.observe(table)
    }

    schedule()
  }

  return { observe, disconnect }
}
