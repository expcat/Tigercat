/**
 * Common inline SVG icon constants — backward-compatible barrel re-export.
 *
 * The actual definitions live in grouped modules:
 *   - icons/common.ts (24x24 stroke close + 24x24 base attrs)
 *   - icons/picker.ts (20x20 solid: close, calendar, clock, chevrons, check, success/error circles)
 *   - icons/status.ts (alert/message/notification status paths + statusIconPaths map)
 *   - icons/table.ts  (16x16 sort + expand chevron + 24x24 lock)
 *
 * Prefer importing from the grouped subpaths:
 *   import { closeIconPathD } from '@expcat/tigercat-core/icons/common'
 *   import { calendarSolidIcon20PathD } from '@expcat/tigercat-core/icons/picker'
 *
 * Importing from `@expcat/tigercat-core` (full barrel) still works thanks to
 * `sideEffects: false` tree-shaking, but the subpath form is preferred for
 * non-bundler / SSR / DTS-only consumers.
 */

export * from './icons/common'
export * from './icons/picker'
export * from './icons/status'
export * from './icons/table'
