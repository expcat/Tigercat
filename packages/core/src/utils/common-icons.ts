/**
 * Common inline SVG icon constants
 *
 * Purpose: share non-framework-specific icon geometry/attrs (e.g. path d, viewBox)
 * between React/Vue components to keep visuals consistent.
 */

export const closeIconViewBox = '0 0 24 24';

export const closeIconPathD = 'M6 18L18 6M6 6l12 12';

export const closeIconPathStrokeLinecap = 'round';

export const closeIconPathStrokeLinejoin = 'round';

export const closeIconPathStrokeWidth = 2;

/**
 * Common outline icon defaults (24x24)
 */
export const icon24ViewBox = '0 0 24 24';
export const icon24PathStrokeLinecap = 'round';
export const icon24PathStrokeLinejoin = 'round';
export const icon24StrokeWidth = 2;

/**
 * Common solid icon defaults (20x20)
 */
export const icon20ViewBox = '0 0 20 20';

/**
 * Common solid close(X) icon path (20x20)
 * Used by DatePicker/TimePicker clear button.
 */
export const closeSolidIcon20PathD =
  'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z';

/**
 * Common status icon paths (shared by Alert/Message/Notification)
 */
export type StatusIconType = 'success' | 'warning' | 'error' | 'info';

export const statusSuccessIconPath =
  'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';

export const statusWarningIconPath =
  'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';

export const statusErrorIconPath =
  'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';

export const statusInfoIconPath =
  'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';

export const statusIconPaths: Record<StatusIconType, string> = {
  success: statusSuccessIconPath,
  warning: statusWarningIconPath,
  error: statusErrorIconPath,
  info: statusInfoIconPath,
};
