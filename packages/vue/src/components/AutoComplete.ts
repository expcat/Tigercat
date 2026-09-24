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
  type CSSProperties
} from 'vue'
import type {
  AutoCompleteFilterOption,
  AutoCompleteOption,
  AutoCompleteValue,
  ComponentSize,
  FloatingPlacement,
  InputStatus,
  TigerLocale
} from '@expcat/tigercat-core'
import { icon20ViewBox } from '@expcat/tigercat-core/icons/picker'
import {
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  autoCompleteClearButtonClasses,
  autoCompleteClearIconClasses,
  autoCompleteDoneActionClasses,
  autoCompleteDoneButtonClasses,
  autoCompleteDropdownClasses,
  autoCompleteEmptyStateClasses,
  autoCompleteListboxClasses,
  autoCompleteTrailingSlotClasses,
  AUTO_COMPLETE_INVALID_VALUE,
  autoCompleteOptionIdentity,
  classNames,
  coerceClassValue,
  filterAutoCompleteOptions,
  getAutoCompleteInputClasses,
  getAutoCompleteKeyIntent,
  getAutoCompleteOptionClasses,
  getAutoCompleteOptionKey,
  getAutoCompletePanelStyle,
  getAutoCompleteVirtualItemHeight,
  shouldVirtualizeAutoCompleteList,
  getAutoCompleteRootClasses,
  getEmptyLabels,
  getInitialPickerActiveIndex,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerNavigationIndex,
  getPickerOptionAria,
  getPickerOptionId,
  getSelectLabels,
  isAutoCompleteEmptyValue,
  isImeCompositionEvent,
  isSameAutoCompleteValue,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  resolveAutoCompleteBlurCommit,
  resolveAutoCompleteInitialQuery,
  resolveLocaleText,
  sanitizeAutoCompleteExternalValue,
  syncAutoCompleteHighlight,
  runShakeAnimation,
  shouldShowAutoCompleteClear
} from '@expcat/tigercat-core'
import { closeSolidIcon20PathD } from '@expcat/tigercat-core/icons/picker'
import { useTigerConfig } from './ConfigProvider'
import { useFixedListWindow } from './internal/useFixedListWindow'
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

export interface VueAutoCompleteProps {
  modelValue?: AutoCompleteValue
  defaultValue?: AutoCompleteValue
  open?: boolean
  defaultOpen?: boolean
  options?: AutoCompleteOption[]
  placeholder?: string
  searchValue?: string
  defaultSearchValue?: string
  size?: ComponentSize
  disabled?: boolean
  clearable?: boolean
  emptyText?: string
  filterOption?: AutoCompleteFilterOption
  defaultActiveFirstOption?: boolean
  allowFreeInput?: boolean
  loading?: boolean
  readOnly?: boolean
  status?: InputStatus
  name?: string
  placement?: FloatingPlacement
  offset?: number
  dropdownClassName?: string
  getPopupContainer?: () => HTMLElement | null
  listHeight?: number
  locale?: Partial<TigerLocale>
  className?: string
}

export type AutoCompleteProps = VueAutoCompleteProps
export type { AutoCompleteOption }

export const AutoComplete = defineComponent({
  name: 'TigerAutoComplete',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number] as PropType<AutoCompleteValue> },
    defaultValue: { type: [String, Number] as PropType<AutoCompleteValue> },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    options: { type: Array as PropType<AutoCompleteOption[]>, default: () => [] },
    placeholder: { type: String, default: '' },
    searchValue: { type: String, default: undefined },
    defaultSearchValue: { type: String, default: undefined },
    size: { type: String as PropType<ComponentSize>, default: 'md' as ComponentSize },
    disabled: Boolean,
    clearable: Boolean,
    emptyText: { type: String, default: undefined },
    filterOption: {
      type: [Boolean, Function] as PropType<AutoCompleteFilterOption>,
      default: true
    },
    defaultActiveFirstOption: { type: Boolean, default: true },
    allowFreeInput: { type: Boolean, default: true },
    loading: Boolean,
    readOnly: { type: Boolean, default: false },
    status: { type: String as PropType<InputStatus>, default: undefined },
    name: String,
    placement: { type: String as PropType<FloatingPlacement>, default: 'bottom-start' },
    offset: { type: Number, default: 4 },
    dropdownClassName: String,
    getPopupContainer: { type: Function as PropType<() => HTMLElement | null> },
    listHeight: { type: Number, default: 256 },
    locale: { type: Object as PropType<Partial<TigerLocale>> },
    className: String
  },
  emits: ['update:modelValue', 'update:searchValue', 'update:open', 'select', 'blur', 'focus'],
  setup(props, { emit, attrs, expose }) {
    const config = useTigerConfig()
    const inputGroup = inject<InputGroupContext | null>(INPUT_GROUP_INJECTION_KEY, null)
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const emptyLabels = computed(() => getEmptyLabels(mergedLocale.value))
    const selectLabels = computed(() => getSelectLabels(mergedLocale.value))
    const instanceId = useId()
    const listboxId = `tiger-autocomplete-listbox-${instanceId}`

    const formBound = computed(
      () => props.modelValue === undefined && Boolean(formItemControl?.name.value)
    )
    const rawExternal = computed(() =>
      props.modelValue !== undefined
        ? props.modelValue
        : formBound.value
          ? formItemControl?.value.value
          : undefined
    )
    const sanitized = computed(() =>
      props.modelValue !== undefined || formBound.value
        ? sanitizeAutoCompleteExternalValue(rawExternal.value)
        : undefined
    )
    const initialCommitted = isAutoCompleteEmptyValue(
      sanitized.value?.value ?? props.defaultValue
    )
      ? undefined
      : (sanitized.value?.value ?? props.defaultValue)
    const localValue = ref<AutoCompleteValue | undefined>(initialCommitted)
    const localOpen = ref(props.defaultOpen)
    const localSearch = ref(
      resolveAutoCompleteInitialQuery({
        searchValue: props.searchValue,
        defaultSearchValue: props.defaultSearchValue,
        committed: initialCommitted,
        optionList: props.options
      })
    )
    const activeIndex = ref(-1)
    const activeKey = ref<string | undefined>(undefined)
    const isEditing = ref(false)
    const composing = ref(false)
    const hadCommitted = ref(!isAutoCompleteEmptyValue(initialCommitted))
    const seeded = ref(false)
    const explained = ref(false)
    const labelMemory = ref<{ value: AutoCompleteValue; label: string } | null>(null)
    const wasOpen = ref(false)
    const rootRef = ref<HTMLElement | null>(null)
    const inputRef = ref<HTMLInputElement | null>(null)
    const hiddenRef = ref<HTMLInputElement | null>(null)
    const dropdownRef = ref<HTMLElement | null>(null)

    const selected = computed<AutoCompleteValue | undefined>(() => {
      if (props.modelValue !== undefined || formBound.value) return sanitized.value?.value
      return localValue.value
    })
    const isOpen = computed(() => (props.open !== undefined ? props.open : localOpen.value))
    const searchQuery = computed(() => props.searchValue ?? localSearch.value)
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const canEdit = computed(() => !effectiveDisabled.value && !props.readOnly)
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )
    const filteredOptions = computed(() =>
      filterAutoCompleteOptions(props.options, searchQuery.value, props.filterOption)
    )
    const hasOptions = computed(() => filteredOptions.value.length > 0)
    const optionWindow = useFixedListWindow({
      enabled: () =>
        shouldVirtualizeAutoCompleteList(
          filteredOptions.value.length,
          props.listHeight,
          props.size
        ),
      activeIndex: () => activeIndex.value,
      itemHeight: () => getAutoCompleteVirtualItemHeight(props.size),
      viewport: () => props.listHeight,
      count: () => filteredOptions.value.length
    })
    const showClear = computed(() =>
      shouldShowAutoCompleteClear({
        clearable: props.clearable,
        disabled: effectiveDisabled.value || props.readOnly,
        query: searchQuery.value,
        committed: selected.value
      })
    )

    watch(
      () => [props.modelValue, formItemControl?.value.value, formBound.value] as const,
      () => {
        if (props.modelValue === undefined && !formBound.value) return
        localValue.value = sanitized.value?.value
      }
    )

    watch(
      () => sanitized.value?.invalid,
      (invalid) => {
        if (invalid) {
          formItemControl?.setError(AUTO_COMPLETE_INVALID_VALUE)
          if (!explained.value) {
            explained.value = true
            emit('update:modelValue', undefined)
            formItemControl?.onChange(undefined)
          }
          return
        }
        if (explained.value && sanitized.value?.value !== undefined) {
          explained.value = false
          formItemControl?.setError(null)
        }
      },
      { immediate: true }
    )

    if (!seeded.value) {
      seeded.value = true
      if (
        formItemControl?.name.value &&
        props.modelValue === undefined &&
        (formItemControl.value.value === '' || formItemControl.value.value == null) &&
        !isAutoCompleteEmptyValue(props.defaultValue)
      ) {
        formItemControl.onChange(props.defaultValue)
      }
    }

    watch(
      () => [status.value, formItemControl?.shakeTrigger.value] as const,
      (current, previous) => {
        if (!previous) return
        if (current[0] === 'error') runShakeAnimation(rootRef.value)
      },
      { flush: 'post' }
    )

    function rememberLabel(next: AutoCompleteValue | undefined, label: string) {
      if (isAutoCompleteEmptyValue(next)) {
        labelMemory.value = null
        return
      }
      labelMemory.value = { value: next as AutoCompleteValue, label }
    }

    watch([selected, () => props.options], () => {
      if (props.searchValue !== undefined) return
      if (isEditing.value) return
      if (selected.value === undefined) {
        if (hadCommitted.value) localSearch.value = ''
        hadCommitted.value = false
        return
      }
      hadCommitted.value = true
      const memory = labelMemory.value
      const label =
        memory && isSameAutoCompleteValue(memory.value, selected.value)
          ? memory.label
          : resolveAutoCompleteInitialQuery({
              committed: selected.value,
              optionList: props.options
            })
      if (!(memory && isSameAutoCompleteValue(memory.value, selected.value))) {
        rememberLabel(selected.value, label)
      }
      localSearch.value = label
    })

    watch(filteredOptions, (items) => {
      const next = syncAutoCompleteHighlight(items, activeKey.value, props.defaultActiveFirstOption)
      activeKey.value = next.key
      if (activeIndex.value !== next.index) activeIndex.value = next.index
    })

    watch(isOpen, (open, previous) => {
      if (previous && !open && isEditing.value) {
        isEditing.value = false
        commitCurrentQuery()
      }
      wasOpen.value = open
    })

    function setOpen(next: boolean) {
      if (next === isOpen.value) return
      if (props.open === undefined) localOpen.value = next
      emit('update:open', next)
    }

    function setSearch(query: string) {
      if (query === searchQuery.value) return
      if (props.searchValue === undefined) localSearch.value = query
      emit('update:searchValue', query)
    }

    function writeNative(next: AutoCompleteValue | undefined) {
      if (hiddenRef.value) {
        hiddenRef.value.value = isAutoCompleteEmptyValue(next) ? '' : String(next)
      }
    }

    function setSelected(next: AutoCompleteValue | undefined, option?: AutoCompleteOption) {
      const stored = isAutoCompleteEmptyValue(next) ? undefined : next
      const changed = !isSameAutoCompleteValue(stored, selected.value)
      if (props.modelValue === undefined && !formBound.value) localValue.value = stored
      writeNative(stored)
      if (changed) {
        emit('update:modelValue', stored)
        formItemControl?.onChange(stored)
      }
      if (option && stored !== undefined) emit('select', option.value, option)
    }

    function openDropdown() {
      if (!canEdit.value) return
      setOpen(true)
      const index = getInitialPickerActiveIndex(
        filteredOptions.value,
        props.defaultActiveFirstOption
      )
      activeIndex.value = index
      activeKey.value = index >= 0 ? autoCompleteOptionIdentity(filteredOptions.value[index]) : undefined
    }

    function closeDropdown() {
      activeKey.value = undefined
      activeIndex.value = -1
      setOpen(false)
    }

    function commitCurrentQuery() {
      const result = resolveAutoCompleteBlurCommit({
        query: searchQuery.value,
        committed: selected.value,
        optionList: props.options,
        allowFreeInput: props.allowFreeInput
      })
      if (!isAutoCompleteEmptyValue(result.value)) {
        rememberLabel(result.value as AutoCompleteValue, result.query)
      } else {
        rememberLabel(undefined, '')
      }
      setSearch(result.query)
      writeNative(result.value)
      if (result.didCommit) setSelected(result.value, result.option)
      return result
    }

    function revertQuery() {
      const memory = labelMemory.value
      const label =
        memory && isSameAutoCompleteValue(memory.value, selected.value)
          ? memory.label
          : resolveAutoCompleteInitialQuery({
              committed: selected.value,
              optionList: props.options
            })
      setSearch(label)
    }

    function finishEdit() {
      isEditing.value = false
      const result = commitCurrentQuery()
      writeNative(result.value)
      closeDropdown()
    }

    function handleDismiss(reason: 'outside' | 'escape') {
      if (reason === 'escape') {
        isEditing.value = false
        revertQuery()
        closeDropdown()
        return
      }
      finishEdit()
    }

    const overlay = useVueAnchoredOverlay({
      enabled: isOpen,
      referenceRef: inputRef,
      floatingRef: dropdownRef,
      containerRef: rootRef,
      placement: () => props.placement ?? 'bottom-start',
      offset: () => props.offset ?? 4,
      layout: 'fullscreen-sm',
      matchReferenceWidth: true,
      dismissOnOutside: true,
      dismissOnEscape: true,
      restoreFocusOnDismiss: true,
      getContainer: () => props.getPopupContainer?.() ?? null,
      onDismiss: handleDismiss
    })

    function handleSelect(option: AutoCompleteOption) {
      if (option.disabled || !canEdit.value) return
      isEditing.value = false
      setSearch(isAutoCompleteEmptyValue(option.value) ? '' : option.label)
      setSelected(option.value, option)
      closeDropdown()
    }

    function handleInput(event: Event) {
      if (!canEdit.value) return
      const next = (event.target as HTMLInputElement).value
      isEditing.value = true
      setSearch(next)
      if (!isOpen.value) setOpen(true)
      const nextItems = filterAutoCompleteOptions(props.options, next, props.filterOption)
      const index = getInitialPickerActiveIndex(nextItems, props.defaultActiveFirstOption)
      activeIndex.value = index
      activeKey.value = index >= 0 ? autoCompleteOptionIdentity(nextItems[index]) : undefined
    }

    function handleClear(event: Event) {
      event.preventDefault()
      event.stopPropagation()
      if (!canEdit.value) return
      isEditing.value = true
      setSearch('')
      setSelected(undefined)
      nextTick(() => inputRef.value?.focus())
      if (!isOpen.value) setOpen(true)
      const index = getInitialPickerActiveIndex(props.options, props.defaultActiveFirstOption)
      activeIndex.value = index
      activeKey.value = index >= 0 ? autoCompleteOptionIdentity(props.options[index]) : undefined
    }

    function handleFocus(event: FocusEvent) {
      if (canEdit.value) {
        isEditing.value = true
        openDropdown()
      }
      emit('focus', event)
    }

    function handleFocusOut(event: FocusEvent) {
      const next = event.relatedTarget as Node | null
      if (
        (rootRef.value && next && rootRef.value.contains(next)) ||
        (dropdownRef.value && next && dropdownRef.value.contains(next))
      ) {
        return
      }
      finishEdit()
      formItemControl?.onBlur()
      emit('blur', event)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (composing.value || isImeCompositionEvent(event) || !canEdit.value) return
      const intent = getAutoCompleteKeyIntent(
        event.key,
        isOpen.value,
        activeIndex.value,
        filteredOptions.value.length
      )
      switch (intent.type) {
        case 'open':
          event.preventDefault()
          openDropdown()
          return
        case 'navigate':
          event.preventDefault()
          activeIndex.value = getPickerNavigationIndex(
            filteredOptions.value,
            activeIndex.value,
            intent.key
          )
          activeKey.value =
            activeIndex.value >= 0
              ? autoCompleteOptionIdentity(filteredOptions.value[activeIndex.value])
              : undefined
          return
        case 'select-active': {
          event.preventDefault()
          const option = filteredOptions.value[activeIndex.value]
          if (option) handleSelect(option)
          return
        }
        case 'commit-query':
          if (!intent.allowDefault) event.preventDefault()
          finishEdit()
          return
        case 'close':
          event.preventDefault()
          isEditing.value = false
          revertQuery()
          closeDropdown()
          return
        default:
          return
      }
    }

    expose({
      focus: () => inputRef.value?.focus(),
      open: openDropdown,
      close: closeDropdown,
      input: inputRef
    })

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
      const listMounted = hasOptions.value
      const popupId = `${listboxId}-popup`
      const comboboxAria = {
        ...getPickerComboboxAria({
          expanded: isOpen.value,
          listboxId,
          activeIndex: listMounted && optionWindow.activeInWindow.value ? activeIndex.value : -1,
          listMounted
        }),
        'aria-controls': isOpen.value ? (listMounted ? listboxId : popupId) : undefined,
        'aria-autocomplete': 'list' as const,
        id: effectiveId,
        readonly: props.readOnly || undefined,
        'aria-label': ariaLabel,
        'aria-labelledby': labelledby,
        'aria-describedby': describedBy,
        'aria-invalid': status.value === 'error' ? true : undefined,
        'aria-required': formItemControl?.required.value ? true : undefined
      }

      const options = filteredOptions.value
      const virtualizeOptions = shouldVirtualizeAutoCompleteList(
        options.length,
        props.listHeight,
        props.size
      )
      const renderAutoCompleteOptionRows = () => {
        const range = optionWindow.range.value
        const source =
          virtualizeOptions && range.endIndex >= range.startIndex
            ? options.slice(range.startIndex, range.endIndex + 1)
            : options
        const nodes = source.map((option, offset) => {
          const index = virtualizeOptions ? range.startIndex + offset : offset
          const selectedFlag = isSameAutoCompleteValue(option.value, selected.value)
          const isActive = index === activeIndex.value
          return h(
            'div',
            {
              key: getAutoCompleteOptionKey(option, index),
              id: getPickerOptionId(listboxId, index),
              'data-active': isActive || undefined,
              ...getPickerOptionAria({
                selected: selectedFlag,
                disabled: !!option.disabled
              }),
              class: getAutoCompleteOptionClasses({
                isSelected: selectedFlag,
                isDisabled: !!option.disabled,
                isActive,
                size: props.size
              }),
              style: virtualizeOptions
                ? { height: `${getAutoCompleteVirtualItemHeight(props.size)}px` }
                : undefined,
              onMousedown: (event: Event) => event.preventDefault(),
              onClick: () => handleSelect(option),
              onMouseenter: () => {
                if (!option.disabled) activeIndex.value = index
              }
            },
            option.label
          )
        })
        if (!virtualizeOptions) return nodes
        return [
          h(
            'div',
            { style: { height: `${range.totalHeight}px`, position: 'relative' } },
            [
              h(
                'div',
                { style: { transform: `translateY(${range.offsetTop}px)` } },
                nodes
              )
            ]
          )
        ]
      }
      const dropdown = isOpen.value
        ? renderVueOverlayTeleport(
            h(
              'div',
              {
                ref: dropdownRef,
                class: classNames(
                  autoCompleteDropdownClasses,
                  overlay.floatingClasses.value,
                  props.dropdownClassName
                ),
                style: overlay.floatingStyles.value as CSSProperties,
                'data-positioned': overlay.positioned.value,
                id: popupId,
                'data-tiger-autocomplete-dropdown': '',
                onMousedown: (event: Event) => event.preventDefault(),
                onFocusout: handleFocusOut
              },
              [
                hasOptions.value
                  ? h(
                      'div',
                      {
                        class: autoCompleteListboxClasses,
                        style: shouldVirtualizeAutoCompleteList(
                          options.length,
                          props.listHeight,
                          props.size
                        )
                          ? { height: `${props.listHeight}px`, overflow: 'auto' }
                          : getAutoCompletePanelStyle(props.listHeight),
                        ref: shouldVirtualizeAutoCompleteList(
                          options.length,
                          props.listHeight,
                          props.size
                        )
                          ? optionWindow.bindRef
                          : undefined,
                        onScroll: shouldVirtualizeAutoCompleteList(
                          options.length,
                          props.listHeight,
                          props.size
                        )
                          ? optionWindow.onScroll
                          : undefined,
                        'data-tiger-autocomplete-virtual': shouldVirtualizeAutoCompleteList(
                          options.length,
                          props.listHeight,
                          props.size
                        )
                          ? ''
                          : undefined,
                        ...getPickerListboxAria({ id: listboxId })
                      },
                      renderAutoCompleteOptionRows()
                    )
                  : h(
                      'div',
                      { class: autoCompleteEmptyStateClasses, role: 'status', 'aria-live': 'polite' },
                      props.loading
                        ? (mergedLocale.value?.common?.loadingText ?? 'Loading...')
                        : resolveLocaleText(emptyLabels.value.noResults, props.emptyText)
                    ),
                h('div', { class: autoCompleteDoneActionClasses }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: autoCompleteDoneButtonClasses,
                      onClick: finishEdit
                    },
                    selectLabels.value.doneText
                  )
                ])
              ]
            ),
            overlay.target.value
          )
        : null

      return h(
        'div',
        {
          ref: rootRef,
          class: getAutoCompleteRootClasses(
            inputGroup != null,
            classNames(props.className, coerceClassValue(attrClass))
          ),
          style: (attrStyle as CSSProperties) ?? undefined,
          [TIGER_CHROME_ATTR]: '',
          onAnimationend: () => rootRef.value?.classList.remove(SHAKE_CLASS)
        },
        [
          effectiveName
            ? h('input', {
                ref: hiddenRef,
                type: 'hidden',
                name: effectiveName,
                value: selected.value === undefined ? '' : String(selected.value),
                disabled: effectiveDisabled.value || undefined
              })
            : null,
          sanitized.value?.invalid && !formItemControl
            ? h(
                'p',
                { role: 'status', 'aria-live': 'polite' },
                AUTO_COMPLETE_INVALID_VALUE
              )
            : null,
          h('div', { class: 'relative' }, [
            h('input', {
              ...restAttrs,
              ref: inputRef,
              type: 'text',
              onCompositionstart: () => {
                composing.value = true
              },
              onCompositionend: () => {
                composing.value = false
              },
              class: getAutoCompleteInputClasses({
                size: props.size,
                disabled: effectiveDisabled.value,
                isOpen: isOpen.value,
                status: status.value,
                hasClear: showClear.value
              }),
              value: searchQuery.value,
              placeholder: props.placeholder,
              disabled: effectiveDisabled.value,
              autocomplete: 'off',
              onInput: handleInput,
              onFocus: handleFocus,
              onKeydown: handleKeyDown,
              onFocusout: handleFocusOut,
              ...comboboxAria
            }),
            showClear.value
              ? h('span', { class: autoCompleteTrailingSlotClasses }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: autoCompleteClearButtonClasses,
                      'data-tiger-autocomplete-clear': '',
                      'aria-label': mergedLocale.value?.common?.clearText ?? 'Clear',
                      onMousedown: (event: Event) => event.preventDefault(),
                      onClick: handleClear
                    },
                    [iconVNode(closeSolidIcon20PathD, autoCompleteClearIconClasses)]
                  )
                ])
              : null
          ]),
          dropdown
        ]
      )
    }
  }
})

export default AutoComplete
