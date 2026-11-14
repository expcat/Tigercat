import type { TigerLocale } from '../../../types/locale'
import {
  getCommonLabels,
  getSplitterLabels,
  getImageEditorLabels,
  getDrawerLabels,
  getProgressLabels,
  getMasonryLabels
} from '../../locale-utils'

export interface FeedbackLayoutLabels {
  sidebarCollapse: string
  sidebarExpand: string
  skeletonBusy: string
  resizableLive: string
  drawerResize: string
  splitterExpand: string
  splitterCollapse: string
  progressIndeterminate: string
  listLoading: string
  masonryOrder: string
}

export function getFeedbackLayoutLabels(locale?: Partial<TigerLocale>): FeedbackLayoutLabels {
  const common = getCommonLabels(locale)
  const splitter = getSplitterLabels(locale)
  return {
    sidebarCollapse: common.sidebarCollapseText,
    sidebarExpand: common.sidebarExpandText,
    skeletonBusy: common.loadingText,
    resizableLive: getImageEditorLabels(locale).cropSizeText,
    drawerResize: getDrawerLabels(locale).resizeAriaLabel,
    splitterExpand: splitter.expandText,
    splitterCollapse: splitter.collapseText,
    progressIndeterminate: getProgressLabels(locale).ariaLabel,
    listLoading: common.loadingText,
    masonryOrder: getMasonryLabels(locale).visualOrderText
  }
}

/** English defaults for callers without a provider. */
export const feedbackLayoutLabels: FeedbackLayoutLabels = getFeedbackLayoutLabels()

export function formatFeedbackLayoutLabel(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key]
    return value === undefined ? match : String(value)
  })
}
