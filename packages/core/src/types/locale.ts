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

export interface TigerLocale {
  common?: TigerLocaleCommon
  modal?: TigerLocaleModal
  drawer?: TigerLocaleDrawer
  upload?: TigerLocaleUpload
}
