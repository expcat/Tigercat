/**
 * Vietnamese (vi-VN).
 */

import type { TigerLocale } from '../../../types/locale'
import { defineLocale } from '../define-locale'
import { VI_VN_DATEPICKER_LOCALE } from '../datepicker-locales/vi-VN'

export const viVN: TigerLocale = defineLocale({
  locale: 'vi-VN',
  direction: 'ltr',
  datePicker: VI_VN_DATEPICKER_LOCALE,
  common: {
    okText: 'Đồng ý',
    cancelText: 'Hủy',
    closeText: 'Đóng',
    loadingText: 'Đang tải...',
    emptyText: 'Không có dữ liệu',
    noMoreText: 'Không còn dữ liệu'
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
  timeline: {
    pendingText: 'Đang tải...'
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
    clearSortText: 'Xóa sắp xếp',
    toolbarAriaLabel: 'Thanh công cụ bảng dữ liệu',
    searchPlaceholder: 'Tìm kiếm',
    searchButtonText: 'Tìm kiếm',
    selectedText: 'Đã chọn',
    selectedItemsText: 'mục',
    columnSettingsText: 'Cài đặt cột',
    columnSettingsAriaLabel: 'Cài đặt cột',
    lockColumnAriaLabel: 'Khóa cột {column}',
    unlockColumnAriaLabel: 'Bỏ khóa cột {column}'
  },
  formWizard: {
    prevText: 'Trước',
    nextText: 'Tiếp',
    finishText: 'Hoàn thành'
  },
  taskBoard: {
    emptyColumnText: 'Không có nhiệm vụ',
    addCardText: 'Thêm nhiệm vụ',
    wipLimitText: 'Giới hạn WIP: {limit}',
    dragHintText: 'Kéo để di chuyển',
    boardAriaLabel: 'Bảng nhiệm vụ'
  },
  select: {
    doneText: 'Hoàn thành'
  }
})
