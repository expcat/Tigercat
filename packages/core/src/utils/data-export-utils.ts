/**
 * DataExport serialization utilities (real .xlsx workbook / GitHub-flavored Markdown table)
 *
 * Kept out of the core main entry on purpose: the DataExport components load this
 * module on demand via `import('@expcat/tigercat-core/utils/data-export')`, so apps
 * only download the serializers when an export is actually triggered.
 *
 * The .xlsx output is a genuine OOXML workbook packed as a zip archive with STORED
 * (uncompressed) entries, which keeps the writer dependency-free: no deflate needed,
 * only CRC-32 checksums and zip headers.
 */

import type { TableColumn } from '../types/table'
import type { DataExportFormat, DataExportOptions } from '../types/data-export'
import { isBrowser } from './env'

function getCellValue<T>(
  record: T,
  column: TableColumn<T>,
  options?: DataExportOptions<T>
): unknown {
  const key = column.dataKey || column.key
  const raw = (record as Record<string, unknown>)[key]
  return options?.cellFormatter ? options.cellFormatter(raw, column, record) : raw
}

// --- CRC-32 (polynomial 0xEDB88320, standard table-driven implementation) ---

let crc32Table: Uint32Array | null = null

function getCrc32Table(): Uint32Array {
  if (crc32Table) return crc32Table

  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let value = i
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
    table[i] = value
  }

  crc32Table = table
  return table
}

export function crc32(bytes: Uint8Array): number {
  const table = getCrc32Table()
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    crc = table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

// --- Minimal zip writer (STORED entries only) ---

export interface ZipEntrySource {
  /** Entry path inside the archive, forward slashes, no leading slash */
  name: string
  data: Uint8Array
}

// Fixed DOS timestamp (1980-01-01 00:00) keeps the archive byte-for-byte deterministic
const ZIP_DOS_TIME = 0
const ZIP_DOS_DATE = (1 << 5) | 1

export function buildStoredZip(entries: ZipEntrySource[]): Uint8Array {
  const encoder = new TextEncoder()
  const parts = entries.map((entry) => ({
    nameBytes: encoder.encode(entry.name),
    data: entry.data,
    crc: crc32(entry.data),
    offset: 0
  }))

  const localSize = parts.reduce((sum, p) => sum + 30 + p.nameBytes.length + p.data.length, 0)
  const centralSize = parts.reduce((sum, p) => sum + 46 + p.nameBytes.length, 0)
  const buffer = new Uint8Array(localSize + centralSize + 22)
  const view = new DataView(buffer.buffer)
  let offset = 0

  const writeCommonFields = (p: (typeof parts)[number]) => {
    view.setUint16(offset, 20, true) // version needed to extract
    view.setUint16(offset + 2, 0x0800, true) // general purpose flags: UTF-8 names
    view.setUint16(offset + 4, 0, true) // compression method: STORED
    view.setUint16(offset + 6, ZIP_DOS_TIME, true)
    view.setUint16(offset + 8, ZIP_DOS_DATE, true)
    view.setUint32(offset + 10, p.crc, true)
    view.setUint32(offset + 14, p.data.length, true) // compressed size
    view.setUint32(offset + 18, p.data.length, true) // uncompressed size
    view.setUint16(offset + 22, p.nameBytes.length, true)
    view.setUint16(offset + 24, 0, true) // extra field length
    offset += 26
  }

  for (const p of parts) {
    p.offset = offset
    view.setUint32(offset, 0x04034b50, true) // local file header signature
    offset += 4
    writeCommonFields(p)
    buffer.set(p.nameBytes, offset)
    offset += p.nameBytes.length
    buffer.set(p.data, offset)
    offset += p.data.length
  }

  const centralOffset = offset
  for (const p of parts) {
    view.setUint32(offset, 0x02014b50, true) // central directory header signature
    view.setUint16(offset + 4, 20, true) // version made by
    offset += 6
    writeCommonFields(p)
    view.setUint16(offset, 0, true) // file comment length
    view.setUint16(offset + 2, 0, true) // disk number start
    view.setUint16(offset + 4, 0, true) // internal file attributes
    view.setUint32(offset + 6, 0, true) // external file attributes
    view.setUint32(offset + 10, p.offset, true) // local header offset
    offset += 14
    buffer.set(p.nameBytes, offset)
    offset += p.nameBytes.length
  }

  view.setUint32(offset, 0x06054b50, true) // end of central directory signature
  view.setUint16(offset + 4, 0, true) // disk number
  view.setUint16(offset + 6, 0, true) // central directory start disk
  view.setUint16(offset + 8, parts.length, true)
  view.setUint16(offset + 10, parts.length, true)
  view.setUint32(offset + 12, offset - centralOffset, true) // central directory size
  view.setUint32(offset + 16, centralOffset, true) // central directory offset
  view.setUint16(offset + 20, 0, true) // comment length

  return buffer
}

// --- XML helpers ---

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // control characters (except tab/newline/CR) are not representable in XML 1.0
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
}

/** 0 -> A, 25 -> Z, 26 -> AA ... */
function columnLetter(index: number): string {
  let letters = ''
  let remaining = index
  while (remaining >= 0) {
    letters = String.fromCharCode(65 + (remaining % 26)) + letters
    remaining = Math.floor(remaining / 26) - 1
  }
  return letters
}

// Excel forbids : \ / ? * [ ] in sheet names and caps them at 31 characters
function sanitizeSheetName(name?: string): string {
  const cleaned = (name ?? '').replace(/[:\\/?*[\]]/g, ' ').trim().slice(0, 31)
  return cleaned || 'Sheet1'
}

const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'

const XLSX_CONTENT_TYPES = `${XML_DECLARATION}
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`

const XLSX_ROOT_RELS = `${XML_DECLARATION}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`

const XLSX_WORKBOOK_RELS = `${XML_DECLARATION}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`

const XLSX_STYLES = `${XML_DECLARATION}
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`

function buildSheetCell(value: unknown, columnIndex: number, rowNumber: number): string {
  const ref = `${columnLetter(columnIndex)}${rowNumber}`
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${ref}"><v>${value}</v></c>`
  }

  const str = value === null || value === undefined ? '' : String(value)
  if (str === '') return ''
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(str)}</t></is></c>`
}

/**
 * Serialize columns + records into a real .xlsx workbook (zip binary)
 */
export function exportDataToXlsx<T>(
  columns: TableColumn<T>[],
  data: T[],
  options?: DataExportOptions<T>
): Uint8Array {
  const headerCells = columns
    .map((column, index) => buildSheetCell(column.title, index, 1))
    .join('')
  const rows = [`<row r="1">${headerCells}</row>`]

  data.forEach((record, rowIndex) => {
    const rowNumber = rowIndex + 2
    const cells = columns
      .map((column, columnIndex) =>
        buildSheetCell(getCellValue(record, column, options), columnIndex, rowNumber)
      )
      .join('')
    rows.push(`<row r="${rowNumber}">${cells}</row>`)
  })

  const sheetXml = `${XML_DECLARATION}
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.join('')}</sheetData></worksheet>`

  const workbookXml = `${XML_DECLARATION}
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(sanitizeSheetName(options?.sheetName))}" sheetId="1" r:id="rId1"/></sheets></workbook>`

  const encoder = new TextEncoder()
  return buildStoredZip([
    { name: '[Content_Types].xml', data: encoder.encode(XLSX_CONTENT_TYPES) },
    { name: '_rels/.rels', data: encoder.encode(XLSX_ROOT_RELS) },
    { name: 'xl/workbook.xml', data: encoder.encode(workbookXml) },
    { name: 'xl/_rels/workbook.xml.rels', data: encoder.encode(XLSX_WORKBOOK_RELS) },
    { name: 'xl/styles.xml', data: encoder.encode(XLSX_STYLES) },
    { name: 'xl/worksheets/sheet1.xml', data: encoder.encode(sheetXml) }
  ])
}

// --- Markdown ---

function escapeMarkdownCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value)
  return str.replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>')
}

function markdownSeparator(align?: TableColumn['align']): string {
  if (align === 'center') return ':---:'
  if (align === 'right') return '---:'
  return '---'
}

/**
 * Serialize columns + records into a GitHub-flavored Markdown table
 */
export function exportDataToMarkdown<T>(
  columns: TableColumn<T>[],
  data: T[],
  options?: DataExportOptions<T>
): string {
  const header = `| ${columns.map((column) => escapeMarkdownCell(column.title)).join(' | ')} |`
  const separator = `| ${columns.map((column) => markdownSeparator(column.align)).join(' | ')} |`
  const rows = data.map(
    (record) =>
      `| ${columns
        .map((column) => escapeMarkdownCell(getCellValue(record, column, options)))
        .join(' | ')} |`
  )

  return [header, separator, ...rows].join('\n')
}

// --- Serialize + download ---

/**
 * Serialize columns + records into the given format
 */
export function exportData<T>(
  columns: TableColumn<T>[],
  data: T[],
  format: DataExportFormat,
  options?: DataExportOptions<T>
): Uint8Array | string {
  return format === 'xlsx'
    ? exportDataToXlsx(columns, data, options)
    : exportDataToMarkdown(columns, data, options)
}

const DATA_EXPORT_FILE_META: Record<DataExportFormat, { extension: string; mime: string }> = {
  xlsx: {
    extension: 'xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  },
  markdown: { extension: 'md', mime: 'text/markdown;charset=utf-8;' }
}

/**
 * Trigger a browser download for serialized export content
 */
export function downloadDataExport(
  content: Uint8Array | string,
  filename: string = 'export',
  format: DataExportFormat = 'xlsx'
): void {
  if (!isBrowser()) return

  const meta = DATA_EXPORT_FILE_META[format]
  const blob = new Blob([content as BlobPart], { type: meta.mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.${meta.extension}`
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
