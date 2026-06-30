/**
 * English (en-US) — default locale for Tigercat UI.
 */

import type { TigerLocale } from '../../../types/locale'
import { DEFAULT_TIME_PICKER_LABELS, DEFAULT_UPLOAD_LABELS } from '../../locale-utils'
import { EN_US_DATEPICKER_LOCALE } from '../datepicker-locales/en-US'

export const enUS: TigerLocale = {
  locale: 'en-US',
  direction: 'ltr',
  common: {
    okText: 'OK',
    cancelText: 'Cancel',
    closeText: 'Close',
    loadingText: 'Loading...',
    emptyText: 'No data',
    noMoreText: 'No more data',
    searchPlaceholder: 'Search',
    clearText: 'Clear'
  },
  empty: {
    noData: 'No data',
    noDataAvailable: 'No data available',
    noResults: 'No results found',
    error: 'Something went wrong'
  },
  modal: {
    closeAriaLabel: 'Close',
    okText: 'OK',
    cancelText: 'Cancel'
  },
  drawer: {
    closeAriaLabel: 'Close'
  },
  qrcode: {
    ariaLabel: 'QR Code',
    expiredText: 'QR code expired',
    refreshText: 'Refresh',
    loadingText: 'Loading...'
  },
  timeline: {
    pendingText: 'Loading...'
  },
  upload: DEFAULT_UPLOAD_LABELS,
  pagination: {
    totalText: 'Total {total} items',
    itemsPerPageText: '/ page',
    jumpToText: 'Go to',
    pageText: 'page',
    prevPageAriaLabel: 'Previous page',
    nextPageAriaLabel: 'Next page',
    pageAriaLabel: 'Page {page}',
    pageIndicatorText: 'Page {current} of {total}'
  },
  table: {
    emptyText: 'No data',
    loadingText: 'Loading',
    expandText: 'Expand',
    collapseText: 'Collapse',
    selectAllText: 'Select all',
    selectRowAriaLabel: 'Select row {row}',
    sortByText: 'Sort by {column}',
    clearSortText: 'Clear sort',
    toolbarAriaLabel: 'Data table toolbar',
    searchPlaceholder: 'Search',
    searchButtonText: 'Search',
    selectedText: 'Selected',
    selectedItemsText: 'items',
    columnSettingsText: 'Column settings',
    columnSettingsAriaLabel: 'Column settings',
    lockColumnAriaLabel: 'Lock column {column}',
    unlockColumnAriaLabel: 'Unlock column {column}',
    allText: 'All',
    filterPlaceholder: 'Filter...',
    exportCsvText: 'Export CSV',
    exportExcelText: 'Export Excel',
    exportCsvAriaLabel: 'Export to CSV',
    exportExcelAriaLabel: 'Export to Excel',
    expandRowAriaLabel: 'Expand row',
    collapseRowAriaLabel: 'Collapse row'
  },
  datePicker: EN_US_DATEPICKER_LOCALE,
  timePicker: DEFAULT_TIME_PICKER_LABELS,
  formWizard: {
    prevText: 'Previous',
    nextText: 'Next',
    finishText: 'Finish'
  },
  tour: {
    prevText: 'Previous',
    nextText: 'Next',
    finishText: 'Finish',
    closeAriaLabel: 'Close tour'
  },
  calendar: {
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    previousYear: 'Previous year',
    nextYear: 'Next year',
    yearSelectAriaLabel: 'Year',
    monthSelectAriaLabel: 'Month',
    daySelectAriaLabel: 'Day'
  },
  fileManager: {
    rootText: 'Root'
  },
  imageViewer: {
    dialogAriaLabel: 'Image viewer',
    previewDialogAriaLabel: 'Image preview',
    closeAriaLabel: 'Close',
    closePreviewAriaLabel: 'Close preview',
    previousImageAriaLabel: 'Previous image',
    nextImageAriaLabel: 'Next image',
    zoomOutAriaLabel: 'Zoom out',
    resetAriaLabel: 'Reset',
    zoomInAriaLabel: 'Zoom in',
    rotateLeftAriaLabel: 'Rotate left',
    rotateRightAriaLabel: 'Rotate right'
  },
  imageEditor: {
    selectImageText: 'Select image',
    selectImageAriaLabel: 'Select image to crop and upload',
    cropModalTitle: 'Crop image',
    cropCancelText: 'Cancel',
    cropConfirmText: 'Confirm crop',
    cropperDialogAriaLabel: 'Image cropper',
    imageToCropAriaLabel: 'Image to crop',
    moveCropAreaAriaLabel: 'Move crop area',
    resizeCropAreaAriaLabel: 'Resize crop area {handle}',
    loadingCropImageAriaLabel: 'Loading image for cropping',
    annotationToolbarAriaLabel: 'Annotation tools',
    annotationEditorAriaLabel: 'Image annotation editor',
    annotationCanvasAriaLabel: 'Image annotation canvas',
    loadingAnnotationImageAriaLabel: 'Loading image for annotation',
    selectToolText: 'Select',
    rectangleToolText: 'Rectangle',
    ellipseToolText: 'Ellipse',
    polygonToolText: 'Polygon',
    freehandToolText: 'Freehand',
    deleteText: 'Delete'
  },
  status: {
    tagCloseAriaLabel: 'Close tag',
    badgeLabel: 'notification',
    badgeCountLabel: '{count} notifications'
  },
  taskBoard: {
    emptyColumnText: 'No tasks',
    addCardText: 'Add task',
    addColumnText: 'Add column',
    wipLimitText: 'WIP limit: {limit}',
    dragHintText: 'Drag to move',
    boardAriaLabel: 'Task Board'
  },
  select: {
    doneText: 'Done'
  },
  formValidation: {
    required: 'This field is required',
    typeString: 'Value must be a string',
    typeNumber: 'Value must be a number',
    typeBoolean: 'Value must be a boolean',
    typeArray: 'Value must be an array',
    typeObject: 'Value must be an object',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    url: 'Please enter a valid URL',
    date: 'Please enter a valid date',
    idCard: 'Please enter a valid ID card number',
    minLength: 'Minimum length is {min} characters',
    maxLength: 'Maximum length is {max} characters',
    minValue: 'Minimum value is {min}',
    maxValue: 'Maximum value is {max}',
    minItems: 'Minimum {min} items required',
    maxItems: 'Maximum {max} items allowed',
    patternMismatch: 'Value does not match the required pattern',
    validatorFailed: 'Validation failed',
    validatorError: 'Validation error occurred'
  }
}
