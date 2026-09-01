import {
  defineComponent,
  computed,
  ref,
  h,
  inject,
  watch,
  nextTick,
  useId,
  type PropType,
  type CSSProperties,
  type VNode
} from 'vue'
import {
  CASCADER_DEFAULT_LIST_HEIGHT,
  CASCADER_DEFAULT_SEPARATOR,
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  cascaderBackButtonClasses,
  cascaderColumnsClasses,
  cascaderDoneActionClasses,
  cascaderDoneButtonClasses,
  cascaderDropdownClasses,
  cascaderEmptyStateClasses,
  cascaderListboxClasses,
  classNames,
  coerceCascaderFormValue,
  coerceClassValue,
  filterCascaderOptions,
  flattenCascaderOptions,
  formatSelectLevelLabel,
  getCascaderColumnClasses,
  getCascaderColumnOptionId,
  getCascaderColumnStyle,
  getCascaderColumns,
  getCascaderDisplayLabel,
  getCascaderOptionClasses,
  getCascaderOptionKey,
  getCascaderRootClasses,
  getCascaderTriggerClasses,
  getCascaderTriggerKeyIntent,
  getCascaderVirtualItemHeight,
  getCascaderVirtualRange,
  getEmptyLabels,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerNavigationIndex,
  getPickerOptionAria,
  getPickerOptionId,
  getSelectLabels,
  icon20ViewBox,
  chevronDownSolidIcon20PathD,
  chevronRightSolidIcon20PathD,
  closeSolidIcon20PathD,
  initialCascaderColumnActiveIndices,
  isCascaderOptionExpandable,
  isCascaderValueEmpty,
  isSelectTypeaheadCharacter,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  navigateCascaderColumnIndex,
  normalizeCascaderValue,
  rememberCascaderLabel,
  resolveCascaderActivePath,
  runShakeAnimation,
  selectChevronWrapClasses,
  selectChromeIconClasses,
  selectClearButtonClasses,
  selectClearIconClasses,
  selectTrailingSlotClasses,
  serializeCascaderFormValue,
  setCascaderOptionChildren,
  shouldShowCascaderClear,
  type CascaderExpandTrigger,
  type CascaderFlattenedOption,
  type CascaderLoadDataFn,
  type CascaderModelValue,
  type CascaderOption,
  type CascaderSearchConfig,
  type CascaderValue,
  type ComponentSize,
  type FloatingPlacement,
  type InputStatus,
  type TigerLocale,
  type TigerLocaleSelect
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { renderVueOverlayTeleport, useVueAnchoredOverlay } from '../utils/overlay'
import { INPUT_GROUP_INJECTION_KEY, type InputGroupContext } from './InputGroup'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

function iconVNode(path: string, className: string) {
  return h(
    'svg',
    {
      class: className,
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: icon20ViewBox,
      fill: 'currentColor',
      'aria-hidden': 'true',
      focusable: 'false'
    },
    [
      h('path', {
        'fill-rule': 'evenodd',
        d: path,
        'clip-rule': 'evenodd'
      })
    ]
  )
}

export interface VueCascaderProps {
  modelValue?: CascaderModelValue
  defaultValue?: CascaderModelValue
  open?: boolean
  defaultOpen?: boolean
  options?: CascaderOption[]
  placeholder?: string
  size?: ComponentSize
  disabled?: boolean
  clearable?: boolean
  searchable?: boolean | CascaderSearchConfig
  searchValue?: string
  defaultSearchValue?: string
  expandTrigger?: CascaderExpandTrigger
  changeOnSelect?: boolean
  separator?: string
  emptyText?: string
  virtual?: boolean
  listHeight?: number
  loading?: boolean
  loadData?: CascaderLoadDataFn
  status?: InputStatus
  name?: string
  placement?: FloatingPlacement
  offset?: number
  dropdownClassName?: string
  getPopupContainer?: () => HTMLElement | null
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleSelect>
  className?: string
}

export type CascaderProps = VueCascaderProps
export type { CascaderOption, CascaderValue, CascaderModelValue }

export const Cascader = defineComponent({
  name: 'TigerCascader',
  inheritAttrs: false,
  props: {
    modelValue: { type: Array as PropType<CascaderValue>, default: undefined },
    defaultValue: { type: Array as PropType<CascaderValue>, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    options: { type: Array as PropType<CascaderOption[]>, default: () => [] },
    placeholder: { type: String, default: undefined },
    size: { type: String as PropType<ComponentSize>, default: 'md' as ComponentSize },
    disabled: Boolean,
    clearable: { type: Boolean, default: true },
    searchable: {
      type: [Boolean, Object] as PropType<boolean | CascaderSearchConfig>,
      default: false
    },
    searchValue: { type: String, default: undefined },
    defaultSearchValue: { type: String, default: '' },
    expandTrigger: { type: String as PropType<CascaderExpandTrigger>, default: 'click' },
    changeOnSelect: Boolean,
    separator: { type: String, default: CASCADER_DEFAULT_SEPARATOR },
    emptyText: { type: String, default: undefined },
    virtual: Boolean,
    listHeight: { type: Number, default: CASCADER_DEFAULT_LIST_HEIGHT },
    loading: Boolean,
    loadData: { type: Function as PropType<CascaderLoadDataFn> },
    status: { type: String as PropType<InputStatus>, default: undefined },
    name: String,
    placement: { type: String as PropType<FloatingPlacement>, default: 'bottom-start' },
    offset: { type: Number, default: 4 },
    dropdownClassName: String,
    getPopupContainer: { type: Function as PropType<() => HTMLElement | null> },
    locale: { type: Object as PropType<Partial<TigerLocale>> },
    labels: { type: Object as PropType<Partial<TigerLocaleSelect>> },
    className: String
  },
  emits: [
    'update:modelValue',
    'update:searchValue',
    'update:open',
    'change',
    'search-change',
    'open-change',
    'blur'
  ],
  setup(props, { emit, attrs, expose }) {
    const config = useTigerConfig()
    const inputGroup = inject<InputGroupContext | null>(INPUT_GROUP_INJECTION_KEY, null)
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getSelectLabels(mergedLocale.value, props.labels))
    const emptyLabels = computed(() => getEmptyLabels(mergedLocale.value))
    const dir = computed<'ltr' | 'rtl'>(() => (config.value.direction === 'rtl' ? 'rtl' : 'ltr'))
    const instanceId = useId()
    const listboxId = computed(() => `tiger-cascader-listbox-${instanceId}`)

    const localValue = ref<CascaderModelValue>(
      normalizeCascaderValue(
        props.modelValue ??
          coerceCascaderFormValue(formItemControl?.value.value) ??
          props.defaultValue
      )
    )
    const localOpen = ref(props.defaultOpen)
    const localSearch = ref(props.defaultSearchValue)
    const loadedOptions = ref<CascaderOption[] | null>(null)
    const loadingKeys = ref(new Set<string>())
    const activePath = ref<CascaderValue>([])
    const columnActiveIndices = ref<number[]>([])
    const focusedColumnIndex = ref(0)
    const searchActiveIndex = ref(-1)
    const columnScrollTops = ref<number[]>([])
    const searchScrollTop = ref(0)
    const labelCache = new Map<string, string>()
    const rootRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const searchInputRef = ref<HTMLInputElement | null>(null)
    const dropdownRef = ref<HTMLElement | null>(null)

    const selected = computed(() =>
      props.modelValue !== undefined
        ? normalizeCascaderValue(props.modelValue)
        : (coerceCascaderFormValue(formItemControl?.value.value) ?? localValue.value)
    )
    const isOpen = computed(() => (props.open !== undefined ? props.open : localOpen.value))
    const searchQuery = computed(() => props.searchValue ?? localSearch.value)
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )
    const options = computed(() => loadedOptions.value ?? props.options)
    const hasLoadData = computed(() => typeof props.loadData === 'function')
    const columns = computed(() =>
      getCascaderColumns(options.value, activePath.value, hasLoadData.value)
    )
    const isSearchMode = computed(() => Boolean(props.searchable) && searchQuery.value.length > 0)
    const flattened = computed(() =>
      props.searchable
        ? flattenCascaderOptions(options.value, [], [], props.changeOnSelect, props.separator)
        : []
    )
    const searchResults = computed(() =>
      isSearchMode.value
        ? filterCascaderOptions(flattened.value, searchQuery.value, props.searchable)
        : []
    )
    const placeholderText = computed(() => props.placeholder ?? labels.value.placeholder)
    const displayLabel = computed(() =>
      getCascaderDisplayLabel(options.value, selected.value, props.separator, labelCache)
    )
    const displayText = computed(() =>
      isCascaderValueEmpty(selected.value) ? placeholderText.value : displayLabel.value
    )
    const emptyCopy = computed(() =>
      props.loading
        ? labels.value.loadingText
        : props.emptyText?.trim()
          ? props.emptyText
          : emptyLabels.value.noResults
    )
    const showClear = computed(() =>
      shouldShowCascaderClear({
        clearable: props.clearable,
        disabled: effectiveDisabled.value,
        value: selected.value
      })
    )
    const itemHeight = computed(() => getCascaderVirtualItemHeight(props.size))

    watch(
      () => [props.modelValue, formItemControl?.value.value] as const,
      ([model, formValue]) => {
        const next = model !== undefined ? model : coerceCascaderFormValue(formValue)
        if (next === undefined) return
        localValue.value = normalizeCascaderValue(next)
      }
    )
    watch(
      () => [status.value, formItemControl?.shakeTrigger.value] as const,
      (current, previous) => {
        if (!previous) return
        if (current[0] === 'error') runShakeAnimation(rootRef.value)
      },
      { flush: 'post' }
    )
    watch(
      () => props.options,
      () => {
        loadedOptions.value = null
      }
    )

    function setOpen(next: boolean) {
      if (props.open === undefined) localOpen.value = next
      emit('update:open', next)
      emit('open-change', next)
    }
    function setSearch(query: string) {
      if (props.searchValue === undefined) localSearch.value = query
      emit('update:searchValue', query)
      emit('search-change', query)
    }
    function setSelected(next: CascaderModelValue) {
      const normalized = normalizeCascaderValue(next)
      if (props.modelValue === undefined) localValue.value = normalized
      emit('update:modelValue', normalized)
      emit('change', normalized)
      formItemControl?.onChange(normalized)
    }
    function closeDropdown() {
      setOpen(false)
    }
    function openDropdown() {
      if (effectiveDisabled.value) return
      setOpen(true)
    }
    function toggleDropdown() {
      if (effectiveDisabled.value) return
      if (isOpen.value) closeDropdown()
      else openDropdown()
    }
    function focusCombobox() {
      triggerRef.value?.focus()
    }
    function commitPath(path: CascaderValue, close: boolean) {
      const normalized = normalizeCascaderValue(path)
      const label = getCascaderDisplayLabel(options.value, normalized, props.separator)
      if (normalized) rememberCascaderLabel(labelCache, normalized, label)
      setSelected(normalized)
      if (close) {
        closeDropdown()
        nextTick(() => triggerRef.value?.focus())
      }
    }

    const overlay = useVueAnchoredOverlay({
      enabled: isOpen,
      referenceRef: triggerRef,
      floatingRef: dropdownRef,
      placement: () => props.placement ?? 'bottom-start',
      offset: () => props.offset ?? 4,
      layout: 'fullscreen-sm',
      matchReferenceWidth: () => isSearchMode.value,
      dismissOnOutside: true,
      dismissOnEscape: true,
      restoreFocusOnDismiss: true,
      getContainer: () => props.getPopupContainer?.() ?? null,
      onDismiss: closeDropdown
    })

    async function loadChildren(option: CascaderOption, path: CascaderValue) {
      if (!props.loadData) return
      const key = path.map(String).join('/')
      const nextKeys = new Set(loadingKeys.value)
      nextKeys.add(key)
      loadingKeys.value = nextKeys
      try {
        const children = await props.loadData(option)
        loadedOptions.value = setCascaderOptionChildren(
          loadedOptions.value ?? props.options,
          path,
          children
        )
      } finally {
        const after = new Set(loadingKeys.value)
        after.delete(key)
        loadingKeys.value = after
      }
    }

    function activateOption(option: CascaderOption, colIndex: number, commitLeaf: boolean) {
      if (option.disabled || effectiveDisabled.value) return
      const nextPath = [...activePath.value.slice(0, colIndex), option.value]
      activePath.value = nextPath
      const expandable = isCascaderOptionExpandable(option, hasLoadData.value)
      if (expandable && (!option.children || option.children.length === 0) && props.loadData) {
        void loadChildren(option, nextPath)
        if (props.changeOnSelect) commitPath(nextPath, false)
        return
      }
      if (expandable) {
        if (props.changeOnSelect && commitLeaf) commitPath(nextPath, false)
        focusedColumnIndex.value = colIndex + 1
        return
      }
      if (commitLeaf) commitPath(nextPath, true)
    }

    function handleOptionClick(option: CascaderOption, colIndex: number) {
      activateOption(option, colIndex, true)
    }
    function handleOptionHover(option: CascaderOption, colIndex: number) {
      if (props.expandTrigger !== 'hover' || option.disabled) return
      if (!isCascaderOptionExpandable(option, hasLoadData.value)) return
      activateOption(option, colIndex, false)
    }
    function handleSearchResultClick(item: CascaderFlattenedOption) {
      if (item.disabled) return
      commitPath(item.valuePath, true)
    }
    function clearSelection(event?: Event) {
      event?.stopPropagation()
      commitPath([], true)
    }

    function getCurrentColumnIndex() {
      const last = columns.value.length - 1
      if (last < 0) return 0
      if (focusedColumnIndex.value >= 0 && focusedColumnIndex.value <= last) {
        return focusedColumnIndex.value
      }
      return last
    }

    function commitActiveOption() {
      if (isSearchMode.value) {
        const item = searchResults.value[searchActiveIndex.value]
        if (item) handleSearchResultClick(item)
        return
      }
      const colIndex = getCurrentColumnIndex()
      const col = columns.value[colIndex]
      const idx = columnActiveIndices.value[colIndex] ?? -1
      const option = col?.options[idx]
      if (option) handleOptionClick(option, colIndex)
    }

    function handleKeyDown(event: KeyboardEvent, fromSearchInput = false) {
      if (effectiveDisabled.value) return
      if (!isOpen.value && isSelectTypeaheadCharacter(event.key, event)) {
        event.preventDefault()
        openDropdown()
        if (props.searchable) setSearch(event.key)
        return
      }
      const intent = getCascaderTriggerKeyIntent({
        key: event.key,
        open: isOpen.value,
        searchable: Boolean(props.searchable),
        searchMode: isSearchMode.value,
        clearable: props.clearable,
        hasValue: !isCascaderValueEmpty(selected.value),
        fromSearchInput,
        dir: dir.value
      })
      switch (intent.type) {
        case 'open':
          event.preventDefault()
          openDropdown()
          return
        case 'close':
          if (event.key !== 'Tab') event.preventDefault()
          closeDropdown()
          triggerRef.value?.focus()
          return
        case 'clear':
          event.preventDefault()
          clearSelection()
          return
        case 'prevent-scroll':
          event.preventDefault()
          openDropdown()
          return
        case 'navigate': {
          event.preventDefault()
          if (isSearchMode.value) {
            searchActiveIndex.value = getPickerNavigationIndex(
              searchResults.value,
              searchActiveIndex.value,
              intent.key,
              (item) => item.disabled
            )
            return
          }
          const colIndex = getCurrentColumnIndex()
          const col = columns.value[colIndex]
          if (!col) return
          const next = columnActiveIndices.value.slice()
          next[colIndex] = navigateCascaderColumnIndex(
            col.options,
            next[colIndex] ?? -1,
            intent.key
          )
          columnActiveIndices.value = next
          focusedColumnIndex.value = colIndex
          return
        }
        case 'into': {
          event.preventDefault()
          const colIndex = getCurrentColumnIndex()
          const col = columns.value[colIndex]
          const idx = columnActiveIndices.value[colIndex] ?? -1
          const option = col?.options[idx]
          if (option && isCascaderOptionExpandable(option, hasLoadData.value)) {
            handleOptionClick(option, colIndex)
          }
          return
        }
        case 'out': {
          event.preventDefault()
          if (activePath.value.length > 0) {
            activePath.value = activePath.value.slice(0, -1)
            focusedColumnIndex.value = Math.max(0, getCurrentColumnIndex() - 1)
          }
          return
        }
        case 'select-active':
          event.preventDefault()
          commitActiveOption()
          return
        default:
          return
      }
    }

    function handleFocusOut(event: FocusEvent) {
      const next = event.relatedTarget as Node | null
      if (
        (rootRef.value && next && rootRef.value.contains(next)) ||
        (dropdownRef.value && next && dropdownRef.value.contains(next))
      ) {
        return
      }
      formItemControl?.onBlur()
      emit('blur', event)
    }

    watch(isOpen, (open) => {
      if (!open) return
      const nextPath = resolveCascaderActivePath(selected.value)
      activePath.value = nextPath
      const nextColumns = getCascaderColumns(options.value, nextPath, hasLoadData.value)
      columnActiveIndices.value = initialCascaderColumnActiveIndices(nextColumns)
      focusedColumnIndex.value = Math.max(0, nextColumns.length - 1)
      searchActiveIndex.value = 0
      if (props.searchable) nextTick(() => searchInputRef.value?.focus())
    })

    expose({ focus: focusCombobox, open: openDropdown, close: closeDropdown })

    return () => {
      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs
      const ariaLabel =
        typeof restAttrs['aria-label'] === 'string' ? restAttrs['aria-label'] : undefined
      const attrLabelledby =
        typeof restAttrs['aria-labelledby'] === 'string' ? restAttrs['aria-labelledby'] : undefined
      const labelledby = attrLabelledby?.trim() ? attrLabelledby : formItemControl?.labelId.value
      const describedBy = mergeAriaDescribedBy(
        typeof restAttrs['aria-describedby'] === 'string'
          ? restAttrs['aria-describedby']
          : undefined,
        formItemControl?.describedBy.value
      )
      const attrId = typeof restAttrs.id === 'string' ? restAttrs.id : undefined
      const effectiveId = attrId ?? formItemControl?.id.value
      const effectiveName = props.name ?? formItemControl?.name.value
      const colIndex = getCurrentColumnIndex()
      const currentOpt = columnActiveIndices.value[colIndex] ?? -1
      const activeOptionId = !isOpen.value
        ? undefined
        : isSearchMode.value
          ? searchActiveIndex.value >= 0
            ? getPickerOptionId(listboxId.value, searchActiveIndex.value)
            : undefined
          : currentOpt >= 0
            ? getCascaderColumnOptionId(listboxId.value, colIndex, currentOpt)
            : undefined
      const comboboxAria = getPickerComboboxAria({
        expanded: isOpen.value,
        listboxId: listboxId.value,
        activeOptionId
      })
      const listboxAria = getPickerListboxAria({
        id: listboxId.value,
        label: isSearchMode.value
          ? undefined
          : formatSelectLevelLabel(labels.value.levelLabel, colIndex + 1)
      })
      const triggerClasses = getCascaderTriggerClasses({
        size: props.size,
        disabled: effectiveDisabled.value,
        isOpen: isOpen.value,
        status: status.value,
        hasClear: showClear.value
      })
      const comboboxProps = {
        ...comboboxAria,
        id: effectiveId,
        'aria-label': ariaLabel,
        'aria-labelledby': labelledby,
        'aria-describedby': describedBy,
        'aria-invalid': status.value === 'error' ? true : undefined,
        'aria-required': formItemControl?.required.value ? true : undefined,
        'aria-autocomplete': props.searchable ? 'list' : 'none'
      }
      const searchOpen = Boolean(props.searchable) && isOpen.value
      let trigger: VNode
      if (searchOpen) {
        trigger = h('input', {
          ref: (node) => {
            const el = node instanceof HTMLInputElement ? node : null
            searchInputRef.value = el
            triggerRef.value = el
          },
          type: 'text',
          class: classNames(triggerClasses, 'bg-transparent'),
          disabled: effectiveDisabled.value,
          value: searchQuery.value,
          placeholder: displayText.value,
          onInput: (event: Event) => setSearch((event.target as HTMLInputElement).value),
          onKeydown: (event: KeyboardEvent) => handleKeyDown(event, true),
          onFocusout: handleFocusOut,
          ...comboboxProps
        })
      } else {
        trigger = h(
          'div',
          {
            ref: triggerRef,
            tabindex: effectiveDisabled.value ? -1 : 0,
            class: triggerClasses,
            onClick: toggleDropdown,
            onKeydown: (event: KeyboardEvent) => handleKeyDown(event, false),
            onFocusout: handleFocusOut,
            ...comboboxProps
          },
          [
            h(
              'span',
              {
                class: classNames(
                  'flex-1 truncate',
                  displayText.value === placeholderText.value &&
                    'text-[var(--tiger-text-muted,#9ca3af)]'
                )
              },
              displayText.value
            )
          ]
        )
      }

      function renderOptionRow(option: CascaderOption, c: number, i: number) {
        const isSelected =
          columns.value[c]?.selectedValue === option.value ||
          (selected.value ?? [])[c] === option.value
        const isActive = (columnActiveIndices.value[c] ?? -1) === i
        return h(
          'div',
          {
            key: getCascaderOptionKey(option, i),
            id:
              c === focusedColumnIndex.value
                ? getCascaderColumnOptionId(listboxId.value, c, i)
                : undefined,
            'data-option-index': i,
            'data-active': isActive || undefined,
            class: getCascaderOptionClasses({
              isSelected,
              isDisabled: Boolean(option.disabled),
              isActive,
              size: props.size
            }),
            style: { height: `${itemHeight.value}px` },
            ...getPickerOptionAria({ selected: isSelected, disabled: Boolean(option.disabled) }),
            onMousedown: (event: MouseEvent) => event.preventDefault(),
            onMouseenter: () => handleOptionHover(option, c),
            onClick: () => handleOptionClick(option, c)
          },
          [
            h('span', { class: 'flex-1 truncate' }, option.label),
            isCascaderOptionExpandable(option, hasLoadData.value)
              ? h(
                  'span',
                  { class: dir.value === 'rtl' ? 'inline-flex rotate-180' : 'inline-flex' },
                  [
                    iconVNode(
                      chevronRightSolidIcon20PathD,
                      'w-4 h-4 text-[var(--tiger-text-muted,#9ca3af)]'
                    )
                  ]
                )
              : null
          ]
        )
      }

      function renderSearchRow(item: CascaderFlattenedOption, index: number) {
        const isSelected = (selected.value ?? []).join('\0') === item.valuePath.join('\0')
        const isActive = searchActiveIndex.value === index
        const label =
          typeof props.searchable === 'object' && props.searchable.render
            ? props.searchable.render(searchQuery.value, item.path)
            : item.label
        return h(
          'div',
          {
            key: `${index}-${item.valuePath.join(',')}`,
            id: getPickerOptionId(listboxId.value, index),
            'data-option-index': index,
            'data-active': isActive || undefined,
            class: getCascaderOptionClasses({
              isSelected,
              isDisabled: item.disabled,
              isActive,
              size: props.size
            }),
            style: { height: `${itemHeight.value}px` },
            ...getPickerOptionAria({ selected: isSelected, disabled: item.disabled }),
            onMousedown: (event: MouseEvent) => event.preventDefault(),
            onMouseenter: () => {
              if (!item.disabled) searchActiveIndex.value = index
            },
            onClick: () => handleSearchResultClick(item)
          },
          [h('span', { class: 'flex-1 truncate' }, label)]
        )
      }

      function renderVirtual<T>(
        items: T[],
        scrollTop: number,
        onScrollTop: (top: number) => void,
        renderItem: (item: T, index: number) => ReturnType<typeof h>
      ) {
        const range = getCascaderVirtualRange(
          scrollTop,
          props.listHeight,
          items.length,
          itemHeight.value
        )
        return h(
          'div',
          {
            style: { height: `${props.listHeight}px`, overflow: 'auto' },
            onScroll: (event: Event) => onScrollTop((event.target as HTMLElement).scrollTop)
          },
          [
            h('div', { style: { height: `${range.totalHeight}px`, position: 'relative' } }, [
              h(
                'div',
                { style: { transform: `translateY(${range.offsetTop}px)` } },
                items
                  .slice(range.startIndex, range.endIndex + 1)
                  .map((item, offset) => renderItem(item, range.startIndex + offset))
              )
            ])
          ]
        )
      }

      let body: ReturnType<typeof h> | ReturnType<typeof h>[]
      if (isSearchMode.value) {
        body =
          searchResults.value.length === 0
            ? h('div', { class: cascaderEmptyStateClasses }, emptyCopy.value)
            : h(
                'div',
                {
                  class: cascaderListboxClasses,
                  style: { maxHeight: `${props.listHeight}px` },
                  ...listboxAria
                },
                props.virtual
                  ? [
                      renderVirtual(
                        searchResults.value,
                        searchScrollTop.value,
                        (top) => {
                          searchScrollTop.value = top
                        },
                        renderSearchRow
                      )
                    ]
                  : searchResults.value.map(renderSearchRow)
              )
      } else if (columns.value.length === 0) {
        body = h('div', { class: cascaderEmptyStateClasses }, emptyCopy.value)
      } else {
        const columnBody: ReturnType<typeof h>[] = []
        if (focusedColumnIndex.value > 0) {
          columnBody.push(
            h(
              'button',
              {
                type: 'button',
                class: cascaderBackButtonClasses,
                'data-tiger-cascader-back': '',
                onMousedown: (event: MouseEvent) => event.preventDefault(),
                onClick: () => {
                  focusedColumnIndex.value = Math.max(0, focusedColumnIndex.value - 1)
                }
              },
              labels.value.backText
            )
          )
        }
        columnBody.push(
          h(
            'div',
            { class: cascaderColumnsClasses },
            columns.value.map((column, c) => {
              const focused = c === focusedColumnIndex.value
              return h(
                'div',
                {
                  key: c,
                  class: getCascaderColumnClasses(focused),
                  style: getCascaderColumnStyle(props.listHeight),
                  'data-focused': focused || undefined,
                  'aria-label': formatSelectLevelLabel(labels.value.levelLabel, c + 1),
                  ...(focused ? listboxAria : {})
                },
                column.options.length === 0
                  ? [h('div', { class: cascaderEmptyStateClasses }, emptyCopy.value)]
                  : props.virtual
                    ? [
                        renderVirtual(
                          column.options,
                          columnScrollTops.value[c] ?? 0,
                          (top) => {
                            const next = columnScrollTops.value.slice()
                            next[c] = top
                            columnScrollTops.value = next
                          },
                          (option, i) => renderOptionRow(option, c, i)
                        )
                      ]
                    : column.options.map((option, i) => renderOptionRow(option, c, i))
              )
            })
          )
        )
        body = columnBody
      }

      const dropdown = isOpen.value
        ? renderVueOverlayTeleport(
            h(
              'div',
              {
                ref: dropdownRef,
                class: classNames(
                  cascaderDropdownClasses,
                  overlay.floatingClasses.value,
                  props.dropdownClassName
                ),
                style: overlay.floatingStyles.value as CSSProperties,
                'data-positioned': overlay.positioned.value,
                'data-tiger-cascader-dropdown': '',
                onMousedown: (event: MouseEvent) => event.preventDefault(),
                onFocusout: handleFocusOut
              },
              [
                body,
                h('div', { class: cascaderDoneActionClasses }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: cascaderDoneButtonClasses,
                      'data-tiger-cascader-done': '',
                      onMousedown: (event: MouseEvent) => event.preventDefault(),
                      onClick: closeDropdown
                    },
                    labels.value.doneText
                  )
                ])
              ]
            ),
            overlay.target.value
          )
        : null

      const hiddenValue = effectiveName ? serializeCascaderFormValue(selected.value) : undefined

      return h(
        'div',
        {
          ref: rootRef,
          class: getCascaderRootClasses(
            inputGroup != null,
            classNames(props.className, coerceClassValue(attrClass))
          ),
          style: (attrStyle as CSSProperties) ?? undefined,
          'data-testid': 'cascader',
          [TIGER_CHROME_ATTR]: '',
          onAnimationend: () => rootRef.value?.classList.remove(SHAKE_CLASS)
        },
        [
          h('div', { class: 'relative' }, [
            trigger,
            h('span', { class: selectTrailingSlotClasses }, [
              showClear.value
                ? h(
                    'button',
                    {
                      type: 'button',
                      class: selectClearButtonClasses,
                      'data-tiger-cascader-clear': '',
                      'aria-label': labels.value.clearAriaLabel,
                      onMousedown: (event: MouseEvent) => event.preventDefault(),
                      onClick: clearSelection
                    },
                    iconVNode(closeSolidIcon20PathD, selectClearIconClasses)
                  )
                : null,
              h(
                'span',
                {
                  class: classNames(selectChevronWrapClasses, isOpen.value && 'rotate-180'),
                  'aria-hidden': 'true'
                },
                iconVNode(chevronDownSolidIcon20PathD, selectChromeIconClasses)
              )
            ])
          ]),
          hiddenValue !== undefined
            ? h('input', { type: 'hidden', name: effectiveName, value: hiddenValue })
            : null,
          dropdown
        ]
      )
    }
  }
})
