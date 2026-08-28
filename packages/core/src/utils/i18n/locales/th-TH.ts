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
    emptyText: 'ไม่พบตัวเลือก'
  },
  colorPicker: {
    trigger: 'เลือกสี',
    panelTitle: 'สี',
    clear: 'ล้าง',
    hue: 'ฮิว',
    alpha: 'ความโปร่งใส',
    value: 'ค่าสี',
    preview: 'ตัวอย่างสี',
    selectPreset: 'เลือก {color}'
  },
  inputOtp: {
    groupLabel: 'รหัสผ่านแบบใช้ครั้งเดียว',
    slotLabel: 'อักขระที่ {index} จาก {total}'
  },
  tagsInput: {
    removeTagLabel: 'ลบ {tag}',
    clearAllLabel: 'ล้างแท็กทั้งหมด'
  }
})
