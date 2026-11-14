import type { TigerLocale } from '../../../types/locale'
import {
  getCommonLabels,
  getTableLabels,
  getCodeEditorLabels,
  getMarkdownEditorLabels,
  getFileManagerLabels,
  getNotificationCenterLabels,
  getFormWizardLabels,
  getAssigneePickerLabels,
  getChartLabels,
  getPageHeaderLabels,
  getCalendarLabels
} from '../../locale-utils'

export interface W9DataLabels {
  dragFromTo: string
  dragHandle: string
  columnDragHandle: string
  selectionCount: string
  selectThisPage: string
  selectLoadedRows: string
  selectAllRemote: string
  filterApply: string
  filterMenu: string
  summary: string
  find: string
  replace: string
  replaceAll: string
  bracketMatch: string
  toc: string
  upload: string
  download: string
  newFolder: string
  rename: string
  delete: string
  preview: string
  unreadCount: string
  leaveStepTitle: string
  leaveStepMessage: string
  stay: string
  leave: string
  emptyDirectory: string
  assigneeList: string
  exportChart: string
  back: string
  weekNumber: string
  pauseHint: string
  gridCell: string
}

/** Reads standard locale sections from an already merged locale object. */
export function getW9DataLabels(locale?: Partial<TigerLocale>): W9DataLabels {
  const common = getCommonLabels(locale)
  const table = getTableLabels(locale)
  const file = getFileManagerLabels(locale)
  const wizard = getFormWizardLabels(locale)
  const assignee = getAssigneePickerLabels(locale)
  return {
    dragFromTo: common.dragMoveText,
    dragHandle: table.dragRowAriaLabel,
    columnDragHandle: table.columnDragAriaLabel,
    selectionCount: table.selectionCountText,
    selectThisPage: table.selectAllText,
    selectLoadedRows: table.selectLoadedText,
    selectAllRemote: table.allText,
    filterApply: table.filterApplyText,
    filterMenu: table.filterColumnAriaLabel,
    summary: table.summaryText,
    find: getCodeEditorLabels(locale).findText,
    replace: getCodeEditorLabels(locale).replaceText,
    replaceAll: getCodeEditorLabels(locale).replaceAllText,
    bracketMatch: getCodeEditorLabels(locale).bracketMatchText,
    toc: getMarkdownEditorLabels(locale).contentsText,
    upload: file.uploadText,
    download: file.downloadText,
    newFolder: file.newFolderText,
    rename: file.renameText,
    delete: file.deleteText,
    preview: file.previewText,
    unreadCount: getNotificationCenterLabels(locale).unreadCountText,
    leaveStepTitle: wizard.leaveStepTitle,
    leaveStepMessage: wizard.leaveStepMessage,
    stay: wizard.stayText,
    leave: wizard.leaveText,
    emptyDirectory: assignee.emptyText,
    assigneeList: assignee.listAriaLabel,
    exportChart: getChartLabels(locale).exportText,
    back: getPageHeaderLabels(locale).backAriaLabel,
    weekNumber: getCalendarLabels(locale).weekNumberText,
    pauseHint: common.countdownTargetText,
    gridCell: '{column} {row}'
  }
}

export function formatW9Label(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key]
    return value === undefined ? '' : String(value)
  })
}
