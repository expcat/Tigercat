/**
 * Shared floating-popup types used by Tooltip, Popover, and Popconfirm.
 */

import type { FloatingPlacement } from '../utils/floating'

/**
 * Trigger type shared by floating popup components
 */
export type FloatingTrigger = 'click' | 'hover' | 'focus' | 'manual'

/**
 * Base props shared across all floating-popup components
 * (Tooltip, Popover, Popconfirm).
 */
export interface BaseFloatingPopupProps {
  /** Whether the popup is open (controlled mode) */
  open?: boolean
  /** Default open state (uncontrolled mode) @default false */
  defaultOpen?: boolean
  /** Placement relative to trigger @default 'top' */
  placement?: FloatingPlacement
  /** Whether the popup is disabled @default false */
  disabled?: boolean
  /** Offset distance from trigger in pixels @default 8 */
  offset?: number
  /** Additional CSS classes */
  className?: string
}
