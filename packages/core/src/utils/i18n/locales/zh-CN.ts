/**
 * Simplified Chinese (zh-CN).
 */

import type { TigerLocale } from '../../../types/locale'
import { ZH_CN_DATEPICKER_LOCALE } from '../datepicker-locales/zh-CN'

export const zhCN: TigerLocale = {
  locale: 'zh-CN',
  direction: 'ltr',
  common: {
    okText: '确定',
    cancelText: '取消',
    closeText: '关闭',
    loadingText: '加载中...',
    emptyText: '暂无数据',
    noMoreText: '没有更多了',
    searchPlaceholder: '搜索',
    clearText: '清除',
    closeMessageAriaLabel: '关闭消息',
    closeNotificationAriaLabel: '关闭通知',
    sidebarAriaLabel: '侧栏',
    moreOptionsText: '更多操作',
    confirmTitle: '确定要执行此操作吗？'
  },
  empty: {
    noData: '暂无数据',
    noDataAvailable: '暂无可用数据',
    noResults: '暂无结果',
    error: '出现错误'
  },
  modal: {
    closeAriaLabel: '关闭',
    okText: '确定',
    cancelText: '取消'
  },
  drawer: {
    closeAriaLabel: '关闭'
  },
  qrcode: {
    ariaLabel: '二维码',
    expiredText: '二维码已过期',
    refreshText: '刷新',
    loadingText: '加载中...'
  },
  marquee: {
    ariaLabel: '滚动内容'
  },
  image: {
    previewAriaLabel: '预览 {alt}',
    previewFallbackAlt: '图片',
    groupAriaLabel: '图片组'
  },
  imageCompare: {
    ariaLabel: '图片对比'
  },
  descriptions: {
    colon: '：'
  },
  list: {
    avatarAlt: '头像',
    dragHandleAriaLabel: '拖动排序'
  },
  scrollArea: {
    ariaLabel: '可滚动区域'
  },
  printLayout: {
    pageBreak: '分页符'
  },
  timeline: {
    pendingText: '加载中...'
  },
  progress: {
    ariaLabel: '进度'
  },
  splitter: {
    gutterAriaLabel: '调整分栏 {index}'
  },
  resizable: {
    handleAriaLabel: '调整大小：{handle}'
  },
  upload: {
    dragAreaAriaLabel: '点击或拖拽上传文件',
    buttonAriaLabel: '上传文件',
    clickToUploadText: '点击上传',
    dragAndDropText: '或拖拽到此处',
    acceptInfoText: '支持：{accept}',
    maxSizeInfoText: '最大大小：{maxSize}',
    selectFileText: '选择文件',
    uploadedFilesAriaLabel: '已上传文件',
    successAriaLabel: '成功',
    errorAriaLabel: '错误',
    uploadingAriaLabel: '上传中',
    removeFileAriaLabel: '移除 {fileName}',
    previewFileAriaLabel: '预览 {fileName}'
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
    selectedItemsText: '项',
    columnSettingsText: '列设置',
    columnSettingsAriaLabel: '列设置',
    lockColumnAriaLabel: '锁定{column}列',
    unlockColumnAriaLabel: '取消锁定{column}列',
    allText: '全部',
    filterPlaceholder: '筛选...',
    exportCsvText: '导出 CSV',
    exportExcelText: '导出 Excel',
    exportCsvAriaLabel: '导出为 CSV',
    exportExcelAriaLabel: '导出为 Excel',
    expandRowAriaLabel: '展开行',
    collapseRowAriaLabel: '收起行',
    sortMenuAriaLabel: '排序',
    filterColumnAriaLabel: '筛选 {column}',
    groupHeaderText: '{key} ({count})'
  },
  dataExport: {
    triggerText: '导出',
    triggerAriaLabel: '导出数据',
    xlsxText: '导出 Excel',
    markdownText: '导出 Markdown',
    csvText: '导出 CSV',
    exportingText: '导出中...',
    errorText: '导出失败'
  },
  datePicker: ZH_CN_DATEPICKER_LOCALE,
  timePicker: {
    hour: '时',
    minute: '分',
    second: '秒',
    period: '时段',
    now: '现在',
    ok: '确定',
    start: '开始',
    end: '结束',
    clear: '清除时间',
    toggle: '打开时间选择器',
    dialog: '时间选择器',
    selectTime: '请选择时间',
    selectTimeRange: '请选择时间范围'
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
    closeAriaLabel: '关闭导览'
  },
  calendar: {
    previousMonth: '上个月',
    nextMonth: '下个月',
    previousYear: '上一年',
    nextYear: '下一年'
  },
  fileManager: {
    rootText: '根目录'
  },
  imageViewer: {
    dialogAriaLabel: '图片查看器',
    previewDialogAriaLabel: '图片预览',
    closeAriaLabel: '关闭',
    closePreviewAriaLabel: '关闭预览',
    previousImageAriaLabel: '上一张图片',
    nextImageAriaLabel: '下一张图片',
    zoomOutAriaLabel: '缩小',
    resetAriaLabel: '重置',
    zoomInAriaLabel: '放大',
    rotateLeftAriaLabel: '向左旋转',
    rotateRightAriaLabel: '向右旋转',
    previewImageAriaLabel: '第 {index} 张，共 {total} 张'
  },
  imageEditor: {
    selectImageText: '选择图片',
    selectImageAriaLabel: '选择图片进行裁剪并上传',
    cropModalTitle: '裁剪图片',
    cropCancelText: '取消',
    cropConfirmText: '确认裁剪',
    cropperDialogAriaLabel: '图片裁剪器',
    imageToCropAriaLabel: '待裁剪图片',
    moveCropAreaAriaLabel: '移动裁剪区域',
    resizeCropAreaAriaLabel: '调整裁剪区域 {handle}',
    resizeHandleNw: '左上',
    resizeHandleN: '上',
    resizeHandleNe: '右上',
    resizeHandleE: '右',
    resizeHandleSe: '右下',
    resizeHandleS: '下',
    resizeHandleSw: '左下',
    resizeHandleW: '左',
    loadingCropImageAriaLabel: '正在加载待裁剪图片',
    loadErrorAriaLabel: '无法加载待裁剪图片',
    fileTooLargeText: '文件大小超过 {maxSize}',
    fileTypeRejectedText: '不支持该文件类型',
    annotationToolbarAriaLabel: '标注工具',
    annotationEditorAriaLabel: '图片标注编辑器',
    annotationCanvasAriaLabel: '图片标注画布',
    loadingAnnotationImageAriaLabel: '正在加载待标注图片',
    selectToolText: '选择',
    rectangleToolText: '矩形',
    ellipseToolText: '椭圆',
    polygonToolText: '多边形',
    freehandToolText: '自由绘制',
    deleteText: '删除'
  },
  status: {
    tagCloseAriaLabel: '关闭标签',
    badgeLabel: '通知',
    badgeCountLabel: '{count} 条通知'
  },
  taskBoard: {
    emptyColumnText: '暂无任务',
    addCardText: '添加任务',
    addColumnText: '添加列',
    wipLimitText: 'WIP 限制: {limit}',
    dragHintText: '拖拽以移动',
    boardAriaLabel: '任务看板'
  },
  chatWindow: {
    emptyText: '暂无消息',
    sendText: '发送',
    placeholder: '请输入消息',
    sendingText: '发送中',
    sentText: '已送达',
    failedText: '发送失败'
  },
  code: {
    copyLabel: '复制',
    copiedLabel: '已复制',
    copyFailedLabel: '复制失败'
  },
  commentThread: {
    emptyText: '暂无评论',
    replyPlaceholder: '写下回复...',
    replyButtonText: '回复',
    cancelReplyText: '取消',
    likeText: '点赞',
    likedText: '已赞',
    replyText: '回复',
    moreText: '更多',
    loadMoreText: '加载更多',
    collapseRepliesText: '▾ 收起回复',
    expandRepliesText: '▸ 展开 {count} 条回复'
  },
  activityFeed: {
    emptyText: '暂无动态',
    loadingText: '加载中...'
  },
  notificationCenter: {
    title: '通知中心',
    emptyText: '暂无通知',
    loadingText: '加载中...',
    allLabel: '全部',
    unreadLabel: '未读',
    readLabel: '已读',
    markAllReadText: '全部标记已读',
    markReadText: '标记已读',
    markUnreadText: '标记未读'
  },
  select: {
    doneText: '完成',
    placeholder: '请选择',
    emptyText: '暂无选项',
    searchPlaceholder: '搜索',
    clearAriaLabel: '清除选择',
    createOptionLabel: '创建“{label}”',
    moreCountText: '等 {count} 项',
    loadingText: '加载中...',
    levelLabel: '第 {level} 级',
    backText: '返回',
    expandAriaLabel: '展开',
    collapseAriaLabel: '收起'
  },
  colorPicker: {
    trigger: '选择颜色',
    panelTitle: '颜色',
    clear: '清空',
    hue: '色相',
    saturation: '饱和度',
    brightness: '明度',
    alpha: '透明度',
    value: '颜色值',
    preview: '颜色预览',
    selectPreset: '选择 {color}',
    done: '完成',
    formatHex: 'HEX',
    formatRgb: 'RGB',
    formatHsl: 'HSL',
    swatches: '色板',
    primaryGroup: '主色',
    accentGroup: '强调色'
  },
  tabs: {
    addTabAriaLabel: '新增标签页',
    closeTabAriaLabel: '关闭{label}'
  },
  rate: {
    ariaLabel: '评分',
    valueText: '{value} 星'
  },
  avatarGroup: {
    ariaLabel: '头像组',
    overflowAriaLabel: '还有 {count} 位'
  },
  carousel: {
    ariaLabel: '轮播',
    roleDescription: '轮播',
    slideRoleDescription: '幻灯片',
    navigationAriaLabel: '轮播导航',
    previousSlideAriaLabel: '上一张',
    nextSlideAriaLabel: '下一张',
    pauseAriaLabel: '暂停自动播放',
    playAriaLabel: '开始自动播放',
    goToSlideAriaLabel: '跳转到第 {index} 张',
    slideAriaLabel: '第 {index} 张，共 {total} 张'
  },
  transfer: {
    sourceTitle: '源列表',
    targetTitle: '目标列表',
    searchAriaLabel: '搜索{title}',
    itemsAriaLabel: '{title}项目',
    moveToTargetAriaLabel: '移动选中项到目标列表',
    moveToSourceAriaLabel: '移动选中项到源列表',
    selectAllAriaLabel: '全选{title}'
  },
  chart: {
    legendAriaLabel: '图表图例',
    pointAriaLabel: '第 {index} 个点：({x}, {y})'
  },
  markdownEditor: {
    formattingToolbarAriaLabel: 'Markdown 格式工具栏',
    modeToolbarAriaLabel: 'Markdown 视图模式',
    editorAriaLabel: 'Markdown 编辑器',
    previewAriaLabel: 'Markdown 预览',
    editModeLabel: '编辑',
    splitModeLabel: '分栏',
    previewModeLabel: '预览',
    bold: '加粗',
    italic: '斜体',
    strikethrough: '删除线',
    heading: '标题',
    blockquote: '引用',
    unorderedList: '无序列表',
    orderedList: '有序列表',
    inlineCode: '行内代码',
    codeBlock: '代码块',
    link: '链接',
    image: '图片',
    table: '表格',
    horizontalRule: '分隔线'
  },
  richTextEditor: {
    formattingToolbarAriaLabel: '富文本格式工具栏',
    editorAriaLabel: '富文本编辑器',
    bold: '加粗',
    italic: '斜体',
    underline: '下划线',
    strikethrough: '删除线',
    heading1: '标题1',
    heading2: '标题2',
    heading3: '标题3',
    bulletList: '无序列表',
    orderedList: '有序列表',
    blockquote: '引用',
    codeBlock: '代码',
    link: '链接',
    image: '图片',
    horizontalRule: '分隔线',
    undo: '撤销',
    redo: '重做',
    clear: '清除格式'
  },
  cronEditor: {
    ariaLabel: 'Cron 表达式编辑器',
    expressionAriaLabel: 'Cron 表达式',
    presetAriaLabel: 'Cron 预设',
    presetPlaceholder: '选择预设',
    everyMinutePreset: '每分钟',
    hourlyPreset: '每小时',
    dailyPreset: '每天',
    weeklyPreset: '每周',
    monthlyPreset: '每月',
    minuteLabel: '分钟',
    hourLabel: '小时',
    dayOfMonthLabel: '日期',
    monthLabel: '月份',
    dayOfWeekLabel: '星期',
    modeAnyLabel: '任意',
    modeEveryLabel: '每隔',
    modeSpecificLabel: '指定',
    modeRangeLabel: '范围',
    modeCustomLabel: '自定义',
    modeAriaLabel: '{field}模式',
    stepAriaLabel: '{field}步长',
    valueAriaLabel: '{field}值',
    rangeStartAriaLabel: '{field}范围开始',
    rangeEndAriaLabel: '{field}范围结束',
    customValueAriaLabel: '{field}自定义值',
    expressionFieldsError: 'Cron 表达式必须包含 5 个字段',
    fieldRequiredError: '{field}为必填项',
    invalidStepError: '{field}步长表达式无效',
    stepRangeError: '{field}步长必须在 1 到 {max} 之间',
    fieldRangeError: '{field}必须在 {min} 到 {max} 之间',
    rangeOrderError: '{field}范围开始值必须小于或等于结束值',
    invalidFieldError: '{field}必须是 *、数字、范围、步长或逗号列表'
  },
  formValidation: {
    required: '此字段为必填项',
    typeString: '值必须是字符串',
    typeNumber: '值必须是数字',
    typeBoolean: '值必须是布尔值',
    typeArray: '值必须是数组',
    typeObject: '值必须是对象',
    email: '请输入有效的邮箱地址',
    phone: '请输入有效的电话号码',
    url: '请输入有效的网址',
    date: '请输入有效的日期',
    idCard: '请输入有效的身份证号码',
    minLength: '长度不能少于 {min} 个字符',
    maxLength: '长度不能超过 {max} 个字符',
    minValue: '数值不能小于 {min}',
    maxValue: '数值不能大于 {max}',
    minItems: '至少需要 {min} 项',
    maxItems: '最多允许 {max} 项',
    patternMismatch: '格式不正确',
    validatorFailed: '校验未通过',
    validatorError: '校验时发生错误'
  },
  inputOtp: {
    groupLabel: '一次性验证码',
    slotLabel: '第 {index} 位，共 {total} 位'
  },
  tagsInput: {
    removeTagLabel: '移除 {tag}',
    clearAllLabel: '清空全部标签'
  },
  input: {
    clearAriaLabel: '清除输入',
    showPasswordAriaLabel: '显示密码',
    hidePasswordAriaLabel: '隐藏密码'
  },
  inputNumber: {
    incrementAriaLabel: '增加',
    decrementAriaLabel: '减少',
    emptyAriaValueText: '空'
  },
  slider: {
    ariaLabel: '滑块',
    minAriaLabel: '最小值',
    maxAriaLabel: '最大值'
  },
  stepper: {
    ariaLabel: '步进器',
    valueAriaLabel: '数值',
    incrementAriaLabel: '增加',
    decrementAriaLabel: '减少'
  },
  signature: {
    ariaLabel: '签名板',
    undoText: '撤销'
  },
  numberKeyboard: {
    ariaLabel: '数字键盘',
    deleteText: '删除',
    decimalAriaLabel: '小数点',
    idCardXAriaLabel: '身份证 X'
  },
  tree: {
    ariaLabel: '树',
    selectNode: '选择{label}',
    expand: '展开',
    collapse: '收起'
  }
}
