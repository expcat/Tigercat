/**
 * Japanese (ja-JP).
 */

import type { TigerLocale } from '../../../types/locale'

export const jaJP: TigerLocale = {
  common: {
    okText: 'OK',
    cancelText: 'キャンセル',
    closeText: '閉じる',
    loadingText: '読み込み中...',
    emptyText: 'データなし'
  },
  modal: {
    closeAriaLabel: '閉じる',
    okText: 'OK',
    cancelText: 'キャンセル'
  },
  drawer: {
    closeAriaLabel: '閉じる'
  },
  pagination: {
    totalText: '全 {total} 件',
    itemsPerPageText: '件/ページ',
    jumpToText: '移動',
    pageText: 'ページ',
    prevPageAriaLabel: '前のページ',
    nextPageAriaLabel: '次のページ',
    pageAriaLabel: '{page} ページ'
  },
  formWizard: {
    prevText: '前へ',
    nextText: '次へ',
    finishText: '完了'
  },
  taskBoard: {
    emptyColumnText: 'タスクなし',
    addCardText: 'タスク追加',
    wipLimitText: 'WIP制限: {limit}',
    dragHintText: 'ドラッグして移動',
    boardAriaLabel: 'タスクボード'
  }
}
