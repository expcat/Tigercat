import { type IconSize } from '../types/icon'

export const iconWrapperClasses = 'inline-flex align-middle'

export const iconSvgBaseClasses = 'inline-block'

export const iconSizeClasses: Record<IconSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
} as const
