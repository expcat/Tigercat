/**
 * PrintLayout component utilities
 * @since 0.9.0
 */

import { isBrowser } from './env'
import type { PrintOrientation, PrintPageBox, PrintPageSize } from '../types/print-layout'

let printInstanceSeq = 0

export function createPrintInstanceId(): string {
  printInstanceSeq += 1
  return `sheet-${printInstanceSeq}`
}
export const PRINT_LAYOUT_PRINTING_CLASS = 'tiger-printing'
export const PRINT_LAYOUT_ACTIVE_CLASS = 'tiger-print-active'
export const PRINT_LAYOUT_MARGIN = '20mm'

export const printLayoutBaseClasses =
  'tiger-print-layout relative bg-white text-[#111827] shadow-[var(--tiger-shadow-sm)] border border-[var(--tiger-border)] mx-auto box-border'

export const printLayoutHeaderClasses =
  'text-center text-sm text-[var(--tiger-text-secondary)] border-b border-[var(--tiger-border)] py-2 font-medium'

export const printLayoutFooterClasses =
  'text-center text-xs text-[var(--tiger-text-secondary)] border-t border-[var(--tiger-border)] py-2'

export const printLayoutPageBreakClasses =
  'relative my-4 border-t-2 border-dashed border-[var(--tiger-border)] print:my-0 print:border-0 print:h-0'

export const printLayoutPageBreakLabelClasses =
  'absolute top-0 start-0 end-0 mx-auto w-fit -translate-y-1/2 bg-white px-2 text-xs text-[var(--tiger-text-secondary)] print:hidden'

export const printLayoutPaddingClasses = ''

/** Shared print rules. Named `@page` size stays on the instance and is removed with it. */
export const printLayoutBaseStyles = {
  '@media print': {
    '.tiger-print-layout': {
      boxShadow: 'none',
      borderWidth: '0',
      margin: '0',
      width: 'auto',
      minHeight: '0'
    },
    '.tiger-print-layout thead': {
      display: 'table-header-group'
    },
    '.tiger-print-layout tfoot': {
      display: 'table-footer-group'
    }
  }
} as const

export const PRINT_PAGE_SIZE_MM: Record<
  PrintPageSize,
  { portrait: { width: number; height: number }; landscape: { width: number; height: number } }
> = {
  A4: { portrait: { width: 210, height: 297 }, landscape: { width: 297, height: 210 } },
  A3: { portrait: { width: 297, height: 420 }, landscape: { width: 420, height: 297 } },
  Letter: { portrait: { width: 215.9, height: 279.4 }, landscape: { width: 279.4, height: 215.9 } },
  Legal: { portrait: { width: 215.9, height: 355.6 }, landscape: { width: 355.6, height: 215.9 } }
}

const CSS_LENGTH = /^(?:\d+|\d*\.\d+)(?:mm|cm|in|px|pt|pc)$/

function cssLength(value: number | string | undefined): string | undefined {
  if (value === undefined || value === '') return undefined
  const length = typeof value === 'number' ? `${value}mm` : value.trim()
  return CSS_LENGTH.test(length) ? length : undefined
}

function knownPageSize(pageSize: string | undefined): PrintPageSize {
  if (pageSize && Object.prototype.hasOwnProperty.call(PRINT_PAGE_SIZE_MM, pageSize)) {
    return pageSize as PrintPageSize
  }
  return 'A4'
}

export function resolvePrintPageBox(
  pageSize: PrintPageSize | string | undefined,
  orientation: PrintOrientation | string | undefined,
  pageWidth?: number | string,
  pageHeight?: number | string
): PrintPageBox {
  const orient: PrintOrientation = orientation === 'landscape' ? 'landscape' : 'portrait'
  const customWidth = cssLength(pageWidth)
  const customHeight = cssLength(pageHeight)
  if (customWidth && customHeight) {
    return {
      width: customWidth,
      height: customHeight,
      pageSize: `${customWidth} ${customHeight}`
    }
  }
  const presetName = knownPageSize(pageSize)
  const preset = PRINT_PAGE_SIZE_MM[presetName][orient]
  return {
    width: `${preset.width}mm`,
    height: `${preset.height}mm`,
    pageSize: `${presetName} ${orient}`
  }
}

export function getPrintLayoutPageKey(box: PrintPageBox): string {
  return box.pageSize.replace(/\s+/g, '-').replace(/[^\w.-]+/g, '')
}

export function getPrintLayoutClasses(className?: string): string {
  return [printLayoutBaseClasses, printLayoutPaddingClasses, className].filter(Boolean).join(' ')
}

export function getPrintLayoutBoxStyle(box: PrintPageBox): {
  width: string
  minHeight: string
} {
  return { width: box.width, minHeight: box.height }
}

/** `@page` for one instance. It does not restyle other sheets. */
export function buildPrintInstanceCss(instanceId: string, box: PrintPageBox): string {
  const safeId = instanceId.replace(/[^\w-]+/g, '')
  return `@page tiger-${safeId} { size: ${box.pageSize}; margin: ${PRINT_LAYOUT_MARGIN}; }
.tiger-print-layout[data-tiger-print-instance="${safeId}"] { page: tiger-${safeId}; }`
}

export function buildPrintLayoutCss(box?: PrintPageBox, instanceId = 'preview'): string {
  const page = box ?? resolvePrintPageBox('A4', 'portrait')
  return buildPrintInstanceCss(instanceId, page)
}

/**
 * Mount this instance's `@page` rule. The node is removed when the returned
 * function runs. Shared print chrome lives in `printLayoutBaseStyles`.
 */
export function mountPrintInstanceStyle(
  doc: Document,
  instanceId: string,
  box: PrintPageBox
): () => void {
  const node = doc.createElement('style')
  node.setAttribute('data-tiger-print-page', instanceId)
  node.textContent = buildPrintInstanceCss(instanceId, box)
  doc.head.appendChild(node)
  return () => {
    node.remove()
  }
}

export function printPrintLayoutRoot(root: HTMLElement | null): void {
  if (!root || !isBrowser()) return
  const doc = root.ownerDocument
  const iframe = doc.createElement('iframe')
  iframe.setAttribute('data-tiger-print-frame', '')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.position = 'fixed'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  doc.body.appendChild(iframe)
  const frameDoc = iframe.contentDocument
  const win = iframe.contentWindow
  const destroy = (): void => {
    iframe.remove()
  }
  if (!frameDoc || !win) {
    destroy()
    return
  }

  // Ancestor-dependent selectors (theme classes / data attributes on
  // <html>/<body>) must match the cloned tree the same way.
  for (const attr of Array.from(doc.documentElement.attributes)) {
    frameDoc.documentElement.setAttribute(attr.name, attr.value)
  }
  for (const attr of Array.from(doc.body.attributes)) {
    frameDoc.body.setAttribute(attr.name, attr.value)
  }

  // Copy the stylesheets the source tree consumes. Constructed sheets cannot
  // cross documents, so they are serialized into a plain <style> instead.
  const pendingResources: Promise<void>[] = []
  for (const node of Array.from(doc.head.querySelectorAll('style, link[rel~="stylesheet"]'))) {
    const copy = node.cloneNode(true)
    if (copy instanceof HTMLLinkElement) {
      pendingResources.push(
        new Promise<void>((resolve) => {
          if (copy.sheet) {
            resolve()
            return
          }
          copy.addEventListener('load', () => resolve(), { once: true })
          copy.addEventListener('error', () => resolve(), { once: true })
        })
      )
    }
    frameDoc.head.appendChild(copy)
  }
  for (const sheet of Array.from(doc.adoptedStyleSheets ?? [])) {
    try {
      const cssText = Array.from(sheet.cssRules)
        .map((rule) => rule.cssText)
        .join('\n')
      if (cssText) {
        const adopted = frameDoc.createElement('style')
        adopted.textContent = cssText
        frameDoc.head.appendChild(adopted)
      }
    } catch {
      // Unreadable sheet — skip it rather than aborting the print.
    }
  }

  const style = frameDoc.createElement('style')
  const instanceId = root.getAttribute('data-tiger-print-instance') ?? 'sheet'
  const declared = root.getAttribute('data-tiger-print-size')
  const box = declared
    ? {
        width: root.style.width || declared.split(' ')[0] || '210mm',
        height: root.style.minHeight || declared.split(' ')[1] || '297mm',
        pageSize: declared
      }
    : resolvePrintPageBox('A4', 'portrait')
  style.textContent = `${buildPrintInstanceCss(instanceId, box)}
@media print {
  .tiger-print-layout { box-shadow: none; border: 0; margin: 0; width: auto; min-height: 0; }
  .tiger-print-layout thead { display: table-header-group; }
  .tiger-print-layout tfoot { display: table-footer-group; }
}`
  frameDoc.head.appendChild(style)

  const clone = root.cloneNode(true) as HTMLElement
  // The hidden frame never intersects a viewport, so lazy images would never
  // start loading. The print copy must fetch eagerly.
  for (const image of Array.from(clone.querySelectorAll('img'))) {
    image.setAttribute('loading', 'eager')
  }
  // CSS custom properties resolved on ancestors do not survive the move into
  // the frame; pin the computed values onto the clone so descendants inherit.
  const view = doc.defaultView
  if (view) {
    const computed = view.getComputedStyle(root)
    for (let i = 0; i < computed.length; i += 1) {
      const name = computed.item(i)
      if (name.startsWith('--')) {
        clone.style.setProperty(
          name,
          computed.getPropertyValue(name),
          computed.getPropertyPriority(name)
        )
      }
    }
  }
  frameDoc.body.appendChild(clone)
  for (const image of Array.from(clone.querySelectorAll('img'))) {
    if (image.complete) continue
    pendingResources.push(
      new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true })
        image.addEventListener('error', () => resolve(), { once: true })
      })
    )
  }

  win.addEventListener('afterprint', destroy)
  const startPrint = (): void => {
    try {
      if (typeof win.print === 'function') win.print()
      else destroy()
    } catch {
      destroy()
    }
  }
  if (pendingResources.length > 0) Promise.all(pendingResources).then(startPrint, destroy)
  else startPrint()
}
