import type {
  DividerOrientation,
  DividerLineStyle,
  DividerSpacing,
} from '../types/divider';

const SPACING_MAP: Record<
  DividerSpacing,
  { horizontal: string; vertical: string }
> = {
  none: { horizontal: '', vertical: '' },
  xs: { horizontal: 'my-1', vertical: 'mx-1' },
  sm: { horizontal: 'my-2', vertical: 'mx-2' },
  md: { horizontal: 'my-4', vertical: 'mx-4' },
  lg: { horizontal: 'my-6', vertical: 'mx-6' },
  xl: { horizontal: 'my-8', vertical: 'mx-8' },
} as const;

const LINE_STYLE_MAP: Record<DividerLineStyle, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
} as const;

const DEFAULT_BORDER_COLOR_CLASS =
  'border-[var(--tiger-border,#e5e7eb)]' as const;

/**
 * Get spacing classes based on spacing type and orientation
 * @param spacing - Spacing size
 * @param orientation - Divider orientation
 * @returns Spacing class string
 */
export function getDividerSpacingClasses(
  spacing: DividerSpacing,
  orientation: DividerOrientation
): string {
  return SPACING_MAP[spacing][orientation];
}

/**
 * Get border style classes based on line style
 * @param lineStyle - Line style type
 * @returns Border style class string
 */
export function getDividerLineStyleClasses(
  lineStyle: DividerLineStyle
): string {
  return LINE_STYLE_MAP[lineStyle];
}

/**
 * Get base divider classes based on orientation
 * @param orientation - Divider orientation
 * @returns Base divider class string
 */
export function getDividerOrientationClasses(
  orientation: DividerOrientation
): string {
  return orientation === 'horizontal'
    ? `w-full border-t ${DEFAULT_BORDER_COLOR_CLASS}`
    : `h-full border-l ${DEFAULT_BORDER_COLOR_CLASS}`;
}
