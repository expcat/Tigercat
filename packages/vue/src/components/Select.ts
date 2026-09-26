import {
  defineComponent,
  computed,
  ref,
  h,
  inject,
  watch,
  nextTick,
  onBeforeUnmount,
  useId,
  type PropType,
  type CSSProperties,
  type VNode
} from 'vue'
import { icon20ViewBox } from '@expcat/tigercat-core/icons/picker'
import {
  classNames,
  coerceClassValue,
  TIGER_CHROME_ATTR,
  SHAKE_CLASS,
  runShakeAnimation,
  mergeAriaDescribedBy,
  getSelectTriggerClasses,
  getSelectOptionClasses,
  getSelectRootClasses,
  selectDoneActionClasses,
  selectDoneButtonClasses,
  selectDropdownBaseClasses,
  selectGroupLabelClasses,
  selectEmptyStateClasses,
  popupListInlinePaddingClass,
  selectListboxClasses,
  selectTagClasses,
  selectTagListClasses,
  selectTagRemoveClasses,
  selectTrailingSlotClasses,
  selectClearButtonClasses,
  selectChevronWrapClasses,
  selectCheckIconClasses,
  selectChromeIconClasses,
  selectClearIconClasses,
  createSelectSearchDebouncer,
  createSelectTypeaheadBuffer,
  getCreateSelectOptionLabel,
  flattenSelectOptions,
  resolveCreatableSelectOption,
  resolveSelectFilteredOptions,
  getSelectVirtualRowHeight,
  getSelectVirtualWindow,
  getSelectActiveAlignScrollTop,
  createSelectScrollScheduler,
  focusAfterPaint,
  selectRowGroupLabel,
  shouldVirtualizeSelectList,
  withCreatedSelectOptions,
  shouldCreateSelectQuery,
  shouldSubmitNativeField,
  isSelectValueEmpty,
  removeLastSelectValue,
  removeSelectValue,
  resolveSelectTags,
  getSelectRowIndexForOption,
  buildSelectListRows,
  getPickerOptionAria,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerOptionId,
  resolveLocaleText,
  mergeTigerLocale,
  getSelectLabels,
  getW9FormLabels,
  collapsedTagSummary,
  normalizeSelectValue,
  pruneCreatedSelectOptions,
  rememberSelectOptions,
  resolveSelectDisplayText,
  commitSelectOption,
  normalizeSelectOptions,
  selectAllSelectValues,
  clearSelectValue,
  getSelectSelectedValues,
  getSelectTriggerKeyIntent,
  findSelectTypeaheadIndex,
  isSelectTypeaheadCharacter,
  isSelectOptionSelected,
  shouldShowSelectClear,
  navigateSelectActiveIndex,
  getSelectClosedHomeEndIndex,
  serializeSelectFormValues,
  coerceSelectFormValue,
  type SelectOption,
  type SelectOptionFields,
  type SelectOptions,
  type ComponentSize,
  type SelectModelValue,
  type SelectSearchDebouncer,
  type InputStatus,
  type TigerLocale,
  type TigerLocaleSelect,
  type SelectFilterOption,
  type SelectOptionSlotContext,
  type FloatingPlacement,
  type SelectListRow
} from '@expcat/tigercat-core'
import {
  chevronDownSolidIcon20PathD,
  closeSolidIcon20PathD,
  checkSolidIcon20PathD
} from '@expcat/tigercat-core/icons/picker'
import { useTigerConfig } from './tiger-config'
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

export interface VueSelectProps {
  modelValue?: SelectModelValue
  defaultValue?: SelectModelValue
  open?: boolean
  defaultOpen?: boolean
  /**
   * Options list (can be flat list or grouped)
   * @default []
   */
  options?: SelectOptions
  size?: ComponentSize
  disabled?: boolean
  placeholder?: string
  /**
   * Whether to allow search/filter
   * @default false
   */
  searchable?: boolean
  searchValue?: string
  defaultSearchValue?: string
  /**
   * Whether to allow multiple selection
   * @default false
   */
  multiple?: boolean
  clearable?: boolean
  emptyText?: string
  maxTagCount?: number
  virtual?: boolean
  remote?: boolean
  searchDebounce?: number
  creatable?: boolean
  createOptionText?: string
  listHeight?: number
  autoClearSearchValue?: boolean
  loading?: boolean
  status?: InputStatus
  name?: string
  filterOption?: SelectFilterOption
  placement?: FloatingPlacement
  offset?: number
  dropdownClassName?: string
  getPopupContainer?: () => HTMLElement | null
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleSelect>
  className?: string
}

export type SelectProps = VueSelectProps
export type { SelectOption, SelectOptions } from '@expcat/tigercat-core'

export const Select = defineComponent({
  name: 'TigerSelect',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number, Array] as PropType<SelectModelValue> },
    defaultValue: { type: [String, Number, Array] as PropType<SelectModelValue> },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    options: { type: Array as PropType<SelectOptions>, default: () => [] },
    size: { type: String as PropType<ComponentSize>, default: 'md' as ComponentSize },
    disabled: Boolean,
    placeholder: { type: String, default: undefined },
    searchable: Boolean,
    searchValue: { type: String, default: undefined },
    defaultSearchValue: { type: String, default: '' },
    multiple: Boolean,
    clearable: { type: Boolean, default: true },
    emptyText: { type: String, default: undefined },
    maxTagCount: { type: Number, default: undefined },
    maxCount: { type: Number, default: undefined },
    readOnly: Boolean,
    optionFields: { type: Object as PropType<SelectOptionFields>, default: undefined },
    virtual: Boolean,
    remote: Boolean,
    searchDebounce: { type: Number, default: 0 },
    creatable: Boolean,
    createOptionText: { type: String, default: undefined },
    listHeight: { type: Number, default: 256 },
    autoClearSearchValue: { type: Boolean, default: true },
    loading: Boolean,
    status: { type: String as PropType<InputStatus>, default: undefined },
    name: String,
    filterOption: { type: Function as PropType<SelectFilterOption> },
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
    'create',
    'open-change',
    'blur'
  ],
  setup(props, { emit, attrs, slots, expose }) {
    const sourceOptions = computed(() => normalizeSelectOptions(props.options, props.optionFields))
    const config = useTigerConfig()
    const inputGroup = inject<InputGroupContext | null>(INPUT_GROUP_INJECTION_KEY, null)
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const isReadOnly = computed(() => props.readOnly)
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getSelectLabels(mergedLocale.value, props.labels))
    const instanceId = useId()
    const listboxId = `tiger-select-listbox-${instanceId}`
    const getOptionId = (index: number) => getPickerOptionId(listboxId, index)

    const localValue = ref<SelectModelValue>(
      normalizeSelectValue(
        props.modelValue ??
          coerceSelectFormValue(
            formItemControl?.value.value,
            sourceOptions.value,
            props.multiple
          ) ??
          props.defaultValue ??
          (props.multiple ? [] : undefined),
        props.multiple,
        false
      )
    )
    const localOpen = ref(props.defaultOpen)
    const localSearch = ref(props.defaultSearchValue)
    const activeIndex = ref(-1)
    const highlightReason = ref<'open' | 'filter' | 'home' | 'end' | 'typeahead'>('open')
    const createdOptions = ref<SelectOption[]>([])
    const optionCache = ref(new Map<string | number, SelectOption>())
    const rootRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const searchInputRef = ref<HTMLInputElement | null>(null)
    const dropdownRef = ref<HTMLElement | null>(null)
    const virtualScrollTop = ref(0)
    const scrollScheduler = createSelectScrollScheduler((top) => {
      virtualScrollTop.value = top
    })
    const virtualScrollRef = ref<HTMLElement | null>(null)
    const activeValue = ref<string | number | undefined>(undefined)

    const selected = computed(() => {
      if (props.modelValue !== undefined) {
        return normalizeSelectValue(props.modelValue, props.multiple, true)
      }
      if (formItemControl?.name.value) {
        const coerced = coerceSelectFormValue(
          formItemControl.value.value,
          sourceOptions.value,
          props.multiple
        )
        return normalizeSelectValue(
          coerced === undefined ? (props.multiple ? [] : null) : coerced,
          props.multiple,
          false
        )
      }
      return localValue.value
    })
    const isOpen = computed(() => (props.open !== undefined ? props.open : localOpen.value))
    const searchQuery = computed(() => props.searchValue ?? localSearch.value)
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )

    watch(
      () => [props.modelValue, formItemControl?.value.value] as const,
      ([model, formValue]) => {
        const next =
          model !== undefined
            ? model
            : coerceSelectFormValue(formValue, sourceOptions.value, props.multiple)
        if (next === undefined && !formItemControl?.name.value) return
        if (next === undefined) return
        localValue.value = normalizeSelectValue(next, props.multiple, false)
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

    const overlay = useVueAnchoredOverlay({
      enabled: isOpen,
      referenceRef: triggerRef,
      floatingRef: dropdownRef,
      placement: () => props.placement ?? 'bottom-start',
      offset: () => props.offset ?? 4,
      layout: 'anchored',
      matchReferenceWidth: true,
      dismissOnOutside: true,
      dismissOnEscape: true,
      restoreFocusOnDismiss: true,
      getContainer: () => props.getPopupContainer?.() ?? null,
      onDismiss: closeDropdown
    })

    let searchDebouncer: SelectSearchDebouncer = createSelectSearchDebouncer({
      delay: props.searchDebounce,
      onSearchChange: (query) => emit('search-change', query)
    })
    const typeahead = createSelectTypeaheadBuffer({
      onQuery: (query) => {
        const index = findSelectTypeaheadIndex(flatSelectableOptions.value, query, -1)
        if (index >= 0) activeIndex.value = index
      }
    })

    function setOpen(next: boolean) {
      if (props.open === undefined) localOpen.value = next
      emit('update:open', next)
      emit('open-change', next)
    }

    function setSearch(query: string) {
      if (props.searchValue === undefined) localSearch.value = query
      emit('update:searchValue', query)
      searchDebouncer.schedule(query)
    }

    function setSelected(next: SelectModelValue) {
      const normalized = normalizeSelectValue(next, props.multiple)
      if (props.modelValue === undefined) localValue.value = normalized
      emit('update:modelValue', normalized)
      emit('change', normalized)
      formItemControl?.onChange(normalized)
    }

    const liveCreated = computed(() =>
      pruneCreatedSelectOptions(createdOptions.value, sourceOptions.value)
    )
    const optionSource = computed(() =>
      withCreatedSelectOptions(sourceOptions.value, liveCreated.value)
    )
    const filteredOptions = computed(() =>
      resolveSelectFilteredOptions(optionSource.value, searchQuery.value, {
        searchable: props.searchable,
        remote: props.remote,
        filterOption: props.filterOption
      })
    )
    const creatableOption = computed(() =>
      resolveCreatableSelectOption(
        [...sourceOptions.value, ...liveCreated.value],
        searchQuery.value,
        {
          creatable: props.creatable && props.searchable
        }
      )
    )
    const flatSelectableOptions = computed(() => {
      const flat = flattenSelectOptions(filteredOptions.value)
      return creatableOption.value ? [...flat, creatableOption.value] : flat
    })
    const selectedValues = computed(() => getSelectSelectedValues(selected.value, props.multiple))
    const placeholderText = computed(() =>
      resolveLocaleText(labels.value.placeholder, props.placeholder)
    )
    const createOptionLabel = computed(() => {
      if (props.createOptionText) {
        return props.createOptionText.includes('{label}')
          ? props.createOptionText
          : `${props.createOptionText} "{label}"`
      }
      return labels.value.createOptionLabel
    })
    watch(
      [sourceOptions, liveCreated, selectedValues],
      () => {
        optionCache.value = rememberSelectOptions(
          optionCache.value,
          [...flattenSelectOptions(sourceOptions.value), ...liveCreated.value],
          selectedValues.value
        )
      },
      { immediate: true }
    )
    const displayText = computed(() => {
      return resolveSelectDisplayText({
        value: selected.value,
        multiple: props.multiple,
        options: sourceOptions.value,
        createdOptions: liveCreated.value,
        optionCache: optionCache.value,
        placeholder: placeholderText.value,
        maxTagCount: props.maxTagCount,
        moreCountText: labels.value.moreCountText
      })
    })
    const showClear = computed(() =>
      shouldShowSelectClear({
        clearable: props.clearable,
        disabled: effectiveDisabled.value || isReadOnly.value,
        value: selected.value,
        multiple: props.multiple
      })
    )

    function closeDropdown() {
      setOpen(false)
      setSearch('')
      activeIndex.value = -1
      activeValue.value = undefined
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

    function selectOption(option: SelectOption) {
      if (option.disabled || effectiveDisabled.value || isReadOnly.value) return
      if (creatableOption.value && option.value === creatableOption.value.value) {
        if (!createdOptions.value.some((item) => item.value === option.value)) {
          createdOptions.value = [...createdOptions.value, option]
        }
        emit('create', option)
      }
      const next = commitSelectOption({
        option,
        value: selected.value,
        multiple: props.multiple,
        maxCount: props.maxCount,
        readOnly: isReadOnly.value
      })
      setSelected(next)
      if (props.multiple) {
        const nextIndex = flatSelectableOptions.value.findIndex(
          (item) => item.value === option.value
        )
        activeIndex.value = nextIndex
        activeValue.value = option.value
        if (props.autoClearSearchValue) setSearch('')
        return
      }
      closeDropdown()
      focusAfterPaint(() => triggerRef.value)
    }

    function clearSelection(event?: Event) {
      event?.stopPropagation()
      setSelected(clearSelectValue(props.multiple))
      focusAfterPaint(() => triggerRef.value)
    }

    function handleKeyDown(event: KeyboardEvent, fromSearchInput = false) {
      if (effectiveDisabled.value) return
      if (!isOpen.value && isSelectTypeaheadCharacter(event.key, event)) {
        event.preventDefault()
        highlightReason.value = props.searchable ? 'open' : 'typeahead'
        openDropdown()
        if (props.searchable) setSearch(event.key)
        else typeahead.push(event.key)
        return
      }
      const intent = getSelectTriggerKeyIntent({
        key: event.key,
        open: isOpen.value,
        searchable: props.searchable,
        clearable: props.clearable,
        hasValue: showClear.value,
        multiple: props.multiple,
        fromSearchInput
      })
      switch (intent.type) {
        case 'open':
          event.preventDefault()
          openDropdown()
          return
        case 'close':
          if (event.key !== 'Tab') event.preventDefault()
          closeDropdown()
          focusAfterPaint(() => triggerRef.value)
          return
        case 'clear':
          event.preventDefault()
          clearSelection()
          return
        case 'remove-last':
          event.preventDefault()
          setSelected(removeLastSelectValue(selected.value))
          return
        case 'prevent-scroll':
          event.preventDefault()
          highlightReason.value = event.key === 'Home' ? 'home' : 'end'
          activeIndex.value = getSelectClosedHomeEndIndex(
            flatSelectableOptions.value,
            event.key as 'Home' | 'End'
          )
          openDropdown()
          return
        case 'navigate':
          event.preventDefault()
          activeIndex.value = navigateSelectActiveIndex(
            flatSelectableOptions.value,
            activeIndex.value,
            intent.key
          )
          activeValue.value = flatSelectableOptions.value[activeIndex.value]?.value
          return
        case 'select-active': {
          event.preventDefault()
          if (
            shouldCreateSelectQuery({
              creatable: props.creatable && props.searchable,
              query: searchQuery.value,
              items: flatSelectableOptions.value.filter((item) => item !== creatableOption.value)
            }) &&
            creatableOption.value
          ) {
            selectOption(creatableOption.value)
            return
          }
          const option = flatSelectableOptions.value[activeIndex.value]
          if (option) selectOption(option)
          return
        }
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
      if (!open) {
        activeIndex.value = -1
        activeValue.value = undefined
        highlightReason.value = 'open'
        return
      }
      const reason = highlightReason.value
      if (reason === 'home' || reason === 'end' || reason === 'typeahead') {
        highlightReason.value = 'filter'
      } else {
        const next = resolveSelectActiveIndexSafe()
        activeIndex.value = next
        activeValue.value = flatSelectableOptions.value[next]?.value
      }
      if (props.searchable) {
        nextTick(() => searchInputRef.value?.focus())
      }
    })

    watch(flatSelectableOptions, () => {
      if (!isOpen.value) return
      const next = resolveSelectActiveIndexSafe(true)
      activeIndex.value = next
      activeValue.value = flatSelectableOptions.value[next]?.value
    })

    function resolveSelectActiveIndexSafe(fromFilter = false) {
      const items = flatSelectableOptions.value
      if (items.length === 0) return -1
      if (fromFilter && activeValue.value !== undefined) {
        const still = items.findIndex((item) => item.value === activeValue.value && !item.disabled)
        if (still >= 0) return still
      }
      const selectedIndex = items.findIndex(
        (item) => selectedValues.value.includes(item.value) && !item.disabled
      )
      if (selectedIndex >= 0) return selectedIndex
      return items.findIndex((item) => !item.disabled)
    }

    watch(
      () => props.searchDebounce,
      (delay) => {
        searchDebouncer.cancel()
        searchDebouncer = createSelectSearchDebouncer({
          delay,
          onSearchChange: (query) => emit('search-change', query)
        })
      }
    )

    watch(activeIndex, (idx) => {
      if (idx < 0) return
      const el = virtualScrollRef.value
      if (!el) return
      const rows = buildSelectListRows(filteredOptions.value, creatableOption.value)
      const rowIndex = getSelectRowIndexForOption(rows, idx)
      const itemH = getSelectVirtualRowHeight(props.size, rows[rowIndex]?.kind ?? 'option')
      const next = getSelectActiveAlignScrollTop({
        scrollTop: el.scrollTop,
        listHeight: props.listHeight,
        rowIndex,
        itemHeight: itemH
      })
      if (next !== el.scrollTop) el.scrollTop = next
    })

    onBeforeUnmount(() => {
      searchDebouncer.cancel()
      scrollScheduler.cancel()
    })

    expose({
      focus: () => {
        if (props.searchable && isOpen.value) searchInputRef.value?.focus()
        else triggerRef.value?.focus()
      },
      open: openDropdown,
      close: closeDropdown
    })

    function renderOptionRow(row: Extract<SelectListRow, { kind: 'option' }>) {
      const option = row.option
      const selectedOption = isSelectOptionSelected(option, selected.value, props.multiple)
      const active = row.optionIndex === activeIndex.value
      const displayLabel = row.isCreate
        ? getCreateSelectOptionLabel(option, createOptionLabel.value)
        : option.label
      const slotCtx: SelectOptionSlotContext = {
        value: option.value,
        label: displayLabel,
        disabled: option.disabled,
        selected: selectedOption,
        active
      }
      const custom = slots.option?.(slotCtx)
      return h(
        'div',
        {
          key: row.key,
          id: getOptionId(row.optionIndex),
          'data-option-index': row.optionIndex,
          'data-active': active ? '' : undefined,
          ...getPickerOptionAria({ selected: selectedOption, disabled: !!option.disabled }),
          class: getSelectOptionClasses({
            isSelected: selectedOption,
            isDisabled: !!option.disabled,
            isActive: active,
            size: props.size
          }),
          onMouseenter: () => {
            if (!option.disabled) {
              activeIndex.value = row.optionIndex
              activeValue.value = option.value
            }
          },
          onMousedown: (event: MouseEvent) => event.preventDefault(),
          onClick: () => selectOption(option)
        },
        custom ?? [
          h('span', { class: 'flex items-center justify-between w-full gap-2' }, [
            h('span', { class: 'min-w-0' }, [
              h('span', { class: 'block truncate' }, displayLabel),
              option.description
                ? h(
                    'span',
                    { class: 'block truncate text-xs text-[var(--tiger-text-secondary)]' },
                    option.description
                  )
                : null
            ]),
            selectedOption ? iconVNode(checkSolidIcon20PathD, selectCheckIconClasses) : null
          ])
        ]
      )
    }

    function renderRows(
      rows: SelectListRow[],
      fullRows: readonly SelectListRow[] = rows,
      offset = 0
    ) {
      const nodes: VNode[] = []
      let bucket: { key: string; label: string; header: boolean; children: VNode[] } | null = null
      const flush = () => {
        if (!bucket) return
        nodes.push(
          h('div', { key: bucket.key, role: 'group', 'aria-label': bucket.label }, [
            h(
              'div',
              { class: bucket.header ? selectGroupLabelClasses : 'sr-only', 'aria-hidden': 'true' },
              bucket.label
            ),
            ...bucket.children
          ])
        )
        bucket = null
      }
      rows.forEach((row, localIndex) => {
        if (row.kind === 'group') {
          flush()
          bucket = { key: row.key, label: row.label, header: true, children: [] }
          return
        }
        const label = selectRowGroupLabel(fullRows, offset + localIndex)
        if (label && bucket?.label !== label) {
          flush()
          bucket = { key: `wrap-${row.key}`, label, header: false, children: [] }
        }
        const option = renderOptionRow(row)
        if (bucket) bucket.children.push(option)
        else nodes.push(option)
      })
      flush()
      return nodes
    }

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
      const comboboxAria = getPickerComboboxAria({
        expanded: isOpen.value,
        listboxId,
        activeIndex: activeIndex.value
      })
      const searchOpen = props.searchable && isOpen.value
      const triggerClasses = getSelectTriggerClasses({
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
            props.multiple &&
            resolveSelectTags({
              value: selected.value,
              options: sourceOptions.value,
              createdOptions: liveCreated.value,
              optionCache: optionCache.value,
              maxTagCount: props.maxTagCount,
              moreCountText: labels.value.moreCountText
            }).tags.length > 0
              ? h('span', { class: selectTagListClasses }, [
                  ...resolveSelectTags({
                    value: selected.value,
                    options: sourceOptions.value,
                    createdOptions: liveCreated.value,
                    optionCache: optionCache.value,
                    maxTagCount: props.maxTagCount,
                    moreCountText: labels.value.moreCountText
                  }).tags.map((tag) =>
                    h('span', { key: tag.key, class: selectTagClasses }, [
                      h('span', { class: 'truncate' }, tag.label),
                      h(
                        'button',
                        {
                          type: 'button',
                          tabindex: -1,
                          class: selectTagRemoveClasses,
                          'aria-label': `${labels.value.clearAriaLabel} ${tag.label}`,
                          onMousedown: (event: MouseEvent) => event.preventDefault(),
                          onClick: (event: MouseEvent) => {
                            event.stopPropagation()
                            if (isReadOnly.value) return
                            setSelected(removeSelectValue(selected.value, tag.value))
                          }
                        },
                        '×'
                      )
                    ])
                  ),
                  ...(resolveSelectTags({
                    value: selected.value,
                    options: sourceOptions.value,
                    createdOptions: liveCreated.value,
                    optionCache: optionCache.value,
                    maxTagCount: props.maxTagCount,
                    moreCountText: labels.value.moreCountText
                  }).collapsedCount > 0
                    ? [
                        h(
                          'span',
                          {
                            class: selectTagClasses,
                            'aria-label': resolveSelectTags({
                              value: selected.value,
                              options: sourceOptions.value,
                              createdOptions: liveCreated.value,
                              optionCache: optionCache.value,
                              maxTagCount: props.maxTagCount,
                              moreCountText: labels.value.moreCountText
                            }).collapsedLabel
                          },
                          slots.maxTagPlaceholder?.({
                            items: resolveSelectTags({
                              value: selected.value,
                              options: sourceOptions.value,
                              createdOptions: liveCreated.value,
                              optionCache: optionCache.value,
                              maxTagCount: props.maxTagCount,
                              moreCountText: labels.value.moreCountText
                            }).collapsedItems
                          }) ??
                            collapsedTagSummary(
                              resolveSelectTags({
                                value: selected.value,
                                options: sourceOptions.value,
                                createdOptions: liveCreated.value,
                                optionCache: optionCache.value,
                                maxTagCount: props.maxTagCount,
                                moreCountText: labels.value.moreCountText
                              }).collapsedItems
                            )
                        )
                      ]
                    : [])
                ])
              : h(
                  'span',
                  {
                    class: classNames(
                      'flex-1 truncate',
                      displayText.value === placeholderText.value &&
                        'text-[var(--tiger-text-secondary)]'
                    )
                  },
                  displayText.value
                )
          ]
        )
      }

      const rows = buildSelectListRows(filteredOptions.value, creatableOption.value)
      const hasOptions = rows.some((row) => row.kind === 'option')
      const listboxAria = getPickerListboxAria({ id: listboxId })
      let listNode = null
      const listMax = {
        maxHeight: `min(${props.listHeight}px, var(--tiger-overlay-available-height, ${props.listHeight}px))`
      }
      const virtualize =
        props.virtual ||
        shouldVirtualizeSelectList({
          rowCount: rows.length,
          listHeight: props.listHeight,
          size: props.size,
          rows
        })
      if (hasOptions && virtualize) {
        const activeRow = getSelectRowIndexForOption(rows, activeIndex.value)
        const window = getSelectVirtualWindow({
          rows,
          scrollTop: virtualScrollTop.value,
          listHeight: props.listHeight,
          size: props.size,
          activeRowIndex: activeRow
        })
        listNode = h(
          'div',
          {
            ref: virtualScrollRef,
            'data-tiger-select-virtual': '',
            class: selectListboxClasses,
            style: listMax,
            ...listboxAria,
            'aria-multiselectable': props.multiple ? true : undefined,
            'aria-busy': props.loading || undefined,
            onScroll: (event: Event) => {
              scrollScheduler.onScroll((event.target as HTMLElement).scrollTop)
            }
          },
          [
            h('div', { style: { height: `${window.totalHeight}px`, position: 'relative' } }, [
              h(
                'div',
                { style: { transform: `translateY(${window.offsetTop}px)` } },
                renderRows(
                  rows.slice(window.startIndex, window.endIndex + 1),
                  rows,
                  window.startIndex
                )
              )
            ])
          ]
        )
      } else if (hasOptions) {
        listNode = h(
          'div',
          {
            class: selectListboxClasses,
            style: listMax,
            ...listboxAria,
            'aria-multiselectable': props.multiple ? true : undefined,
            'aria-busy': props.loading || undefined
          },
          renderRows(rows)
        )
      } else {
        listNode = h(
          'div',
          { class: selectEmptyStateClasses },
          props.loading
            ? labels.value.loadingText
            : resolveLocaleText(labels.value.emptyText, props.emptyText)
        )
      }

      const dropdown = isOpen.value
        ? renderVueOverlayTeleport(
            h(
              'div',
              {
                ref: dropdownRef,
                class: classNames(
                  selectDropdownBaseClasses,
                  overlay.floatingClasses.value,
                  props.dropdownClassName
                ),
                style: overlay.floatingStyles.value as CSSProperties,
                'data-positioned': overlay.positioned.value,
                'data-tiger-select-dropdown': '',
                onMousedown: (event: MouseEvent) => event.preventDefault(),
                onFocusout: handleFocusOut
              },
              [
                slots.header?.(),
                props.multiple
                  ? h(
                      'button',
                      {
                        type: 'button',
                        class: classNames(
                          'w-full py-2 text-start text-sm text-[var(--tiger-primary)] hover:bg-[var(--tiger-outline-bg-hover)]',
                          popupListInlinePaddingClass
                        ),
                        'data-tiger-select-all': '',
                        disabled: isReadOnly.value || undefined,
                        onClick: () => {
                          if (isReadOnly.value) return
                          setSelected(
                            selectAllSelectValues({
                              value: selected.value,
                              options: filteredOptions.value,
                              maxCount: props.maxCount,
                              readOnly: isReadOnly.value
                            })
                          )
                        }
                      },
                      getW9FormLabels(mergedLocale.value?.locale).selectAll
                    )
                  : null,
                hasOptions ? listNode : (slots.empty?.() ?? listNode),
                h('div', { class: selectDoneActionClasses }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: selectDoneButtonClasses,
                      onClick: () => {
                        setOpen(false)
                      }
                    },
                    labels.value.doneText
                  )
                ]),
                slots.footer?.()
              ]
            ),
            overlay.target.value
          )
        : null

      const hiddenValues = shouldSubmitNativeField({
        name: effectiveName,
        disabled: effectiveDisabled.value
      })
        ? isSelectValueEmpty(selected.value, props.multiple)
          ? ['']
          : serializeSelectFormValues(selected.value, props.multiple)
        : []

      return h(
        'div',
        {
          ref: rootRef,
          class: getSelectRootClasses(
            inputGroup != null,
            classNames(props.className, coerceClassValue(attrClass))
          ),
          style: (attrStyle as CSSProperties) ?? undefined,
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
                      'data-tiger-select-clear': '',
                      tabindex: -1,
                      'aria-label': labels.value.clearAriaLabel,
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
          ...hiddenValues.map((value, index) =>
            h('input', {
              key: `${effectiveName}-${index}-${value}`,
              type: 'hidden',
              name: effectiveName,
              value
            })
          ),
          dropdown
        ]
      )
    }
  }
})

export default Select
