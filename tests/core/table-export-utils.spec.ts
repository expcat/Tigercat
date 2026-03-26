/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { exportTableToCsv, downloadCsv, tableExportButtonClasses } from '@expcat/tigercat-core'

const columns = [
  { key: 'name', title: 'Name' },
  { key: 'age', title: 'Age' },
  { key: 'city', title: 'City' }
]

const data = [
  { name: 'Alice', age: 25, city: 'New York' },
  { name: 'Bob', age: 30, city: 'London' }
]

describe('exportTableToCsv', () => {
  it('should generate CSV with headers', () => {
    const csv = exportTableToCsv(columns, data)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('Name,Age,City')
  })

  it('should generate CSV with data rows', () => {
    const csv = exportTableToCsv(columns, data)
    const lines = csv.split('\n')
    expect(lines[1]).toBe('Alice,25,New York')
    expect(lines[2]).toBe('Bob,30,London')
  })

  it('should escape commas in values', () => {
    const dataWithComma = [{ name: 'Doe, John', age: 25, city: 'NYC' }]
    const csv = exportTableToCsv(columns, dataWithComma)
    const lines = csv.split('\n')
    expect(lines[1]).toContain('"Doe, John"')
  })

  it('should escape quotes in values', () => {
    const dataWithQuote = [{ name: 'He said "hi"', age: 25, city: 'NYC' }]
    const csv = exportTableToCsv(columns, dataWithQuote)
    expect(csv).toContain('"He said ""hi"""')
  })

  it('should handle empty data', () => {
    const csv = exportTableToCsv(columns, [])
    expect(csv).toBe('Name,Age,City')
  })

  it('should handle null/undefined values', () => {
    const dataWithNull = [{ name: null, age: undefined, city: 'NYC' }]
    const csv = exportTableToCsv(columns, dataWithNull as any)
    const lines = csv.split('\n')
    expect(lines[1]).toBe(',,NYC')
  })

  it('should use dataKey when available', () => {
    const cols = [{ key: 'n', title: 'Name', dataKey: 'fullName' }]
    const d = [{ fullName: 'Alice' }]
    const csv = exportTableToCsv(cols, d)
    expect(csv).toContain('Alice')
  })
})

describe('downloadCsv', () => {
  it('should create and click a link', () => {
    const clickSpy = vi.fn()
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      style: { display: '' },
      click: clickSpy
    } as any)
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((n) => n)
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((n) => n)
    const revokeURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    downloadCsv('a,b,c', 'test')

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(clickSpy).toHaveBeenCalled()

    createElementSpy.mockRestore()
    appendSpy.mockRestore()
    removeSpy.mockRestore()
    revokeURL.mockRestore()
  })
})

describe('tableExportButtonClasses', () => {
  it('should be a non-empty string', () => {
    expect(tableExportButtonClasses).toBeTruthy()
    expect(typeof tableExportButtonClasses).toBe('string')
  })
})
