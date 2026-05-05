/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import {
  createTableResizeObserverController,
  measureTableResizeSnapshot
} from '@expcat/tigercat-core'

function setRect(element: Element, width: number, height: number) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    width,
    height,
    top: 0,
    right: width,
    bottom: height,
    left: 0,
    x: 0,
    y: 0,
    toJSON: () => ({})
  } as DOMRect)
}

describe('table-resize-utils', () => {
  it('measures container, table, column widths and row heights', () => {
    const container = document.createElement('div')
    const table = document.createElement('table')
    const thead = document.createElement('thead')
    const tbody = document.createElement('tbody')
    const headerRow = document.createElement('tr')
    const bodyRow = document.createElement('tr')
    const nameHeader = document.createElement('th')
    const ageHeader = document.createElement('th')

    nameHeader.dataset.tigerTableColumnKey = 'name'
    ageHeader.dataset.tigerTableColumnKey = 'age'
    bodyRow.dataset.tigerTableRowIndex = '0'

    headerRow.append(nameHeader, ageHeader)
    thead.append(headerRow)
    tbody.append(bodyRow)
    table.append(thead, tbody)
    container.append(table)

    setRect(container, 480, 320)
    setRect(table, 460, 240)
    setRect(nameHeader, 180, 40)
    setRect(ageHeader, 90, 40)
    setRect(bodyRow, 460, 48)

    expect(measureTableResizeSnapshot(container, table)).toMatchObject({
      containerWidth: 480,
      containerHeight: 320,
      tableWidth: 460,
      tableHeight: 240,
      columnWidths: { name: 180, age: 90 },
      rowHeights: [48]
    })
  })

  it('batches resize observer bursts into one animation frame', () => {
    const container = document.createElement('div')
    const table = document.createElement('table')
    container.append(table)

    let resizeCallback: ResizeObserverCallback | undefined
    let frameCallback: ((timestamp: number) => void) | undefined
    const observe = vi.fn()
    const disconnect = vi.fn()
    const onResize = vi.fn()
    const requestFrame = vi.fn((callback: (timestamp: number) => void) => {
      frameCallback = callback
      return 1
    })

    const controller = createTableResizeObserverController({
      onResize,
      requestFrame,
      cancelFrame: vi.fn(),
      createResizeObserver: (callback) => {
        resizeCallback = callback
        return { observe, disconnect }
      }
    })

    controller.observe(container, table)
    resizeCallback?.([], {} as ResizeObserver)
    resizeCallback?.([], {} as ResizeObserver)

    expect(requestFrame).toHaveBeenCalledTimes(1)

    frameCallback?.(0)

    expect(onResize).toHaveBeenCalledTimes(1)
    expect(observe).toHaveBeenCalledWith(container)
    expect(observe).toHaveBeenCalledWith(table)
  })
})
