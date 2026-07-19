/**
 * Arabic (Saudi Arabia) (ar-SA).
 */

import type { TigerLocale } from '../../../types/locale'
import { defineLocale } from '../define-locale'
import { AR_SA_DATEPICKER_LOCALE } from '../datepicker-locales/ar-SA'

export const arSA: TigerLocale = defineLocale({
  locale: 'ar-SA',
  direction: 'rtl',
  datePicker: AR_SA_DATEPICKER_LOCALE,
  common: {
    okText: 'موافق',
    cancelText: 'إلغاء',
    closeText: 'إغلاق',
    loadingText: 'جار التحميل...',
    emptyText: 'لا توجد بيانات',
    noMoreText: 'لا مزيد من البيانات'
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
  timeline: {
    pendingText: 'جار التحميل...'
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
    unlockColumnAriaLabel: 'إلغاء تثبيت العمود {column}'
  },
  formWizard: {
    prevText: 'السابق',
    nextText: 'التالي',
    finishText: 'إنهاء'
  },
  taskBoard: {
    emptyColumnText: 'لا توجد مهام',
    addCardText: 'إضافة مهمة',
    wipLimitText: 'حد العمل الجاري: {limit}',
    dragHintText: 'اسحب للنقل',
    boardAriaLabel: 'لوحة المهام'
  },
  select: {
    doneText: 'إنهاء'
  },
  inputOtp: {
    groupLabel: 'كلمة المرور لمرة واحدة',
    slotLabel: 'الحرف {index} من {total}'
  },
  tagsInput: {
    removeTagLabel: 'إزالة {tag}',
    clearAllLabel: 'مسح كل الوسوم'
  }
})

export default arSA
