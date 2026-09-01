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
  selectDropdownBaseClasses,
  selectGroupLabelClasses,
  selectEmptyStateClasses,
  selectDoneActionClasses,
  selectDoneButtonClasses,
  selectListboxClasses,
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
  getSelectVirtualItemHeight,
  getSelectVirtualRange,
  getSelectActiveAlignScrollTop,
  getSelectRowIndexForOption,
  buildSelectListRows,
  getPickerOptionAria,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerOptionId,
  icon20ViewBox,
  chevronDownSolidIcon20PathD,
  closeSolidIcon20PathD,
  checkSolidIcon20PathD,
  resolveLocaleText,
  mergeTigerLocale,
  getSelectLabels,
  normalizeSelectValue,
  pruneCreatedSelectOptions,
  rememberSelectOptions,
  resolveSelectDisplayText,
  commitSelectOption,
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

export interface VueSelectProps {
  modelValue?: SelectModelValue
  defaultValue?: SelectModelValue
  open?: boolean
  defaultOpen?: boolean
  options?: SelectOptions
  size?: ComponentSize
  disabled?: boolean
  placeholder?: string
  searchable?: boolean
  searchValue?: string
  defaultSearchValue?: string
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
    const config = useTigerConfig()
    const inputGroup = inject<InputGroupContext | null>(INPUT_GROUP_INJECTION_KEY, null)
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getSelectLabels(mergedLocale.value, props.labels))
    const instanceId = useId()
    const listboxId = `tiger-select-listbox-${instanceId}`
    const getOptionId = (index: number) => getPickerOptionId(listboxId, index)

    const localValue = ref<SelectModelValue>(
      normalizeSelectValue(
        props.modelValue ??
          coerceSelectFormValue(formItemControl?.value.value, props.options, props.multiple) ??
          props.defaultValue ??
          (props.multiple ? [] : undefined),
        props.multiple,
        false
      )
    )
    const localOpen = ref(props.defaultOpen)
    const localSearch = ref(props.defaultSearchValue)
    const activeIndex = ref(-1)
    const createdOptions = ref<SelectOption[]>([])
    const optionCache = ref(new Map<string | number, SelectOption>())
    const rootRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const searchInputRef = ref<HTMLInputElement | null>(null)
    const dropdownRef = ref<HTMLElement | null>(null)
    const virtualScrollTop = ref(0)
    const virtualScrollRef = ref<HTMLElement | null>(null)
    const activeValue = ref<string | number | undefined>(undefined)

    const selected = computed(() =>
      props.modelValue !== undefined
        ? normalizeSelectValue(props.modelValue, props.multiple, true)
        : (coerceSelectFormValue(formItemControl?.value.value, props.options, props.multiple) ??
          localValue.value)
    )
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
            : coerceSelectFormValue(formValue, props.options, props.multiple)
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
      layout: 'fullscreen-sm',
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
      pruneCreatedSelectOptions(createdOptions.value, props.options)
    )
    const filteredOptions = computed(() =>
      resolveSelectFilteredOptions(props.options, searchQuery.value, {
        searchable: props.searchable,
        remote: props.remote,
        filterOption: props.filterOption
      })
    )
    const creatableOption = computed(() =>
      resolveCreatableSelectOption([...props.options, ...liveCreated.value], searchQuery.value, {
        creatable: props.creatable && props.searchable
      })
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
    const displayText = computed(() => {
      optionCache.value = rememberSelectOptions(
        optionCache.value,
        [...flattenSelectOptions(props.options), ...liveCreated.value],
        selectedValues.value
      )
      return resolveSelectDisplayText({
        value: selected.value,
        multiple: props.multiple,
        options: props.options,
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
        disabled: effectiveDisabled.value,
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
      if (option.disabled || effectiveDisabled.value) return
      if (creatableOption.value && option.value === creatableOption.value.value) {
        if (!createdOptions.value.some((item) => item.value === option.value)) {
          createdOptions.value = [...createdOptions.value, option]
        }
        emit('create', option)
      }
      const next = commitSelectOption({
        option,
        value: selected.value,
        multiple: props.multiple
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
      nextTick(() => triggerRef.value?.focus())
    }

    function clearSelection(event?: Event) {
      event?.stopPropagation()
      setSelected(clearSelectValue(props.multiple))
      nextTick(() => triggerRef.value?.focus())
    }

    function handleKeyDown(event: KeyboardEvent, fromSearchInput = false) {
      if (effectiveDisabled.value) return
      if (!isOpen.value && isSelectTypeaheadCharacter(event.key, event)) {
        event.preventDefault()
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
          triggerRef.value?.focus()
          return
        case 'clear':
          event.preventDefault()
          clearSelection()
          return
        case 'prevent-scroll':
          event.preventDefault()
          openDropdown()
          activeIndex.value = getSelectClosedHomeEndIndex(
            flatSelectableOptions.value,
            event.key as 'Home' | 'End'
          )
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
        return
      }
      const next = resolveSelectActiveIndexSafe()
      activeIndex.value = next
      activeValue.value = flatSelectableOptions.value[next]?.value
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
      if (!props.virtual || idx < 0) return
      const el = virtualScrollRef.value
      if (!el) return
      const rows = buildSelectListRows(filteredOptions.value, creatableOption.value)
      const rowIndex = getSelectRowIndexForOption(rows, idx)
      const itemH = getSelectVirtualItemHeight(props.size)
      const next = getSelectActiveAlignScrollTop({
        scrollTop: el.scrollTop,
        listHeight: props.listHeight,
        rowIndex,
        itemHeight: itemH
      })
      if (next !== el.scrollTop) el.scrollTop = next
    })

    onBeforeUnmount(() => searchDebouncer.cancel())

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
            h('span', { class: 'truncate' }, displayLabel),
            selectedOption ? iconVNode(checkSolidIcon20PathD, selectCheckIconClasses) : null
          ])
        ]
      )
    }

    function renderRows(rows: SelectListRow[]) {
      return rows.map((row) => {
        if (row.kind === 'group') {
          return h('div', { key: row.key, role: 'group', 'aria-label': row.label }, [
            h('div', { class: selectGroupLabelClasses, 'aria-hidden': 'true' }, row.label)
          ])
        }
        return renderOptionRow(row)
      })
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

      const rows = buildSelectListRows(filteredOptions.value, creatableOption.value)
      const hasOptions = rows.some((row) => row.kind === 'option')
      const listboxAria = getPickerListboxAria({ id: listboxId })
      let listNode = null
      if (hasOptions && props.virtual) {
        const itemH = getSelectVirtualItemHeight(props.size)
        const { startIndex, endIndex, totalHeight } = getSelectVirtualRange(
          virtualScrollTop.value,
          props.listHeight,
          rows.length,
          itemH
        )
        listNode = h(
          'div',
          {
            ref: virtualScrollRef,
            'data-tiger-select-virtual': '',
            class: selectListboxClasses,
            style: { maxHeight: `${props.listHeight}px` },
            ...listboxAria,
            'aria-multiselectable': props.multiple ? true : undefined,
            'aria-busy': props.loading || undefined,
            onScroll: (event: Event) => {
              virtualScrollTop.value = (event.target as HTMLElement).scrollTop
            }
          },
          [
            h('div', { style: { height: `${totalHeight}px`, position: 'relative' } }, [
              h(
                'div',
                { style: { transform: `translateY(${startIndex * itemH}px)` } },
                renderRows(rows.slice(startIndex, endIndex + 1))
              )
            ])
          ]
        )
      } else if (hasOptions) {
        listNode = h(
          'div',
          {
            class: selectListboxClasses,
            style: { maxHeight: `${props.listHeight}px` },
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
                listNode,
                h('div', { class: selectDoneActionClasses }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: selectDoneButtonClasses,
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

      const hiddenValues = effectiveName
        ? serializeSelectFormValues(selected.value, props.multiple)
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
