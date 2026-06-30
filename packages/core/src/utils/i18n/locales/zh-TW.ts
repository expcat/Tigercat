/**
 * Traditional Chinese (zh-TW).
 */

import type { TigerLocale } from '../../../types/locale'
import { defineLocale } from '../define-locale'
import { ZH_TW_DATEPICKER_LOCALE } from '../datepicker-locales/zh-TW'

export const zhTW: TigerLocale = defineLocale({
  locale: 'zh-TW',
  direction: 'ltr',
  datePicker: ZH_TW_DATEPICKER_LOCALE,
  common: {
    okText: '確定',
    cancelText: '取消',
    closeText: '關閉',
    loadingText: '載入中...',
    emptyText: '暫無資料',
    noMoreText: '沒有更多了'
  },
  modal: {
    closeAriaLabel: '關閉',
    okText: '確定',
    cancelText: '取消'
  },
  drawer: {
    closeAriaLabel: '關閉'
  },
  qrcode: {
    ariaLabel: 'QR Code',
    expiredText: 'QR Code 已過期',
    refreshText: '重新整理',
    loadingText: '載入中...'
  },
  timeline: {
    pendingText: '載入中...'
  },
  pagination: {
    totalText: '共 {total} 筆',
    itemsPerPageText: '筆/頁',
    jumpToText: '跳至',
    pageText: '頁',
    prevPageAriaLabel: '上一頁',
    nextPageAriaLabel: '下一頁',
    pageAriaLabel: '第 {page} 頁',
    pageIndicatorText: '第 {current} 頁，共 {total} 頁'
  },
  table: {
    emptyText: '暫無資料',
    loadingText: '載入中',
    expandText: '展開',
    collapseText: '收合',
    selectAllText: '全選',
    selectRowAriaLabel: '選擇第 {row} 列',
    sortByText: '依 {column} 排序',
    clearSortText: '不排序',
    toolbarAriaLabel: '資料表格工具列',
    searchPlaceholder: '搜尋',
    searchButtonText: '搜尋',
    selectedText: '已選擇',
    selectedItemsText: '筆',
    columnSettingsText: '欄位設定',
    columnSettingsAriaLabel: '欄位設定',
    lockColumnAriaLabel: '鎖定{column}欄',
    unlockColumnAriaLabel: '取消鎖定{column}欄'
  },
  formWizard: {
    prevText: '上一步',
    nextText: '下一步',
    finishText: '完成'
  },
  taskBoard: {
    emptyColumnText: '暫無任務',
    addCardText: '新增任務',
    wipLimitText: 'WIP 限制: {limit}',
    dragHintText: '拖曳以移動',
    boardAriaLabel: '任務看板'
  },
  select: {
    doneText: '完成'
  }
})
