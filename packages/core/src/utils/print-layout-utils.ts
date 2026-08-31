/**
 * PrintLayout component utilities
 * @since 0.9.0
 */

import { isBrowser } from './env'
import type { PrintOrientation, PrintPageBox, PrintPageSize } from '../types/print-layout'

export const PRINT_LAYOUT_STYLE_ID = 'tiger-ui-print-layout-styles'
export const PRINT_LAYOUT_PRINTING_CLASS = 'tiger-printing'
export const PRINT_LAYOUT_ACTIVE_CLASS = 'tiger-print-active'
export const PRINT_LAYOUT_MARGIN = '20mm'

export const printLayoutBaseClasses =
  'tiger-print-layout relative bg-white text-[#111827] shadow-[var(--tiger-shadow-sm,0_1px_2px_0_rgb(0_0_0_/_0.05))] border border-[var(--tiger-border,#e5e7eb)] mx-auto box-border'

export const printLayoutHeaderClasses =
  'text-center text-sm text-[var(--tiger-text-muted,#6b7280)] border-b border-[var(--tiger-border,#e5e7eb)] py-2 font-medium'

export const printLayoutFooterClasses =
  'text-center text-xs text-[var(--tiger-text-muted,#6b7280)] border-t border-[var(--tiger-border,#e5e7eb)] py-2'

export const printLayoutPageBreakClasses =
  'relative my-4 border-t-2 border-dashed border-[var(--tiger-border,#e5e7eb)] print:my-0 print:border-0 print:h-0'

export const printLayoutPageBreakLabelClasses =
  'absolute start-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-[var(--tiger-text-muted,#6b7280)] print:hidden'

export const printLayoutPaddingClasses = 'p-8'

export const PRINT_PAGE_SIZE_MM: Record<
  PrintPageSize,
  { portrait: { width: number; height: number }; landscape: { width: number; height: number } }
> = {
  A4: { portrait: { width: 210, height: 297 }, landscape: { width: 297, height: 210 } },
  A3: { portrait: { width: 297, height: 420 }, landscape: { width: 420, height: 297 } },
  Letter: { portrait: { width: 215.9, height: 279.4 }, landscape: { width: 279.4, height: 215.9 } },
  Legal: { portrait: { width: 215.9, height: 355.6 }, landscape: { width: 355.6, height: 215.9 } }
}

function cssLength(value: number | string | undefined): string | undefined {
  if (value === undefined || value === '') return undefined
  return typeof value === 'number' ? `${value}mm` : value
}

export function resolvePrintPageBox(
  pageSize: PrintPageSize | undefined,
  orientation: PrintOrientation,
  pageWidth?: number | string,
  pageHeight?: number | string
): PrintPageBox {
  const customWidth = cssLength(pageWidth)
  const customHeight = cssLength(pageHeight)
  if (customWidth && customHeight) {
    return {
      width: customWidth,
      height: customHeight,
      pageSize: `${customWidth} ${customHeight}`
    }
  }
  const preset = PRINT_PAGE_SIZE_MM[pageSize ?? 'A4'][orientation]
  return {
    width: `${preset.width}mm`,
    height: `${preset.height}mm`,
    pageSize: `${pageSize ?? 'A4'} ${orientation}`
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

export function buildPrintLayoutCss(): string {
  const pages = (['A4', 'A3', 'Letter', 'Legal'] as PrintPageSize[]).flatMap((size) =>
    (['portrait', 'landscape'] as PrintOrientation[]).map((orientation) => {
      const box = resolvePrintPageBox(size, orientation)
      const key = getPrintLayoutPageKey(box)
      return `@page tiger-${key} { size: ${box.pageSize}; margin: ${PRINT_LAYOUT_MARGIN}; }
.tiger-print-layout[data-tiger-print="${key}"] { page: tiger-${key}; }`
    })
  )

  return `
${pages.join('\n')}
@media print {
  .tiger-print-layout {
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    width: auto !important;
    min-height: 0 !important;
    padding: ${PRINT_LAYOUT_MARGIN} !important;
  }
  body.${PRINT_LAYOUT_PRINTING_CLASS} * { visibility: hidden; }
  body.${PRINT_LAYOUT_PRINTING_CLASS} .${PRINT_LAYOUT_ACTIVE_CLASS},
  body.${PRINT_LAYOUT_PRINTING_CLASS} .${PRINT_LAYOUT_ACTIVE_CLASS} * { visibility: visible; }
  thead { display: table-header-group; }
  tfoot { display: table-footer-group; }
}
`
}

export function injectPrintLayoutStyles(): void {
  if (!isBrowser()) return
  let node = document.getElementById(PRINT_LAYOUT_STYLE_ID)
  if (!node) {
    node = document.createElement('style')
    node.id = PRINT_LAYOUT_STYLE_ID
    document.head.appendChild(node)
  }
  const css = buildPrintLayoutCss()
  if (node.textContent !== css) node.textContent = css
}

export function printPrintLayoutRoot(root: HTMLElement | null): void {
  if (!root || !isBrowser()) return
  injectPrintLayoutStyles()
  const body = root.ownerDocument.body
  root.classList.add(PRINT_LAYOUT_ACTIVE_CLASS)
  body.classList.add(PRINT_LAYOUT_PRINTING_CLASS)
  const cleanup = (): void => {
    root.classList.remove(PRINT_LAYOUT_ACTIVE_CLASS)
    body.classList.remove(PRINT_LAYOUT_PRINTING_CLASS)
    root.ownerDocument.defaultView?.removeEventListener('afterprint', cleanup)
  }
  root.ownerDocument.defaultView?.addEventListener('afterprint', cleanup)
  root.ownerDocument.defaultView?.print()
}

/** @deprecated Injected via {@link injectPrintLayoutStyles}; kept so callers stop importing a dead string. */
export const printLayoutPrintStyles = buildPrintLayoutCss()
