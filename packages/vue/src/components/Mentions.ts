import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  ref,
  useId,
  watch,
  type CSSProperties,
  type PropType
} from 'vue'
import type {
  ComponentSize,
  FloatingPlacement,
  InputStatus,
  MentionOption,
  MentionsFilterOption,
  TigerLocale
} from '@expcat/tigercat-core'
import {
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  callUnknownEventHandler,
  classNames,
  coerceClassValue,
  extractMentionQuery,
  filterMentionOptions,
  getEmptyLabels,
  getInitialMentionsActiveIndex,
  getInputErrorClasses,
  getMentionOptionKey,
  getMentionsKeyIntent,
  getMentionsOptionClasses,
  getMentionsPanelStyle,
  getMentionsTextareaClasses,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerNavigationIndex,
  getPickerOptionAria,
  getPickerOptionId,
  insertMention,
  mentionsDropdownClasses,
  mentionsEmptyStateClasses,
  mentionsListboxClasses,
  mergeAriaDescribedBy,
  mergeStyleValues,
  mergeTigerLocale,
  resolveLocaleText,
  runShakeAnimation,
  shouldOpenMentions
} from '@expcat/tigercat-core'
import { renderVueOverlayTeleport, useVueAnchoredOverlay } from '../utils/overlay'
import { useTigerConfig } from './ConfigProvider'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'
import { INPUT_GROUP_INJECTION_KEY, type InputGroupContext } from './InputGroup'

export interface VueMentionsProps {
  modelValue?: string
  defaultValue?: string
  open?: boolean
  defaultOpen?: boolean
  prefix?: string | string[]
  options?: MentionOption[]
  placeholder?: string
  disabled?: boolean
  size?: ComponentSize
  rows?: number
  status?: InputStatus
  errorMessage?: string
  name?: string
  loading?: boolean
  filterOption?: MentionsFilterOption
  placement?: FloatingPlacement
  offset?: number
  dropdownClassName?: string
  getPopupContainer?: () => HTMLElement | null
  listHeight?: number
  locale?: Partial<TigerLocale>
  className?: string
}

export type MentionsProps = VueMentionsProps
export type { MentionOption }

export const Mentions = defineComponent({
  name: 'TigerMentions',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: '' },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    prefix: { type: [String, Array] as PropType<string | string[]>, default: '@' },
    options: { type: Array as PropType<MentionOption[]>, default: () => [] },
    placeholder: { type: String, default: undefined },
    disabled: Boolean,
    size: { type: String as PropType<ComponentSize>, default: 'md' },
    rows: { type: Number, default: 3 },
    status: { type: String as PropType<InputStatus>, default: undefined },
    errorMessage: String,
    name: String,
    loading: Boolean,
    filterOption: {
      type: [Boolean, Function] as PropType<MentionsFilterOption>,
      default: true
    },
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
    'update:open',
    'change',
    'select',
    'search',
    'open-change',
    'focus',
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
    const emptyLabels = computed(() => getEmptyLabels(mergedLocale.value))
    const loadingText = computed(() => mergedLocale.value?.common?.loadingText ?? 'Loading...')
    const resolvedEmptyText = computed(() => resolveLocaleText(emptyLabels.value.noResults))
    const instanceId = useId()
    const listboxId = `tiger-mentions-listbox-${instanceId}`
    const errorMsgId = `tiger-mentions-error-${instanceId}`

    const formValue = computed(() => formItemControl?.value.value)
    const initialValue =
      props.modelValue ??
      (typeof formValue.value === 'string' ? formValue.value : undefined) ??
      props.defaultValue
    const localValue = ref(initialValue ?? '')
    const localOpen = ref(props.defaultOpen)
    const query = ref('')
    const activeIndex = ref(-1)
    const mentionStartPos = ref(-1)
    const mentionEndPos = ref(-1)
    const mentionPrefix = ref('@')
    const dismissed = ref(false)
    const liveText = ref(initialValue ?? '')
    const textareaRef = ref<HTMLTextAreaElement | null>(null)
    const dropdownRef = ref<HTMLDivElement | null>(null)

    const currentValue = computed(() =>
      props.modelValue !== undefined
        ? props.modelValue
        : typeof formValue.value === 'string'
          ? formValue.value
          : localValue.value
    )
    const isOpen = computed(() => (props.open !== undefined ? props.open : localOpen.value))
    const inGroup = computed(() => inputGroup != null)
    const effectiveSize = computed(() => props.size ?? inputGroup?.size ?? 'md')
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const filteredOptions = computed(() =>
      filterMentionOptions(props.options, query.value, props.filterOption)
    )
    const expanded = computed(
      () =>
        isOpen.value &&
        shouldOpenMentions({
          query:
            mentionStartPos.value >= 0
              ? {
                  query: query.value,
                  startPos: mentionStartPos.value,
                  prefix: mentionPrefix.value
                }
              : null,
          filteredCount: filteredOptions.value.length,
          loading: props.loading
        })
    )
    const activeError = computed(() => status.value === 'error' && !!props.errorMessage)
    const hasExtras = computed(() => activeError.value)

    watch(
      () => [props.modelValue, formValue.value] as const,
      ([model, controlValue]) => {
        const source =
          model !== undefined ? model : typeof controlValue === 'string' ? controlValue : undefined
        if (source === undefined) return
        if (source !== localValue.value) localValue.value = source
      }
    )

    watch(
      () => [status.value, formItemControl?.shakeTrigger.value] as const,
      (current, previous) => {
        if (!previous) return
        if (current[0] === 'error') runShakeAnimation(textareaRef.value)
      },
      { flush: 'post' }
    )

    function setOpen(next: boolean) {
      if (props.open === undefined) localOpen.value = next
      emit('update:open', next)
      emit('open-change', next)
    }

    function commitValue(next: string, caret?: number) {
      liveText.value = next
      if (props.modelValue === undefined && typeof formValue.value !== 'string') {
        localValue.value = next
      }
      if (textareaRef.value) textareaRef.value.value = next
      emit('update:modelValue', next)
      emit('change', next)
      formItemControl?.onChange(next)
      if (caret !== undefined) {
        nextTick(() => {
          textareaRef.value?.setSelectionRange(caret, caret)
        })
      }
    }

    function applyQuery(text: string, cursor: number) {
      const result = extractMentionQuery(text, cursor, props.prefix)
      if (result) {
        mentionStartPos.value = result.startPos
        mentionEndPos.value = cursor
        mentionPrefix.value = result.prefix
        query.value = result.query
        emit('search', result.query)
        const nextFiltered = filterMentionOptions(props.options, result.query, props.filterOption)
        setOpen(
          shouldOpenMentions({
            query: result,
            filteredCount: nextFiltered.length,
            loading: props.loading
          })
        )
        activeIndex.value = getInitialMentionsActiveIndex(nextFiltered)
        return
      }
      mentionStartPos.value = -1
      mentionEndPos.value = -1
      query.value = ''
      setOpen(false)
      activeIndex.value = -1
    }

    watch(
      () => [props.options, props.loading] as const,
      () => {
        if (dismissed.value) return
        const textarea = textareaRef.value
        const text = textarea?.value ?? currentValue.value
        const result = extractMentionQuery(
          text,
          textarea?.selectionStart ?? text.length,
          props.prefix
        )
        if (!result) return
        const nextFiltered = filterMentionOptions(props.options, result.query, props.filterOption)
        setOpen(
          shouldOpenMentions({
            query: result,
            filteredCount: nextFiltered.length,
            loading: props.loading
          })
        )
      }
    )

    function closeDropdown() {
      dismissed.value = true
      setOpen(false)
      activeIndex.value = -1
    }

    const overlay = useVueAnchoredOverlay({
      enabled: expanded,
      referenceRef: textareaRef,
      floatingRef: dropdownRef,
      containerRef: textareaRef,
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

    function selectOption(option: MentionOption) {
      if (option.disabled || effectiveDisabled.value) return
      const textarea = textareaRef.value
      const text = liveText.value || textarea?.value || currentValue.value
      const cursor =
        mentionEndPos.value >= 0 ? mentionEndPos.value : (textarea?.selectionStart ?? text.length)
      const result = insertMention({
        text,
        mentionStart: mentionStartPos.value,
        cursor,
        prefix: mentionPrefix.value,
        value: option.value
      })
      commitValue(result.value, result.caret)
      emit('select', option)
      mentionStartPos.value = -1
      mentionEndPos.value = -1
      query.value = ''
      closeDropdown()
      textarea?.focus()
    }

    function handleInput(event: Event) {
      if (effectiveDisabled.value) return
      dismissed.value = false
      const target = event.target as HTMLTextAreaElement
      liveText.value = target.value
      commitValue(target.value)
      applyQuery(target.value, target.selectionStart ?? target.value.length)
    }

    function handleKeydown(event: KeyboardEvent) {
      const intent = getMentionsKeyIntent(event.key, expanded.value)
      switch (intent.type) {
        case 'navigate':
          event.preventDefault()
          activeIndex.value = getPickerNavigationIndex(
            filteredOptions.value,
            activeIndex.value,
            intent.key
          )
          return
        case 'select-active': {
          const option = filteredOptions.value[activeIndex.value]
          if (!option || option.disabled) return
          event.preventDefault()
          selectOption(option)
          return
        }
        case 'close':
          event.preventDefault()
          closeDropdown()
          return
        default:
          return
      }
    }

    function handleFocusOut(event: FocusEvent) {
      const next = event.relatedTarget as Node | null
      if (
        (textareaRef.value && next && textareaRef.value.contains(next)) ||
        (dropdownRef.value && next && dropdownRef.value.contains(next))
      ) {
        return
      }
      closeDropdown()
      formItemControl?.onBlur()
      emit('blur', event)
    }

    expose({
      focus: () => textareaRef.value?.focus(),
      textarea: textareaRef,
      open: () => setOpen(true),
      close: closeDropdown
    })

    return () => {
      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs
      const ariaLabel =
        typeof restAttrs['aria-label'] === 'string' ? restAttrs['aria-label'] : undefined
      const attrLabelledby =
        typeof restAttrs['aria-labelledby'] === 'string' ? restAttrs['aria-labelledby'] : undefined
      const labelledby = attrLabelledby?.trim() ? attrLabelledby : formItemControl?.labelId.value
      const describedBy = mergeAriaDescribedBy(
        mergeAriaDescribedBy(
          typeof restAttrs['aria-describedby'] === 'string'
            ? restAttrs['aria-describedby']
            : undefined,
          activeError.value ? errorMsgId : undefined
        ),
        formItemControl?.describedBy.value
      )
      const attrId = typeof restAttrs.id === 'string' ? restAttrs.id : undefined
      const effectiveId = attrId ?? formItemControl?.id.value
      const effectiveName = props.name ?? formItemControl?.name.value
      const comboboxAria = {
        ...getPickerComboboxAria({
          expanded: expanded.value,
          listboxId,
          activeIndex: expanded.value ? activeIndex.value : -1
        }),
        'aria-autocomplete': 'list' as const
      }

      const textarea = h('textarea', {
        ...restAttrs,
        ...comboboxAria,
        ref: textareaRef,
        class: classNames(
          getMentionsTextareaClasses({
            size: effectiveSize.value,
            status: status.value,
            inGroup: inGroup.value && !hasExtras.value
          }),
          !hasExtras.value ? props.className : undefined,
          !hasExtras.value ? coerceClassValue(attrClass) : undefined
        ),
        style: !hasExtras.value ? mergeStyleValues(undefined, attrStyle) : undefined,
        value: currentValue.value,
        placeholder: props.placeholder,
        disabled: effectiveDisabled.value,
        rows: props.rows,
        name: effectiveName,
        id: effectiveId,
        'aria-label': ariaLabel,
        'aria-labelledby': labelledby,
        'aria-invalid': status.value === 'error' ? true : restAttrs['aria-invalid'],
        'aria-required': formItemControl?.required.value ? true : restAttrs['aria-required'],
        'aria-describedby': describedBy,
        [TIGER_CHROME_ATTR]: '',
        onInput: (event: Event) => {
          handleInput(event)
          callUnknownEventHandler(restAttrs.onInput, event)
        },
        onKeydown: handleKeydown,
        onFocus: (event: FocusEvent) => emit('focus', event),
        onFocusout: (event: FocusEvent) => {
          handleFocusOut(event)
          callUnknownEventHandler(restAttrs.onFocusout, event)
        },
        onAnimationend: () => textareaRef.value?.classList.remove(SHAKE_CLASS)
      })

      const dropdown = expanded.value
        ? renderVueOverlayTeleport(
            h(
              'div',
              {
                ref: dropdownRef,
                class: classNames(
                  mentionsDropdownClasses,
                  overlay.floatingClasses.value,
                  props.dropdownClassName
                ),
                style: overlay.floatingStyles.value as CSSProperties,
                'data-positioned': overlay.positioned.value,
                onMousedown: (event: Event) => event.preventDefault()
              },
              [
                props.loading && filteredOptions.value.length === 0
                  ? h('div', { class: mentionsEmptyStateClasses }, loadingText.value)
                  : filteredOptions.value.length === 0
                    ? h('div', { class: mentionsEmptyStateClasses }, resolvedEmptyText.value)
                    : h(
                        'div',
                        {
                          class: mentionsListboxClasses,
                          style: getMentionsPanelStyle(props.listHeight),
                          ...getPickerListboxAria({ id: listboxId })
                        },
                        filteredOptions.value.map((option, index) => {
                          const isActive = index === activeIndex.value
                          return h(
                            'div',
                            {
                              key: getMentionOptionKey(option, index),
                              id: getPickerOptionId(listboxId, index),
                              'data-active': isActive || undefined,
                              ...getPickerOptionAria({
                                selected: false,
                                disabled: !!option.disabled
                              }),
                              class: getMentionsOptionClasses({
                                isActive,
                                isDisabled: !!option.disabled,
                                size: effectiveSize.value
                              }),
                              onMousedown: (event: Event) => event.preventDefault(),
                              onClick: () => selectOption(option),
                              onMouseenter: () => {
                                if (!option.disabled) activeIndex.value = index
                              }
                            },
                            option.label
                          )
                        })
                      )
              ]
            ),
            overlay.target.value
          )
        : null

      if (!hasExtras.value) {
        return [textarea, dropdown]
      }

      return h(
        'div',
        {
          class: classNames(
            inGroup.value ? 'flex flex-col flex-1 min-w-0' : 'flex flex-col w-full',
            props.className,
            coerceClassValue(attrClass)
          ),
          style: mergeStyleValues(undefined, attrStyle)
        },
        [
          textarea,
          activeError.value
            ? h(
                'div',
                {
                  id: errorMsgId,
                  class: getInputErrorClasses(effectiveSize.value),
                  'aria-live': 'polite'
                },
                props.errorMessage
              )
            : null,
          dropdown
        ]
      )
    }
  }
})

export default Mentions
