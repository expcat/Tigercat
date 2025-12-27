/**
 * Utility functions for Divider component
 */

import type { DividerOrientation, DividerLineStyle, DividerSpacing } from '../types/divider'

/**
 * Get spacing classes based on spacing type and orientation
 */
export function getDividerSpacingClasses(
  spacing: DividerSpacing,
  orientation: DividerOrientation
): string {
  const spacingMap: Record<DividerSpacing, { horizontal: string; vertical: string }> = {
    none: { horizontal: '', vertical: '' },
    xs: { horizontal: 'my-1', vertical: 'mx-1' },
    sm: { horizontal: 'my-2', vertical: 'mx-2' },
    md: { horizontal: 'my-4', vertical: 'mx-4' },
    lg: { horizontal: 'my-6', vertical: 'mx-6' },
    xl: { horizontal: 'my-8', vertical: 'mx-8' },
  }
  
  return spacingMap[spacing][orientation]
}

/**
 * Get border style classes based on line style
 */
export function getDividerLineStyleClasses(lineStyle: DividerLineStyle): string {
  const styleMap: Record<DividerLineStyle, string> = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  }
  
  return styleMap[lineStyle]
}

/**
 * Get base divider classes based on orientation
 */
export function getDividerOrientationClasses(orientation: DividerOrientation): string {
  if (orientation === 'horizontal') {
    return 'w-full border-t'
  }
  return 'h-full border-l'
}
