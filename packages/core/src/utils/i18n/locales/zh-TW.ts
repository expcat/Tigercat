/**
 * Traditional Chinese (zh-TW).
 */

import type { TigerLocale } from '../../../types/locale'

export const zhTW: TigerLocale = {
  common: {
    okText: '確定',
    cancelText: '取消',
    closeText: '關閉',
    loadingText: '載入中...',
    emptyText: '暫無資料'
  },
  modal: {
    closeAriaLabel: '關閉',
    okText: '確定',
    cancelText: '取消'
  },
  drawer: {
    closeAriaLabel: '關閉'
  },
  pagination: {
    totalText: '共 {total} 筆',
    itemsPerPageText: '筆/頁',
    jumpToText: '跳至',
    pageText: '頁',
    prevPageAriaLabel: '上一頁',
    nextPageAriaLabel: '下一頁',
    pageAriaLabel: '第 {page} 頁'
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
  }
}
