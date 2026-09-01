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
  /** Imperative Message close-button accessible name */
  closeMessageAriaLabel?: string
  /** Imperative Notification close-button accessible name */
  closeNotificationAriaLabel?: string
  /** Default accessible name for Sidebar (`<aside>`) when none is passed */
  sidebarAriaLabel?: string
  /** Default accessible name for SplitButton chevron / "more" triggers */
  moreOptionsText?: string
  /** Default Popconfirm title when none is passed */
  confirmTitle?: string
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
  /** Accessible name when the dialog has no visible title */
  dialogAriaLabel?: string
}

export interface TigerLocaleDrawer {
  closeAriaLabel?: string
  /** Accessible name when the drawer has no visible title */
  dialogAriaLabel?: string
}

export interface TigerLocaleAlert {
  /** Close-button accessible name */
  closeAriaLabel?: string
}

export interface TigerLocaleQRCode {
  ariaLabel?: string
  expiredText?: string
  refreshText?: string
  loadingText?: string
}

export interface TigerLocaleMarquee {
  /** Accessible name when Marquee is a labeled region */
  ariaLabel?: string
}

export interface TigerLocaleImage {
  /** Preview control name. Template: supports {alt} */
  previewAriaLabel?: string
  /** Substituted for {alt} when the image has no alternative text */
  previewFallbackAlt?: string
  /** Accessible name for ImageGroup */
  groupAriaLabel?: string
}

export interface TigerLocaleImageCompare {
  /** Accessible name for the comparison slider handle */
  ariaLabel?: string
}

export interface TigerLocaleDescriptions {
  /** Glyph appended to labels when `colon` is on */
  colon?: string
}

export interface TigerLocaleList {
  /** Fallback `alt` when a default item has an image avatar but no title */
  avatarAlt?: string
  /** Accessible name for the reorder handle */
  dragHandleAriaLabel?: string
}

export interface TigerLocaleScrollArea {
  /** Accessible name when the viewport is a tab stop without a user label */
  ariaLabel?: string
}

export interface TigerLocalePrintLayout {
  /** On-screen page-break indicator */
  pageBreak?: string
}

export interface TigerLocaleTimeline {
  pendingText?: string
}

export interface TigerLocaleProgress {
  /** Accessible name for the progress widget (does not include the current value) */
  ariaLabel?: string
}

export interface TigerLocaleSplitter {
  /** Accessible name for a gutter. Template: supports {index} (1-based) */
  gutterAriaLabel?: string
}

export interface TigerLocaleResizable {
  /** Accessible name for an edge handle. Template: supports {handle} */
  handleAriaLabel?: string
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
  /** Items per page option suffix */
  itemsPerPageText?: string
  /** Accessible name for the page-size control */
  pageSizeAriaLabel?: string
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
  /** Default pagination landmark name */
  paginationAriaLabel?: string
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
  /** Accessible name for the card-layout sort Select */
  sortMenuAriaLabel?: string
  /** Template: supports {column} */
  filterColumnAriaLabel?: string
  /** Template: supports {key} and {count} */
  groupHeaderText?: string
}

export interface TigerLocaleDataExport {
  /** Trigger button text when multiple formats are offered */
  triggerText?: string
  /** Aria label for the export trigger when it has no visible text */
  triggerAriaLabel?: string
  /** Button/menu-item text for xlsx export */
  xlsxText?: string
  /** Button/menu-item text for markdown export */
  markdownText?: string
  /** Button/menu-item text for csv export */
  csvText?: string
  /** Trigger text while an export is running */
  exportingText?: string
  /** Visible error when serialization or download fails */
  errorText?: string
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
  dialogAriaLabel?: string
}

export interface TigerLocaleCalendar {
  previousMonth?: string
  nextMonth?: string
  previousYear?: string
  nextYear?: string
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
  /** Template for the current bitmap when the item has no `alt`. Uses `{index}` and `{total}`. */
  previewImageAriaLabel?: string
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
  resizeHandleNw?: string
  resizeHandleN?: string
  resizeHandleNe?: string
  resizeHandleE?: string
  resizeHandleSe?: string
  resizeHandleS?: string
  resizeHandleSw?: string
  resizeHandleW?: string
  loadingCropImageAriaLabel?: string
  loadErrorAriaLabel?: string
  /** Template: supports {maxSize} */
  fileTooLargeText?: string
  fileTypeRejectedText?: string
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

export interface TigerLocaleChatWindow {
  emptyText?: string
  sendText?: string
  placeholder?: string
  sendingText?: string
  sentText?: string
  failedText?: string
}

export interface TigerLocaleCode {
  copyLabel?: string
  copiedLabel?: string
  copyFailedLabel?: string
}

export interface TigerLocaleCommentThread {
  emptyText?: string
  replyPlaceholder?: string
  replyButtonText?: string
  cancelReplyText?: string
  likeText?: string
  likedText?: string
  replyText?: string
  moreText?: string
  loadMoreText?: string
  collapseRepliesText?: string
  /** Template: supports {count} */
  expandRepliesText?: string
}

export interface TigerLocaleActivityFeed {
  emptyText?: string
  loadingText?: string
}

export interface TigerLocaleNotificationCenter {
  title?: string
  emptyText?: string
  loadingText?: string
  allLabel?: string
  unreadLabel?: string
  readLabel?: string
  markAllReadText?: string
  markReadText?: string
  markUnreadText?: string
}

export interface TigerLocaleSelect {
  /** Mobile dropdown completion action text */
  doneText?: string
  /** Trigger placeholder when no option is selected */
  placeholder?: string
  /** Empty options list / no-match copy */
  emptyText?: string
  /** Search input placeholder */
  searchPlaceholder?: string
  /** Clear-selection control accessible name */
  clearAriaLabel?: string
  /** Creatable row sentence. Template: supports {label} */
  createOptionLabel?: string
  /** Overflow count after maxTagCount. Template: supports {count} */
  moreCountText?: string
  /** Remote-loading copy shown in the panel */
  loadingText?: string
  /** Column accessible name. Template: supports {level} */
  levelLabel?: string
  /** Small-screen drill-down back control */
  backText?: string
  /** Expand-parent control accessible name */
  expandAriaLabel?: string
  /** Collapse-parent control accessible name */
  collapseAriaLabel?: string
}

export interface TigerLocaleColorPicker {
  /** Trigger aria-label / title. Default "Pick color". */
  trigger?: string
  /** Panel heading and dialog accessible name */
  panelTitle?: string
  /** Clear-color action text */
  clear?: string
  /** Hue slider label */
  hue?: string
  /** Saturation / brightness plane */
  saturation?: string
  brightness?: string
  /** Alpha slider label */
  alpha?: string
  /** Color value input aria-label */
  value?: string
  /** Preview swatch (decorative; not exposed as a name) */
  preview?: string
  /** Preset swatch aria-label. Template: supports {color} */
  selectPreset?: string
  /** Small-screen Done button */
  done?: string
  formatHex?: string
  formatRgb?: string
  formatHsl?: string
  /** ColorSwatch radiogroup name */
  swatches?: string
  /** Default ColorSwatch group names */
  primaryGroup?: string
  accentGroup?: string
}

export interface TigerLocaleTabs {
  addTabAriaLabel?: string
  /** Template: supports {label} */
  closeTabAriaLabel?: string
  /** Default tablist accessible name when none is passed */
  tablistAriaLabel?: string
}

export interface TigerLocaleBreadcrumb {
  /** Default breadcrumb landmark name */
  ariaLabel?: string
  /** Ellipsis button that expands collapsed items */
  expandAriaLabel?: string
}

export interface TigerLocalePageHeader {
  /** Default back-control accessible name */
  backAriaLabel?: string
}

export interface TigerLocaleBackTop {
  /** Default BackTop button accessible name when there is no visible text */
  ariaLabel?: string
}

export interface TigerLocaleAnchor {
  /** Default Anchor landmark name */
  ariaLabel?: string
}

export interface TigerLocaleFloatButton {
  /** Default accessible name for an icon-only FloatButton */
  ariaLabel?: string
}

export interface TigerLocaleSpotlight {
  /** Default command-palette dialog title */
  title?: string
  /** Default search-field placeholder */
  placeholder?: string
}

export interface TigerLocaleScrollSpy {
  /** Default ScrollSpy landmark name */
  ariaLabel?: string
}

export interface TigerLocaleSteps {
  /** Default steps list accessible name */
  ariaLabel?: string
  waitStatus?: string
  processStatus?: string
  finishStatus?: string
  errorStatus?: string
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
  /** Used only when the caller names the carousel; omitted name is not a landmark. */
  ariaLabel?: string
  roleDescription?: string
  slideRoleDescription?: string
  navigationAriaLabel?: string
  previousSlideAriaLabel?: string
  nextSlideAriaLabel?: string
  pauseAriaLabel?: string
  playAriaLabel?: string
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
  /** Template: supports {title} */
  selectAllAriaLabel?: string
}

export interface TigerLocaleChart {
  legendAriaLabel?: string
  /** Template: supports {index}, {x}, {y} */
  pointAriaLabel?: string
  /** Template: supports {index} */
  seriesName?: string
  /** Template: supports {index} */
  sliceName?: string
  /** Template: supports {label}, {value}, {percent} */
  sliceAriaLabel?: string
  /** Template: supports {index} */
  stageName?: string
}

export interface TigerLocaleMarkdownEditor {
  formattingToolbarAriaLabel?: string
  modeToolbarAriaLabel?: string
  editorAriaLabel?: string
  previewAriaLabel?: string
  editModeLabel?: string
  splitModeLabel?: string
  previewModeLabel?: string
  bold?: string
  italic?: string
  strikethrough?: string
  heading?: string
  blockquote?: string
  unorderedList?: string
  orderedList?: string
  inlineCode?: string
  codeBlock?: string
  link?: string
  image?: string
  table?: string
  horizontalRule?: string
}

export interface TigerLocaleRichTextEditor {
  formattingToolbarAriaLabel?: string
  editorAriaLabel?: string
  bold?: string
  italic?: string
  underline?: string
  strikethrough?: string
  heading1?: string
  heading2?: string
  heading3?: string
  bulletList?: string
  orderedList?: string
  blockquote?: string
  codeBlock?: string
  link?: string
  image?: string
  horizontalRule?: string
  undo?: string
  redo?: string
  clear?: string
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

/** Input trailing-button labels. */
export interface TigerLocaleInputLabels {
  clearAriaLabel?: string
  showPasswordAriaLabel?: string
  hidePasswordAriaLabel?: string
}

/** InputNumber spinbutton and step-button labels. */
export interface TigerLocaleInputNumber {
  incrementAriaLabel?: string
  decrementAriaLabel?: string
  /** Spoken value when the field is empty */
  emptyAriaValueText?: string
}

/** Slider thumb names. */
export interface TigerLocaleSlider {
  /** Default accessible name when none is passed */
  ariaLabel?: string
  /** Range thumb name for the lower value */
  minAriaLabel?: string
  /** Range thumb name for the upper value */
  maxAriaLabel?: string
}

/** Stepper group / spinbutton / step-button labels. */
export interface TigerLocaleStepper {
  /** Accessible name for the control group */
  ariaLabel?: string
  /** Accessible name for the value spinbutton */
  valueAriaLabel?: string
  incrementAriaLabel?: string
  decrementAriaLabel?: string
}

export interface TigerLocaleSignature {
  /** Accessible name for the signature pad widget */
  ariaLabel?: string
  /** Undo-last-stroke control */
  undoText?: string
}

export interface TigerLocaleNumberKeyboard {
  /** Accessible name for the keypad group / dialog */
  ariaLabel?: string
  deleteText?: string
  decimalAriaLabel?: string
  idCardXAriaLabel?: string
}

export interface TigerLocaleTree {
  /** Default accessible name for the tree widget */
  ariaLabel?: string
  /** Checkbox name. Template: supports {label} */
  selectNode?: string
  /** Expand-control name (hidden; expansion is on the treeitem) */
  expand?: string
  /** Collapse-control name */
  collapse?: string
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
  alert?: TigerLocaleAlert
  qrcode?: TigerLocaleQRCode
  marquee?: TigerLocaleMarquee
  image?: TigerLocaleImage
  imageCompare?: TigerLocaleImageCompare
  descriptions?: TigerLocaleDescriptions
  list?: TigerLocaleList
  scrollArea?: TigerLocaleScrollArea
  printLayout?: TigerLocalePrintLayout
  timeline?: TigerLocaleTimeline
  progress?: TigerLocaleProgress
  splitter?: TigerLocaleSplitter
  resizable?: TigerLocaleResizable
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
  chatWindow?: TigerLocaleChatWindow
  code?: TigerLocaleCode
  commentThread?: TigerLocaleCommentThread
  activityFeed?: TigerLocaleActivityFeed
  notificationCenter?: TigerLocaleNotificationCenter
  select?: TigerLocaleSelect
  colorPicker?: TigerLocaleColorPicker
  tabs?: TigerLocaleTabs
  breadcrumb?: TigerLocaleBreadcrumb
  pageHeader?: TigerLocalePageHeader
  backTop?: TigerLocaleBackTop
  anchor?: TigerLocaleAnchor
  floatButton?: TigerLocaleFloatButton
  spotlight?: TigerLocaleSpotlight
  scrollSpy?: TigerLocaleScrollSpy
  steps?: TigerLocaleSteps
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
  input?: TigerLocaleInputLabels
  inputNumber?: TigerLocaleInputNumber
  slider?: TigerLocaleSlider
  stepper?: TigerLocaleStepper
  signature?: TigerLocaleSignature
  numberKeyboard?: TigerLocaleNumberKeyboard
  tree?: TigerLocaleTree
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
  Partial<TigerLocale> | { default?: Partial<TigerLocale> } | Record<string, unknown>

export type TigerLocaleLoader = () => PromiseLike<TigerLocaleLazyModule>

export type TigerLocaleInput =
  Partial<TigerLocale> | PromiseLike<TigerLocaleLazyModule> | TigerLocaleLoader
