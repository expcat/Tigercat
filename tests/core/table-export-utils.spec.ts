/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import {
  exportTableToCsv,
  exportTableData,
  downloadCsv,
  downloadTableExport
} from '@expcat/tigercat-core/utils/table-export'

const columns = [
  { key: 'nameCol', title: '姓名', dataKey: 'name' },
  { key: 'age', title: 'Age' },
  { key: 'city', title: 'City' }
]

const data = [
  { name: 'Alice', age: 25, city: 'New York' },
  { name: 'Bob', age: 30, city: 'London' }
]

describe('exportTableToCsv', () => {
  it('writes a UTF-8 BOM and CRLF rows', () => {
    const csv = exportTableToCsv(columns, data)
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('\r\n')
    expect(csv).toContain('姓名,Age,City')
    expect(csv).toContain('Alice,25,New York')
  })

  it('uses dataKey for cell values', () => {
    const csv = exportTableToCsv(columns, [{ name: 'Ada', age: 1, city: 'X' }])
    expect(csv).toContain('Ada')
  })

  it('quotes commas, quotes, and carriage returns', () => {
    const csv = exportTableToCsv(columns, [
      { name: 'Doe, John', age: 25, city: 'A"B' },
      { name: 'line\rbreak', age: 1, city: 'NYC' }
    ])
    expect(csv).toContain('"Doe, John"')
    expect(csv).toContain('"A""B"')
    expect(csv).toContain('"line\rbreak"')
  })

  it('prefixes formula-like cells', () => {
    const csv = exportTableToCsv(columns, [{ name: '=SUM(A1)', age: 1, city: '+cmd' }])
    expect(csv).toContain("'=SUM(A1)")
    expect(csv).toContain("'+cmd")
  })

  it('handles empty, null, and undefined cells', () => {
    const csv = exportTableToCsv(columns, [{ name: null, age: undefined, city: 'NYC' }] as never)
    expect(csv).toContain(',,NYC')
  })
})

describe('downloadCsv', () => {
  it('does not duplicate an existing .csv suffix', () => {
    const clickSpy = vi.fn()
    const created = {
      href: '',
      download: '',
      style: { display: '' },
      click: clickSpy
    }
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(created as unknown as HTMLElement)
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node)
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    downloadCsv('a,b,c', 'report.csv')
    expect(created.download).toBe('report.csv')
    expect(clickSpy).toHaveBeenCalled()

    downloadTableExport('a,b,c', 'plain')
    expect(created.download).toBe('plain.csv')

    createElementSpy.mockRestore()
    appendSpy.mockRestore()
    removeSpy.mockRestore()
  })
})

describe('exportTableData', () => {
  it('is CSV-only', () => {
    expect(exportTableData(columns, data)).toContain('Alice,25,New York')
  })
})
