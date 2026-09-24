export function resolveLocaleText(
  fallback: string,
  ...candidates: Array<string | null | undefined>
): string {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate
    }
  }

  return fallback
}

import type { DataExportFormat } from '../types/data-export'
import type {
  TigerLocale,
  TigerLocaleInput,
  TigerLocaleLoader,
  TigerLocaleLazyModule,
  TigerLocaleEmpty,
  TigerLocaleModal,
  TigerLocaleDrawer,
  TigerLocaleAlert,
  TigerLocaleQRCode,
  TigerLocalePagination,
  TigerLocaleTable,
  TigerLocaleDataExport,
  TigerLocaleFormWizard,
  TigerLocaleSchemaForm,
  TigerLocaleTour,
  TigerLocaleCalendar,
  TigerLocaleFullscreen,
  TigerLocaleFileManager,
  TigerLocaleImageViewer,
  TigerLocaleImageEditor,
  TigerLocaleStatus,
  TigerLocaleTaskBoard,
  TigerLocaleChatWindow,
  TigerLocaleCode,
  TigerLocaleCommentThread,
  TigerLocaleActivityFeed,
  TigerLocaleNotificationCenter,
  TigerLocaleSelect,
  TigerLocaleCascader,
  TigerLocaleTreeSelect,
  TigerLocaleColorPicker,
  TigerLocaleTabs,
  TigerLocaleBreadcrumb,
  TigerLocalePageHeader,
  TigerLocaleBackTop,
  TigerLocaleAnchor,
  TigerLocaleFloatButton,
  TigerLocaleSpotlight,
  TigerLocaleScrollSpy,
  TigerLocaleSteps,
  TigerLocaleRate,
  TigerLocaleAvatarGroup,
  TigerLocaleCarousel,
  TigerLocaleMarquee,
  TigerLocaleImage,
  TigerLocaleImageCompare,
  TigerLocaleText,
  TigerLocaleWatermark,
  TigerLocaleSegmented,
  TigerLocaleDescriptions,
  TigerLocaleList,
  TigerLocaleMasonry,
  TigerLocaleScrollArea,
  TigerLocalePrintLayout,
  TigerLocaleProgress,
  TigerLocaleSplitter,
  TigerLocaleResizable,
  TigerLocaleTransfer,
  TigerLocaleChart,
  TigerLocaleCodeEditor,
  TigerLocaleMarkdownEditor,
  TigerLocaleRichTextEditor,
  TigerLocaleCronEditor,
  TigerLocaleFormValidation,
  TigerLocaleInputOTP,
  TigerLocaleTagsInput,
  TigerLocaleInputLabels,
  TigerLocaleInputNumber,
  TigerLocaleSlider,
  TigerLocaleSignature,
  TigerLocaleNumberKeyboard,
  TigerLocaleTree,
  TigerLocaleWorkflowTimeline,
  TigerLocaleWorkflowDesigner,
  TigerLocaleDirection
} from '../types/locale'
import { deepMergeLocale, TIGER_LOCALE_KEYS } from './i18n/locale-merge'

export { TIGER_LOCALE_KEYS, mergeTigerLocale } from './i18n/locale-merge'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPromiseLike(value: unknown): value is PromiseLike<TigerLocaleLazyModule> {
  return isRecord(value) && typeof value.then === 'function'
}

function hasTigerLocaleShape(value: unknown): value is Partial<TigerLocale> {
  if (!isRecord(value)) return false
  return TIGER_LOCALE_KEYS.some((key) => key in value)
}

function resolveTigerLocaleModule(module: TigerLocaleLazyModule): Partial<TigerLocale> | undefined {
  if (!isRecord(module)) return undefined

  const moduleRecord = module as Record<string, unknown>
  const defaultExport = moduleRecord.default
  if (hasTigerLocaleShape(defaultExport)) return defaultExport

  for (const value of Object.values(moduleRecord)) {
    if (hasTigerLocaleShape(value)) return value
  }

  return module as Partial<TigerLocale>
}

export function isLazyTigerLocale(
  locale?: TigerLocaleInput
): locale is PromiseLike<TigerLocaleLazyModule> | TigerLocaleLoader {
  return typeof locale === 'function' || isPromiseLike(locale)
}

export function getImmediateTigerLocale(
  locale?: TigerLocaleInput
): Partial<TigerLocale> | undefined {
  if (!locale || isLazyTigerLocale(locale)) return undefined
  return locale
}

export async function resolveTigerLocale(
  locale?: TigerLocaleInput
): Promise<Partial<TigerLocale> | undefined> {
  if (!locale) return undefined

  const loaded =
    typeof locale === 'function' ? await locale() : isPromiseLike(locale) ? await locale : locale
  return resolveTigerLocaleModule(loaded)
}

const RTL_LANGUAGE_CODES = new Set(['ar', 'fa', 'he', 'iw', 'ps', 'ur'])

export function isRtlLocale(locale?: string | Partial<TigerLocale>): boolean {
  if (!locale) return false
  if (typeof locale !== 'string') {
    if (locale.direction) return locale.direction === 'rtl'
    return isRtlLocale(locale.locale)
  }

  const language = locale.split('-')[0]?.toLowerCase()
  return RTL_LANGUAGE_CODES.has(language)
}

export function getLocaleDirection(locale?: string | Partial<TigerLocale>): TigerLocaleDirection {
  return isRtlLocale(locale) ? 'rtl' : 'ltr'
}

export function formatIntlNumber(
  value: number,
  locale?: string,
  options?: Intl.NumberFormatOptions
): string {
  if (!locale && !options) return String(value)
  try {
    return new Intl.NumberFormat(locale || undefined, options).format(value)
  } catch {
    return String(value)
  }
}

export function getIntlPluralCategory(value: number, locale?: string): Intl.LDMLPluralRule {
  try {
    return new Intl.PluralRules(locale).select(value)
  } catch {
    return value === 1 ? 'one' : 'other'
  }
}

/**
 * Merge `overrides` onto `section` onto `defaults`, skipping `undefined`.
 * Missing keys always fall back to the en-US locale object — never a
 * language-id heuristic.
 *
 * Constraint is `object`, not `Record<string, unknown>`: locale sections are
 * closed interfaces without an index signature, which TypeScript does not
 * assign to `Record<string, unknown>`. `NoInfer` keeps T from the complete
 * defaults object so partial locale/overrides cannot widen the return type.
 */
export function resolveLocaleSection<T extends object>(
  defaults: T,
  section?: Partial<NoInfer<T>> | null,
  overrides?: Partial<NoInfer<T>> | null
): T {
  return deepMergeLocale(
    deepMergeLocale(defaults, section ?? undefined),
    overrides ?? undefined
  ) as T
}

type TigerLocaleSectionKey = Exclude<keyof TigerLocale, 'locale' | 'direction'>

import { enUS } from './i18n/locales/en-US'

function enSection<K extends TigerLocaleSectionKey>(
  key: K,
  _locale?: Partial<TigerLocale>
): Required<NonNullable<TigerLocale[K]>> {
  const section = enUS[key]
  if (typeof section === 'object' && section !== null) {
    return section as Required<NonNullable<TigerLocale[K]>>
  }
  return {} as Required<NonNullable<TigerLocale[K]>>
}

export function getEmptyLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleEmpty>
): Required<TigerLocaleEmpty> {
  return resolveLocaleSection(enSection('empty', locale), locale?.empty, overrides)
}

export function getTextLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleText>
): Required<TigerLocaleText> {
  return resolveLocaleSection(enSection('text', locale), locale?.text, overrides)
}

export function getWatermarkLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleWatermark>
): Required<TigerLocaleWatermark> {
  return resolveLocaleSection(enSection('watermark', locale), locale?.watermark, overrides)
}

export function getSegmentedLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleSegmented>
): Required<TigerLocaleSegmented> {
  return resolveLocaleSection(enSection('segmented', locale), locale?.segmented, overrides)
}

export function getQRCodeLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleQRCode>
): Required<TigerLocaleQRCode> {
  return resolveLocaleSection(enSection('qrcode', locale), locale?.qrcode, overrides)
}

export function getTourLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTour>
): Required<TigerLocaleTour> {
  const labels = resolveLocaleSection(enSection('tour', locale), locale?.tour, overrides)
  return {
    ...labels,
    closeAriaLabel:
      overrides?.closeAriaLabel ??
      locale?.tour?.closeAriaLabel ??
      locale?.common?.closeText ??
      labels.closeAriaLabel
  }
}

export function getCalendarLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleCalendar>
): Required<TigerLocaleCalendar> {
  return resolveLocaleSection(enSection('calendar', locale), locale?.calendar, overrides)
}

export function getFormWizardLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleFormWizard>
): Required<TigerLocaleFormWizard> {
  return resolveLocaleSection(enSection('formWizard', locale), locale?.formWizard, overrides)
}

export function getSchemaFormLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleSchemaForm>
): Required<TigerLocaleSchemaForm> {
  return resolveLocaleSection(enSection('schemaForm', locale), locale?.schemaForm, overrides)
}

export function getPaginationLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocalePagination>
): Required<TigerLocalePagination> {
  return resolveLocaleSection(enSection('pagination', locale), locale?.pagination, overrides)
}

export function formatPaginationTotal(
  template: string,
  total: number,
  range: [number, number],
  locale?: string
): string {
  const category = getIntlPluralCategory(total, locale)

  return template
    .replace('{total}', formatIntlNumber(total, locale))
    .replace('{start}', formatIntlNumber(range[0], locale))
    .replace('{end}', formatIntlNumber(range[1], locale))
    .replace('{plural}', category)
}

export function formatPageAriaLabel(template: string, page: number, locale?: string): string {
  return template.replace('{page}', formatIntlNumber(page, locale))
}

export function formatPaginationPageIndicator(
  template: string,
  current: number,
  total: number,
  locale?: string
): string {
  return template
    .replace('{current}', formatIntlNumber(current, locale))
    .replace('{total}', formatIntlNumber(total, locale))
}

export function getTableLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTable>
): Required<TigerLocaleTable> {
  return resolveLocaleSection(enSection('table', locale), locale?.table, overrides)
}

export function formatTableSelectRowAriaLabel(
  template: string,
  row: number,
  locale?: string
): string {
  return template.replace('{row}', formatIntlNumber(row, locale))
}

export function formatTableSortByText(template: string, column: string): string {
  return template.replace('{column}', column)
}

export function formatTableSortButtonName(
  template: string,
  column: string,
  directionLabel: string
): string {
  return `${formatTableSortByText(template, column)}, ${directionLabel}`
}

export function formatTableSelectionCount(template: string, count: number, locale?: string): string {
  return template.replace('{count}', formatIntlNumber(count, locale))
}

export function formatTableSortAnnouncement(
  template: string,
  column: string,
  direction: string
): string {
  return template.replace('{column}', column).replace('{direction}', direction)
}

export function formatTableFilterColumnAriaLabel(template: string, column: string): string {
  return template.replace('{column}', column)
}

export function formatTableGroupHeaderText(
  template: string,
  key: string,
  count: number,
  locale?: string
): string {
  return template.replace('{key}', key).replace('{count}', formatIntlNumber(count, locale))
}

export function getDataExportLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleDataExport>
): Required<TigerLocaleDataExport> {
  return resolveLocaleSection(enSection('dataExport', locale), locale?.dataExport, overrides)
}

export function getDataExportFormatLabel(
  format: DataExportFormat,
  labels: Required<TigerLocaleDataExport>
): string {
  if (format === 'xlsx') return labels.xlsxText
  if (format === 'csv') return labels.csvText
  return labels.markdownText
}

export function getTaskBoardLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTaskBoard>
): Required<TigerLocaleTaskBoard> {
  return resolveLocaleSection(enSection('taskBoard', locale), locale?.taskBoard, overrides)
}

export function getChatWindowLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleChatWindow>
): Required<TigerLocaleChatWindow> {
  return resolveLocaleSection(enSection('chatWindow', locale), locale?.chatWindow, overrides)
}

export function getCodeLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleCode>
): Required<TigerLocaleCode> {
  return resolveLocaleSection(enSection('code', locale), locale?.code, overrides)
}

export function getCommentThreadLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleCommentThread>
): Required<TigerLocaleCommentThread> {
  return resolveLocaleSection(enSection('commentThread', locale), locale?.commentThread, overrides)
}

export function getActivityFeedLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleActivityFeed>
): Required<TigerLocaleActivityFeed> {
  return resolveLocaleSection(enSection('activityFeed', locale), locale?.activityFeed, overrides)
}

export function getNotificationCenterLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleNotificationCenter>
): Required<TigerLocaleNotificationCenter> {
  return resolveLocaleSection(
    enSection('notificationCenter', locale),
    locale?.notificationCenter,
    overrides
  )
}

export function getSelectLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleSelect>
): Required<TigerLocaleSelect> {
  return resolveLocaleSection(enSection('select', locale), locale?.select, overrides)
}

export function getCascaderLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleCascader>
): Required<TigerLocaleCascader> {
  return resolveLocaleSection(enSection('cascader', locale), locale?.cascader, overrides)
}

export function getTreeSelectLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTreeSelect>
): Required<TigerLocaleTreeSelect> {
  return resolveLocaleSection(enSection('treeSelect', locale), locale?.treeSelect, overrides)
}

export function formatSelectLevelLabel(template: string, level: number): string {
  return template.replace('{level}', String(level))
}

export function getColorPickerLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleColorPicker>
): Required<TigerLocaleColorPicker> {
  return resolveLocaleSection(enSection('colorPicker', locale), locale?.colorPicker, overrides)
}

export function formatColorPickerSelectPreset(template: string, color: string): string {
  return template.replace('{color}', color)
}

export function getTabsLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTabs>
): Required<TigerLocaleTabs> {
  return resolveLocaleSection(enSection('tabs', locale), locale?.tabs, overrides)
}

export function getBreadcrumbLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleBreadcrumb>
): Required<TigerLocaleBreadcrumb> {
  return resolveLocaleSection(enSection('breadcrumb', locale), locale?.breadcrumb, overrides)
}

export function getPageHeaderLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocalePageHeader>
): Required<TigerLocalePageHeader> {
  return resolveLocaleSection(enSection('pageHeader', locale), locale?.pageHeader, overrides)
}

export function getBackTopLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleBackTop>
): Required<TigerLocaleBackTop> {
  return resolveLocaleSection(enSection('backTop', locale), locale?.backTop, overrides)
}

export function getAnchorLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleAnchor>
): Required<TigerLocaleAnchor> {
  return resolveLocaleSection(enSection('anchor', locale), locale?.anchor, overrides)
}

export function getFloatButtonLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleFloatButton>
): Required<TigerLocaleFloatButton> {
  return resolveLocaleSection(enSection('floatButton', locale), locale?.floatButton, overrides)
}

export function getFullscreenLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleFullscreen>
): Required<TigerLocaleFullscreen> {
  return resolveLocaleSection(enSection('fullscreen', locale), locale?.fullscreen, overrides)
}

export function getSpotlightLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleSpotlight>
): Required<TigerLocaleSpotlight> {
  return resolveLocaleSection(enSection('spotlight', locale), locale?.spotlight, overrides)
}

export function getScrollSpyLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleScrollSpy>
): Required<TigerLocaleScrollSpy> {
  return resolveLocaleSection(enSection('scrollSpy', locale), locale?.scrollSpy, overrides)
}

export function getStepsLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleSteps>
): Required<TigerLocaleSteps> {
  return resolveLocaleSection(enSection('steps', locale), locale?.steps, overrides)
}

export function getWorkflowTimelineLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleWorkflowTimeline>
): Required<TigerLocaleWorkflowTimeline> {
  return resolveLocaleSection(enSection('workflowTimeline', locale), locale?.workflowTimeline, overrides)
}

export function getWorkflowDetailShellLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocale['workflowDetailShell']>
): Required<NonNullable<TigerLocale['workflowDetailShell']>> {
  return resolveLocaleSection(
    enSection('workflowDetailShell', locale),
    locale?.workflowDetailShell,
    overrides
  )
}

export function getWorkflowDesignerLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleWorkflowDesigner>
): Required<TigerLocaleWorkflowDesigner> {
  return resolveLocaleSection(enSection('workflowDesigner', locale), locale?.workflowDesigner, overrides)
}

export function getRateLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleRate>
): Required<TigerLocaleRate> {
  return resolveLocaleSection(enSection('rate', locale), locale?.rate, overrides)
}

/**
 * Fill `{value}` with an Intl number. The rest of the sentence comes from the locale.
 */
export function formatRateValueText(template: string, value: number, locale?: string): string {
  return template.replace('{value}', formatIntlNumber(value, locale))
}

export function getAvatarGroupLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleAvatarGroup>
): Required<TigerLocaleAvatarGroup> {
  return resolveLocaleSection(enSection('avatarGroup', locale), locale?.avatarGroup, overrides)
}

export function getCarouselLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleCarousel>
): Required<TigerLocaleCarousel> {
  return resolveLocaleSection(enSection('carousel', locale), locale?.carousel, overrides)
}

export function getProgressLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleProgress>
): Required<TigerLocaleProgress> {
  return resolveLocaleSection(enSection('progress', locale), locale?.progress, overrides)
}

export function getTreeLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTree>
): Required<TigerLocaleTree> {
  return resolveLocaleSection(enSection('tree', locale), locale?.tree, overrides)
}

export function formatTreeSelectNodeLabel(template: string, label: string): string {
  return template.replace('{label}', label)
}

export function getSplitterLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleSplitter>
): Required<TigerLocaleSplitter> {
  return resolveLocaleSection(enSection('splitter', locale), locale?.splitter, overrides)
}

export function getResizableLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleResizable>
): Required<TigerLocaleResizable> {
  return resolveLocaleSection(enSection('resizable', locale), locale?.resizable, overrides)
}

export function formatResizableHandleLabel(template: string, handle: string): string {
  return template.replace(/\{handle\}/g, handle)
}

export function getMarqueeLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleMarquee>
): Required<TigerLocaleMarquee> {
  return resolveLocaleSection(enSection('marquee', locale), locale?.marquee, overrides)
}

export function getSidebarAriaLabel(locale?: Partial<TigerLocale>): string {
  return resolveLocaleText(
    locale?.common?.sidebarAriaLabel ?? 'Sidebar',
    locale?.common?.sidebarAriaLabel
  )
}

export function getImageLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleImage>
): Required<TigerLocaleImage> {
  return resolveLocaleSection(enSection('image', locale), locale?.image, overrides)
}

export function getImageCompareLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleImageCompare>
): Required<TigerLocaleImageCompare> {
  return resolveLocaleSection(enSection('imageCompare', locale), locale?.imageCompare, overrides)
}

export function getDescriptionsLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleDescriptions>
): Required<TigerLocaleDescriptions> {
  return resolveLocaleSection(enSection('descriptions', locale), locale?.descriptions, overrides)
}

export function getMasonryLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleMasonry>
): Required<TigerLocaleMasonry> {
  return resolveLocaleSection(enSection('masonry', locale), locale?.masonry, overrides)
}

export function getListLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleList>
): Required<TigerLocaleList> {
  return resolveLocaleSection(enSection('list', locale), locale?.list, overrides)
}

export function getScrollAreaLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleScrollArea>
): Required<TigerLocaleScrollArea> {
  return resolveLocaleSection(enSection('scrollArea', locale), locale?.scrollArea, overrides)
}

export function getPrintLayoutLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocalePrintLayout>
): Required<TigerLocalePrintLayout> {
  return resolveLocaleSection(enSection('printLayout', locale), locale?.printLayout, overrides)
}

export function getTransferLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTransfer>
): Required<TigerLocaleTransfer> {
  return resolveLocaleSection(enSection('transfer', locale), locale?.transfer, overrides)
}

export function getChartLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleChart>
): Required<TigerLocaleChart> {
  return resolveLocaleSection(enSection('chart', locale), locale?.chart, overrides)
}

export function getCodeEditorLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleCodeEditor>
): Required<TigerLocaleCodeEditor> {
  return resolveLocaleSection(enSection('codeEditor', locale), locale?.codeEditor, overrides)
}

export function getMarkdownEditorLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleMarkdownEditor>
): Required<TigerLocaleMarkdownEditor> {
  return resolveLocaleSection(enSection('markdownEditor', locale), locale?.markdownEditor, overrides)
}

export function getRichTextEditorLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleRichTextEditor>
): Required<TigerLocaleRichTextEditor> {
  return resolveLocaleSection(enSection('richTextEditor', locale), locale?.richTextEditor, overrides)
}

export function getCronEditorLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleCronEditor>
): Required<TigerLocaleCronEditor> {
  return resolveLocaleSection(enSection('cronEditor', locale), locale?.cronEditor, overrides)
}

export function getFileManagerLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleFileManager>
): Required<TigerLocaleFileManager> {
  return resolveLocaleSection(enSection('fileManager', locale), locale?.fileManager, overrides)
}

export function getImageViewerLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleImageViewer>
): Required<TigerLocaleImageViewer> {
  return resolveLocaleSection(enSection('imageViewer', locale), locale?.imageViewer, overrides)
}

export function getImageEditorLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleImageEditor>
): Required<TigerLocaleImageEditor> {
  return resolveLocaleSection(enSection('imageEditor', locale), locale?.imageEditor, overrides)
}

export function getStatusLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleStatus>
): Required<TigerLocaleStatus> {
  return resolveLocaleSection(enSection('status', locale), locale?.status, overrides)
}

function pickLocaleText(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) return value
  }
  return ''
}

export function getModalLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleModal>
): Required<TigerLocaleModal> {
  const en = enSection('modal', locale)
  return {
    closeAriaLabel: pickLocaleText(
      overrides?.closeAriaLabel,
      locale?.modal?.closeAriaLabel,
      locale?.common?.closeText,
      en.closeAriaLabel
    ),
    okText: pickLocaleText(
      overrides?.okText,
      locale?.modal?.okText,
      locale?.common?.okText,
      en.okText
    ),
    cancelText: pickLocaleText(
      overrides?.cancelText,
      locale?.modal?.cancelText,
      locale?.common?.cancelText,
      en.cancelText
    ),
    dialogAriaLabel: pickLocaleText(
      overrides?.dialogAriaLabel,
      locale?.modal?.dialogAriaLabel,
      en.dialogAriaLabel
    )
  }
}

export function getDrawerLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleDrawer>
): Required<TigerLocaleDrawer> {
  const en = enSection('drawer', locale)
  return {
    closeAriaLabel: pickLocaleText(
      overrides?.closeAriaLabel,
      locale?.drawer?.closeAriaLabel,
      locale?.common?.closeText,
      en.closeAriaLabel
    ),
    dialogAriaLabel: pickLocaleText(
      overrides?.dialogAriaLabel,
      locale?.drawer?.dialogAriaLabel,
      en.dialogAriaLabel
    )
  }
}

export function getAlertLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleAlert>
): Required<TigerLocaleAlert> {
  return resolveLocaleSection(enSection('alert', locale), locale?.alert, overrides)
}

export function getLoadingLabel(locale?: Partial<TigerLocale>, text?: string): string {
  if (typeof text === 'string' && text.trim().length > 0) return text.trim()
  return resolveLocaleSection(enSection('common', locale), locale?.common).loadingText
}

export function getMessageCloseAriaLabel(locale?: Partial<TigerLocale>, override?: string): string {
  if (typeof override === 'string' && override.trim().length > 0) return override
  return resolveLocaleSection(enSection('common', locale), locale?.common).closeMessageAriaLabel
}

export function getNotificationCloseAriaLabel(
  locale?: Partial<TigerLocale>,
  override?: string
): string {
  if (typeof override === 'string' && override.trim().length > 0) return override
  return resolveLocaleSection(enSection('common', locale), locale?.common).closeNotificationAriaLabel
}

/**
 * Fill `{count}` with an Intl number and `{plural}` with an English suffix
 * (`''` for `one`, `'s'` otherwise). Locales that write a complete sentence
 * omit `{plural}` so they are not given an English `s`.
 */
export function formatBadgeCountLabel(template: string, count: number, locale?: string): string {
  const category = getIntlPluralCategory(count, locale)
  return template
    .replace('{count}', formatIntlNumber(count, locale))
    .replace('{plural}', category === 'one' ? '' : 's')
}

export function getFormValidationLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleFormValidation>
): Required<TigerLocaleFormValidation> {
  return resolveLocaleSection(enSection('formValidation', locale), locale?.formValidation, overrides)
}

export function getInputOTPLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleInputOTP>
): Required<TigerLocaleInputOTP> {
  return resolveLocaleSection(enSection('inputOtp', locale), locale?.inputOtp, overrides)
}

export function getTagsInputLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleTagsInput>
): Required<TigerLocaleTagsInput> {
  return resolveLocaleSection(enSection('tagsInput', locale), locale?.tagsInput, overrides)
}

export function getInputLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleInputLabels>
): Required<TigerLocaleInputLabels> {
  return resolveLocaleSection(enSection('input', locale), locale?.input, overrides)
}

export function getInputNumberLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleInputNumber>
): Required<TigerLocaleInputNumber> {
  return resolveLocaleSection(enSection('inputNumber', locale), locale?.inputNumber, overrides)
}

export function getSliderLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleSlider>
): Required<TigerLocaleSlider> {
  return resolveLocaleSection(enSection('slider', locale), locale?.slider, overrides)
}

export function getSignatureLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleSignature>
): Required<TigerLocaleSignature> {
  const section = resolveLocaleSection(enSection('signature', locale), locale?.signature, overrides)
  const clearText =
    typeof overrides?.clearText === 'string' && overrides.clearText.trim()
      ? overrides.clearText
      : (section.clearText ||
        locale?.common?.clearText ||
        locale?.common?.clearText ||
        'Clear')
  return {
    ...section,
    clearText
  }
}

export interface NumberKeyboardResolvedLabels extends Required<TigerLocaleNumberKeyboard> {
  confirmText: string
}

export function getNumberKeyboardLabels(
  locale?: Partial<TigerLocale>,
  overrides?: Partial<TigerLocaleNumberKeyboard> & { confirmText?: string; deleteText?: string }
): NumberKeyboardResolvedLabels {
  const section = resolveLocaleSection(
    enSection('numberKeyboard', locale),
    locale?.numberKeyboard,
    overrides
  )
  const confirmText =
    typeof overrides?.confirmText === 'string' && overrides.confirmText.trim()
      ? overrides.confirmText
      : (locale?.common?.okText ?? 'OK')
  const deleteText =
    typeof overrides?.deleteText === 'string' && overrides.deleteText.trim()
      ? overrides.deleteText
      : section.deleteText
  return {
    ...section,
    deleteText,
    confirmText
  }
}
