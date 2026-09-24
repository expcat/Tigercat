/**
 * Streaming row chunks and print tokens.
 * The binary workbook writer stays in `data-export-utils.ts`.
 */

export interface ExportStreamOptions {
  chunkSize: number
}

export interface PrintExchangeTokens {
  marginMm: number
  pageBreak: 'auto' | 'always'
}

export const printExchangeTokens: PrintExchangeTokens = {
  marginMm: 16,
  pageBreak: 'auto'
}

/**
 * Yields row chunks from `rows` without copying the whole sequence first.
 * Throws when `chunkSize` is not a positive integer.
 */
export function* createExportStream<T>(
  rows: Iterable<T>,
  options: ExportStreamOptions
): Generator<T[], void, void> {
  const { chunkSize } = options
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new Error('chunkSize must be a positive integer')
  }
  let chunk: T[] = []
  for (const row of rows) {
    chunk.push(row)
    if (chunk.length === chunkSize) {
      yield chunk
      chunk = []
    }
  }
  if (chunk.length > 0) yield chunk
}
