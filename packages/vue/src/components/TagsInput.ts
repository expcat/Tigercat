import { computed, defineComponent, h, inject, ref, useId, watch, type PropType } from 'vue'
import {
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  classNames,
  coerceClassValue,
  commitTagCandidates,
  extractTagCandidates,
  formatRemoveTagLabel,
  getTagsArrowDelta,
  getTagsInputClearButtonClasses,
  getTagsInputContainerClasses,
  getTagsInputErrorClasses,
  getTagsInputHighlightClasses,
  getTagsInputInnerInputClasses,
  getTagsInputLabels,
  mergeAriaDescribedBy,
  mergeStyleValues,
  moveTagsHighlight,
  removeTagAt,
  resolveTagsPasteCandidates,
  runShakeAnimation,
  type ComponentSize,
  type InputStatus
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'
import { INPUT_GROUP_INJECTION_KEY, type InputGroupContext } from './InputGroup'
import { Icon } from './Icon'
import { Tag } from './Tag'

export type VueTagsInputProps = InstanceType<typeof TagsInput>['$props']
export type TagsInputProps = VueTagsInputProps

export const TagsInput = defineComponent({
  name: 'TigerTagsInput',
  inheritAttrs: false,
  props: {
    modelValue: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: () => [] },
    size: { type: String as PropType<ComponentSize>, default: undefined },
    status: { type: String as PropType<InputStatus>, default: undefined },
    errorMessage: String,
    placeholder: { type: String, default: '' },
    allowDuplicates: Boolean,
    max: { type: Number, default: undefined },
    delimiters: { type: Array as PropType<string[]>, default: () => [','] },
    addOnBlur: Boolean,
    beforeAdd: {
      type: Function as PropType<(tag: string) => boolean | string>,
      default: undefined
    },
    clearable: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    name: String,
    id: String,
    removeTagAriaLabel: String,
    _shakeTrigger: { type: Number, default: undefined },
    className: String,
    style: { type: Object as PropType<Record<string, string | number>>, default: undefined }
  },
  emits: {
    'update:modelValue': null,
    add: null,
    remove: null,
    clear: null,
    focus: null,
    blur: null
  },
  setup(props, { emit, attrs, expose }) {
    const config = useTigerConfig()
    const inputGroup = inject<InputGroupContext | null>(INPUT_GROUP_INJECTION_KEY, null)
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const inGroup = computed(() => inputGroup != null)
    const effectiveSize = computed(() => props.size ?? inputGroup?.size ?? 'md')
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const effectiveId = computed(() => props.id ?? formItemControl?.id.value)
    const effectiveName = computed(() => props.name ?? formItemControl?.name.value)
    const formValue = computed(() => formItemControl?.value.value)
    const dir = computed(() => (config.value.direction === 'rtl' ? 'rtl' : 'ltr'))
    const labels = computed(() => getTagsInputLabels(config.value.locale))
    const errorMsgId = `tiger-tags-input-error-${useId()}`

    const containerRef = ref<HTMLDivElement | null>(null)
    const inputRef = ref<HTMLInputElement | null>(null)
    const localTags = ref<string[]>([...(props.defaultValue ?? [])])
    const tags = computed(() =>
      props.modelValue !== undefined
        ? props.modelValue
        : Array.isArray(formValue.value)
          ? formValue.value
          : localTags.value
    )
    const inputText = ref('')
    const highlightedIndex = ref<number | null>(null)
    const isInteractive = computed(() => !effectiveDisabled.value && !props.readonly)

    watch(
      () => [props.modelValue, formValue.value] as const,
      ([model, controlValue]) => {
        const source =
          model !== undefined ? model : Array.isArray(controlValue) ? controlValue : undefined
        if (source === undefined) return
        localTags.value = source
      }
    )

    watch(
      () => [status.value, formItemControl?.shakeTrigger.value, props._shakeTrigger] as const,
      (current, previous) => {
        if (!previous) return
        if (current[0] === 'error') runShakeAnimation(containerRef.value)
      },
      { flush: 'post' }
    )

    function setTags(next: string[]) {
      if (props.modelValue === undefined && !Array.isArray(formValue.value)) {
        localTags.value = next
      }
      emit('update:modelValue', next)
      formItemControl?.onChange(next)
    }

    function commitCandidates(candidates: string[], pendingFallback?: string) {
      const result = commitTagCandidates(tags.value, candidates, {
        allowDuplicates: props.allowDuplicates,
        max: props.max,
        beforeAdd: props.beforeAdd,
        pendingFallback
      })
      if (result.added.length > 0) {
        setTags(result.tags)
        result.added.forEach((tag) => emit('add', tag))
      }
      return result
    }

    function removeAt(index: number) {
      const tag = tags.value[index]
      if (tag === undefined) return
      setTags(removeTagAt(tags.value, index))
      emit('remove', tag, index)
    }

    function handleInput(event: Event) {
      if (!isInteractive.value) return
      highlightedIndex.value = null
      const target = event.target as HTMLInputElement
      const { candidates, pending } = extractTagCandidates(target.value, props.delimiters)
      if (candidates.length > 0) {
        const result = commitCandidates(candidates, pending || candidates.at(-1))
        inputText.value = result.added.length > 0 ? pending : result.pending || pending
        target.value = inputText.value
        return
      }
      inputText.value = pending
    }

    function handleKeydown(event: KeyboardEvent) {
      if (!isInteractive.value) return
      if (event.key === 'Enter') {
        if (!inputText.value.trim()) return
        event.preventDefault()
        const result = commitCandidates([inputText.value], inputText.value)
        inputText.value = result.added.length > 0 ? '' : result.pending
        return
      }
      if (event.key === 'Backspace' && inputText.value === '') {
        if (highlightedIndex.value !== null) {
          removeAt(highlightedIndex.value)
          highlightedIndex.value = null
        } else if (tags.value.length > 0) {
          highlightedIndex.value = tags.value.length - 1
        }
        return
      }
      if (event.key === 'Delete' && highlightedIndex.value !== null) {
        removeAt(highlightedIndex.value)
        highlightedIndex.value = null
        return
      }
      const delta = getTagsArrowDelta(event.key, dir.value)
      if (delta !== null && inputText.value === '' && tags.value.length > 0) {
        highlightedIndex.value = moveTagsHighlight(highlightedIndex.value, tags.value.length, delta)
        return
      }
      if (event.key === 'Escape' && highlightedIndex.value !== null) {
        highlightedIndex.value = null
        return
      }
      if (highlightedIndex.value !== null) highlightedIndex.value = null
    }

    function handlePaste(event: ClipboardEvent) {
      if (!isInteractive.value) return
      const text = event.clipboardData?.getData('text') ?? ''
      const candidates = resolveTagsPasteCandidates(inputText.value, text, props.delimiters)
      if (candidates.length <= 1) return
      event.preventDefault()
      const result = commitCandidates(candidates, inputText.value)
      inputText.value = result.added.length > 0 ? '' : result.pending
      if (inputRef.value) inputRef.value.value = inputText.value
    }

    function handleBlur(event: FocusEvent) {
      const next = event.relatedTarget as Node | null
      if (containerRef.value && next && containerRef.value.contains(next)) return
      highlightedIndex.value = null
      if (props.addOnBlur && inputText.value.trim() && isInteractive.value) {
        const result = commitCandidates([inputText.value], inputText.value)
        if (result.added.length > 0) inputText.value = ''
      }
      formItemControl?.onBlur()
      emit('blur', event)
    }

    function handleClear() {
      if (!isInteractive.value || tags.value.length === 0) return
      setTags([])
      inputText.value = ''
      highlightedIndex.value = null
      emit('clear')
      inputRef.value?.focus()
    }

    function handleContainerClick(event: MouseEvent) {
      if (event.target instanceof HTMLButtonElement) return
      inputRef.value?.focus()
    }

    expose({
      focus: () => inputRef.value?.focus(),
      input: inputRef
    })

    return () => {
      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs
      const activeError = status.value === 'error' && !!props.errorMessage
      const hasExtras = activeError
      const isFull = props.max !== undefined && tags.value.length >= props.max
      const removeLabelTemplate = props.removeTagAriaLabel ?? labels.value.removeTagLabel
      const tagSize = effectiveSize.value === 'lg' ? 'md' : 'sm'
      const labelledby =
        typeof restAttrs['aria-labelledby'] === 'string' && restAttrs['aria-labelledby'].trim()
          ? restAttrs['aria-labelledby']
          : formItemControl?.labelId.value
      const describedBy = mergeAriaDescribedBy(
        mergeAriaDescribedBy(
          typeof restAttrs['aria-describedby'] === 'string'
            ? restAttrs['aria-describedby']
            : undefined,
          activeError ? errorMsgId : undefined
        ),
        formItemControl?.describedBy.value
      )

      const children: ReturnType<typeof h>[] = []
      tags.value.forEach((tag, index) => {
        children.push(
          h(
            Tag,
            {
              key: `${tag}-${index}`,
              size: tagSize,
              closable: isInteractive.value,
              closeTabIndex: -1,
              closeAriaLabel: formatRemoveTagLabel(removeLabelTemplate, tag),
              class: index === highlightedIndex.value ? getTagsInputHighlightClasses() : undefined,
              'aria-current': index === highlightedIndex.value ? 'true' : undefined,
              onClose: (event: MouseEvent) => {
                event.preventDefault()
                removeAt(index)
                inputRef.value?.focus()
              }
            },
            () => tag
          )
        )
      })

      children.push(
        h('input', {
          key: 'text-input',
          ref: inputRef,
          class: getTagsInputInnerInputClasses(),
          type: 'text',
          value: inputText.value,
          placeholder: tags.value.length === 0 ? props.placeholder : '',
          disabled: effectiveDisabled.value,
          readonly: props.readonly,
          id: effectiveId.value,
          'aria-label':
            typeof restAttrs['aria-label'] === 'string' ? restAttrs['aria-label'] : undefined,
          'aria-labelledby': labelledby,
          'aria-invalid': status.value === 'error' ? true : undefined,
          'aria-required': formItemControl?.required.value ? true : undefined,
          'aria-describedby': describedBy,
          onInput: handleInput,
          onKeydown: handleKeydown,
          onPaste: handlePaste,
          onFocus: (event: FocusEvent) => emit('focus', event),
          onFocusout: handleBlur
        })
      )

      if (props.clearable && tags.value.length > 0 && isInteractive.value) {
        children.push(
          h(
            'button',
            {
              key: 'clear',
              type: 'button',
              class: getTagsInputClearButtonClasses(),
              onMousedown: (event: Event) => event.preventDefault(),
              onClick: handleClear,
              'aria-label': labels.value.clearAllLabel,
              tabindex: -1
            },
            [h(Icon, { name: 'close', size: 'sm', 'aria-hidden': true })]
          )
        )
      }

      if (effectiveName.value && !effectiveDisabled.value) {
        tags.value.forEach((tag, index) => {
          children.push(
            h('input', {
              key: `hidden-${index}`,
              type: 'hidden',
              name: effectiveName.value,
              value: tag
            })
          )
        })
      }

      const containerNode = h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          class: classNames(
            getTagsInputContainerClasses(effectiveSize.value, status.value, {
              disabled: effectiveDisabled.value,
              inGroup: inGroup.value && !hasExtras
            }),
            !hasExtras ? props.className : undefined,
            !hasExtras ? coerceClassValue(attrClass) : undefined
          ),
          style: !hasExtras
            ? mergeStyleValues(props.style, attrStyle as Record<string, unknown> | undefined)
            : undefined,
          'data-state': isFull ? 'full' : undefined,
          [TIGER_CHROME_ATTR]: '',
          onClick: handleContainerClick,
          onAnimationend: () => containerRef.value?.classList.remove(SHAKE_CLASS)
        },
        children
      )

      if (!hasExtras) return containerNode
      return h(
        'div',
        {
          class: classNames(
            inGroup.value ? 'flex flex-col flex-1 min-w-0' : 'flex flex-col w-full',
            props.className,
            coerceClassValue(attrClass)
          ),
          style: mergeStyleValues(props.style, attrStyle as Record<string, unknown> | undefined)
        },
        [
          containerNode,
          h(
            'div',
            { id: errorMsgId, class: getTagsInputErrorClasses(), 'aria-live': 'polite' },
            props.errorMessage
          )
        ]
      )
    }
  }
})

export default TagsInput
