/**
 * Japanese (ja-JP).
 */

import type { TigerLocale } from '../../../types/locale'

export const jaJP: TigerLocale = {
  locale: 'ja-JP',
  direction: 'ltr',
  common: {
    okText: 'OK',
    cancelText: 'キャンセル',
    closeText: '閉じる',
    loadingText: '読み込み中...',
    emptyText: 'データなし',
    noMoreText: 'これ以上ありません'
  },
  modal: {
    closeAriaLabel: '閉じる',
    okText: 'OK',
    cancelText: 'キャンセル'
  },
  drawer: {
    closeAriaLabel: '閉じる'
  },
  qrcode: {
    ariaLabel: 'QRコード',
    expiredText: 'QRコードの有効期限が切れました',
    refreshText: '更新',
    loadingText: '読み込み中...'
  },
  timeline: {
    pendingText: '読み込み中...'
  },
  pagination: {
    totalText: '全 {total} 件',
    itemsPerPageText: '件/ページ',
    jumpToText: '移動',
    pageText: 'ページ',
    prevPageAriaLabel: '前のページ',
    nextPageAriaLabel: '次のページ',
    pageAriaLabel: '{page} ページ',
    pageIndicatorText: '全 {total} ページ中 {current} ページ'
  },
  table: {
    emptyText: 'データなし',
    loadingText: '読み込み中',
    expandText: '展開',
    collapseText: '折りたたむ',
    selectAllText: 'すべて選択',
    selectRowAriaLabel: '{row} 行目を選択',
    sortByText: '{column} で並べ替え',
    clearSortText: '並べ替えを解除',
    toolbarAriaLabel: 'データテーブルツールバー',
    searchPlaceholder: '検索',
    searchButtonText: '検索',
    selectedText: '選択済み',
    selectedItemsText: '件',
    columnSettingsText: '列の設定',
    columnSettingsAriaLabel: '列の設定',
    lockColumnAriaLabel: '{column} 列を固定',
    unlockColumnAriaLabel: '{column} 列の固定を解除'
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
