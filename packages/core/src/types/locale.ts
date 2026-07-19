import type { DatePickerLocalePreset } from './datepicker'
import type { TimePickerLabels } from './timepicker'

export type TigerLocaleDirection = 'ltr' | 'rtl'

export interface TigerLocaleCommon {
  okText?: string
  cancelText?: string
  closeText?: string
  loadingText?: string
  emptyText?: string
  /** Default "no more items" text for infinite-scroll end state */
  noMoreText?: string
  /** Default placeholder for in-component search inputs (Select/Tree/Transfer/Cascader…) */
  searchPlaceholder?: string
  /** Default label for clear actions */
  clearText?: string
}

export interface TigerLocaleEmpty {
  noData?: string
  noDataAvailable?: string
  noResults?: string
  error?: string
}

export interface TigerLocaleModal {
  closeAriaLabel?: string
  okText?: string
  cancelText?: string
}

export interface TigerLocaleDrawer {
  closeAriaLabel?: string
}

export interface TigerLocaleQRCode {
  ariaLabel?: string
  expiredText?: string
  refreshText?: string
  loadingText?: string
}

export interface TigerLocaleTimeline {
  pendingText?: string
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

export interface TigerLocaleTable {
  emptyText?: string
  loadingText?: string
  expandText?: string
  collapseText?: string
  selectAllText?: string
  /** Template: supports {row} */
  selectRowAriaLabel?: string
  /** Template: supports {column} */
  sortByText?: string
  clearSortText?: string
  toolbarAriaLabel?: string
  searchPlaceholder?: string
  searchButtonText?: string
  selectedText?: string
  selectedItemsText?: string
  /** Column-settings panel title / trigger label */
  columnSettingsText?: string
  /** Aria label for the column-settings trigger button */
  columnSettingsAriaLabel?: string
  /** Lock-column button aria-label. Template: supports {column} */
  lockColumnAriaLabel?: string
  /** Unlock-column button aria-label. Template: supports {column} */
  unlockColumnAriaLabel?: string
  allText?: string
  filterPlaceholder?: string
  exportCsvText?: string
  exportExcelText?: string
  exportCsvAriaLabel?: string
  exportExcelAriaLabel?: string
  expandRowAriaLabel?: string
  collapseRowAriaLabel?: string
}

export interface TigerLocaleDataExport {
  /** Trigger button text when multiple formats are offered */
  triggerText?: string
  /** Aria label for the export trigger button */
  triggerAriaLabel?: string
  /** Button/menu-item text for xlsx export */
  xlsxText?: string
  /** Button/menu-item text for markdown export */
  markdownText?: string
  /** Trigger text while an export is running */
  exportingText?: string
}

export interface TigerLocaleFormWizard {
  prevText?: string
  nextText?: string
  finishText?: string
}

export interface TigerLocaleTour {
  prevText?: string
  nextText?: string
  finishText?: string
  closeAriaLabel?: string
}

export interface TigerLocaleCalendar {
  previousMonth?: string
  nextMonth?: string
  previousYear?: string
  nextYear?: string
  yearSelectAriaLabel?: string
  monthSelectAriaLabel?: string
  daySelectAriaLabel?: string
}

export interface TigerLocaleFileManager {
  rootText?: string
}

export interface TigerLocaleImageViewer {
  dialogAriaLabel?: string
  previewDialogAriaLabel?: string
  closeAriaLabel?: string
  closePreviewAriaLabel?: string
  previousImageAriaLabel?: string
  nextImageAriaLabel?: string
  zoomOutAriaLabel?: string
  resetAriaLabel?: string
  zoomInAriaLabel?: string
  rotateLeftAriaLabel?: string
  rotateRightAriaLabel?: string
}

export interface TigerLocaleImageEditor {
  selectImageText?: string
  selectImageAriaLabel?: string
  cropModalTitle?: string
  cropCancelText?: string
  cropConfirmText?: string
  cropperDialogAriaLabel?: string
  imageToCropAriaLabel?: string
  moveCropAreaAriaLabel?: string
  resizeCropAreaAriaLabel?: string
  loadingCropImageAriaLabel?: string
  annotationToolbarAriaLabel?: string
  annotationEditorAriaLabel?: string
  annotationCanvasAriaLabel?: string
  loadingAnnotationImageAriaLabel?: string
  selectToolText?: string
  rectangleToolText?: string
  ellipseToolText?: string
  polygonToolText?: string
  freehandToolText?: string
  deleteText?: string
}

export interface TigerLocaleStatus {
  tagCloseAriaLabel?: string
  badgeLabel?: string
  badgeCountLabel?: string
}

export type TigerLocaleTimePicker = Partial<TimePickerLabels>

export interface TigerLocaleTaskBoard {
  /** Placeholder shown inside an empty column */
  emptyColumnText?: string
  /** Label for the add-card button */
  addCardText?: string
  /** Label for the add-column button */
  addColumnText?: string
  /** Template: supports {limit} */
  wipLimitText?: string
  /** Aria hint for draggable items */
  dragHintText?: string
  /** Aria label for the board root region */
  boardAriaLabel?: string
}

export interface TigerLocaleSelect {
  /** Mobile dropdown completion action text */
  doneText?: string
}

export interface TigerLocaleTabs {
  addTabAriaLabel?: string
  /** Template: supports {label} */
  closeTabAriaLabel?: string
}

export interface TigerLocaleRate {
  ariaLabel?: string
  /** Template: supports {value} */
  valueText?: string
}

export interface TigerLocaleAvatarGroup {
  ariaLabel?: string
  /** Template: supports {count} */
  overflowAriaLabel?: string
}

export interface TigerLocaleCarousel {
  ariaLabel?: string
  navigationAriaLabel?: string
  previousSlideAriaLabel?: string
  nextSlideAriaLabel?: string
  /** Template: supports {index} */
  goToSlideAriaLabel?: string
  /** Template: supports {index} and {total} */
  slideAriaLabel?: string
}

export interface TigerLocaleTransfer {
  sourceTitle?: string
  targetTitle?: string
  /** Template: supports {title} */
  searchAriaLabel?: string
  /** Template: supports {title} */
  itemsAriaLabel?: string
  moveToTargetAriaLabel?: string
  moveToSourceAriaLabel?: string
}

export interface TigerLocaleChart {
  legendAriaLabel?: string
  /** Template: supports {index}, {x}, {y} */
  pointAriaLabel?: string
}

export interface TigerLocaleMarkdownEditor {
  formattingToolbarAriaLabel?: string
  modeToolbarAriaLabel?: string
  editorAriaLabel?: string
  previewAriaLabel?: string
  editModeLabel?: string
  splitModeLabel?: string
  previewModeLabel?: string
}

export interface TigerLocaleRichTextEditor {
  formattingToolbarAriaLabel?: string
  editorAriaLabel?: string
}

export interface TigerLocaleCronEditor {
  ariaLabel?: string
  expressionAriaLabel?: string
  presetAriaLabel?: string
  presetPlaceholder?: string
  everyMinutePreset?: string
  hourlyPreset?: string
  dailyPreset?: string
  weeklyPreset?: string
  monthlyPreset?: string
  minuteLabel?: string
  hourLabel?: string
  dayOfMonthLabel?: string
  monthLabel?: string
  dayOfWeekLabel?: string
  modeAnyLabel?: string
  modeEveryLabel?: string
  modeSpecificLabel?: string
  modeRangeLabel?: string
  modeCustomLabel?: string
  modeAriaLabel?: string
  stepAriaLabel?: string
  valueAriaLabel?: string
  rangeStartAriaLabel?: string
  rangeEndAriaLabel?: string
  customValueAriaLabel?: string
  expressionFieldsError?: string
  fieldRequiredError?: string
  invalidStepError?: string
  stepRangeError?: string
  fieldRangeError?: string
  rangeOrderError?: string
  invalidFieldError?: string
}

/**
 * Built-in form-validation messages.
 *
 * Used by `validateRule`/`validateField`/`validateForm` to localize the
 * default error messages. A per-rule `message` always takes precedence over
 * these. Range messages support `{min}` / `{max}` placeholders.
 */
export interface TigerLocaleFormValidation {
  /** Required-field message */
  required?: string
  /** Type errors */
  typeString?: string
  typeNumber?: string
  typeBoolean?: string
  typeArray?: string
  typeObject?: string
  /** Preset type errors */
  email?: string
  phone?: string
  url?: string
  date?: string
  idCard?: string
  /** Range errors — template: supports {min} */
  minLength?: string
  /** Template: supports {max} */
  maxLength?: string
  /** Template: supports {min} */
  minValue?: string
  /** Template: supports {max} */
  maxValue?: string
  /** Template: supports {min} */
  minItems?: string
  /** Template: supports {max} */
  maxItems?: string
  /** Pattern mismatch message */
  patternMismatch?: string
  /** Custom validator returned false */
  validatorFailed?: string
  /** Custom validator threw */
  validatorError?: string
}

/**
 * InputOTP labels.
 * @since 2.1.0
 */
export interface TigerLocaleInputOTP {
  /** Accessible label for the slot group */
  groupLabel?: string
  /** Per-slot aria-label — template: supports {index} (1-based) and {total} */
  slotLabel?: string
}

/**
 * TagsInput labels.
 * @since 2.1.0
 */
export interface TigerLocaleTagsInput {
  /** Remove-tag button aria-label — template: supports {tag} */
  removeTagLabel?: string
  /** Clear-all button aria-label */
  clearAllLabel?: string
}

export interface TigerLocale {
  /** BCP 47 locale identifier, for Intl formatting and direction inference. */
  locale?: string
  /** Text/layout direction. RTL locales should set this to `rtl`. */
  direction?: TigerLocaleDirection
  common?: TigerLocaleCommon
  empty?: TigerLocaleEmpty
  modal?: TigerLocaleModal
  drawer?: TigerLocaleDrawer
  qrcode?: TigerLocaleQRCode
  timeline?: TigerLocaleTimeline
  upload?: TigerLocaleUpload
  pagination?: TigerLocalePagination
  table?: TigerLocaleTable
  datePicker?: Partial<DatePickerLocalePreset>
  timePicker?: TigerLocaleTimePicker
  dataExport?: TigerLocaleDataExport
  formWizard?: TigerLocaleFormWizard
  tour?: TigerLocaleTour
  calendar?: TigerLocaleCalendar
  fileManager?: TigerLocaleFileManager
  imageViewer?: TigerLocaleImageViewer
  imageEditor?: TigerLocaleImageEditor
  status?: TigerLocaleStatus
  taskBoard?: TigerLocaleTaskBoard
  select?: TigerLocaleSelect
  tabs?: TigerLocaleTabs
  rate?: TigerLocaleRate
  avatarGroup?: TigerLocaleAvatarGroup
  carousel?: TigerLocaleCarousel
  transfer?: TigerLocaleTransfer
  chart?: TigerLocaleChart
  markdownEditor?: TigerLocaleMarkdownEditor
  richTextEditor?: TigerLocaleRichTextEditor
  cronEditor?: TigerLocaleCronEditor
  formValidation?: TigerLocaleFormValidation
  inputOtp?: TigerLocaleInputOTP
  tagsInput?: TigerLocaleTagsInput
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
