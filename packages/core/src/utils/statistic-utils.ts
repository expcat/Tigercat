import { classNames } from './class-names'
import type { StatisticSize } from '../types/statistic'

/* ------------------------------------------------------------------ */
/*  Style constants                                                    */
/* ------------------------------------------------------------------ */

export const statisticBaseClasses = 'inline-block'

const titleSize: Record<StatisticSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
}

const valueSize: Record<StatisticSize, string> = {
  sm: 'text-lg font-semibold',
  md: 'text-2xl font-semibold',
  lg: 'text-4xl font-bold'
}

export function getStatisticTitleClasses(size: StatisticSize): string {
  return classNames(
    titleSize[size],
    'text-[var(--tiger-statistic-title,var(--tiger-text-muted,#6b7280))] mb-1'
  )
}

export function getStatisticValueClasses(size: StatisticSize): string {
  return classNames(
    valueSize[size],
    'text-[var(--tiger-statistic-value,var(--tiger-text,#111827))]'
  )
}

export const statisticPrefixClasses =
  'mr-1 text-[var(--tiger-statistic-prefix,var(--tiger-text,#111827))]'
export const statisticSuffixClasses =
  'ml-1 text-[var(--tiger-statistic-suffix,var(--tiger-text-muted,#6b7280))]'

/* ------------------------------------------------------------------ */
/*  Formatting                                                         */
/* ------------------------------------------------------------------ */

export function formatStatisticValue(
  value: string | number | undefined,
  precision: number | undefined,
  groupSeparator: boolean
): string {
  if (value === undefined || value === '') return ''

  if (typeof value === 'string') return value

  let formatted = precision !== undefined ? value.toFixed(precision) : String(value)

  if (groupSeparator) {
    const [intPart, decPart] = formatted.split('.')
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    formatted = decPart !== undefined ? `${grouped}.${decPart}` : grouped
  }

  return formatted
}
