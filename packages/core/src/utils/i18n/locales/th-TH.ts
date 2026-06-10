/**
 * Thai (th-TH).
 */

import type { TigerLocale } from '../../../types/locale'

export const thTH: TigerLocale = {
  locale: 'th-TH',
  direction: 'ltr',
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
    pageAriaLabel: 'หน้า {page}',
    pageIndicatorText: 'หน้า {current} จาก {total}'
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
    selectedItemsText: 'รายการ'
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
