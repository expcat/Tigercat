/**
 * Japanese (ja-JP).
 */

import type { TigerLocale } from '../../../types/locale'
import { JA_JP_DATEPICKER_LOCALE } from '../datepicker-locales/ja-JP'

export const jaJP: TigerLocale = {
  locale: 'ja-JP',
  direction: 'ltr',
  datePicker: JA_JP_DATEPICKER_LOCALE,
  common: {
    okText: 'OK',
    cancelText: 'キャンセル',
    closeText: '閉じる',
    loadingText: '読み込み中...',
    emptyText: 'データなし',
    noMoreText: 'これ以上ありません',
    searchPlaceholder: '検索',
    clearText: 'クリア',
    closeMessageAriaLabel: 'メッセージを閉じる',
    closeNotificationAriaLabel: '通知を閉じる',
    sidebarAriaLabel: 'サイドバー'
  },
  empty: {
    noData: 'データなし',
    noDataAvailable: '利用できるデータがありません',
    noResults: '該当する結果はありません',
    error: '問題が発生しました'
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
  marquee: {
    ariaLabel: 'スクロール中のコンテンツ'
  },
  image: {
    previewAriaLabel: '{alt} をプレビュー',
    previewFallbackAlt: '画像',
    groupAriaLabel: '画像グループ'
  },
  imageCompare: {
    ariaLabel: '画像比較'
  },
  descriptions: {
    colon: '：'
  },
  list: {
    avatarAlt: 'アバター',
    dragHandleAriaLabel: '並べ替え'
  },
  scrollArea: {
    ariaLabel: 'スクロール領域'
  },
  printLayout: {
    pageBreak: '改ページ'
  },
  timeline: {
    pendingText: '読み込み中...'
  },
  progress: {
    ariaLabel: '進捗'
  },
  splitter: {
    gutterAriaLabel: 'ペイン {index} をリサイズ'
  },
  resizable: {
    handleAriaLabel: '{handle} をリサイズ'
  },
  upload: {
    dragAreaAriaLabel: 'クリックまたはドラッグしてファイルをアップロード',
    buttonAriaLabel: 'ファイルをアップロード',
    clickToUploadText: 'クリックしてアップロード',
    dragAndDropText: 'またはドラッグ＆ドロップ',
    acceptInfoText: '対応形式：{accept}',
    maxSizeInfoText: '最大サイズ：{maxSize}',
    selectFileText: 'ファイルを選択',
    uploadedFilesAriaLabel: 'アップロード済みファイル',
    successAriaLabel: '成功',
    errorAriaLabel: 'エラー',
    uploadingAriaLabel: 'アップロード中',
    removeFileAriaLabel: '{fileName} を削除',
    previewFileAriaLabel: '{fileName} をプレビュー'
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
    unlockColumnAriaLabel: '{column} 列の固定を解除',
    allText: 'すべて',
    filterPlaceholder: '絞り込み...',
    exportCsvText: 'CSV を書き出す',
    exportExcelText: 'Excel を書き出す',
    exportCsvAriaLabel: 'CSV に書き出す',
    exportExcelAriaLabel: 'Excel に書き出す',
    expandRowAriaLabel: '行を展開',
    collapseRowAriaLabel: '行を折りたたむ'
  },
  dataExport: {
    triggerText: '書き出す',
    triggerAriaLabel: 'データを書き出す',
    xlsxText: 'Excel を書き出す',
    markdownText: 'Markdown を書き出す',
    csvText: 'CSV を書き出す',
    exportingText: '書き出し中...',
    errorText: '書き出しに失敗しました'
  },
  timePicker: {
    hour: '時',
    minute: '分',
    second: '秒',
    period: '午前/午後',
    now: '現在',
    ok: 'OK',
    start: '開始',
    end: '終了',
    clear: '時刻をクリア',
    toggle: '時刻ピッカーを開く',
    dialog: '時刻ピッカー',
    selectTime: '時刻を選択',
    selectTimeRange: '時刻の範囲を選択'
  },
  formWizard: {
    prevText: '前へ',
    nextText: '次へ',
    finishText: '完了'
  },
  tour: {
    prevText: '前へ',
    nextText: '次へ',
    finishText: '完了',
    closeAriaLabel: 'ツアーを閉じる'
  },
  calendar: {
    previousMonth: '前月',
    nextMonth: '翌月',
    previousYear: '前年',
    nextYear: '翌年'
  },
  fileManager: {
    rootText: 'ルート'
  },
  imageViewer: {
    dialogAriaLabel: '画像ビューア',
    previewDialogAriaLabel: '画像プレビュー',
    closeAriaLabel: '閉じる',
    closePreviewAriaLabel: 'プレビューを閉じる',
    previousImageAriaLabel: '前の画像',
    nextImageAriaLabel: '次の画像',
    zoomOutAriaLabel: '縮小',
    resetAriaLabel: 'リセット',
    zoomInAriaLabel: '拡大',
    rotateLeftAriaLabel: '左に回転',
    rotateRightAriaLabel: '右に回転',
    previewImageAriaLabel: '画像 {index} / {total}'
  },
  imageEditor: {
    selectImageText: '画像を選択',
    selectImageAriaLabel: '切り抜いてアップロードする画像を選択',
    cropModalTitle: '画像を切り抜く',
    cropCancelText: 'キャンセル',
    cropConfirmText: '切り抜きを確定',
    cropperDialogAriaLabel: '画像クロッパー',
    imageToCropAriaLabel: '切り抜く画像',
    moveCropAreaAriaLabel: '切り抜き範囲を移動',
    resizeCropAreaAriaLabel: '切り抜き範囲 {handle} をリサイズ',
    resizeHandleNw: '左上',
    resizeHandleN: '上',
    resizeHandleNe: '右上',
    resizeHandleE: '右',
    resizeHandleSe: '右下',
    resizeHandleS: '下',
    resizeHandleSw: '左下',
    resizeHandleW: '左',
    loadingCropImageAriaLabel: '切り抜き用の画像を読み込み中',
    loadErrorAriaLabel: '切り抜き用の画像を読み込めませんでした',
    fileTooLargeText: 'ファイルサイズが {maxSize} を超えています',
    fileTypeRejectedText: 'このファイル形式は受け付けられません',
    annotationToolbarAriaLabel: '注釈ツール',
    annotationEditorAriaLabel: '画像注釈エディタ',
    annotationCanvasAriaLabel: '画像注釈キャンバス',
    loadingAnnotationImageAriaLabel: '注釈用の画像を読み込み中',
    selectToolText: '選択',
    rectangleToolText: '矩形',
    ellipseToolText: '楕円',
    polygonToolText: '多角形',
    freehandToolText: 'フリーハンド',
    deleteText: '削除'
  },
  status: {
    tagCloseAriaLabel: 'タグを閉じる',
    badgeLabel: '通知',
    badgeCountLabel: '{count} 件の通知'
  },
  taskBoard: {
    emptyColumnText: 'タスクなし',
    addCardText: 'タスク追加',
    addColumnText: '列を追加',
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
    emptyText: 'オプションがありません',
    searchPlaceholder: '検索',
    clearAriaLabel: '選択をクリア',
    createOptionLabel: '「{label}」を作成',
    moreCountText: 'ほか{count}件',
    loadingText: '読み込み中...',
    levelLabel: 'レベル {level}',
    backText: '戻る',
    expandAriaLabel: '展開',
    collapseAriaLabel: '折りたたむ'
  },
  colorPicker: {
    trigger: '色を選択',
    panelTitle: '色',
    clear: 'クリア',
    hue: '色相',
    saturation: '彩度',
    brightness: '明度',
    alpha: '不透明度',
    value: 'カラー値',
    preview: 'プレビュー',
    selectPreset: '{color} を選択',
    done: '完了',
    formatHex: 'HEX',
    formatRgb: 'RGB',
    formatHsl: 'HSL',
    swatches: 'スウォッチ',
    primaryGroup: 'プライマリ',
    accentGroup: 'アクセント'
  },
  tabs: {
    addTabAriaLabel: 'タブを追加',
    closeTabAriaLabel: '{label} を閉じる'
  },
  rate: {
    ariaLabel: '評価',
    valueText: '{value}つ星'
  },
  avatarGroup: {
    ariaLabel: 'アバターグループ',
    overflowAriaLabel: '他 {count} 人'
  },
  carousel: {
    ariaLabel: 'カルーセル',
    roleDescription: 'カルーセル',
    slideRoleDescription: 'スライド',
    navigationAriaLabel: 'カルーセルの操作',
    previousSlideAriaLabel: '前のスライド',
    nextSlideAriaLabel: '次のスライド',
    pauseAriaLabel: '自動再生を一時停止',
    playAriaLabel: '自動再生を開始',
    goToSlideAriaLabel: 'スライド {index} へ',
    slideAriaLabel: 'スライド {index} / {total}'
  },
  transfer: {
    sourceTitle: 'ソース',
    targetTitle: 'ターゲット',
    searchAriaLabel: '{title} を検索',
    itemsAriaLabel: '{title} の項目',
    moveToTargetAriaLabel: '選択項目をターゲットへ移動',
    moveToSourceAriaLabel: '選択項目をソースへ移動',
    selectAllAriaLabel: '{title}をすべて選択'
  },
  chart: {
    legendAriaLabel: 'グラフの凡例',
    pointAriaLabel: 'ポイント {index}: ({x}, {y})'
  },
  markdownEditor: {
    formattingToolbarAriaLabel: 'Markdown の書式',
    modeToolbarAriaLabel: 'Markdown の表示モード',
    editorAriaLabel: 'Markdown エディタ',
    previewAriaLabel: 'Markdown プレビュー',
    editModeLabel: '編集',
    splitModeLabel: '分割',
    previewModeLabel: 'プレビュー',
    bold: '太字',
    italic: '斜体',
    strikethrough: '取り消し線',
    heading: '見出し',
    blockquote: '引用',
    unorderedList: '箇条書き',
    orderedList: '番号付きリスト',
    inlineCode: 'インラインコード',
    codeBlock: 'コードブロック',
    link: 'リンク',
    image: '画像',
    table: '表',
    horizontalRule: '水平線'
  },
  richTextEditor: {
    formattingToolbarAriaLabel: 'テキストの書式',
    editorAriaLabel: 'リッチテキストエディタ',
    bold: '太字',
    italic: '斜体',
    underline: '下線',
    strikethrough: '取り消し線',
    heading1: '見出し1',
    heading2: '見出し2',
    heading3: '見出し3',
    bulletList: '箇条書き',
    orderedList: '番号付きリスト',
    blockquote: '引用',
    codeBlock: 'コード',
    link: 'リンク',
    image: '画像',
    horizontalRule: '水平線',
    undo: '元に戻す',
    redo: 'やり直す',
    clear: '書式をクリア'
  },
  cronEditor: {
    ariaLabel: 'Cron エディタ',
    expressionAriaLabel: 'Cron 式',
    presetAriaLabel: 'Cron プリセット',
    presetPlaceholder: 'プリセット',
    everyMinutePreset: '毎分',
    hourlyPreset: '毎時',
    dailyPreset: '毎日',
    weeklyPreset: '毎週',
    monthlyPreset: '毎月',
    minuteLabel: '分',
    hourLabel: '時',
    dayOfMonthLabel: '日',
    monthLabel: '月',
    dayOfWeekLabel: '曜日',
    modeAnyLabel: '任意',
    modeEveryLabel: '間隔',
    modeSpecificLabel: '指定',
    modeRangeLabel: '範囲',
    modeCustomLabel: 'カスタム',
    modeAriaLabel: '{field}のモード',
    stepAriaLabel: '{field}の間隔',
    valueAriaLabel: '{field}の値',
    rangeStartAriaLabel: '{field}の開始',
    rangeEndAriaLabel: '{field}の終了',
    customValueAriaLabel: '{field}のカスタム値',
    expressionFieldsError: 'Cron 式は 5 つのフィールドが必要です',
    fieldRequiredError: '{field}は必須です',
    invalidStepError: '{field}の間隔式が無効です',
    stepRangeError: '{field}の間隔は 1 から {max} の間にしてください',
    fieldRangeError: '{field}は {min} から {max} の間にしてください',
    rangeOrderError: '{field}の開始は終了以下にしてください',
    invalidFieldError: '{field}は *、数値、範囲、間隔、またはカンマ区切りにしてください'
  },
  formValidation: {
    required: 'この項目は必須です',
    typeString: '文字列を入力してください',
    typeNumber: '数値を入力してください',
    typeBoolean: '真偽値を入力してください',
    typeArray: '配列を入力してください',
    typeObject: 'オブジェクトを入力してください',
    email: '有効なメールアドレスを入力してください',
    phone: '有効な電話番号を入力してください',
    url: '有効な URL を入力してください',
    date: '有効な日付を入力してください',
    idCard: '有効な身分証明書番号を入力してください',
    minLength: '{min} 文字以上にしてください',
    maxLength: '{max} 文字以下にしてください',
    minValue: '{min} 以上にしてください',
    maxValue: '{max} 以下にしてください',
    minItems: '{min} 件以上必要です',
    maxItems: '{max} 件までです',
    patternMismatch: '形式が正しくありません',
    validatorFailed: '検証に失敗しました',
    validatorError: '検証中にエラーが発生しました'
  },
  inputOtp: {
    groupLabel: 'ワンタイムパスワード',
    slotLabel: '{total} 文字中 {index} 文字目'
  },
  tagsInput: {
    removeTagLabel: '{tag} を削除',
    clearAllLabel: 'すべてのタグをクリア'
  },
  input: {
    clearAriaLabel: '入力をクリア',
    showPasswordAriaLabel: 'パスワードを表示',
    hidePasswordAriaLabel: 'パスワードを隠す'
  },
  inputNumber: {
    incrementAriaLabel: '増やす',
    decrementAriaLabel: '減らす',
    emptyAriaValueText: '空'
  },
  slider: {
    ariaLabel: 'スライダー',
    minAriaLabel: '最小値',
    maxAriaLabel: '最大値'
  },
  stepper: {
    ariaLabel: 'ステッパー',
    valueAriaLabel: '値',
    incrementAriaLabel: '増やす',
    decrementAriaLabel: '減らす'
  },
  signature: {
    ariaLabel: '署名パッド',
    undoText: '元に戻す'
  },
  numberKeyboard: {
    ariaLabel: '数字キーボード',
    deleteText: '削除',
    decimalAriaLabel: '小数点',
    idCardXAriaLabel: 'IDカードのX'
  }
}

export default jaJP
