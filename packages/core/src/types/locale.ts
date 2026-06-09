import type { DatePickerLocalePreset } from './datepicker'

export type TigerLocaleDirection = 'ltr' | 'rtl'

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
  /** Simple pagination page indicator template: supports {current}, {total} */
  pageIndicatorText?: string
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
  /** Aria label for the board root region */
  boardAriaLabel?: string
}

export interface TigerLocale {
  /** BCP 47 locale identifier, for Intl formatting and direction inference. */
  locale?: string
  /** Text/layout direction. RTL locales should set this to `rtl`. */
  direction?: TigerLocaleDirection
  common?: TigerLocaleCommon
  modal?: TigerLocaleModal
  drawer?: TigerLocaleDrawer
  upload?: TigerLocaleUpload
  pagination?: TigerLocalePagination
  datePicker?: Partial<DatePickerLocalePreset>
  formWizard?: TigerLocaleFormWizard
  taskBoard?: TigerLocaleTaskBoard
}

/**
 * Flat custom-text overlay for single-language projects that do not need i18n.
 *
 * Same shape as `TigerLocale` but without the `locale` code / `direction`
 * fields — it carries only the component text. Pass it to
 * `<ConfigProvider locale={defineText({...})} />` for app-wide custom text, or
 * to a component's `labels` prop for a one-off override. No locale data files
 * are pulled in, so the bundle stays small.
 */
export type TigerText = Omit<Partial<TigerLocale>, 'locale' | 'direction'>

export type TigerLocaleLazyModule =
  | Partial<TigerLocale>
  | { default?: Partial<TigerLocale> }
  | Record<string, unknown>

export type TigerLocaleLoader = () => PromiseLike<TigerLocaleLazyModule>

export type TigerLocaleInput =
  | Partial<TigerLocale>
  | PromiseLike<TigerLocaleLazyModule>
  | TigerLocaleLoader
