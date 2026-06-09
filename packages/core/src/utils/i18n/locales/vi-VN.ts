/**
 * Vietnamese (vi-VN).
 */

import type { TigerLocale } from '../../../types/locale'

export const viVN: TigerLocale = {
  locale: 'vi-VN',
  direction: 'ltr',
  common: {
    okText: 'Đồng ý',
    cancelText: 'Hủy',
    closeText: 'Đóng',
    loadingText: 'Đang tải...',
    emptyText: 'Không có dữ liệu'
  },
  modal: {
    closeAriaLabel: 'Đóng',
    okText: 'Đồng ý',
    cancelText: 'Hủy'
  },
  drawer: {
    closeAriaLabel: 'Đóng'
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
  }
}
