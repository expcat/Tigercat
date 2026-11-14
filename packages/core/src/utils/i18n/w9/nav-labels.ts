import type { TigerLocale } from '../../../types/locale'
import {
  getCommonLabels,
  getBreadcrumbLabels,
  getTreeLabels,
  getPaginationLabels
} from '../../locale-utils'

export interface NavLabels {
  dangerItem: string
  breadcrumbCollapsed: string
  breadcrumbCollapse: string
  paginationJump: string
  menuCollapsedTip: string
  directory: string
}

export function getNavLabels(locale?: Partial<TigerLocale>): NavLabels {
  const common = getCommonLabels(locale)
  return {
    dangerItem: common.dangerText,
    breadcrumbCollapsed: getBreadcrumbLabels(locale).expandAriaLabel,
    breadcrumbCollapse: getTreeLabels(locale).collapse,
    paginationJump: getPaginationLabels(locale).jumpToPageAriaLabel,
    menuCollapsedTip: common.moreOptionsText,
    directory: getTreeLabels(locale).directoryText
  }
}

/** English defaults for callers without a provider. */
export const navLabels: NavLabels = getNavLabels()

export function formatNavLabel(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key]
    return value === undefined ? match : String(value)
  })
}
