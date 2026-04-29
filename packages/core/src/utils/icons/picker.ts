/**
 * 20x20 solid icon paths shared by picker-like components
 * (Select, Cascader, AutoComplete, TreeSelect, Transfer, DatePicker, TimePicker, Upload).
 *
 * Subpath: `@expcat/tigercat-core/icons/picker`
 */

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
