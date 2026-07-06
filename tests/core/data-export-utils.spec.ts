/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import {
  crc32,
  buildStoredZip,
  exportData,
  exportDataToMarkdown,
  exportDataToXlsx,
  downloadDataExport
} from '@expcat/tigercat-core/utils/data-export'
import type { TableColumn } from '@expcat/tigercat-core'

const columns: TableColumn[] = [
  { key: 'name', title: 'Name' },
  { key: 'age', title: 'Age' },
  { key: 'city', title: 'City' }
]

const data = [
  { name: 'Alice', age: 25, city: 'New York' },
  { name: 'Bob', age: 30, city: 'London' }
]

const decoder = new TextDecoder()

/** Parse a STORED-only zip produced by buildStoredZip into name -> content text */
function readZipEntries(bytes: Uint8Array): Map<string, string> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const entries = new Map<string, string>()
  let offset = 0

  while (view.getUint32(offset, true) === 0x04034b50) {
    const dataSize = view.getUint32(offset + 18, true)
    const nameLength = view.getUint16(offset + 26, true)
    const extraLength = view.getUint16(offset + 28, true)
    const name = decoder.decode(bytes.subarray(offset + 30, offset + 30 + nameLength))
    const start = offset + 30 + nameLength + extraLength
    entries.set(name, decoder.decode(bytes.subarray(start, start + dataSize)))
    offset = start + dataSize
  }

  return entries
}

describe('crc32', () => {
  it('matches the standard check vector', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926)
    expect(crc32(new Uint8Array(0))).toBe(0)
  })
})

describe('buildStoredZip', () => {
  it('writes a valid STORED archive: local header, entry CRC, end record, verbatim data', () => {
    const payload = new TextEncoder().encode('123456789')
    const zip = buildStoredZip([{ name: 'a.txt', data: payload }])
    const view = new DataView(zip.buffer)

    expect(view.getUint32(0, true)).toBe(0x04034b50) // local file header signature
    expect(view.getUint32(14, true)).toBe(0xcbf43926) // entry CRC recorded in header
    expect(view.getUint32(zip.length - 22, true)).toBe(0x06054b50) // end of central directory
    expect(view.getUint16(zip.length - 22 + 10, true)).toBe(1) // total entry count
    expect(readZipEntries(zip).get('a.txt')).toBe('123456789') // stored data is verbatim
  })
})

describe('exportDataToXlsx', () => {
  it('packs the minimal OOXML file set', () => {
    const entries = readZipEntries(exportDataToXlsx(columns, data))

    expect([...entries.keys()].sort()).toEqual([
      '[Content_Types].xml',
      '_rels/.rels',
      'xl/_rels/workbook.xml.rels',
      'xl/styles.xml',
      'xl/workbook.xml',
      'xl/worksheets/sheet1.xml'
    ])
  })

  it('writes headers and rows with inline strings and numeric cells', () => {
    const sheet = readZipEntries(exportDataToXlsx(columns, data)).get('xl/worksheets/sheet1.xml')!

    expect(sheet).toContain('<row r="1">')
    expect(sheet).toContain('<t xml:space="preserve">Name</t>')
    expect(sheet).toContain('<t xml:space="preserve">Alice</t>')
    expect(sheet).toContain('<c r="B2"><v>25</v></c>')
    expect(sheet).toContain('<row r="3">')
  })

  it('escapes XML special characters', () => {
    const sheet = readZipEntries(
      exportDataToXlsx(columns, [{ name: '<Alice> & "Bob"', age: 1, city: '' }])
    ).get('xl/worksheets/sheet1.xml')!

    expect(sheet).toContain('&lt;Alice&gt; &amp; &quot;Bob&quot;')
  })

  it('sanitizes sheet names and falls back to Sheet1', () => {
    const sanitized = readZipEntries(
      exportDataToXlsx(columns, data, { sheetName: 'My: [Sheet]/2026' })
    ).get('xl/workbook.xml')!
    expect(sanitized).toContain('name="My   Sheet  2026"')

    const fallback = readZipEntries(exportDataToXlsx(columns, data, { sheetName: '///' })).get(
      'xl/workbook.xml'
    )!
    expect(fallback).toContain('name="Sheet1"')
  })

  it('extracts cell values via dataKey and cellFormatter', () => {
    const sheet = readZipEntries(
      exportDataToXlsx([{ key: 'col-a', dataKey: 'name', title: 'Name' }], data, {
        cellFormatter: (value) => `${value}!`
      })
    ).get('xl/worksheets/sheet1.xml')!

    expect(sheet).toContain('<t xml:space="preserve">Alice!</t>')
  })
})

describe('exportDataToMarkdown', () => {
  it('renders a GFM table; empty data keeps header and separator only', () => {
    const lines = exportDataToMarkdown(columns, data).split('\n')

    expect(lines[0]).toBe('| Name | Age | City |')
    expect(lines[1]).toBe('| --- | --- | --- |')
    expect(lines[2]).toBe('| Alice | 25 | New York |')
    expect(lines[3]).toBe('| Bob | 30 | London |')

    expect(exportDataToMarkdown(columns, []).split('\n')).toHaveLength(2)
  })

  it('maps column alignment to separator syntax', () => {
    const aligned: TableColumn[] = [
      { key: 'a', title: 'A', align: 'center' },
      { key: 'b', title: 'B', align: 'right' },
      { key: 'c', title: 'C', align: 'left' }
    ]
    expect(exportDataToMarkdown(aligned, []).split('\n')[1]).toBe('| :---: | ---: | --- |')
  })

  it('escapes pipes, backslashes and newlines', () => {
    const markdown = exportDataToMarkdown(columns, [
      { name: 'A|B', age: 1, city: 'line1\nline2' }
    ])
    expect(markdown).toContain('A\\|B')
    expect(markdown).toContain('line1<br>line2')

    const withBackslash = exportDataToMarkdown(columns, [{ name: 'a\\b', age: 1, city: '' }])
    expect(withBackslash).toContain('a\\\\b')
  })
})

describe('exportData', () => {
  it('dispatches to the matching serializer', () => {
    expect(exportData(columns, data, 'xlsx')).toBeInstanceOf(Uint8Array)
    expect(typeof exportData(columns, data, 'markdown')).toBe('string')
  })
})

describe('downloadDataExport', () => {
  it.each([
    ['xlsx' as const, 'report.xlsx'],
    ['markdown' as const, 'report.md']
  ])('creates and clicks a link for %s downloads', (format, expectedName) => {
    const clickSpy = vi.fn()
    const link = { href: '', download: '', style: { display: '' }, click: clickSpy }
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(link as never)
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((n) => n)
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((n) => n)
    const revokeURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    downloadDataExport(format === 'xlsx' ? exportDataToXlsx(columns, data) : '| a |', 'report', format)

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(link.download).toBe(expectedName)
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeURL).toHaveBeenCalled()

    createElementSpy.mockRestore()
    appendSpy.mockRestore()
    removeSpy.mockRestore()
    revokeURL.mockRestore()
  })
})
