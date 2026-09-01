/**
 * Traditional Chinese (zh-TW).
 */

import type { TigerLocale } from '../../../types/locale'
import { ZH_TW_DATEPICKER_LOCALE } from '../datepicker-locales/zh-TW'

export const zhTW: TigerLocale = {
  locale: 'zh-TW',
  direction: 'ltr',
  datePicker: ZH_TW_DATEPICKER_LOCALE,
  common: {
    okText: '確定',
    cancelText: '取消',
    closeText: '關閉',
    loadingText: '載入中...',
    emptyText: '暫無資料',
    noMoreText: '沒有更多了',
    searchPlaceholder: '搜尋',
    clearText: '清除',
    closeMessageAriaLabel: '關閉訊息',
    closeNotificationAriaLabel: '關閉通知',
    sidebarAriaLabel: '側欄',
    moreOptionsText: '更多選項',
    confirmTitle: '確定要執行此操作嗎？'
  },
  empty: {
    noData: '暫無資料',
    noDataAvailable: '暫無可用資料',
    noResults: '暫無結果',
    error: '出現錯誤'
  },
  modal: {
    closeAriaLabel: '關閉',
    okText: '確定',
    cancelText: '取消',
    dialogAriaLabel: '對話框'
  },
  drawer: {
    closeAriaLabel: '關閉',
    dialogAriaLabel: '抽屜'
  },
  alert: {
    closeAriaLabel: '關閉提示'
  },
  qrcode: {
    ariaLabel: 'QR 碼',
    expiredText: 'QR 碼已過期',
    refreshText: '重新整理',
    loadingText: '載入中...'
  },
  marquee: {
    ariaLabel: '滾動內容'
  },
  image: {
    previewAriaLabel: '預覽 {alt}',
    previewFallbackAlt: '圖片',
    groupAriaLabel: '圖片組'
  },
  imageCompare: {
    ariaLabel: '圖片對比'
  },
  descriptions: {
    colon: '：'
  },
  list: {
    avatarAlt: '頭像',
    dragHandleAriaLabel: '拖曳排序'
  },
  scrollArea: {
    ariaLabel: '可捲動區域'
  },
  printLayout: {
    pageBreak: '分頁符號'
  },
  timeline: {
    pendingText: '載入中...'
  },
  progress: {
    ariaLabel: '進度'
  },
  splitter: {
    gutterAriaLabel: '調整分欄 {index}'
  },
  resizable: {
    handleAriaLabel: '調整大小：{handle}'
  },
  upload: {
    dragAreaAriaLabel: '點擊或拖曳上傳檔案',
    buttonAriaLabel: '上傳檔案',
    clickToUploadText: '點擊上傳',
    dragAndDropText: '或拖曳到此處',
    acceptInfoText: '支援：{accept}',
    maxSizeInfoText: '最大大小：{maxSize}',
    selectFileText: '選擇檔案',
    uploadedFilesAriaLabel: '已上傳檔案',
    successAriaLabel: '成功',
    errorAriaLabel: '錯誤',
    uploadingAriaLabel: '上傳中',
    removeFileAriaLabel: '移除 {fileName}',
    previewFileAriaLabel: '預覽 {fileName}'
  },
  pagination: {
    totalText: '共 {total} 筆',
    itemsPerPageText: '筆/頁',
    jumpToText: '跳至',
    pageText: '頁',
    prevPageAriaLabel: '上一頁',
    nextPageAriaLabel: '下一頁',
    pageAriaLabel: '第 {page} 頁',
    pageIndicatorText: '第 {current} 頁，共 {total} 頁',
    paginationAriaLabel: '分頁',
    pageSizeAriaLabel: '每頁筆數'
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
    unlockColumnAriaLabel: '取消鎖定{column}欄',
    allText: '全部',
    filterPlaceholder: '篩選...',
    exportCsvText: '匯出 CSV',
    exportExcelText: '匯出 Excel',
    exportCsvAriaLabel: '匯出為 CSV',
    exportExcelAriaLabel: '匯出為 Excel',
    expandRowAriaLabel: '展開列',
    collapseRowAriaLabel: '收合列',
    sortMenuAriaLabel: '排序',
    filterColumnAriaLabel: '篩選 {column}',
    groupHeaderText: '{key} ({count})'
  },
  dataExport: {
    triggerText: '匯出',
    triggerAriaLabel: '匯出資料',
    xlsxText: '匯出 Excel',
    markdownText: '匯出 Markdown',
    csvText: '匯出 CSV',
    exportingText: '匯出中...',
    errorText: '匯出失敗'
  },
  timePicker: {
    hour: '時',
    minute: '分',
    second: '秒',
    period: '時段',
    now: '現在',
    ok: '確定',
    start: '開始',
    end: '結束',
    clear: '清除時間',
    toggle: '開啟時間選擇器',
    dialog: '時間選擇器',
    selectTime: '請選擇時間',
    selectTimeRange: '請選擇時間範圍'
  },
  formWizard: {
    prevText: '上一步',
    nextText: '下一步',
    finishText: '完成'
  },
  tour: {
    prevText: '上一步',
    nextText: '下一步',
    finishText: '完成',
    closeAriaLabel: '關閉導覽',
    dialogAriaLabel: '導覽'
  },
  calendar: {
    previousMonth: '上個月',
    nextMonth: '下個月',
    previousYear: '上一年',
    nextYear: '下一年'
  },
  fileManager: {
    rootText: '根目錄',
    pathAriaLabel: '檔案路徑',
    listboxAriaLabel: '檔案列表',
    searchAriaLabel: '搜尋檔案',
    emptyText: '空資料夾'
  },
  imageViewer: {
    dialogAriaLabel: '圖片檢視器',
    previewDialogAriaLabel: '圖片預覽',
    closeAriaLabel: '關閉',
    closePreviewAriaLabel: '關閉預覽',
    previousImageAriaLabel: '上一張圖片',
    nextImageAriaLabel: '下一張圖片',
    zoomOutAriaLabel: '縮小',
    resetAriaLabel: '重設',
    zoomInAriaLabel: '放大',
    rotateLeftAriaLabel: '向左旋轉',
    rotateRightAriaLabel: '向右旋轉',
    previewImageAriaLabel: '第 {index} 張，共 {total} 張'
  },
  imageEditor: {
    selectImageText: '選擇圖片',
    selectImageAriaLabel: '選擇圖片進行裁剪並上傳',
    cropModalTitle: '裁剪圖片',
    cropCancelText: '取消',
    cropConfirmText: '確認裁剪',
    cropperDialogAriaLabel: '圖片裁剪器',
    imageToCropAriaLabel: '待裁剪圖片',
    moveCropAreaAriaLabel: '移動裁剪區域',
    resizeCropAreaAriaLabel: '調整裁剪區域 {handle}',
    resizeHandleNw: '左上',
    resizeHandleN: '上',
    resizeHandleNe: '右上',
    resizeHandleE: '右',
    resizeHandleSe: '右下',
    resizeHandleS: '下',
    resizeHandleSw: '左下',
    resizeHandleW: '左',
    loadingCropImageAriaLabel: '正在載入待裁剪圖片',
    loadErrorAriaLabel: '無法載入待裁剪圖片',
    fileTooLargeText: '檔案大小超過 {maxSize}',
    fileTypeRejectedText: '不支援此檔案類型',
    annotationToolbarAriaLabel: '標註工具',
    annotationEditorAriaLabel: '圖片標註編輯器',
    annotationCanvasAriaLabel: '圖片標註畫布',
    loadingAnnotationImageAriaLabel: '正在載入待標註圖片',
    loadAnnotationErrorAriaLabel: '無法載入待標註圖片',
    defaultAnnotationAlt: '待標註圖片',
    annotationShapeAriaLabel: '{type}標註',
    annotationLabeledShapeAriaLabel: '{label}，{type}標註',
    selectToolText: '選擇',
    rectangleToolText: '矩形',
    ellipseToolText: '橢圓',
    polygonToolText: '多邊形',
    freehandToolText: '自由繪製',
    deleteText: '刪除'
  },
  status: {
    tagCloseAriaLabel: '關閉標籤',
    badgeLabel: '通知',
    badgeCountLabel: '{count} 則通知'
  },
  taskBoard: {
    emptyColumnText: '暫無任務',
    addCardText: '新增任務',
    addColumnText: '新增欄',
    newCardTitle: '新任務',
    newColumnTitle: '新欄',
    unassignedSwimlaneText: '未分組',
    wipLimitText: 'WIP 限制: {limit}',
    dragHintText: '拖曳以移動',
    boardAriaLabel: '任務看板'
  },
  chatWindow: {
    emptyText: '暫無訊息',
    sendText: '傳送',
    placeholder: '請輸入訊息',
    sendingText: '傳送中',
    sentText: '已送達',
    failedText: '傳送失敗',
    messageListAriaLabel: '訊息列表'
  },
  code: {
    copyLabel: '複製',
    copiedLabel: '已複製',
    copyFailedLabel: '複製失敗'
  },
  commentThread: {
    emptyText: '暫無評論',
    replyPlaceholder: '寫下回覆...',
    replyButtonText: '回覆',
    cancelReplyText: '取消',
    likeText: '點讚',
    likedText: '已讚',
    replyText: '回覆',
    moreText: '更多',
    loadMoreText: '載入更多',
    collapseRepliesText: '▾ 收合回覆',
    expandRepliesText: '▸ 展開 {count} 則回覆',
    listAriaLabel: '評論列表',
    replySubmitText: '傳送回覆',
    remainingRepliesText: '顯示剩餘 {count} 則',
    maxDepthReachedText: '已到最大回覆層'
  },
  activityFeed: {
    emptyText: '暫無動態',
    loadingText: '載入中...',
    listAriaLabel: '動態',
    otherGroupTitle: '其他'
  },
  notificationCenter: {
    title: '通知中心',
    emptyText: '暫無通知',
    loadingText: '載入中...',
    allLabel: '全部',
    unreadLabel: '未讀',
    readLabel: '已讀',
    markAllReadText: '全部標記已讀',
    markReadText: '標記已讀',
    markUnreadText: '標記未讀',
    defaultGroupTitle: '預設',
    unreadCountText: '{count} 則未讀'
  },
  select: {
    doneText: '完成',
    placeholder: '請選擇',
    emptyText: '暫無選項',
    searchPlaceholder: '搜尋',
    clearAriaLabel: '清除選取',
    createOptionLabel: '建立「{label}」',
    moreCountText: '等 {count} 項',
    loadingText: '載入中...',
    levelLabel: '第 {level} 級',
    backText: '返回',
    expandAriaLabel: '展開',
    collapseAriaLabel: '收合'
  },
  colorPicker: {
    trigger: '選擇顏色',
    panelTitle: '顏色',
    clear: '清除',
    hue: '色相',
    saturation: '飽和度',
    brightness: '明度',
    alpha: '透明度',
    value: '顏色值',
    preview: '顏色預覽',
    selectPreset: '選擇 {color}',
    done: '完成',
    formatHex: 'HEX',
    formatRgb: 'RGB',
    formatHsl: 'HSL',
    swatches: '色票',
    primaryGroup: '主色',
    accentGroup: '強調色'
  },
  tabs: {
    addTabAriaLabel: '新增分頁',
    closeTabAriaLabel: '關閉{label}',
    tablistAriaLabel: '標籤頁'
  },
  rate: {
    ariaLabel: '評分',
    valueText: '{value} 顆星'
  },
  avatarGroup: {
    ariaLabel: '頭像組',
    overflowAriaLabel: '還有 {count} 位'
  },
  carousel: {
    ariaLabel: '輪播',
    roleDescription: '輪播',
    slideRoleDescription: '投影片',
    navigationAriaLabel: '輪播導覽',
    previousSlideAriaLabel: '上一張',
    nextSlideAriaLabel: '下一張',
    pauseAriaLabel: '暫停自動播放',
    playAriaLabel: '開始自動播放',
    goToSlideAriaLabel: '跳到第 {index} 張',
    slideAriaLabel: '第 {index} 張，共 {total} 張'
  },
  transfer: {
    sourceTitle: '來源清單',
    targetTitle: '目標清單',
    searchAriaLabel: '搜尋{title}',
    itemsAriaLabel: '{title}項目',
    moveToTargetAriaLabel: '移動選取項到目標清單',
    moveToSourceAriaLabel: '移動選取項到來源清單',
    selectAllAriaLabel: '全選{title}'
  },
  chart: {
    legendAriaLabel: '圖表圖例',
    pointAriaLabel: '第 {index} 個點：({x}, {y})',
    seriesName: '系列 {index}',
    sliceName: '切片 {index}',
    sliceAriaLabel: '{label}：{value}（{percent}%）',
    stageName: '階段 {index}',
    heatmapTooltip: '{x} × {y}：{value}',
    treemapTooltip: '{label}：{value}（{percent}%）',
    sunburstTooltip: '{label}：{value}（{percent}%）',
    orgChartAriaLabel: '組織架構圖',
    ganttAriaLabel: '甘特圖',
    ganttTaskAriaLabel: '{label}，{start} 至 {end}{progress}'
  },
  codeEditor: {
    editorAriaLabel: '程式碼編輯器'
  },

  markdownEditor: {
    formattingToolbarAriaLabel: 'Markdown 格式工具列',
    modeToolbarAriaLabel: 'Markdown 檢視模式',
    editorAriaLabel: 'Markdown 編輯器',
    previewAriaLabel: 'Markdown 預覽',
    editModeLabel: '編輯',
    splitModeLabel: '分欄',
    previewModeLabel: '預覽',
    bold: '粗體',
    italic: '斜體',
    strikethrough: '刪除線',
    heading: '標題',
    blockquote: '引用',
    unorderedList: '無序列表',
    orderedList: '有序列表',
    inlineCode: '行內程式碼',
    codeBlock: '程式碼區塊',
    link: '連結',
    image: '圖片',
    table: '表格',
    horizontalRule: '分隔線',
    placeholderStrong: '粗體文字',
    placeholderEmphasis: '斜體文字',
    placeholderDeleted: '刪除文字',
    placeholderCode: '程式碼',
    placeholderHeading: '標題',
    placeholderQuote: '引用',
    placeholderListItem: '清單項目',
    placeholderLinkText: '連結文字',
    placeholderImageAlt: '圖片描述',
    placeholderTable: '| 欄 | 值 |\n| --- | --- |\n| 名稱 | Tigercat |'
  },
  richTextEditor: {
    formattingToolbarAriaLabel: '富文本格式工具列',
    editorAriaLabel: '富文本編輯器',
    bold: '粗體',
    italic: '斜體',
    underline: '底線',
    strikethrough: '刪除線',
    heading1: '標題1',
    heading2: '標題2',
    heading3: '標題3',
    bulletList: '無序列表',
    orderedList: '有序列表',
    blockquote: '引用',
    codeBlock: '程式碼',
    link: '連結',
    image: '圖片',
    horizontalRule: '分隔線',
    undo: '復原',
    redo: '重做',
    clear: '清除格式',
    linkPrompt: '輸入連結網址',
    imagePrompt: '輸入圖片網址'
  },
  cronEditor: {
    ariaLabel: 'Cron 運算式編輯器',
    expressionAriaLabel: 'Cron 運算式',
    presetAriaLabel: 'Cron 預設',
    presetPlaceholder: '選擇預設',
    everyMinutePreset: '每分鐘',
    hourlyPreset: '每小時',
    dailyPreset: '每天',
    weeklyPreset: '每週',
    monthlyPreset: '每月',
    minuteLabel: '分鐘',
    hourLabel: '小時',
    dayOfMonthLabel: '日期',
    monthLabel: '月份',
    dayOfWeekLabel: '星期',
    modeAnyLabel: '任意',
    modeEveryLabel: '每隔',
    modeSpecificLabel: '指定',
    modeRangeLabel: '範圍',
    modeCustomLabel: '自訂',
    modeAriaLabel: '{field}模式',
    stepAriaLabel: '{field}步長',
    valueAriaLabel: '{field}值',
    rangeStartAriaLabel: '{field}範圍開始',
    rangeEndAriaLabel: '{field}範圍結束',
    customValueAriaLabel: '{field}自訂值',
    expressionFieldsError: 'Cron 運算式必須包含 5 個欄位',
    fieldRequiredError: '{field}為必填項',
    invalidStepError: '{field}步長運算式無效',
    stepRangeError: '{field}步長必須在 1 到 {max} 之間',
    fieldRangeError: '{field}必須在 {min} 到 {max} 之間',
    rangeOrderError: '{field}範圍開始值必須小於或等於結束值',
    invalidFieldError: '{field}必須是 *、數字、範圍、步長或逗號清單'
  },
  formValidation: {
    required: '此欄位為必填項',
    typeString: '值必須是字串',
    typeNumber: '值必須是數字',
    typeBoolean: '值必須是布林值',
    typeArray: '值必須是陣列',
    typeObject: '值必須是物件',
    email: '請輸入有效的電子郵件地址',
    phone: '請輸入有效的電話號碼',
    url: '請輸入有效的網址',
    date: '請輸入有效的日期',
    idCard: '請輸入有效的身分證號碼',
    minLength: '長度不能少於 {min} 個字元',
    maxLength: '長度不能超過 {max} 個字元',
    minValue: '數值不能小於 {min}',
    maxValue: '數值不能大於 {max}',
    minItems: '至少需要 {min} 項',
    maxItems: '最多允許 {max} 項',
    patternMismatch: '格式不正確',
    validatorFailed: '校驗未通過',
    validatorError: '校驗時發生錯誤'
  },
  inputOtp: {
    groupLabel: '一次性驗證碼',
    slotLabel: '第 {index} 位，共 {total} 位'
  },
  tagsInput: {
    removeTagLabel: '移除 {tag}',
    clearAllLabel: '清空全部標籤'
  },
  input: {
    clearAriaLabel: '清除輸入',
    showPasswordAriaLabel: '顯示密碼',
    hidePasswordAriaLabel: '隱藏密碼'
  },
  inputNumber: {
    incrementAriaLabel: '增加',
    decrementAriaLabel: '減少',
    emptyAriaValueText: '空白'
  },
  slider: {
    ariaLabel: '滑桿',
    minAriaLabel: '下限',
    maxAriaLabel: '上限'
  },
  stepper: {
    ariaLabel: '步進器',
    valueAriaLabel: '數值',
    incrementAriaLabel: '遞增',
    decrementAriaLabel: '遞減'
  },
  signature: {
    ariaLabel: '簽名板',
    undoText: '復原'
  },
  numberKeyboard: {
    ariaLabel: '數字鍵盤',
    deleteText: '刪除',
    decimalAriaLabel: '小數點',
    idCardXAriaLabel: '身份證 X'
  },
  breadcrumb: {
    ariaLabel: '麵包屑',
    expandAriaLabel: '顯示摺疊的麵包屑項目'
  },
  pageHeader: {
    backAriaLabel: '返回'
  },
  backTop: {
    ariaLabel: '回到頂部'
  },
  anchor: {
    ariaLabel: '本頁導覽'
  },
  floatButton: {
    ariaLabel: '新增'
  },
  spotlight: {
    title: '命令面板',
    placeholder: '搜尋'
  },
  scrollSpy: {
    ariaLabel: '章節導覽'
  },
  steps: {
    ariaLabel: '步驟',
    waitStatus: '等待',
    processStatus: '進行中',
    finishStatus: '已完成',
    errorStatus: '錯誤'
  },
  tree: {
    ariaLabel: '樹',
    selectNode: '選取{label}',
    expand: '展開',
    collapse: '收合'
  }
}

export default zhTW
