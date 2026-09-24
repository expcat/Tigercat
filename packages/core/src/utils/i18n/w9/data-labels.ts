/**
 * W9 data-module labels. Callers pass a locale tag; TigerLocale is not edited.
 */

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

const zhCN: W9DataLabels = {
  dragFromTo: '从第 {from} 项到第 {to} 项',
  dragHandle: '拖动行',
  columnDragHandle: '拖动列',
  selectionCount: '已选择 {count} 项',
  selectThisPage: '全选本页',
  selectLoadedRows: '全选已加载行',
  selectAllRemote: '全选全部',
  filterApply: '应用筛选',
  filterMenu: '{column} 筛选',
  summary: '合计',
  find: '查找',
  replace: '替换',
  replaceAll: '全部替换',
  bracketMatch: '括号配对',
  toc: '目录',
  upload: '上传',
  download: '下载',
  newFolder: '新建文件夹',
  rename: '重命名',
  delete: '删除',
  preview: '预览',
  unreadCount: '{count} 条未读',
  leaveStepTitle: '离开此步骤',
  leaveStepMessage: '当前步骤有未保存的修改',
  stay: '留在此步骤',
  leave: '离开',
  emptyDirectory: '目录为空',
  assigneeList: '受理人',
  exportChart: '导出图表',
  back: '返回',
  weekNumber: '周',
  pauseHint: '倒计时由目标时间控制',
  gridCell: '{column} {row}'
}

const enUS: W9DataLabels = {
  dragFromTo: 'from item {from} to item {to}',
  dragHandle: 'Drag row',
  columnDragHandle: 'Drag column',
  selectionCount: '{count} selected',
  selectThisPage: 'Select all on this page',
  selectLoadedRows: 'Select all loaded rows',
  selectAllRemote: 'Select all',
  filterApply: 'Apply filter',
  filterMenu: 'Filter {column}',
  summary: 'Summary',
  find: 'Find',
  replace: 'Replace',
  replaceAll: 'Replace all',
  bracketMatch: 'Matching bracket',
  toc: 'Contents',
  upload: 'Upload',
  download: 'Download',
  newFolder: 'New folder',
  rename: 'Rename',
  delete: 'Delete',
  preview: 'Preview',
  unreadCount: '{count} unread',
  leaveStepTitle: 'Leave this step',
  leaveStepMessage: 'This step has unsaved changes',
  stay: 'Stay on this step',
  leave: 'Leave',
  emptyDirectory: 'The directory is empty',
  assigneeList: 'Assignees',
  exportChart: 'Export chart',
  back: 'Back',
  weekNumber: 'Week',
  pauseHint: 'Countdown follows the target',
  gridCell: '{column} {row}'
}

const LABELS: Record<string, W9DataLabels> = {
  'zh-CN': zhCN,
  'en-US': enUS
}

export function getW9DataLabels(locale?: string): W9DataLabels {
  if (!locale) return enUS
  if (LABELS[locale]) return LABELS[locale]
  const language = locale.toLowerCase()
  if (language.startsWith('zh')) return zhCN
  return enUS
}

export function formatW9Label(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key]
    return value === undefined ? '' : String(value)
  })
}
