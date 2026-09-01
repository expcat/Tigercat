/**
 * Thai (th-TH).
 */

import type { TigerLocale } from '../../../types/locale'
import { TH_TH_DATEPICKER_LOCALE } from '../datepicker-locales/th-TH'

export const thTH: TigerLocale = {
  locale: 'th-TH',
  direction: 'ltr',
  datePicker: TH_TH_DATEPICKER_LOCALE,
  common: {
    okText: 'ตกลง',
    cancelText: 'ยกเลิก',
    closeText: 'ปิด',
    loadingText: 'กำลังโหลด...',
    emptyText: 'ไม่มีข้อมูล',
    noMoreText: 'ไม่มีข้อมูลเพิ่มเติม',
    searchPlaceholder: 'ค้นหา',
    clearText: 'ล้าง',
    closeMessageAriaLabel: 'ปิดข้อความ',
    closeNotificationAriaLabel: 'ปิดการแจ้งเตือน',
    sidebarAriaLabel: 'แถบด้านข้าง',
    moreOptionsText: 'ตัวเลือกเพิ่มเติม',
    confirmTitle: 'คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?'
  },
  empty: {
    noData: 'ไม่มีข้อมูล',
    noDataAvailable: 'ไม่มีข้อมูลที่ใช้ได้',
    noResults: 'ไม่พบผลลัพธ์',
    error: 'เกิดข้อผิดพลาด'
  },
  modal: {
    closeAriaLabel: 'ปิด',
    okText: 'ตกลง',
    cancelText: 'ยกเลิก',
    dialogAriaLabel: 'กล่องโต้ตอบ'
  },
  drawer: {
    closeAriaLabel: 'ปิด',
    dialogAriaLabel: 'ลิ้นชัก'
  },
  alert: {
    closeAriaLabel: 'ปิดการแจ้งเตือน'
  },
  qrcode: {
    ariaLabel: 'คิวอาร์โค้ด',
    expiredText: 'คิวอาร์โค้ดหมดอายุแล้ว',
    refreshText: 'รีเฟรช',
    loadingText: 'กำลังโหลด...'
  },
  marquee: {
    ariaLabel: 'เนื้อหาเลื่อน'
  },
  image: {
    previewAriaLabel: 'ดูตัวอย่าง {alt}',
    previewFallbackAlt: 'รูปภาพ',
    groupAriaLabel: 'กลุ่มรูปภาพ'
  },
  imageCompare: {
    ariaLabel: 'เปรียบเทียบรูปภาพ'
  },
  descriptions: {
    colon: ':'
  },
  list: {
    avatarAlt: 'อวาตาร์',
    dragHandleAriaLabel: 'จัดลำดับ'
  },
  scrollArea: {
    ariaLabel: 'พื้นที่เลื่อน'
  },
  printLayout: {
    pageBreak: 'ตัวแบ่งหน้า'
  },
  timeline: {
    pendingText: 'กำลังโหลด...'
  },
  progress: {
    ariaLabel: 'ความคืบหน้า'
  },
  splitter: {
    gutterAriaLabel: 'ปรับขนาดแผง {index}'
  },
  resizable: {
    handleAriaLabel: 'ปรับขนาด {handle}'
  },
  upload: {
    dragAreaAriaLabel: 'คลิกหรือลากเพื่ออัปโหลดไฟล์',
    buttonAriaLabel: 'อัปโหลดไฟล์',
    clickToUploadText: 'คลิกเพื่ออัปโหลด',
    dragAndDropText: 'หรือลากแล้ววาง',
    acceptInfoText: 'รองรับ: {accept}',
    maxSizeInfoText: 'ขนาดสูงสุด: {maxSize}',
    selectFileText: 'เลือกไฟล์',
    uploadedFilesAriaLabel: 'ไฟล์ที่อัปโหลด',
    successAriaLabel: 'สำเร็จ',
    errorAriaLabel: 'ข้อผิดพลาด',
    uploadingAriaLabel: 'กำลังอัปโหลด',
    removeFileAriaLabel: 'ลบ {fileName}',
    previewFileAriaLabel: 'ดูตัวอย่าง {fileName}'
  },
  pagination: {
    totalText: 'ทั้งหมด {total} รายการ',
    itemsPerPageText: '/หน้า',
    jumpToText: 'ไปที่',
    pageText: 'หน้า',
    prevPageAriaLabel: 'หน้าก่อนหน้า',
    nextPageAriaLabel: 'หน้าถัดไป',
    pageAriaLabel: 'หน้า {page}',
    pageIndicatorText: 'หน้า {current} จาก {total}',
    paginationAriaLabel: 'การแบ่งหน้า',
    pageSizeAriaLabel: 'รายการต่อหน้า'
  },
  table: {
    emptyText: 'ไม่มีข้อมูล',
    loadingText: 'กำลังโหลด',
    expandText: 'ขยาย',
    collapseText: 'ยุบ',
    selectAllText: 'เลือกทั้งหมด',
    selectRowAriaLabel: 'เลือกแถว {row}',
    sortByText: 'เรียงตาม {column}',
    clearSortText: 'ล้างการเรียง',
    toolbarAriaLabel: 'แถบเครื่องมือตารางข้อมูล',
    searchPlaceholder: 'ค้นหา',
    searchButtonText: 'ค้นหา',
    selectedText: 'เลือกแล้ว',
    selectedItemsText: 'รายการ',
    columnSettingsText: 'ตั้งค่าคอลัมน์',
    columnSettingsAriaLabel: 'ตั้งค่าคอลัมน์',
    lockColumnAriaLabel: 'ล็อกคอลัมน์ {column}',
    unlockColumnAriaLabel: 'ปลดล็อกคอลัมน์ {column}',
    allText: 'ทั้งหมด',
    filterPlaceholder: 'กรอง...',
    exportCsvText: 'ส่งออก CSV',
    exportExcelText: 'ส่งออก Excel',
    exportCsvAriaLabel: 'ส่งออกเป็น CSV',
    exportExcelAriaLabel: 'ส่งออกเป็น Excel',
    expandRowAriaLabel: 'ขยายแถว',
    collapseRowAriaLabel: 'ยุบแถว'
  },
  dataExport: {
    triggerText: 'ส่งออก',
    triggerAriaLabel: 'ส่งออกข้อมูล',
    xlsxText: 'ส่งออก Excel',
    markdownText: 'ส่งออก Markdown',
    csvText: 'ส่งออก CSV',
    exportingText: 'กำลังส่งออก...',
    errorText: 'ส่งออกไม่สำเร็จ'
  },
  timePicker: {
    hour: 'ชั่วโมง',
    minute: 'นาที',
    second: 'วินาที',
    period: 'ช่วงเวลา',
    now: 'ตอนนี้',
    ok: 'ตกลง',
    start: 'เริ่ม',
    end: 'สิ้นสุด',
    clear: 'ล้างเวลา',
    toggle: 'เปิดตัวเลือกเวลา',
    dialog: 'ตัวเลือกเวลา',
    selectTime: 'เลือกเวลา',
    selectTimeRange: 'เลือกช่วงเวลา'
  },
  formWizard: {
    prevText: 'ก่อนหน้า',
    nextText: 'ถัดไป',
    finishText: 'เสร็จสิ้น'
  },
  tour: {
    prevText: 'ก่อนหน้า',
    nextText: 'ถัดไป',
    finishText: 'เสร็จสิ้น',
    closeAriaLabel: 'ปิดทัวร์'
  },
  calendar: {
    previousMonth: 'เดือนก่อนหน้า',
    nextMonth: 'เดือนถัดไป',
    previousYear: 'ปีก่อนหน้า',
    nextYear: 'ปีถัดไป'
  },
  fileManager: {
    rootText: 'ราก'
  },
  imageViewer: {
    dialogAriaLabel: 'ตัวดูรูปภาพ',
    previewDialogAriaLabel: 'ดูตัวอย่างรูปภาพ',
    closeAriaLabel: 'ปิด',
    closePreviewAriaLabel: 'ปิดตัวอย่าง',
    previousImageAriaLabel: 'รูปก่อนหน้า',
    nextImageAriaLabel: 'รูปถัดไป',
    zoomOutAriaLabel: 'ย่อ',
    resetAriaLabel: 'รีเซ็ต',
    zoomInAriaLabel: 'ขยาย',
    rotateLeftAriaLabel: 'หมุนซ้าย',
    rotateRightAriaLabel: 'หมุนขวา',
    previewImageAriaLabel: 'ภาพที่ {index} จาก {total}'
  },
  imageEditor: {
    selectImageText: 'เลือกรูปภาพ',
    selectImageAriaLabel: 'เลือกรูปภาพเพื่อครอบตัดและอัปโหลด',
    cropModalTitle: 'ครอบตัดรูปภาพ',
    cropCancelText: 'ยกเลิก',
    cropConfirmText: 'ยืนยันการครอบตัด',
    cropperDialogAriaLabel: 'เครื่องมือครอบตัดรูปภาพ',
    imageToCropAriaLabel: 'รูปภาพที่จะครอบตัด',
    moveCropAreaAriaLabel: 'ย้ายพื้นที่ครอบตัด',
    resizeCropAreaAriaLabel: 'ปรับขนาดพื้นที่ครอบตัด {handle}',
    resizeHandleNw: 'บนซ้าย',
    resizeHandleN: 'บน',
    resizeHandleNe: 'บนขวา',
    resizeHandleE: 'ขวา',
    resizeHandleSe: 'ล่างขวา',
    resizeHandleS: 'ล่าง',
    resizeHandleSw: 'ล่างซ้าย',
    resizeHandleW: 'ซ้าย',
    loadingCropImageAriaLabel: 'กำลังโหลดรูปภาพสำหรับครอบตัด',
    loadErrorAriaLabel: 'โหลดรูปภาพสำหรับครอบตัดไม่สำเร็จ',
    fileTooLargeText: 'ไฟล์มีขนาดเกิน {maxSize}',
    fileTypeRejectedText: 'ไม่รองรับไฟล์ประเภทนี้',
    annotationToolbarAriaLabel: 'เครื่องมือคำอธิบาย',
    annotationEditorAriaLabel: 'ตัวแก้ไขคำอธิบายรูปภาพ',
    annotationCanvasAriaLabel: 'ผืนผ้าใบคำอธิบาย',
    loadingAnnotationImageAriaLabel: 'กำลังโหลดรูปภาพสำหรับคำอธิบาย',
    selectToolText: 'เลือก',
    rectangleToolText: 'สี่เหลี่ยม',
    ellipseToolText: 'วงรี',
    polygonToolText: 'หลายเหลี่ยม',
    freehandToolText: 'วาดอิสระ',
    deleteText: 'ลบ'
  },
  status: {
    tagCloseAriaLabel: 'ปิดแท็ก',
    badgeLabel: 'การแจ้งเตือน',
    badgeCountLabel: '{count} การแจ้งเตือน'
  },
  taskBoard: {
    emptyColumnText: 'ไม่มีงาน',
    addCardText: 'เพิ่มงาน',
    addColumnText: 'เพิ่มคอลัมน์',
    wipLimitText: 'จำกัด WIP: {limit}',
    dragHintText: 'ลากเพื่อย้าย',
    boardAriaLabel: 'บอร์ดงาน'
  },
  chatWindow: {
    emptyText: 'ไม่มีข้อความ',
    sendText: 'ส่ง',
    placeholder: 'พิมพ์ข้อความ',
    sendingText: 'กำลังส่ง',
    sentText: 'ส่งแล้ว',
    failedText: 'ส่งไม่สำเร็จ'
  },
  code: {
    copyLabel: 'คัดลอก',
    copiedLabel: 'คัดลอกแล้ว',
    copyFailedLabel: 'คัดลอกไม่สำเร็จ'
  },
  commentThread: {
    emptyText: 'ไม่มีความคิดเห็น',
    replyPlaceholder: 'เขียนการตอบกลับ...',
    replyButtonText: 'ตอบกลับ',
    cancelReplyText: 'ยกเลิก',
    likeText: 'ถูกใจ',
    likedText: 'ถูกใจแล้ว',
    replyText: 'ตอบกลับ',
    moreText: 'เพิ่มเติม',
    loadMoreText: 'โหลดเพิ่ม',
    collapseRepliesText: '▾ ย่อการตอบกลับ',
    expandRepliesText: '▸ ขยายการตอบกลับ {count} รายการ'
  },
  activityFeed: {
    emptyText: 'ไม่มีกิจกรรม',
    loadingText: 'กำลังโหลด...'
  },
  notificationCenter: {
    title: 'การแจ้งเตือน',
    emptyText: 'ไม่มีการแจ้งเตือน',
    loadingText: 'กำลังโหลด...',
    allLabel: 'ทั้งหมด',
    unreadLabel: 'ยังไม่อ่าน',
    readLabel: 'อ่านแล้ว',
    markAllReadText: 'ทำเครื่องหมายว่าอ่านแล้วทั้งหมด',
    markReadText: 'ทำเครื่องหมายว่าอ่านแล้ว',
    markUnreadText: 'ทำเครื่องหมายว่ายังไม่อ่าน'
  },
  select: {
    doneText: 'เสร็จสิ้น',
    placeholder: 'เลือกตัวเลือก',
    emptyText: 'ไม่พบตัวเลือก',
    searchPlaceholder: 'ค้นหา',
    clearAriaLabel: 'ล้างรายการที่เลือก',
    createOptionLabel: 'สร้าง "{label}"',
    moreCountText: '+อีก {count}',
    loadingText: 'กำลังโหลด...',
    levelLabel: 'ระดับ {level}',
    backText: 'ย้อนกลับ',
    expandAriaLabel: 'ขยาย',
    collapseAriaLabel: 'ยุบ'
  },
  colorPicker: {
    trigger: 'เลือกสี',
    panelTitle: 'สี',
    clear: 'ล้าง',
    hue: 'ฮิว',
    saturation: 'ความอิ่มตัว',
    brightness: 'ความสว่าง',
    alpha: 'ความโปร่งใส',
    value: 'ค่าสี',
    preview: 'ตัวอย่างสี',
    selectPreset: 'เลือก {color}',
    done: 'เสร็จ',
    formatHex: 'HEX',
    formatRgb: 'RGB',
    formatHsl: 'HSL',
    swatches: 'แถบสี',
    primaryGroup: 'หลัก',
    accentGroup: 'เน้น'
  },
  tabs: {
    addTabAriaLabel: 'เพิ่มแท็บ',
    closeTabAriaLabel: 'ปิด {label}',
    tablistAriaLabel: 'แท็บ'
  },
  rate: {
    ariaLabel: 'คะแนน',
    valueText: '{value} ดาว'
  },
  avatarGroup: {
    ariaLabel: 'กลุ่มรูปโปรไฟล์',
    overflowAriaLabel: 'อีก {count} คน'
  },
  carousel: {
    ariaLabel: 'สไลด์โชว์',
    roleDescription: 'สไลด์โชว์',
    slideRoleDescription: 'สไลด์',
    navigationAriaLabel: 'การนำทางสไลด์',
    previousSlideAriaLabel: 'สไลด์ก่อนหน้า',
    nextSlideAriaLabel: 'สไลด์ถัดไป',
    pauseAriaLabel: 'หยุดเล่นอัตโนมัติ',
    playAriaLabel: 'เริ่มเล่นอัตโนมัติ',
    goToSlideAriaLabel: 'ไปยังสไลด์ {index}',
    slideAriaLabel: 'สไลด์ {index} จาก {total}'
  },
  transfer: {
    sourceTitle: 'ต้นทาง',
    targetTitle: 'ปลายทาง',
    searchAriaLabel: 'ค้นหา {title}',
    itemsAriaLabel: 'รายการ {title}',
    moveToTargetAriaLabel: 'ย้ายรายการที่เลือกไปปลายทาง',
    moveToSourceAriaLabel: 'ย้ายรายการที่เลือกไปต้นทาง',
    selectAllAriaLabel: 'เลือกทั้งหมดใน {title}'
  },
  chart: {
    legendAriaLabel: 'คำอธิบายแผนภูมิ',
    pointAriaLabel: 'จุด {index}: ({x}, {y})'
  },
  markdownEditor: {
    formattingToolbarAriaLabel: 'จัดรูปแบบ Markdown',
    modeToolbarAriaLabel: 'โหมดมุมมอง Markdown',
    editorAriaLabel: 'ตัวแก้ไข Markdown',
    previewAriaLabel: 'ตัวอย่าง Markdown',
    editModeLabel: 'แก้ไข',
    splitModeLabel: 'แยก',
    previewModeLabel: 'ตัวอย่าง',
    bold: 'ตัวหนา',
    italic: 'ตัวเอียง',
    strikethrough: 'ขีดฆ่า',
    heading: 'หัวข้อ',
    blockquote: 'คำพูด',
    unorderedList: 'รายการสัญลักษณ์',
    orderedList: 'รายการลำดับเลข',
    inlineCode: 'โค้ดในบรรทัด',
    codeBlock: 'บล็อกโค้ด',
    link: 'ลิงก์',
    image: 'รูปภาพ',
    table: 'ตาราง',
    horizontalRule: 'เส้นคั่น'
  },
  richTextEditor: {
    formattingToolbarAriaLabel: 'จัดรูปแบบข้อความ',
    editorAriaLabel: 'ตัวแก้ไขข้อความแบบมีรูปแบบ',
    bold: 'ตัวหนา',
    italic: 'ตัวเอียง',
    underline: 'ขีดเส้นใต้',
    strikethrough: 'ขีดฆ่า',
    heading1: 'หัวข้อ 1',
    heading2: 'หัวข้อ 2',
    heading3: 'หัวข้อ 3',
    bulletList: 'รายการสัญลักษณ์',
    orderedList: 'รายการลำดับเลข',
    blockquote: 'คำพูด',
    codeBlock: 'โค้ด',
    link: 'ลิงก์',
    image: 'รูปภาพ',
    horizontalRule: 'เส้น',
    undo: 'เลิกทำ',
    redo: 'ทำซ้ำ',
    clear: 'ล้างรูปแบบ'
  },
  cronEditor: {
    ariaLabel: 'ตัวแก้ไข Cron',
    expressionAriaLabel: 'นิพจน์ Cron',
    presetAriaLabel: 'ชุดสำเร็จรูป Cron',
    presetPlaceholder: 'ชุดสำเร็จรูป',
    everyMinutePreset: 'ทุกนาที',
    hourlyPreset: 'ทุกชั่วโมง',
    dailyPreset: 'ทุกวัน',
    weeklyPreset: 'ทุกสัปดาห์',
    monthlyPreset: 'ทุกเดือน',
    minuteLabel: 'นาที',
    hourLabel: 'ชั่วโมง',
    dayOfMonthLabel: 'วัน',
    monthLabel: 'เดือน',
    dayOfWeekLabel: 'วันในสัปดาห์',
    modeAnyLabel: 'ใดก็ได้',
    modeEveryLabel: 'ทุก',
    modeSpecificLabel: 'ระบุ',
    modeRangeLabel: 'ช่วง',
    modeCustomLabel: 'กำหนดเอง',
    modeAriaLabel: 'โหมด {field}',
    stepAriaLabel: 'ขั้นของ {field}',
    valueAriaLabel: 'ค่าของ {field}',
    rangeStartAriaLabel: 'จุดเริ่มช่วงของ {field}',
    rangeEndAriaLabel: 'จุดสิ้นช่วงของ {field}',
    customValueAriaLabel: 'ค่ากำหนดเองของ {field}',
    expressionFieldsError: 'นิพจน์ Cron ต้องมี 5 ช่อง',
    fieldRequiredError: '{field} จำเป็นต้องระบุ',
    invalidStepError: 'นิพจน์ขั้นของ {field} ไม่ถูกต้อง',
    stepRangeError: 'ขั้นของ {field} ต้องอยู่ระหว่าง 1 ถึง {max}',
    fieldRangeError: '{field} ต้องอยู่ระหว่าง {min} ถึง {max}',
    rangeOrderError: 'จุดเริ่มช่วงของ {field} ต้องน้อยกว่าหรือเท่ากับจุดสิ้น',
    invalidFieldError: '{field} ต้องเป็น *, ตัวเลข, ช่วง, ขั้น หรือรายการคั่นด้วยจุลภาค'
  },
  formValidation: {
    required: 'ต้องกรอกช่องนี้',
    typeString: 'ค่าต้องเป็นข้อความ',
    typeNumber: 'ค่าต้องเป็นตัวเลข',
    typeBoolean: 'ค่าต้องเป็นบูลีน',
    typeArray: 'ค่าต้องเป็นอาร์เรย์',
    typeObject: 'ค่าต้องเป็นอ็อบเจ็กต์',
    email: 'กรุณากรอกอีเมลที่ถูกต้อง',
    phone: 'กรุณากรอกเบอร์โทรที่ถูกต้อง',
    url: 'กรุณากรอก URL ที่ถูกต้อง',
    date: 'กรุณากรอกวันที่ที่ถูกต้อง',
    idCard: 'กรุณากรอกเลขบัตรที่ถูกต้อง',
    minLength: 'ความยาวอย่างน้อย {min} ตัวอักษร',
    maxLength: 'ความยาวไม่เกิน {max} ตัวอักษร',
    minValue: 'ค่าต่ำสุดคือ {min}',
    maxValue: 'ค่าสูงสุดคือ {max}',
    minItems: 'ต้องมีอย่างน้อย {min} รายการ',
    maxItems: 'อนุญาตไม่เกิน {max} รายการ',
    patternMismatch: 'ค่าไม่ตรงกับรูปแบบที่กำหนด',
    validatorFailed: 'การตรวจสอบไม่ผ่าน',
    validatorError: 'เกิดข้อผิดพลาดขณะตรวจสอบ'
  },
  inputOtp: {
    groupLabel: 'รหัสผ่านแบบใช้ครั้งเดียว',
    slotLabel: 'อักขระที่ {index} จาก {total}'
  },
  tagsInput: {
    removeTagLabel: 'ลบ {tag}',
    clearAllLabel: 'ล้างแท็กทั้งหมด'
  },
  input: {
    clearAriaLabel: 'ล้างช่องป้อน',
    showPasswordAriaLabel: 'แสดงรหัสผ่าน',
    hidePasswordAriaLabel: 'ซ่อนรหัสผ่าน'
  },
  inputNumber: {
    incrementAriaLabel: 'เพิ่ม',
    decrementAriaLabel: 'ลด',
    emptyAriaValueText: 'ว่าง'
  },
  slider: {
    ariaLabel: 'แถบเลื่อน',
    minAriaLabel: 'ค่าต่ำสุด',
    maxAriaLabel: 'ค่าสูงสุด'
  },
  stepper: {
    ariaLabel: 'ตัวปรับค่า',
    valueAriaLabel: 'ค่า',
    incrementAriaLabel: 'เพิ่ม',
    decrementAriaLabel: 'ลด'
  },
  signature: {
    ariaLabel: 'แผ่นลายเซ็น',
    undoText: 'เลิกทำ'
  },
  numberKeyboard: {
    ariaLabel: 'แป้นตัวเลข',
    deleteText: 'ลบ',
    decimalAriaLabel: 'จุดทศนิยม',
    idCardXAriaLabel: 'บัตรประชาชน X'
  },
  breadcrumb: {
    ariaLabel: 'เส้นทางนำทาง',
    expandAriaLabel: 'แสดงรายการที่ยุบ'
  },
  pageHeader: {
    backAriaLabel: 'ย้อนกลับ'
  },
  backTop: {
    ariaLabel: 'กลับขึ้นด้านบน'
  },
  anchor: {
    ariaLabel: 'ในหน้านี้'
  },
  floatButton: {
    ariaLabel: 'เพิ่ม'
  },
  spotlight: {
    title: 'แผงคำสั่ง',
    placeholder: 'ค้นหา'
  },
  scrollSpy: {
    ariaLabel: 'การนำทางส่วน'
  },
  steps: {
    ariaLabel: 'ขั้นตอน',
    waitStatus: 'รอดำเนินการ',
    processStatus: 'กำลังดำเนินการ',
    finishStatus: 'เสร็จสิ้น',
    errorStatus: 'ข้อผิดพลาด'
  },
  tree: {
    ariaLabel: 'ต้นไม้',
    selectNode: 'เลือก {label}',
    expand: 'ขยาย',
    collapse: 'ยุบ'
  }
}

export default thTH
