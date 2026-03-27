/**
 * PrintLayout component utilities
 * @since 0.9.0
 */

import type { PrintPageSize, PrintOrientation } from '../types/print-layout'

/**
 * Base classes for the PrintLayout container (screen view)
 */
export const printLayoutBaseClasses =
  'tiger-print-layout relative bg-white shadow-sm border border-[var(--tiger-border,#e5e7eb)] mx-auto'

/**
 * Classes for print-only header
 */
export const printLayoutHeaderClasses =
  'hidden print:block text-center text-sm text-[var(--tiger-text-muted,#6b7280)] border-b border-[var(--tiger-border,#e5e7eb)] py-2 mb-4'

/**
 * Classes for print-only footer
 */
export const printLayoutFooterClasses =
  'hidden print:block text-center text-xs text-[var(--tiger-text-muted,#6b7280)] border-t border-[var(--tiger-border,#e5e7eb)] pt-2 mt-4'

/**
 * Classes for page break indicator (screen only)
 */
export const printLayoutPageBreakClasses =
  'border-t-2 border-dashed border-[var(--tiger-border,#e5e7eb)] my-4 print:hidden relative before:content-["Page_Break"] before:absolute before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-white before:px-2 before:text-xs before:text-[var(--tiger-text-muted,#6b7280)]'

/**
 * Page size dimensions (width in mm for screen representation)
 */
export const printPageSizeDimensions: Record<
  Exclude<PrintPageSize, 'custom'>,
  { portrait: string; landscape: string }
> = {
  A4: { portrait: 'max-w-[210mm]', landscape: 'max-w-[297mm]' },
  A3: { portrait: 'max-w-[297mm]', landscape: 'max-w-[420mm]' },
  Letter: { portrait: 'max-w-[216mm]', landscape: 'max-w-[279mm]' },
  Legal: { portrait: 'max-w-[216mm]', landscape: 'max-w-[356mm]' }
}

/**
 * Page padding classes
 */
export const printLayoutPaddingClasses = 'p-8 print:p-0'

/**
 * Get PrintLayout container classes
 */
export function getPrintLayoutClasses(
  pageSize: PrintPageSize,
  orientation: PrintOrientation,
  className?: string
): string {
  const classes = [printLayoutBaseClasses, printLayoutPaddingClasses]

  if (pageSize !== 'custom') {
    classes.push(printPageSizeDimensions[pageSize][orientation])
  }

  if (className) classes.push(className)
  return classes.join(' ')
}

/**
 * Get the @media print CSS as inline style string
 */
export const printLayoutPrintStyles = `
@media print {
  .tiger-print-layout {
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    padding: 20mm !important;
  }
}
`
