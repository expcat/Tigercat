/**
 * Thai (th-TH).
 */

import type { TigerLocale } from '../../../types/locale'
import { defineLocale } from '../define-locale'
import { TH_TH_DATEPICKER_LOCALE } from '../datepicker-locales/th-TH'

export const thTH: TigerLocale = defineLocale({
  locale: 'th-TH',
  direction: 'ltr',
  datePicker: TH_TH_DATEPICKER_LOCALE,
  common: {
    okText: 'ตกลง',
    cancelText: 'ยกเลิก',
    closeText: 'ปิด',
    loadingText: 'กำลังโหลด...',
    emptyText: 'ไม่มีข้อมูล',
    noMoreText: 'ไม่มีข้อมูลเพิ่มเติม'
  },
  modal: {
    closeAriaLabel: 'ปิด',
    okText: 'ตกลง',
    cancelText: 'ยกเลิก'
  },
  drawer: {
    closeAriaLabel: 'ปิด'
  },
  qrcode: {
    ariaLabel: 'QR Code',
    expiredText: 'QR Code หมดอายุแล้ว',
    refreshText: 'รีเฟรช',
    loadingText: 'กำลังโหลด...'
  },
  timeline: {
    pendingText: 'กำลังโหลด...'
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
    selectedItemsText: 'รายการ',
    columnSettingsText: 'ตั้งค่าคอลัมน์',
    columnSettingsAriaLabel: 'ตั้งค่าคอลัมน์',
    lockColumnAriaLabel: 'ล็อกคอลัมน์ {column}',
    unlockColumnAriaLabel: 'ปลดล็อกคอลัมน์ {column}'
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
})
