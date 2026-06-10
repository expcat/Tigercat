/**
 * Simplified Chinese (zh-CN).
 */

import type { TigerLocale } from '../../../types/locale'

export const zhCN: TigerLocale = {
  locale: 'zh-CN',
  direction: 'ltr',
  common: {
    okText: '确定',
    cancelText: '取消',
    closeText: '关闭',
    loadingText: '加载中...',
    emptyText: '暂无数据'
  },
  modal: {
    closeAriaLabel: '关闭',
    okText: '确定',
    cancelText: '取消'
  },
  drawer: {
    closeAriaLabel: '关闭'
  },
  pagination: {
    totalText: '共 {total} 条',
    itemsPerPageText: '条/页',
    jumpToText: '跳至',
    pageText: '页',
    prevPageAriaLabel: '上一页',
    nextPageAriaLabel: '下一页',
    pageAriaLabel: '第 {page} 页',
    pageIndicatorText: '第 {current} 页，共 {total} 页'
  },
  table: {
    emptyText: '暂无数据',
    loadingText: '加载中',
    expandText: '展开',
    collapseText: '收起',
    selectAllText: '全选',
    selectRowAriaLabel: '选择第 {row} 行',
    sortByText: '按 {column} 排序',
    clearSortText: '不排序',
    toolbarAriaLabel: '数据表格工具栏',
    searchPlaceholder: '搜索',
    searchButtonText: '搜索',
    selectedText: '已选择',
    selectedItemsText: '项'
  },
  formWizard: {
    prevText: '上一步',
    nextText: '下一步',
    finishText: '完成'
  },
  taskBoard: {
    emptyColumnText: '暂无任务',
    addCardText: '添加任务',
    wipLimitText: 'WIP 限制: {limit}',
    dragHintText: '拖拽以移动',
    boardAriaLabel: '任务看板'
  }
}
