import { classNames } from './class-names'
import { THEME_CSS_VARS, TIGER_BREAKPOINT_CSS_VALUES } from '../theme-runtime'
import { type ContainerMaxWidth } from '../types/container'
import { ensureGridBreakpointSync, injectLayoutGridStyles } from './layout-grid-styles'

export const containerBaseClasses = 'tiger-container'

export const containerCenteredClasses = 'tiger-container-center'

export const containerPaddingClasses = 'tiger-container-pad'

const MAX_WIDTH_VAR: Record<Exclude<ContainerMaxWidth, false | 'full'>, string> = {
  sm: THEME_CSS_VARS.breakpointSm,
  md: THEME_CSS_VARS.breakpointMd,
  lg: THEME_CSS_VARS.breakpointLg,
  xl: THEME_CSS_VARS.breakpointXl,
  '2xl': THEME_CSS_VARS.breakpoint2xl
}

const MAX_WIDTH_FALLBACK: Record<Exclude<ContainerMaxWidth, false | 'full'>, string> = {
  sm: TIGER_BREAKPOINT_CSS_VALUES.breakpointSm,
  md: TIGER_BREAKPOINT_CSS_VALUES.breakpointMd,
  lg: TIGER_BREAKPOINT_CSS_VALUES.breakpointLg,
  xl: TIGER_BREAKPOINT_CSS_VALUES.breakpointXl,
  '2xl': TIGER_BREAKPOINT_CSS_VALUES.breakpoint2xl
}

export const containerMaxWidthClasses: Record<Exclude<ContainerMaxWidth, false>, string> = {
  sm: '',
  md: '',
  lg: '',
  xl: '',
  '2xl': '',
  full: 'tiger-container-full'
} as const

export interface GetContainerClassesOptions {
  maxWidth?: ContainerMaxWidth
  center?: boolean
  padding?: boolean
  className?: string
}

export function getContainerMaxWidthStyle(
  maxWidth: ContainerMaxWidth = false
): Record<string, string> {
  if (maxWidth === false) return {}
  if (maxWidth === 'full') return { maxWidth: '100%' }
  const varName = MAX_WIDTH_VAR[maxWidth]
  const fallback = MAX_WIDTH_FALLBACK[maxWidth]
  if (!varName) return {}
  return { maxWidth: `var(${varName}, ${fallback})` }
}

export const getContainerClasses = ({
  maxWidth = false,
  center = true,
  padding = true,
  className
}: GetContainerClassesOptions = {}) => {
  injectLayoutGridStyles()
  ensureGridBreakpointSync()
  return classNames(
    containerBaseClasses,
    maxWidth === 'full' && containerMaxWidthClasses.full,
    center && containerCenteredClasses,
    padding && containerPaddingClasses,
    className
  )
}
