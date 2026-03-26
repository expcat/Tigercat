/**
 * Locale presets for Tigercat UI
 *
 * Each preset provides a full TigerLocale object for a specific language.
 */

import type { TigerLocale } from '../../types/locale'

/**
 * English (en-US) — default
 */
export const enUS: TigerLocale = {
  common: {
    okText: 'OK',
    cancelText: 'Cancel',
    closeText: 'Close',
    loadingText: 'Loading...',
    emptyText: 'No data'
  },
  modal: {
    closeAriaLabel: 'Close',
    okText: 'OK',
    cancelText: 'Cancel'
  },
  drawer: {
    closeAriaLabel: 'Close'
  },
  pagination: {
    totalText: 'Total {total} items',
    itemsPerPageText: '/ page',
    jumpToText: 'Go to',
    pageText: 'page',
    prevPageAriaLabel: 'Previous page',
    nextPageAriaLabel: 'Next page',
    pageAriaLabel: 'Page {page}'
  },
  formWizard: {
    prevText: 'Previous',
    nextText: 'Next',
    finishText: 'Finish'
  },
  taskBoard: {
    emptyColumnText: 'No tasks',
    addCardText: 'Add task',
    wipLimitText: 'WIP limit: {limit}',
    dragHintText: 'Drag to move',
    boardAriaLabel: 'Task Board'
  }
}

/**
 * Simplified Chinese (zh-CN)
 */
export const zhCN: TigerLocale = {
  common: {
    okText: '确定',
    cancelText: '取消',
    closeText: '关闭',
    loadingText: '加载中...',
    emptyText: '暂无数据'
  },
  modal: {
    closeAriaLabel: '关闭',
    okText: '确定',
    cancelText: '取消'
  },
  drawer: {
    closeAriaLabel: '关闭'
  },
  pagination: {
    totalText: '共 {total} 条',
    itemsPerPageText: '条/页',
    jumpToText: '跳至',
    pageText: '页',
    prevPageAriaLabel: '上一页',
    nextPageAriaLabel: '下一页',
    pageAriaLabel: '第 {page} 页'
  },
  formWizard: {
    prevText: '上一步',
    nextText: '下一步',
    finishText: '完成'
  },
  taskBoard: {
    emptyColumnText: '暂无任务',
    addCardText: '添加任务',
    wipLimitText: 'WIP 限制: {limit}',
    dragHintText: '拖拽以移动',
    boardAriaLabel: '任务看板'
  }
}

/**
 * Traditional Chinese (zh-TW)
 */
export const zhTW: TigerLocale = {
  common: {
    okText: '確定',
    cancelText: '取消',
    closeText: '關閉',
    loadingText: '載入中...',
    emptyText: '暫無資料'
  },
  modal: {
    closeAriaLabel: '關閉',
    okText: '確定',
    cancelText: '取消'
  },
  drawer: {
    closeAriaLabel: '關閉'
  },
  pagination: {
    totalText: '共 {total} 筆',
    itemsPerPageText: '筆/頁',
    jumpToText: '跳至',
    pageText: '頁',
    prevPageAriaLabel: '上一頁',
    nextPageAriaLabel: '下一頁',
    pageAriaLabel: '第 {page} 頁'
  },
  formWizard: {
    prevText: '上一步',
    nextText: '下一步',
    finishText: '完成'
  },
  taskBoard: {
    emptyColumnText: '暫無任務',
    addCardText: '新增任務',
    wipLimitText: 'WIP 限制: {limit}',
    dragHintText: '拖曳以移動',
    boardAriaLabel: '任務看板'
  }
}

/**
 * Japanese (ja)
 */
export const jaJP: TigerLocale = {
  common: {
    okText: 'OK',
    cancelText: 'キャンセル',
    closeText: '閉じる',
    loadingText: '読み込み中...',
    emptyText: 'データなし'
  },
  modal: {
    closeAriaLabel: '閉じる',
    okText: 'OK',
    cancelText: 'キャンセル'
  },
  drawer: {
    closeAriaLabel: '閉じる'
  },
  pagination: {
    totalText: '全 {total} 件',
    itemsPerPageText: '件/ページ',
    jumpToText: '移動',
    pageText: 'ページ',
    prevPageAriaLabel: '前のページ',
    nextPageAriaLabel: '次のページ',
    pageAriaLabel: '{page} ページ'
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

/**
 * Korean (ko)
 */
export const koKR: TigerLocale = {
  common: {
    okText: '확인',
    cancelText: '취소',
    closeText: '닫기',
    loadingText: '로딩 중...',
    emptyText: '데이터 없음'
  },
  modal: {
    closeAriaLabel: '닫기',
    okText: '확인',
    cancelText: '취소'
  },
  drawer: {
    closeAriaLabel: '닫기'
  },
  pagination: {
    totalText: '총 {total}개',
    itemsPerPageText: '개/페이지',
    jumpToText: '이동',
    pageText: '페이지',
    prevPageAriaLabel: '이전 페이지',
    nextPageAriaLabel: '다음 페이지',
    pageAriaLabel: '{page} 페이지'
  },
  formWizard: {
    prevText: '이전',
    nextText: '다음',
    finishText: '완료'
  },
  taskBoard: {
    emptyColumnText: '작업 없음',
    addCardText: '작업 추가',
    wipLimitText: 'WIP 제한: {limit}',
    dragHintText: '드래그하여 이동',
    boardAriaLabel: '작업 보드'
  }
}

/**
 * Thai (th)
 */
export const thTH: TigerLocale = {
  common: {
    okText: 'ตกลง',
    cancelText: 'ยกเลิก',
    closeText: 'ปิด',
    loadingText: 'กำลังโหลด...',
    emptyText: 'ไม่มีข้อมูล'
  },
  modal: {
    closeAriaLabel: 'ปิด',
    okText: 'ตกลง',
    cancelText: 'ยกเลิก'
  },
  drawer: {
    closeAriaLabel: 'ปิด'
  },
  pagination: {
    totalText: 'ทั้งหมด {total} รายการ',
    itemsPerPageText: '/หน้า',
    jumpToText: 'ไปที่',
    pageText: 'หน้า',
    prevPageAriaLabel: 'หน้าก่อนหน้า',
    nextPageAriaLabel: 'หน้าถัดไป',
    pageAriaLabel: 'หน้า {page}'
  },
  formWizard: {
    prevText: 'ก่อนหน้า',
    nextText: 'ถัดไป',
    finishText: 'เสร็จสิ้น'
  },
  taskBoard: {
    emptyColumnText: 'ไม่มีงาน',
    addCardText: 'เพิ่มงาน',
    wipLimitText: 'จำกัด WIP: {limit}',
    dragHintText: 'ลากเพื่อย้าย',
    boardAriaLabel: 'บอร์ดงาน'
  }
}

/**
 * Vietnamese (vi)
 */
export const viVN: TigerLocale = {
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
    pageAriaLabel: 'Trang {page}'
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

/**
 * Indonesian (id)
 */
export const idID: TigerLocale = {
  common: {
    okText: 'OK',
    cancelText: 'Batal',
    closeText: 'Tutup',
    loadingText: 'Memuat...',
    emptyText: 'Tidak ada data'
  },
  modal: {
    closeAriaLabel: 'Tutup',
    okText: 'OK',
    cancelText: 'Batal'
  },
  drawer: {
    closeAriaLabel: 'Tutup'
  },
  pagination: {
    totalText: 'Total {total} item',
    itemsPerPageText: '/halaman',
    jumpToText: 'Ke halaman',
    pageText: 'halaman',
    prevPageAriaLabel: 'Halaman sebelumnya',
    nextPageAriaLabel: 'Halaman berikutnya',
    pageAriaLabel: 'Halaman {page}'
  },
  formWizard: {
    prevText: 'Sebelumnya',
    nextText: 'Selanjutnya',
    finishText: 'Selesai'
  },
  taskBoard: {
    emptyColumnText: 'Tidak ada tugas',
    addCardText: 'Tambah tugas',
    wipLimitText: 'Batas WIP: {limit}',
    dragHintText: 'Seret untuk memindahkan',
    boardAriaLabel: 'Papan Tugas'
  }
}
