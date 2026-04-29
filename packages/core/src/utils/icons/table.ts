/**
 * Table-specific icon paths (sort indicators, expand chevron, lock indicators).
 *
 * Subpath: `@expcat/tigercat-core/icons/table`
 */

/**
 * Table sort icon paths (16x16)
 */
export const icon16ViewBox = '0 0 16 16'
export const sortAscIcon16PathD = 'M8 3l4 4H4l4-4z'
export const sortDescIcon16PathD = 'M8 13l-4-4h8l-4 4z'
export const sortBothIcon16PathD = 'M8 3l4 4H4l4-4zM8 13l-4-4h8l-4 4z'

/**
 * Expand/collapse chevron icon path (16x16)
 * Points right when collapsed, rotates 90° when expanded.
 */
export const expandChevronIcon16PathD = 'M6 3l5 5-5 5V3z'

/**
 * Lock icon paths (24x24)
 * Used by Table fixed column indicator.
 */
export const lockClosedIcon24PathD =
  'M17 8h-1V6a4 4 0 10-8 0v2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V10a2 2 0 00-2-2zm-7-2a2 2 0 114 0v2h-4V6z'
export const lockOpenIcon24PathD =
  'M17 8h-1V6a4 4 0 00-7.75-1.41 1 1 0 101.9.62A2 2 0 0114 6v2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V10a2 2 0 00-2-2zm0 12H7V10h10v10z'
