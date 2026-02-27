/**
 * Common inline SVG icon constants
 *
 * Purpose: share non-framework-specific icon geometry/attrs (e.g. path d, viewBox)
 * between React/Vue components to keep visuals consistent.
 */

export const closeIconViewBox = '0 0 24 24'

export const closeIconPathD = 'M6 18L18 6M6 6l12 12'

export const closeIconPathStrokeLinecap = 'round'

export const closeIconPathStrokeLinejoin = 'round'

export const closeIconPathStrokeWidth = 2

/**
 * Common outline icon defaults (24x24)
 */
export const icon24ViewBox = '0 0 24 24'
export const icon24PathStrokeLinecap = 'round'
export const icon24PathStrokeLinejoin = 'round'
export const icon24StrokeWidth = 2

/**
 * Common solid icon defaults (20x20)
 */
export const icon20ViewBox = '0 0 20 20'

/**
 * Common solid close(X) icon path (20x20)
 * Used by DatePicker/TimePicker clear button.
 */
export const closeSolidIcon20PathD =
  'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'

/**
 * Common Date/Time solid icon paths (20x20)
 * Used by DatePicker/TimePicker.
 */
export const calendarSolidIcon20PathD =
  'M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'

export const clockSolidIcon20PathD =
  'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'

export const chevronLeftSolidIcon20PathD =
  'M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'

export const chevronRightSolidIcon20PathD =
  'M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'

/**
 * Chevron down icon path (20x20 solid)
 * Used by Select, Dropdown, etc.
 */
export const chevronDownSolidIcon20PathD =
  'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'

/**
 * Check icon path (20x20 solid)
 * Used by Select selected option, Checkbox, etc.
 */
export const checkSolidIcon20PathD =
  'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'

/**
 * Common 20x20 solid status icon paths
 * Used by Upload.
 */
export const successCircleSolidIcon20PathD =
  'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'

export const errorCircleSolidIcon20PathD =
  'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'

/**
 * Common status icon paths (shared by Alert/Message/Notification)
 */
export type StatusIconType = 'success' | 'warning' | 'error' | 'info'

export const statusSuccessIconPath = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'

export const statusWarningIconPath =
  'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'

export const statusErrorIconPath =
  'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'

export const statusInfoIconPath = 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'

export const statusIconPaths: Record<StatusIconType, string> = {
  success: statusSuccessIconPath,
  warning: statusWarningIconPath,
  error: statusErrorIconPath,
  info: statusInfoIconPath
}

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

/**
 * DatePicker icon aliases (re-exports for backward compatibility)
 */
export const CalendarIconPath = calendarSolidIcon20PathD
export const CloseIconPath = closeSolidIcon20PathD
export const ChevronLeftIconPath = chevronLeftSolidIcon20PathD
export const ChevronRightIconPath = chevronRightSolidIcon20PathD

/**
 * TimePicker icon aliases (re-exports for backward compatibility)
 */
export const ClockIconPath = clockSolidIcon20PathD
export const TimePickerCloseIconPath = closeSolidIcon20PathD
