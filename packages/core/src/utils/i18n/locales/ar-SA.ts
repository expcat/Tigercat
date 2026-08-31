/**
 * Arabic (Saudi Arabia) (ar-SA).
 */

import type { TigerLocale } from '../../../types/locale'
import { AR_SA_DATEPICKER_LOCALE } from '../datepicker-locales/ar-SA'

export const arSA: TigerLocale = {
  locale: 'ar-SA',
  direction: 'rtl',
  datePicker: AR_SA_DATEPICKER_LOCALE,
  common: {
    okText: 'موافق',
    cancelText: 'إلغاء',
    closeText: 'إغلاق',
    loadingText: 'جار التحميل...',
    emptyText: 'لا توجد بيانات',
    noMoreText: 'لا مزيد من البيانات',
    searchPlaceholder: 'بحث',
    clearText: 'مسح',
    closeMessageAriaLabel: 'إغلاق الرسالة',
    closeNotificationAriaLabel: 'إغلاق الإشعار',
    sidebarAriaLabel: 'الشريط الجانبي'
  },
  empty: {
    noData: 'لا توجد بيانات',
    noDataAvailable: 'لا توجد بيانات متاحة',
    noResults: 'لا توجد نتائج',
    error: 'حدث خطأ ما'
  },
  modal: {
    closeAriaLabel: 'إغلاق',
    okText: 'موافق',
    cancelText: 'إلغاء'
  },
  drawer: {
    closeAriaLabel: 'إغلاق'
  },
  qrcode: {
    ariaLabel: 'رمز QR',
    expiredText: 'انتهت صلاحية رمز QR',
    refreshText: 'تحديث',
    loadingText: 'جار التحميل...'
  },
  marquee: {
    ariaLabel: 'محتوى التمرير'
  },
  image: {
    previewAriaLabel: 'معاينة {alt}',
    previewFallbackAlt: 'صورة',
    groupAriaLabel: 'مجموعة الصور'
  },
  imageCompare: {
    ariaLabel: 'مقارنة الصور'
  },
  descriptions: {
    colon: ':'
  },
  list: {
    avatarAlt: 'صورة رمزية',
    dragHandleAriaLabel: 'إعادة ترتيب'
  },
  scrollArea: {
    ariaLabel: 'منطقة التمرير'
  },
  printLayout: {
    pageBreak: 'فاصل صفحات'
  },
  timeline: {
    pendingText: 'جار التحميل...'
  },
  progress: {
    ariaLabel: 'التقدم'
  },
  splitter: {
    gutterAriaLabel: 'تغيير حجم الأجزاء {index}'
  },
  resizable: {
    handleAriaLabel: 'تغيير الحجم {handle}'
  },
  upload: {
    dragAreaAriaLabel: 'رفع ملف بالنقر أو السحب',
    buttonAriaLabel: 'رفع ملف',
    clickToUploadText: 'انقر للرفع',
    dragAndDropText: 'أو اسحب وأفلت',
    acceptInfoText: 'المقبول: {accept}',
    maxSizeInfoText: 'الحجم الأقصى: {maxSize}',
    selectFileText: 'اختر ملفًا',
    uploadedFilesAriaLabel: 'الملفات المرفوعة',
    successAriaLabel: 'نجاح',
    errorAriaLabel: 'خطأ',
    uploadingAriaLabel: 'جار الرفع',
    removeFileAriaLabel: 'إزالة {fileName}',
    previewFileAriaLabel: 'معاينة {fileName}'
  },
  pagination: {
    totalText: 'الإجمالي {total} عنصرًا',
    itemsPerPageText: '/ صفحة',
    jumpToText: 'انتقل إلى',
    pageText: 'صفحة',
    prevPageAriaLabel: 'الصفحة السابقة',
    nextPageAriaLabel: 'الصفحة التالية',
    pageAriaLabel: 'الصفحة {page}',
    pageIndicatorText: 'الصفحة {current} من {total}'
  },
  table: {
    emptyText: 'لا توجد بيانات',
    loadingText: 'جار التحميل',
    expandText: 'توسيع',
    collapseText: 'طي',
    selectAllText: 'تحديد الكل',
    selectRowAriaLabel: 'تحديد الصف {row}',
    sortByText: 'فرز حسب {column}',
    clearSortText: 'مسح الفرز',
    toolbarAriaLabel: 'شريط أدوات جدول البيانات',
    searchPlaceholder: 'بحث',
    searchButtonText: 'بحث',
    selectedText: 'محدد',
    selectedItemsText: 'عناصر',
    columnSettingsText: 'إعدادات الأعمدة',
    columnSettingsAriaLabel: 'إعدادات الأعمدة',
    lockColumnAriaLabel: 'تثبيت العمود {column}',
    unlockColumnAriaLabel: 'إلغاء تثبيت العمود {column}',
    allText: 'الكل',
    filterPlaceholder: 'تصفية...',
    exportCsvText: 'تصدير CSV',
    exportExcelText: 'تصدير Excel',
    exportCsvAriaLabel: 'تصدير إلى CSV',
    exportExcelAriaLabel: 'تصدير إلى Excel',
    expandRowAriaLabel: 'توسيع الصف',
    collapseRowAriaLabel: 'طي الصف'
  },
  dataExport: {
    triggerText: 'تصدير',
    triggerAriaLabel: 'تصدير البيانات',
    xlsxText: 'تصدير Excel',
    markdownText: 'تصدير Markdown',
    exportingText: 'جارٍ التصدير...'
  },
  timePicker: {
    hour: 'ساعة',
    minute: 'دقيقة',
    second: 'ثانية',
    now: 'الآن',
    ok: 'موافق',
    start: 'البداية',
    end: 'النهاية',
    clear: 'مسح الوقت',
    toggle: 'فتح منتقي الوقت',
    dialog: 'منتقي الوقت',
    selectTime: 'اختر الوقت',
    selectTimeRange: 'اختر نطاق الوقت'
  },
  formWizard: {
    prevText: 'السابق',
    nextText: 'التالي',
    finishText: 'إنهاء'
  },
  tour: {
    prevText: 'السابق',
    nextText: 'التالي',
    finishText: 'إنهاء',
    closeAriaLabel: 'إغلاق الجولة'
  },
  calendar: {
    previousMonth: 'الشهر السابق',
    nextMonth: 'الشهر التالي',
    previousYear: 'السنة السابقة',
    nextYear: 'السنة التالية',
    yearSelectAriaLabel: 'السنة',
    monthSelectAriaLabel: 'الشهر',
    daySelectAriaLabel: 'اليوم'
  },
  fileManager: {
    rootText: 'الجذر'
  },
  imageViewer: {
    dialogAriaLabel: 'عارض الصور',
    previewDialogAriaLabel: 'معاينة الصورة',
    closeAriaLabel: 'إغلاق',
    closePreviewAriaLabel: 'إغلاق المعاينة',
    previousImageAriaLabel: 'الصورة السابقة',
    nextImageAriaLabel: 'الصورة التالية',
    zoomOutAriaLabel: 'تصغير',
    resetAriaLabel: 'إعادة تعيين',
    zoomInAriaLabel: 'تكبير',
    rotateLeftAriaLabel: 'تدوير لليسار',
    rotateRightAriaLabel: 'تدوير لليمين',
    previewImageAriaLabel: 'صورة {index} من {total}'
  },
  imageEditor: {
    selectImageText: 'اختر صورة',
    selectImageAriaLabel: 'اختر صورة للقص والرفع',
    cropModalTitle: 'قص الصورة',
    cropCancelText: 'إلغاء',
    cropConfirmText: 'تأكيد القص',
    cropperDialogAriaLabel: 'أداة قص الصورة',
    imageToCropAriaLabel: 'الصورة المراد قصها',
    moveCropAreaAriaLabel: 'تحريك منطقة القص',
    resizeCropAreaAriaLabel: 'تغيير حجم منطقة القص {handle}',
    resizeHandleNw: 'أعلى اليسار',
    resizeHandleN: 'أعلى',
    resizeHandleNe: 'أعلى اليمين',
    resizeHandleE: 'يمين',
    resizeHandleSe: 'أسفل اليمين',
    resizeHandleS: 'أسفل',
    resizeHandleSw: 'أسفل اليسار',
    resizeHandleW: 'يسار',
    loadingCropImageAriaLabel: 'جارٍ تحميل الصورة للقص',
    loadErrorAriaLabel: 'تعذر تحميل الصورة للقص',
    annotationToolbarAriaLabel: 'أدوات التعليق',
    annotationEditorAriaLabel: 'محرر تعليق الصورة',
    annotationCanvasAriaLabel: 'لوحة التعليق',
    loadingAnnotationImageAriaLabel: 'جارٍ تحميل الصورة للتعليق',
    selectToolText: 'تحديد',
    rectangleToolText: 'مستطيل',
    ellipseToolText: 'قطع ناقص',
    polygonToolText: 'مضلع',
    freehandToolText: 'رسم حر',
    deleteText: 'حذف'
  },
  status: {
    tagCloseAriaLabel: 'إغلاق الوسم',
    badgeLabel: 'إشعار',
    badgeCountLabel: '{count} إشعارات'
  },
  taskBoard: {
    emptyColumnText: 'لا توجد مهام',
    addCardText: 'إضافة مهمة',
    addColumnText: 'إضافة عمود',
    wipLimitText: 'حد العمل الجاري: {limit}',
    dragHintText: 'اسحب للنقل',
    boardAriaLabel: 'لوحة المهام'
  },
  chatWindow: {
    emptyText: 'لا توجد رسائل',
    sendText: 'إرسال',
    placeholder: 'اكتب رسالة',
    sendingText: 'جارٍ الإرسال',
    sentText: 'تم التسليم',
    failedText: 'فشل الإرسال'
  },
  code: {
    copyLabel: 'نسخ',
    copiedLabel: 'تم النسخ',
    copyFailedLabel: 'فشل النسخ'
  },
  commentThread: {
    emptyText: 'لا توجد تعليقات',
    replyPlaceholder: 'اكتب ردًا...',
    replyButtonText: 'رد',
    cancelReplyText: 'إلغاء',
    likeText: 'إعجاب',
    likedText: 'تم الإعجاب',
    replyText: 'رد',
    moreText: 'المزيد',
    loadMoreText: 'تحميل المزيد',
    collapseRepliesText: '▾ طي الردود',
    expandRepliesText: '▸ توسيع {count} من الردود'
  },
  activityFeed: {
    emptyText: 'لا يوجد نشاط',
    loadingText: 'جارٍ التحميل...'
  },
  notificationCenter: {
    title: 'الإشعارات',
    emptyText: 'لا توجد إشعارات',
    loadingText: 'جارٍ التحميل...',
    allLabel: 'الكل',
    unreadLabel: 'غير مقروء',
    readLabel: 'مقروء',
    markAllReadText: 'وضع علامة مقروء على الكل',
    markReadText: 'وضع علامة مقروء',
    markUnreadText: 'وضع علامة غير مقروء'
  },
  select: {
    doneText: 'إنهاء',
    placeholder: 'اختر خياراً',
    emptyText: 'لا توجد خيارات'
  },
  colorPicker: {
    trigger: 'اختيار لون',
    panelTitle: 'اللون',
    clear: 'مسح',
    hue: 'تدرج',
    alpha: 'الشفافية',
    value: 'قيمة اللون',
    preview: 'معاينة',
    selectPreset: 'اختيار {color}'
  },
  tabs: {
    addTabAriaLabel: 'إضافة علامة تبويب',
    closeTabAriaLabel: 'إغلاق {label}'
  },
  rate: {
    ariaLabel: 'التقييم',
    valueText: '{value} نجوم'
  },
  avatarGroup: {
    ariaLabel: 'مجموعة الصور الرمزية',
    overflowAriaLabel: '{count} أكثر'
  },
  carousel: {
    ariaLabel: 'عرض شرائح',
    roleDescription: 'عرض شرائح',
    slideRoleDescription: 'شريحة',
    navigationAriaLabel: 'تنقل العرض',
    previousSlideAriaLabel: 'الشريحة السابقة',
    nextSlideAriaLabel: 'الشريحة التالية',
    pauseAriaLabel: 'إيقاف التشغيل التلقائي',
    playAriaLabel: 'بدء التشغيل التلقائي',
    goToSlideAriaLabel: 'الانتقال إلى الشريحة {index}',
    slideAriaLabel: 'الشريحة {index} من {total}'
  },
  transfer: {
    sourceTitle: 'المصدر',
    targetTitle: 'الهدف',
    searchAriaLabel: 'بحث {title}',
    itemsAriaLabel: 'عناصر {title}',
    moveToTargetAriaLabel: 'نقل المحدد إلى الهدف',
    moveToSourceAriaLabel: 'نقل المحدد إلى المصدر'
  },
  chart: {
    legendAriaLabel: 'مفتاح الرسم البياني',
    pointAriaLabel: 'النقطة {index}: ({x}, {y})'
  },
  markdownEditor: {
    formattingToolbarAriaLabel: 'تنسيق Markdown',
    modeToolbarAriaLabel: 'وضع عرض Markdown',
    editorAriaLabel: 'محرر Markdown',
    previewAriaLabel: 'معاينة Markdown',
    editModeLabel: 'تحرير',
    splitModeLabel: 'تقسيم',
    previewModeLabel: 'معاينة',
    bold: 'عريض',
    italic: 'مائل',
    strikethrough: 'يتوسطه خط',
    heading: 'عنوان',
    blockquote: 'اقتباس',
    unorderedList: 'قائمة نقطية',
    orderedList: 'قائمة مرقمة',
    inlineCode: 'رمز مضمّن',
    codeBlock: 'كتلة رمز',
    link: 'رابط',
    image: 'صورة',
    table: 'جدول',
    horizontalRule: 'خط أفقي'
  },
  richTextEditor: {
    formattingToolbarAriaLabel: 'تنسيق النص',
    editorAriaLabel: 'محرر نص منسق',
    bold: 'عريض',
    italic: 'مائل',
    underline: 'تسطير',
    strikethrough: 'يتوسطه خط',
    heading1: 'عنوان 1',
    heading2: 'عنوان 2',
    heading3: 'عنوان 3',
    bulletList: 'قائمة نقطية',
    orderedList: 'قائمة مرقمة',
    blockquote: 'اقتباس',
    codeBlock: 'رمز',
    link: 'رابط',
    image: 'صورة',
    horizontalRule: 'خط',
    undo: 'تراجع',
    redo: 'إعادة',
    clear: 'مسح التنسيق'
  },
  cronEditor: {
    ariaLabel: 'محرر Cron',
    expressionAriaLabel: 'تعبير Cron',
    presetAriaLabel: 'إعداد مسبق لـ Cron',
    presetPlaceholder: 'إعداد مسبق',
    everyMinutePreset: 'كل دقيقة',
    hourlyPreset: 'كل ساعة',
    dailyPreset: 'يوميًا',
    weeklyPreset: 'أسبوعيًا',
    monthlyPreset: 'شهريًا',
    minuteLabel: 'دقيقة',
    hourLabel: 'ساعة',
    dayOfMonthLabel: 'يوم',
    monthLabel: 'شهر',
    dayOfWeekLabel: 'يوم الأسبوع',
    modeAnyLabel: 'أي',
    modeEveryLabel: 'كل',
    modeSpecificLabel: 'محدد',
    modeRangeLabel: 'نطاق',
    modeCustomLabel: 'مخصص',
    modeAriaLabel: 'وضع {field}',
    stepAriaLabel: 'خطوة {field}',
    valueAriaLabel: 'قيمة {field}',
    rangeStartAriaLabel: 'بداية نطاق {field}',
    rangeEndAriaLabel: 'نهاية نطاق {field}',
    customValueAriaLabel: 'قيمة {field} المخصصة',
    expressionFieldsError: 'يجب أن يحتوي تعبير Cron على 5 حقول',
    fieldRequiredError: '{field} مطلوب',
    invalidStepError: '{field} يحتوي على تعبير خطوة غير صالح',
    stepRangeError: 'يجب أن تكون خطوة {field} بين 1 و {max}',
    fieldRangeError: 'يجب أن يكون {field} بين {min} و {max}',
    rangeOrderError: 'يجب أن تكون بداية نطاق {field} أقل من النهاية أو تساويها',
    invalidFieldError: 'يجب أن يكون {field} * أو رقمًا أو نطاقًا أو خطوة أو قائمة مفصولة بفواصل'
  },
  formValidation: {
    required: 'هذا الحقل مطلوب',
    typeString: 'يجب أن تكون القيمة نصًا',
    typeNumber: 'يجب أن تكون القيمة رقمًا',
    typeBoolean: 'يجب أن تكون القيمة منطقية',
    typeArray: 'يجب أن تكون القيمة مصفوفة',
    typeObject: 'يجب أن تكون القيمة كائنًا',
    email: 'يرجى إدخال بريد إلكتروني صالح',
    phone: 'يرجى إدخال رقم هاتف صالح',
    url: 'يرجى إدخال عنوان URL صالح',
    date: 'يرجى إدخال تاريخ صالح',
    idCard: 'يرجى إدخال رقم هوية صالح',
    minLength: 'الحد الأدنى للطول هو {min} أحرف',
    maxLength: 'الحد الأقصى للطول هو {max} أحرف',
    minValue: 'الحد الأدنى للقيمة هو {min}',
    maxValue: 'الحد الأقصى للقيمة هو {max}',
    minItems: 'يلزم {min} عناصر على الأقل',
    maxItems: 'يُسمح بـ {max} عناصر كحد أقصى',
    patternMismatch: 'القيمة لا تطابق النمط المطلوب',
    validatorFailed: 'فشل التحقق',
    validatorError: 'حدث خطأ أثناء التحقق'
  },
  inputOtp: {
    groupLabel: 'كلمة المرور لمرة واحدة',
    slotLabel: 'الحرف {index} من {total}'
  },
  tagsInput: {
    removeTagLabel: 'إزالة {tag}',
    clearAllLabel: 'مسح كل الوسوم'
  },
  input: {
    clearAriaLabel: 'مسح الإدخال',
    showPasswordAriaLabel: 'إظهار كلمة المرور',
    hidePasswordAriaLabel: 'إخفاء كلمة المرور'
  },
  inputNumber: {
    incrementAriaLabel: 'زيادة',
    decrementAriaLabel: 'إنقاص',
    emptyAriaValueText: 'فارغ'
  },
  slider: {
    ariaLabel: 'شريط التمرير',
    minAriaLabel: 'الحد الأدنى',
    maxAriaLabel: 'الحد الأعلى'
  },
  stepper: {
    ariaLabel: 'عداد الخطوات',
    valueAriaLabel: 'القيمة',
    incrementAriaLabel: 'زيادة',
    decrementAriaLabel: 'إنقاص'
  }
}

export default arSA
