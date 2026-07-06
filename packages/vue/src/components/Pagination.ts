import {
  defineComponent,
  computed,
  ref,
  watch,
  onBeforeUnmount,
  PropType,
  h,
  type VNodeChild
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getTotalPages,
  getPageRange,
  validateCurrentPage,
  getPageNumbers,
  defaultTotalText,
  formatPaginationTotal,
  getPaginationContainerClasses,
  getPaginationButtonBaseClasses,
  getPaginationEllipsisClasses,
  getQuickJumperInputClasses,
  getPageSizeSelectorClasses,
  getTotalTextClasses,
  getSizeTextClasses,
  getPaginationLabels,
  getLocaleDirection,
  formatPageAriaLabel,
  createPaginationIdleValidationScheduler,
  getImmediateTigerLocale,
  getPaginationJumperPage,
  getValidatedPaginationJumperValue,
  isLazyTigerLocale,
  resolveTigerLocale,
  mergeTigerLocale,
  type PaginationSize,
  type PaginationAlign,
  type PaginationPageSizeOptionItem,
  type PaginationIdleValidationScheduler,
  type TigerLocale,
  type TigerLocaleInput,
  type TigerLocalePagination
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VuePaginationProps {
  current?: number
  defaultCurrent?: number
  total?: number
  pageSize?: number
  defaultPageSize?: number
  pageSizeOptions?: PaginationPageSizeOptionItem[]
  showQuickJumper?: boolean
  quickJumperValidation?: {
    delay?: number
    timeout?: number
  }
  showSizeChanger?: boolean
  showTotal?: boolean
  totalText?: (total: number, range: [number, number]) => string
  simple?: boolean
  pageIndicatorText?: (current: number, totalPages: number) => string
  size?: PaginationSize
  align?: PaginationAlign
  disabled?: boolean
  hideOnSinglePage?: boolean
  showLessItems?: boolean
  className?: string
  style?: Record<string, unknown>
  /**
   * Locale configuration for i18n support
   */
  locale?: TigerLocaleInput
  /**
   * Flat custom-text overrides for single-language use (no i18n needed).
   * Takes precedence over `locale` and global ConfigProvider text.
   */
  labels?: Partial<TigerLocalePagination>
}

export const Pagination = defineComponent({
  name: 'TigerPagination',
  inheritAttrs: false,
  props: {
    /**
     * Current page number (1-indexed)
     * @default 1
     */
    current: {
      type: Number,
      default: undefined
    },
    /**
     * Default current page (for uncontrolled mode)
     * @default 1
     */
    defaultCurrent: {
      type: Number,
      default: 1
    },
    /**
     * Total number of items
     * @default 0
     */
    total: {
      type: Number,
      default: 0
    },
    /**
     * Number of items per page
     * @default 10
     */
    pageSize: {
      type: Number,
      default: undefined
    },
    /**
     * Default page size (for uncontrolled mode)
     * @default 10
     */
    defaultPageSize: {
      type: Number,
      default: 10
    },
    /**
     * Available page size options
     * @default [10, 20, 50, 100]
     */
    pageSizeOptions: {
      type: Array as PropType<PaginationPageSizeOptionItem[]>,
      default: () => [10, 20, 50, 100]
    },
    /**
     * Whether to show quick jumper (input for page number)
     * @default false
     */
    showQuickJumper: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to show page size selector
     * @default false
     */
    showSizeChanger: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to show total count
     * @default true
     */
    showTotal: {
      type: Boolean,
      default: true
    },
    /**
     * Custom total text renderer
     */
    totalText: {
      type: Function as PropType<(total: number, range: [number, number]) => string>,
      default: undefined
    },
    /**
     * Simple mode - only show prev/next buttons
     * @default false
     */
    simple: {
      type: Boolean,
      default: false
    },
    /**
     * Custom text renderer for the simple-mode page indicator.
     * Defaults to `{current} / {totalPages}` when not provided.
     */
    pageIndicatorText: {
      type: Function as PropType<(current: number, totalPages: number) => string>,
      default: undefined
    },
    /**
     * Size of pagination
     * @default 'medium'
     */
    size: {
      type: String as PropType<PaginationSize>,
      default: 'medium' as PaginationSize
    },
    /**
     * Alignment of pagination
     * @default 'center'
     */
    align: {
      type: String as PropType<PaginationAlign>,
      default: 'center' as PaginationAlign
    },
    /**
     * Whether pagination is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to hide pagination on single page
     * @default false
     */
    hideOnSinglePage: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to show less items (affects page number range)
     * @default false
     */
    showLessItems: {
      type: Boolean,
      default: false
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    },
    /**
     * Locale configuration for i18n support
     */
    locale: {
      type: [Object, Function] as PropType<TigerLocaleInput>,
      default: undefined
    },
    /**
     * Flat custom-text overrides for single-language use (no i18n needed).
     */
    labels: {
      type: Object as PropType<Partial<TigerLocalePagination>>,
      default: undefined
    },
    quickJumperValidation: {
      type: Object as PropType<{
        delay?: number
        timeout?: number
      }>,
      default: undefined
    }
  },
  emits: ['update:current', 'update:pageSize', 'change', 'page-size-change'],
  setup(props, { emit, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>
    const attrsClass = (attrsRecord as { class?: unknown }).class
    const attrsStyle = (attrsRecord as { style?: unknown }).style

    const config = useTigerConfig()

    const resolvedLocale = ref<Partial<TigerLocale> | undefined>(
      getImmediateTigerLocale(props.locale)
    )
    let localeResolveId = 0
    let disposed = false

    watch(
      () => props.locale,
      (locale) => {
        const resolveId = ++localeResolveId
        const immediateLocale = getImmediateTigerLocale(locale)
        resolvedLocale.value = immediateLocale

        if (!isLazyTigerLocale(locale)) return

        resolveTigerLocale(locale)
          .then((nextLocale) => {
            if (!disposed && resolveId === localeResolveId) {
              resolvedLocale.value = nextLocale
            }
          })
          .catch(() => {
            if (!disposed && resolveId === localeResolveId) {
              resolvedLocale.value = immediateLocale
            }
          })
      },
      { immediate: true }
    )

    // Merge global ConfigProvider locale with the component-level locale
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, resolvedLocale.value))

    // Get resolved locale labels (props.labels has highest precedence)
    const labels = computed(() => getPaginationLabels(mergedLocale.value, props.labels))
    const localeCode = computed(() => mergedLocale.value?.locale)
    const isRtl = computed(() => getLocaleDirection(mergedLocale.value) === 'rtl')

    // Internal state for uncontrolled mode
    const internalCurrent = ref<number>(props.defaultCurrent)
    const internalPageSize = ref<number>(props.defaultPageSize)

    // Quick jumper input value
    const quickJumperValue = ref<string>('')
    let quickJumperValidationScheduler: PaginationIdleValidationScheduler =
      createPaginationIdleValidationScheduler(props.quickJumperValidation)

    watch(
      () => props.quickJumperValidation,
      (options) => {
        quickJumperValidationScheduler.cancel()
        quickJumperValidationScheduler = createPaginationIdleValidationScheduler(options)
      }
    )

    onBeforeUnmount(() => {
      disposed = true
      quickJumperValidationScheduler.cancel()
    })

    // Computed current page (controlled or uncontrolled)
    const currentPage = computed(() => {
      return props.current !== undefined ? props.current : internalCurrent.value
    })

    // Computed page size (controlled or uncontrolled)
    const currentPageSize = computed(() => {
      return props.pageSize !== undefined ? props.pageSize : internalPageSize.value
    })

    // Calculate total pages
    const totalPages = computed(() => {
      return getTotalPages(props.total, currentPageSize.value)
    })

    // Validate and adjust current page
    const validatedCurrentPage = computed(() => {
      return validateCurrentPage(currentPage.value, totalPages.value)
    })

    // Calculate current page range
    const pageRange = computed(() => {
      return getPageRange(validatedCurrentPage.value, currentPageSize.value, props.total)
    })

    // Check if should hide on single page
    const shouldHide = computed(() => {
      return props.hideOnSinglePage && totalPages.value <= 1
    })

    // Handle page change
    const handlePageChange = (page: number) => {
      if (props.disabled) return
      if (page === validatedCurrentPage.value) return
      if (page < 1 || page > totalPages.value) return

      // Update internal state if uncontrolled
      if (props.current === undefined) {
        internalCurrent.value = page
      }

      // Emit events
      emit('update:current', page)
      emit('change', page, currentPageSize.value)
    }

    // Handle page size change
    const handlePageSizeChange = (newPageSize: number) => {
      if (props.disabled) return

      const newTotalPages = getTotalPages(props.total, newPageSize)
      let newPage = validatedCurrentPage.value

      // Adjust current page if it exceeds new total pages
      if (newPage > newTotalPages) {
        newPage = Math.max(1, newTotalPages)
      }

      // Update internal state if uncontrolled
      if (props.pageSize === undefined) {
        internalPageSize.value = newPageSize
      }
      if (props.current === undefined && newPage !== validatedCurrentPage.value) {
        internalCurrent.value = newPage
      }

      // Emit events
      emit('update:pageSize', newPageSize)
      emit('page-size-change', newPage, newPageSize)

      // Also emit change if page changed
      if (newPage !== validatedCurrentPage.value) {
        emit('update:current', newPage)
        emit('change', newPage, newPageSize)
      }
    }

    // Handle quick jumper submit
    const handleQuickJumperSubmit = () => {
      quickJumperValidationScheduler.cancel()
      const page = getPaginationJumperPage(quickJumperValue.value, totalPages.value)
      if (page !== null) {
        handlePageChange(page)
      }
      quickJumperValue.value = ''
    }

    const handleQuickJumperInput = (value: string) => {
      quickJumperValue.value = value
      quickJumperValidationScheduler.schedule(() => {
        quickJumperValue.value = getValidatedPaginationJumperValue(value, totalPages.value)
      })
    }

    // Handle quick jumper keypress
    const handleQuickJumperKeypress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleQuickJumperSubmit()
      }
    }

    // Container classes
    const containerClasses = computed(() => {
      return classNames(
        getPaginationContainerClasses(props.align),
        props.className,
        coerceClassValue(attrsClass)
      )
    })

    const mergedStyle = computed(() => mergeStyleValues(attrsStyle, props.style))

    const normalizedPageSizeOptions = computed(() => {
      return (props.pageSizeOptions || []).map((option) => {
        if (typeof option === 'number') {
          return {
            value: option,
            label: `${option} ${labels.value.itemsPerPageText}`
          }
        }

        const label = option.label ?? `${option.value} ${labels.value.itemsPerPageText}`
        return { value: option.value, label }
      })
    })

    return () => {
      if (shouldHide.value) {
        return null
      }

      const elements: VNodeChild[] = []
      const size = props.size
      const page = validatedCurrentPage.value
      const pages = totalPages.value
      const prevDisabled = page <= 1 || props.disabled
      const nextDisabled = page >= pages || props.disabled

      // Total text
      if (props.showTotal) {
        const totalTextFn =
          props.totalText ||
          (props.labels?.totalText || mergedLocale.value?.pagination?.totalText
            ? (value: number, range: [number, number]) =>
                formatPaginationTotal(labels.value.totalText, value, range, localeCode.value)
            : defaultTotalText)
        elements.push(
          h('span', { class: getTotalTextClasses(size) }, totalTextFn(props.total, pageRange.value))
        )
      }

      // Previous button
      elements.push(
        h(
          'button',
          {
            type: 'button',
            class: getPaginationButtonBaseClasses(size),
            disabled: prevDisabled,
            onClick: () => handlePageChange(page - 1),
            'aria-label': labels.value.prevPageAriaLabel
          },
          isRtl.value ? '›' : '‹'
        )
      )

      if (props.simple) {
        // Simple mode: current / total
        const indicatorText = props.pageIndicatorText
          ? props.pageIndicatorText(page, pages)
          : `${page} / ${pages}`
        elements.push(
          h(
            'span',
            { class: classNames('mx-2', getSizeTextClasses(size)), 'aria-label': indicatorText },
            indicatorText
          )
        )
      } else {
        // Full mode: page number buttons
        getPageNumbers(page, pages, props.showLessItems).forEach((pageNum) => {
          if (pageNum === '...') {
            elements.push(
              h('span', { class: getPaginationEllipsisClasses(size), 'aria-hidden': 'true' }, '...')
            )
          } else {
            const isActive = pageNum === page
            elements.push(
              h(
                'button',
                {
                  type: 'button',
                  class: getPaginationButtonBaseClasses(size, isActive),
                  disabled: props.disabled,
                  onClick: () => handlePageChange(pageNum as number),
                  'aria-label': formatPageAriaLabel(
                    labels.value.pageAriaLabel,
                    pageNum as number,
                    localeCode.value
                  ),
                  'aria-current': isActive ? 'page' : undefined
                },
                String(pageNum)
              )
            )
          }
        })
      }

      // Next button
      elements.push(
        h(
          'button',
          {
            type: 'button',
            class: getPaginationButtonBaseClasses(size),
            disabled: nextDisabled,
            onClick: () => handlePageChange(page + 1),
            'aria-label': labels.value.nextPageAriaLabel
          },
          isRtl.value ? '‹' : '›'
        )
      )

      // Page size selector
      if (props.showSizeChanger) {
        elements.push(
          h(
            'select',
            {
              class: getPageSizeSelectorClasses(size),
              disabled: props.disabled,
              value: currentPageSize.value,
              onChange: (e: Event) => {
                handlePageSizeChange(parseInt((e.target as HTMLSelectElement).value, 10))
              },
              'aria-label': labels.value.itemsPerPageText
            },
            normalizedPageSizeOptions.value.map((sizeOption) =>
              h('option', { value: sizeOption.value, key: sizeOption.value }, sizeOption.label)
            )
          )
        )
      }

      // Quick jumper
      if (props.showQuickJumper) {
        const sizeText = getSizeTextClasses(size)
        elements.push(h('span', { class: classNames('ml-2', sizeText) }, labels.value.jumpToText))
        elements.push(
          h('input', {
            type: 'number',
            class: classNames(getQuickJumperInputClasses(size), 'mx-2'),
            disabled: props.disabled,
            value: quickJumperValue.value,
            onInput: (e: Event) => {
              handleQuickJumperInput((e.target as HTMLInputElement).value)
            },
            onKeydown: handleQuickJumperKeypress,
            min: 1,
            max: pages,
            'aria-label': labels.value.jumpToText
          })
        )
        elements.push(h('span', { class: sizeText }, labels.value.pageText))
      }

      const {
        class: _class,
        style: _style,
        'aria-label': ariaLabelAttr,
        ...restAttrs
      } = attrsRecord as {
        class?: unknown
        style?: unknown
        'aria-label'?: unknown
      } & Record<string, unknown>

      return h(
        'nav',
        {
          ...restAttrs,
          class: containerClasses.value,
          style: mergedStyle.value,
          role: 'navigation',
          'aria-label': typeof ariaLabelAttr === 'string' ? ariaLabelAttr : 'Pagination'
        },
        elements
      )
    }
  }
})

export default Pagination
