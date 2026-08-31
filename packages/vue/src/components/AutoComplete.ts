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
  classNames,
  closeSolidIcon20PathD,
  coerceAutoCompleteFormValue,
  coerceClassValue,
  filterAutoCompleteOptions,
  getAutoCompleteInputClasses,
  getAutoCompleteKeyIntent,
  getAutoCompleteOptionClasses,
  getAutoCompleteOptionKey,
  getAutoCompletePanelStyle,
  getAutoCompleteRootClasses,
  getEmptyLabels,
  getInitialPickerActiveIndex,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerNavigationIndex,
  getPickerOptionAria,
  getPickerOptionId,
  getSelectLabels,
  icon20ViewBox,
  isSameAutoCompleteValue,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  resolveAutoCompleteBlurCommit,
  resolveAutoCompleteIdleQuery,
  resolveAutoCompleteInitialQuery,
  resolveLocaleText,
  runShakeAnimation,
  shouldShowAutoCompleteClear
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
  emits: [
    'update:modelValue',
    'update:searchValue',
    'update:open',
    'change',
    'select',
    'search-change',
    'open-change',
    'blur',
    'focus'
  ],
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

    const initialCommitted =
      props.modelValue ??
      coerceAutoCompleteFormValue(formItemControl?.value.value) ??
      props.defaultValue
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
    const isEditing = ref(false)
    const hadCommitted = ref(initialCommitted !== undefined)
    const rootRef = ref<HTMLElement | null>(null)
    const inputRef = ref<HTMLInputElement | null>(null)
    const dropdownRef = ref<HTMLElement | null>(null)

    const selected = computed(() =>
      props.modelValue !== undefined
        ? props.modelValue
        : (coerceAutoCompleteFormValue(formItemControl?.value.value) ?? localValue.value)
    )
    const isOpen = computed(() => (props.open !== undefined ? props.open : localOpen.value))
    const searchQuery = computed(() => props.searchValue ?? localSearch.value)
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )
    const filteredOptions = computed(() =>
      filterAutoCompleteOptions(props.options, searchQuery.value, props.filterOption)
    )
    const hasOptions = computed(() => filteredOptions.value.length > 0)
    const showClear = computed(() =>
      shouldShowAutoCompleteClear({
        clearable: props.clearable,
        disabled: effectiveDisabled.value,
        query: searchQuery.value,
        committed: selected.value
      })
    )

    watch(
      () => [props.modelValue, formItemControl?.value.value] as const,
      ([model, formValue]) => {
        const next = model !== undefined ? model : coerceAutoCompleteFormValue(formValue)
        if (next === undefined) return
        localValue.value = next
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

    watch([selected, () => props.options], () => {
      if (props.searchValue !== undefined) return
      if (isEditing.value) return
      if (selected.value === undefined) {
        if (hadCommitted.value) localSearch.value = ''
        hadCommitted.value = false
        return
      }
      hadCommitted.value = true
      localSearch.value = resolveAutoCompleteIdleQuery(selected.value, props.options)
    })

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

    function setSelected(next: AutoCompleteValue | undefined, option?: AutoCompleteOption) {
      if (props.modelValue === undefined) localValue.value = next
      emit('update:modelValue', next)
      emit('change', next)
      formItemControl?.onChange(next)
      if (option) emit('select', option.value, option)
    }

    function openDropdown() {
      if (effectiveDisabled.value) return
      setOpen(true)
      activeIndex.value = getInitialPickerActiveIndex(
        filteredOptions.value,
        props.defaultActiveFirstOption
      )
    }

    function closeDropdown() {
      setOpen(false)
      activeIndex.value = -1
    }

    function commitCurrentQuery() {
      const result = resolveAutoCompleteBlurCommit({
        query: searchQuery.value,
        committed: selected.value,
        optionList: props.options,
        allowFreeInput: props.allowFreeInput
      })
      setSearch(result.query)
      if (result.didCommit) setSelected(result.value, result.option)
      return result
    }

    function revertQuery() {
      setSearch(resolveAutoCompleteIdleQuery(selected.value, props.options))
    }

    function handleDismiss(reason: 'outside' | 'escape') {
      if (reason === 'escape') {
        isEditing.value = false
        revertQuery()
        closeDropdown()
        return
      }
      isEditing.value = false
      commitCurrentQuery()
      closeDropdown()
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
      if (option.disabled || effectiveDisabled.value) return
      isEditing.value = false
      setSearch(option.label)
      setSelected(option.value, option)
      closeDropdown()
    }

    function handleInput(event: Event) {
      if (effectiveDisabled.value) return
      const next = (event.target as HTMLInputElement).value
      isEditing.value = true
      setSearch(next)
      if (!isOpen.value) setOpen(true)
      activeIndex.value = getInitialPickerActiveIndex(
        filterAutoCompleteOptions(props.options, next, props.filterOption),
        props.defaultActiveFirstOption
      )
    }

    function handleClear(event: Event) {
      event.preventDefault()
      event.stopPropagation()
      isEditing.value = true
      setSearch('')
      setSelected(undefined)
      nextTick(() => inputRef.value?.focus())
      if (!isOpen.value) setOpen(true)
      activeIndex.value = getInitialPickerActiveIndex(props.options, props.defaultActiveFirstOption)
    }

    function handleFocus(event: FocusEvent) {
      isEditing.value = true
      openDropdown()
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
      isEditing.value = false
      commitCurrentQuery()
      closeDropdown()
      formItemControl?.onBlur()
      emit('blur', event)
    }

    function handleKeyDown(event: KeyboardEvent) {
      const intent = getAutoCompleteKeyIntent(event.key, isOpen.value, activeIndex.value)
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
          return
        case 'select-active': {
          event.preventDefault()
          const option = filteredOptions.value[activeIndex.value]
          if (option) handleSelect(option)
          return
        }
        case 'commit-query':
          event.preventDefault()
          isEditing.value = false
          commitCurrentQuery()
          closeDropdown()
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
      const expanded = isOpen.value && hasOptions.value
      const comboboxAria = {
        ...getPickerComboboxAria({
          expanded,
          listboxId,
          activeIndex: expanded ? activeIndex.value : -1
        }),
        'aria-autocomplete': 'list' as const,
        id: effectiveId,
        name: effectiveName,
        'aria-label': ariaLabel,
        'aria-labelledby': labelledby,
        'aria-describedby': describedBy,
        'aria-invalid': status.value === 'error' ? true : undefined,
        'aria-required': formItemControl?.required.value ? true : undefined
      }

      const options = filteredOptions.value
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
                        style: getAutoCompletePanelStyle(props.listHeight),
                        ...getPickerListboxAria({ id: listboxId })
                      },
                      options.map((option, index) => {
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
                            onMousedown: (event: Event) => event.preventDefault(),
                            onClick: () => handleSelect(option),
                            onMouseenter: () => {
                              if (!option.disabled) activeIndex.value = index
                            }
                          },
                          option.label
                        )
                      })
                    )
                  : h(
                      'div',
                      { class: autoCompleteEmptyStateClasses },
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
                      onClick: closeDropdown
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
          h('div', { class: 'relative' }, [
            h('input', {
              ...restAttrs,
              ref: inputRef,
              type: 'text',
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
