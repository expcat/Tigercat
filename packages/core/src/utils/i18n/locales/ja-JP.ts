/**
 * Japanese (ja-JP).
 */

import type { TigerLocale } from '../../../types/locale'
import { defineLocale } from '../define-locale'
import { JA_JP_DATEPICKER_LOCALE } from '../datepicker-locales/ja-JP'

export const jaJP: TigerLocale = defineLocale({
  locale: 'ja-JP',
  direction: 'ltr',
  datePicker: JA_JP_DATEPICKER_LOCALE,
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
  },
  chatWindow: {
    emptyText: 'メッセージはありません',
    sendText: '送信',
    placeholder: 'メッセージを入力',
    sendingText: '送信中',
    sentText: '配信済み',
    failedText: '送信に失敗しました'
  },
  code: {
    copyLabel: 'コピー',
    copiedLabel: 'コピーしました',
    copyFailedLabel: 'コピーに失敗しました'
  },
  commentThread: {
    emptyText: 'コメントはありません',
    replyPlaceholder: '返信を書く...',
    replyButtonText: '返信',
    cancelReplyText: 'キャンセル',
    likeText: 'いいね',
    likedText: 'いいね済み',
    replyText: '返信',
    moreText: 'その他',
    loadMoreText: 'もっと読み込む',
    collapseRepliesText: '▾ 返信を折りたたむ',
    expandRepliesText: '▸ {count} 件の返信を展開'
  },
  activityFeed: {
    emptyText: 'アクティビティはありません',
    loadingText: '読み込み中...'
  },
  notificationCenter: {
    title: '通知',
    emptyText: '通知はありません',
    loadingText: '読み込み中...',
    allLabel: 'すべて',
    unreadLabel: '未読',
    readLabel: '既読',
    markAllReadText: 'すべて既読にする',
    markReadText: '既読にする',
    markUnreadText: '未読にする'
  },
  select: {
    doneText: '完了',
    placeholder: '選択してください',
    emptyText: 'オプションがありません'
  },
  colorPicker: {
    trigger: '色を選択',
    panelTitle: '色',
    clear: 'クリア',
    hue: '色相',
    alpha: '不透明度',
    value: 'カラー値',
    preview: 'プレビュー',
    selectPreset: '{color} を選択'
  },
  inputOtp: {
    groupLabel: 'ワンタイムパスワード',
    slotLabel: '{total} 文字中 {index} 文字目'
  },
  tagsInput: {
    removeTagLabel: '{tag} を削除',
    clearAllLabel: 'すべてのタグをクリア'
  }
})
