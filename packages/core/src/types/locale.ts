export interface TigerLocaleCommon {
  okText?: string
  cancelText?: string
  closeText?: string
  loadingText?: string
  emptyText?: string
}

export interface TigerLocaleModal {
  closeAriaLabel?: string
  okText?: string
  cancelText?: string
}

export interface TigerLocaleDrawer {
  closeAriaLabel?: string
}

export interface TigerLocaleUpload {
  /** Drag area aria-label */
  dragAreaAriaLabel?: string
  /** Upload button aria-label (non-drag mode) */
  buttonAriaLabel?: string

  /** Main drag-area instruction (emphasized part) */
  clickToUploadText?: string
  /** Secondary drag-area instruction */
  dragAndDropText?: string

  /** Template: supports {accept} */
  acceptInfoText?: string
  /** Template: supports {maxSize} */
  maxSizeInfoText?: string

  /** Default non-drag button text */
  selectFileText?: string

  /** File list aria-label */
  uploadedFilesAriaLabel?: string

  /** Status aria-labels */
  successAriaLabel?: string
  errorAriaLabel?: string
  uploadingAriaLabel?: string

  /** Templates: support {fileName} */
  removeFileAriaLabel?: string
  previewFileAriaLabel?: string
}

export interface TigerLocalePagination {
  /** Total text template: supports {total}, {start}, {end} */
  totalText?: string
  /** Items per page text */
  itemsPerPageText?: string
  /** Quick jumper label */
  jumpToText?: string
  /** Page text (after number) */
  pageText?: string
  /** Previous page button aria-label */
  prevPageAriaLabel?: string
  /** Next page button aria-label */
  nextPageAriaLabel?: string
  /** Page button aria-label template: supports {page} */
  pageAriaLabel?: string
}

export interface TigerLocaleFormWizard {
  prevText?: string
  nextText?: string
  finishText?: string
}

export interface TigerLocaleTaskBoard {
  /** Placeholder shown inside an empty column */
  emptyColumnText?: string
  /** Label for the add-card button */
  addCardText?: string
  /** Template: supports {limit} */
  wipLimitText?: string
  /** Aria hint for draggable items */
  dragHintText?: string
}

export interface TigerLocale {
  common?: TigerLocaleCommon
  modal?: TigerLocaleModal
  drawer?: TigerLocaleDrawer
  upload?: TigerLocaleUpload
  pagination?: TigerLocalePagination
  formWizard?: TigerLocaleFormWizard
  taskBoard?: TigerLocaleTaskBoard
}
