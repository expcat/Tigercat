/**
 * Vietnamese (vi-VN).
 */

import type { TigerLocale } from '../../../types/locale'
import { VI_VN_DATEPICKER_LOCALE } from '../datepicker-locales/vi-VN'

export const viVN: TigerLocale = {
  locale: 'vi-VN',
  direction: 'ltr',
  datePicker: VI_VN_DATEPICKER_LOCALE,
  common: {
    okText: 'Đồng ý',
    cancelText: 'Hủy',
    closeText: 'Đóng',
    loadingText: 'Đang tải...',
    emptyText: 'Không có dữ liệu',
    noMoreText: 'Không còn dữ liệu',
    searchPlaceholder: 'Tìm kiếm',
    clearText: 'Xóa',
    closeMessageAriaLabel: 'Đóng tin nhắn',
    closeNotificationAriaLabel: 'Đóng thông báo',
    sidebarAriaLabel: 'Thanh bên'
  },
  empty: {
    noData: 'Không có dữ liệu',
    noDataAvailable: 'Không có dữ liệu khả dụng',
    noResults: 'Không có kết quả',
    error: 'Đã xảy ra lỗi'
  },
  modal: {
    closeAriaLabel: 'Đóng',
    okText: 'Đồng ý',
    cancelText: 'Hủy'
  },
  drawer: {
    closeAriaLabel: 'Đóng'
  },
  qrcode: {
    ariaLabel: 'Mã QR',
    expiredText: 'Mã QR đã hết hạn',
    refreshText: 'Làm mới',
    loadingText: 'Đang tải...'
  },
  marquee: {
    ariaLabel: 'Nội dung cuộn'
  },
  image: {
    previewAriaLabel: 'Xem trước {alt}',
    previewFallbackAlt: 'hình ảnh',
    groupAriaLabel: 'Nhóm hình ảnh'
  },
  imageCompare: {
    ariaLabel: 'So sánh hình ảnh'
  },
  descriptions: {
    colon: ':'
  },
  list: {
    avatarAlt: 'Ảnh đại diện',
    dragHandleAriaLabel: 'Sắp xếp lại'
  },
  scrollArea: {
    ariaLabel: 'Vùng cuộn'
  },
  printLayout: {
    pageBreak: 'Ngắt trang'
  },
  timeline: {
    pendingText: 'Đang tải...'
  },
  progress: {
    ariaLabel: 'Tiến độ'
  },
  splitter: {
    gutterAriaLabel: 'Chỉnh kích thước ngăn {index}'
  },
  resizable: {
    handleAriaLabel: 'Chỉnh kích thước {handle}'
  },
  upload: {
    dragAreaAriaLabel: 'Nhấp hoặc kéo để tải tệp lên',
    buttonAriaLabel: 'Tải tệp lên',
    clickToUploadText: 'Nhấp để tải lên',
    dragAndDropText: 'hoặc kéo và thả',
    acceptInfoText: 'Chấp nhận: {accept}',
    maxSizeInfoText: 'Kích thước tối đa: {maxSize}',
    selectFileText: 'Chọn tệp',
    uploadedFilesAriaLabel: 'Tệp đã tải lên',
    successAriaLabel: 'Thành công',
    errorAriaLabel: 'Lỗi',
    uploadingAriaLabel: 'Đang tải lên',
    removeFileAriaLabel: 'Xóa {fileName}',
    previewFileAriaLabel: 'Xem trước {fileName}'
  },
  pagination: {
    totalText: 'Tổng {total} mục',
    itemsPerPageText: '/trang',
    jumpToText: 'Đi đến',
    pageText: 'trang',
    prevPageAriaLabel: 'Trang trước',
    nextPageAriaLabel: 'Trang sau',
    pageAriaLabel: 'Trang {page}',
    pageIndicatorText: 'Trang {current} / {total}'
  },
  table: {
    emptyText: 'Không có dữ liệu',
    loadingText: 'Đang tải',
    expandText: 'Mở rộng',
    collapseText: 'Thu gọn',
    selectAllText: 'Chọn tất cả',
    selectRowAriaLabel: 'Chọn hàng {row}',
    sortByText: 'Sắp xếp theo {column}',
    clearSortText: 'Bỏ sắp xếp',
    toolbarAriaLabel: 'Thanh công cụ bảng dữ liệu',
    searchPlaceholder: 'Tìm kiếm',
    searchButtonText: 'Tìm kiếm',
    selectedText: 'Đã chọn',
    selectedItemsText: 'mục',
    columnSettingsText: 'Cài đặt cột',
    columnSettingsAriaLabel: 'Cài đặt cột',
    lockColumnAriaLabel: 'Khóa cột {column}',
    unlockColumnAriaLabel: 'Bỏ khóa cột {column}',
    allText: 'Tất cả',
    filterPlaceholder: 'Lọc...',
    exportCsvText: 'Xuất CSV',
    exportExcelText: 'Xuất Excel',
    exportCsvAriaLabel: 'Xuất sang CSV',
    exportExcelAriaLabel: 'Xuất sang Excel',
    expandRowAriaLabel: 'Mở rộng hàng',
    collapseRowAriaLabel: 'Thu gọn hàng'
  },
  dataExport: {
    triggerText: 'Xuất',
    triggerAriaLabel: 'Xuất dữ liệu',
    xlsxText: 'Xuất Excel',
    markdownText: 'Xuất Markdown',
    exportingText: 'Đang xuất...'
  },
  timePicker: {
    hour: 'Giờ',
    minute: 'Phút',
    second: 'Giây',
    now: 'Bây giờ',
    ok: 'Đồng ý',
    start: 'Bắt đầu',
    end: 'Kết thúc',
    clear: 'Xóa giờ',
    toggle: 'Mở bộ chọn giờ',
    dialog: 'Bộ chọn giờ',
    selectTime: 'Chọn giờ',
    selectTimeRange: 'Chọn khoảng giờ'
  },
  formWizard: {
    prevText: 'Trước',
    nextText: 'Tiếp',
    finishText: 'Hoàn thành'
  },
  tour: {
    prevText: 'Trước',
    nextText: 'Tiếp',
    finishText: 'Hoàn thành',
    closeAriaLabel: 'Đóng hướng dẫn'
  },
  calendar: {
    previousMonth: 'Tháng trước',
    nextMonth: 'Tháng sau',
    previousYear: 'Năm trước',
    nextYear: 'Năm sau',
    yearSelectAriaLabel: 'Năm',
    monthSelectAriaLabel: 'Tháng',
    daySelectAriaLabel: 'Ngày'
  },
  fileManager: {
    rootText: 'Gốc'
  },
  imageViewer: {
    dialogAriaLabel: 'Trình xem ảnh',
    previewDialogAriaLabel: 'Xem trước ảnh',
    closeAriaLabel: 'Đóng',
    closePreviewAriaLabel: 'Đóng xem trước',
    previousImageAriaLabel: 'Ảnh trước',
    nextImageAriaLabel: 'Ảnh sau',
    zoomOutAriaLabel: 'Thu nhỏ',
    resetAriaLabel: 'Đặt lại',
    zoomInAriaLabel: 'Phóng to',
    rotateLeftAriaLabel: 'Xoay trái',
    rotateRightAriaLabel: 'Xoay phải',
    previewImageAriaLabel: 'Ảnh {index} / {total}'
  },
  imageEditor: {
    selectImageText: 'Chọn ảnh',
    selectImageAriaLabel: 'Chọn ảnh để cắt và tải lên',
    cropModalTitle: 'Cắt ảnh',
    cropCancelText: 'Hủy',
    cropConfirmText: 'Xác nhận cắt',
    cropperDialogAriaLabel: 'Công cụ cắt ảnh',
    imageToCropAriaLabel: 'Ảnh cần cắt',
    moveCropAreaAriaLabel: 'Di chuyển vùng cắt',
    resizeCropAreaAriaLabel: 'Thay đổi kích thước vùng cắt {handle}',
    resizeHandleNw: 'trên-trái',
    resizeHandleN: 'trên',
    resizeHandleNe: 'trên-phải',
    resizeHandleE: 'phải',
    resizeHandleSe: 'dưới-phải',
    resizeHandleS: 'dưới',
    resizeHandleSw: 'dưới-trái',
    resizeHandleW: 'trái',
    loadingCropImageAriaLabel: 'Đang tải ảnh để cắt',
    loadErrorAriaLabel: 'Không tải được ảnh để cắt',
    annotationToolbarAriaLabel: 'Công cụ chú thích',
    annotationEditorAriaLabel: 'Trình chú thích ảnh',
    annotationCanvasAriaLabel: 'Canvas chú thích',
    loadingAnnotationImageAriaLabel: 'Đang tải ảnh để chú thích',
    selectToolText: 'Chọn',
    rectangleToolText: 'Hình chữ nhật',
    ellipseToolText: 'Hình elip',
    polygonToolText: 'Đa giác',
    freehandToolText: 'Vẽ tự do',
    deleteText: 'Xóa'
  },
  status: {
    tagCloseAriaLabel: 'Đóng thẻ',
    badgeLabel: 'thông báo',
    badgeCountLabel: '{count} thông báo'
  },
  taskBoard: {
    emptyColumnText: 'Không có nhiệm vụ',
    addCardText: 'Thêm nhiệm vụ',
    addColumnText: 'Thêm cột',
    wipLimitText: 'Giới hạn WIP: {limit}',
    dragHintText: 'Kéo để di chuyển',
    boardAriaLabel: 'Bảng nhiệm vụ'
  },
  chatWindow: {
    emptyText: 'Không có tin nhắn',
    sendText: 'Gửi',
    placeholder: 'Nhập tin nhắn',
    sendingText: 'Đang gửi',
    sentText: 'Đã gửi',
    failedText: 'Gửi thất bại'
  },
  code: {
    copyLabel: 'Sao chép',
    copiedLabel: 'Đã sao chép',
    copyFailedLabel: 'Sao chép thất bại'
  },
  commentThread: {
    emptyText: 'Không có bình luận',
    replyPlaceholder: 'Viết phản hồi...',
    replyButtonText: 'Trả lời',
    cancelReplyText: 'Hủy',
    likeText: 'Thích',
    likedText: 'Đã thích',
    replyText: 'Trả lời',
    moreText: 'Thêm',
    loadMoreText: 'Tải thêm',
    collapseRepliesText: '▾ Thu gọn phản hồi',
    expandRepliesText: '▸ Mở rộng {count} phản hồi'
  },
  activityFeed: {
    emptyText: 'Không có hoạt động',
    loadingText: 'Đang tải...'
  },
  notificationCenter: {
    title: 'Thông báo',
    emptyText: 'Không có thông báo',
    loadingText: 'Đang tải...',
    allLabel: 'Tất cả',
    unreadLabel: 'Chưa đọc',
    readLabel: 'Đã đọc',
    markAllReadText: 'Đánh dấu tất cả là đã đọc',
    markReadText: 'Đánh dấu đã đọc',
    markUnreadText: 'Đánh dấu chưa đọc'
  },
  select: {
    doneText: 'Hoàn thành',
    placeholder: 'Chọn một tùy chọn',
    emptyText: 'Không có tùy chọn'
  },
  colorPicker: {
    trigger: 'Chọn màu',
    panelTitle: 'Màu',
    clear: 'Xóa',
    hue: 'Tông màu',
    alpha: 'Độ trong suốt',
    value: 'Giá trị màu',
    preview: 'Xem trước',
    selectPreset: 'Chọn {color}'
  },
  tabs: {
    addTabAriaLabel: 'Thêm tab',
    closeTabAriaLabel: 'Đóng {label}'
  },
  rate: {
    ariaLabel: 'Đánh giá',
    valueText: '{value} sao'
  },
  avatarGroup: {
    ariaLabel: 'Nhóm ảnh đại diện',
    overflowAriaLabel: 'còn {count} người'
  },
  carousel: {
    ariaLabel: 'Băng chuyền',
    roleDescription: 'băng chuyền',
    slideRoleDescription: 'trang',
    navigationAriaLabel: 'Điều hướng băng chuyền',
    previousSlideAriaLabel: 'Trang trước',
    nextSlideAriaLabel: 'Trang sau',
    pauseAriaLabel: 'Tạm dừng tự chạy',
    playAriaLabel: 'Bắt đầu tự chạy',
    goToSlideAriaLabel: 'Đến trang {index}',
    slideAriaLabel: 'Trang {index} / {total}'
  },
  transfer: {
    sourceTitle: 'Nguồn',
    targetTitle: 'Đích',
    searchAriaLabel: 'Tìm {title}',
    itemsAriaLabel: 'Mục {title}',
    moveToTargetAriaLabel: 'Chuyển mục đã chọn sang đích',
    moveToSourceAriaLabel: 'Chuyển mục đã chọn sang nguồn'
  },
  chart: {
    legendAriaLabel: 'Chú giải biểu đồ',
    pointAriaLabel: 'Điểm {index}: ({x}, {y})'
  },
  markdownEditor: {
    formattingToolbarAriaLabel: 'Định dạng Markdown',
    modeToolbarAriaLabel: 'Chế độ xem Markdown',
    editorAriaLabel: 'Trình soạn Markdown',
    previewAriaLabel: 'Xem trước Markdown',
    editModeLabel: 'Sửa',
    splitModeLabel: 'Chia',
    previewModeLabel: 'Xem trước',
    bold: 'Đậm',
    italic: 'Nghiêng',
    strikethrough: 'Gạch ngang',
    heading: 'Tiêu đề',
    blockquote: 'Trích dẫn',
    unorderedList: 'Danh sách dấu đầu dòng',
    orderedList: 'Danh sách đánh số',
    inlineCode: 'Mã nội dòng',
    codeBlock: 'Khối mã',
    link: 'Liên kết',
    image: 'Ảnh',
    table: 'Bảng',
    horizontalRule: 'Đường ngang'
  },
  richTextEditor: {
    formattingToolbarAriaLabel: 'Định dạng văn bản',
    editorAriaLabel: 'Trình soạn văn bản phong phú',
    bold: 'Đậm',
    italic: 'Nghiêng',
    underline: 'Gạch chân',
    strikethrough: 'Gạch ngang',
    heading1: 'Tiêu đề 1',
    heading2: 'Tiêu đề 2',
    heading3: 'Tiêu đề 3',
    bulletList: 'Danh sách dấu đầu dòng',
    orderedList: 'Danh sách đánh số',
    blockquote: 'Trích dẫn',
    codeBlock: 'Mã',
    link: 'Liên kết',
    image: 'Ảnh',
    horizontalRule: 'Đường',
    undo: 'Hoàn tác',
    redo: 'Làm lại',
    clear: 'Xóa định dạng'
  },
  cronEditor: {
    ariaLabel: 'Trình soạn Cron',
    expressionAriaLabel: 'Biểu thức Cron',
    presetAriaLabel: 'Cài đặt sẵn Cron',
    presetPlaceholder: 'Cài đặt sẵn',
    everyMinutePreset: 'Mỗi phút',
    hourlyPreset: 'Mỗi giờ',
    dailyPreset: 'Mỗi ngày',
    weeklyPreset: 'Mỗi tuần',
    monthlyPreset: 'Mỗi tháng',
    minuteLabel: 'Phút',
    hourLabel: 'Giờ',
    dayOfMonthLabel: 'Ngày',
    monthLabel: 'Tháng',
    dayOfWeekLabel: 'Thứ',
    modeAnyLabel: 'Bất kỳ',
    modeEveryLabel: 'Mỗi',
    modeSpecificLabel: 'Cụ thể',
    modeRangeLabel: 'Khoảng',
    modeCustomLabel: 'Tùy chỉnh',
    modeAriaLabel: 'Chế độ {field}',
    stepAriaLabel: 'Bước {field}',
    valueAriaLabel: 'Giá trị {field}',
    rangeStartAriaLabel: 'Đầu khoảng {field}',
    rangeEndAriaLabel: 'Cuối khoảng {field}',
    customValueAriaLabel: 'Giá trị tùy chỉnh {field}',
    expressionFieldsError: 'Biểu thức Cron phải có 5 trường',
    fieldRequiredError: '{field} là bắt buộc',
    invalidStepError: '{field} có biểu thức bước không hợp lệ',
    stepRangeError: 'Bước {field} phải từ 1 đến {max}',
    fieldRangeError: '{field} phải từ {min} đến {max}',
    rangeOrderError: 'Đầu khoảng {field} phải nhỏ hơn hoặc bằng cuối',
    invalidFieldError: '{field} phải là *, số, khoảng, bước hoặc danh sách cách nhau bởi dấu phẩy'
  },
  formValidation: {
    required: 'Trường này là bắt buộc',
    typeString: 'Giá trị phải là chuỗi',
    typeNumber: 'Giá trị phải là số',
    typeBoolean: 'Giá trị phải là boolean',
    typeArray: 'Giá trị phải là mảng',
    typeObject: 'Giá trị phải là đối tượng',
    email: 'Vui lòng nhập email hợp lệ',
    phone: 'Vui lòng nhập số điện thoại hợp lệ',
    url: 'Vui lòng nhập URL hợp lệ',
    date: 'Vui lòng nhập ngày hợp lệ',
    idCard: 'Vui lòng nhập số CMND/CCCD hợp lệ',
    minLength: 'Độ dài tối thiểu là {min} ký tự',
    maxLength: 'Độ dài tối đa là {max} ký tự',
    minValue: 'Giá trị tối thiểu là {min}',
    maxValue: 'Giá trị tối đa là {max}',
    minItems: 'Cần ít nhất {min} mục',
    maxItems: 'Cho phép tối đa {max} mục',
    patternMismatch: 'Giá trị không khớp mẫu yêu cầu',
    validatorFailed: 'Xác thực không thành công',
    validatorError: 'Đã xảy ra lỗi khi xác thực'
  },
  inputOtp: {
    groupLabel: 'Mật khẩu dùng một lần',
    slotLabel: 'Ký tự {index} trong {total}'
  },
  tagsInput: {
    removeTagLabel: 'Xóa {tag}',
    clearAllLabel: 'Xóa tất cả thẻ'
  },
  input: {
    clearAriaLabel: 'Xóa nội dung',
    showPasswordAriaLabel: 'Hiện mật khẩu',
    hidePasswordAriaLabel: 'Ẩn mật khẩu'
  },
  inputNumber: {
    incrementAriaLabel: 'Tăng',
    decrementAriaLabel: 'Giảm',
    emptyAriaValueText: 'Trống'
  },
  slider: {
    ariaLabel: 'Thanh trượt',
    minAriaLabel: 'Giá trị tối thiểu',
    maxAriaLabel: 'Giá trị tối đa'
  },
  stepper: {
    ariaLabel: 'Bộ đếm bước',
    valueAriaLabel: 'Giá trị',
    incrementAriaLabel: 'Tăng',
    decrementAriaLabel: 'Giảm'
  }
}

export default viVN
