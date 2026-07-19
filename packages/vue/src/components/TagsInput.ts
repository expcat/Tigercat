import { computed, defineComponent, h, inject, ref, watch, type PropType } from 'vue'
import {
  addTags,
  classNames,
  coerceClassValue,
  extractTagCandidates,
  formatRemoveTagLabel,
  getTagsInputClearButtonClasses,
  getTagsInputContainerClasses,
  getTagsInputErrorClasses,
  getTagsInputHighlightClasses,
  getTagsInputInnerInputClasses,
  getTagsInputLabels,
  injectShakeStyle,
  mergeStyleValues,
  removeTagAt,
  SHAKE_CLASS,
  splitTagInput,
  type ComponentSize,
  type InputStatus
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'
import { Tag } from './Tag'

let tagsInputIdCounter = 0

export type VueTagsInputProps = InstanceType<typeof TagsInput>['$props']

export const TagsInput = defineComponent({
  name: 'TigerTagsInput',
  inheritAttrs: false,
  props: {
    /**
     * Tags (for v-model)
     */
    modelValue: { type: Array as PropType<string[]>, default: undefined },
    /**
     * Default tags (for uncontrolled mode)
     */
    defaultValue: { type: Array as PropType<string[]>, default: () => [] },
    /**
     * Input size
     * @default 'md'
     */
    size: { type: String as PropType<ComponentSize>, default: 'md' },
    /**
     * Validation status
     * @default 'default'
     */
    status: { type: String as PropType<InputStatus>, default: 'default' },
    /** Error message to display */
    errorMessage: String,
    /** Placeholder for the inner text input */
    placeholder: { type: String, default: '' },
    /** Whether the same tag may be added more than once */
    allowDuplicates: Boolean,
    /** Maximum number of tags */
    max: { type: Number, default: undefined },
    /**
     * Characters that commit input while typing and split pasted text
     * @default [',']
     */
    delimiters: { type: Array as PropType<string[]>, default: () => [','] },
    /** Commit the pending input as a tag on blur */
    addOnBlur: Boolean,
    /** Validate/transform a candidate tag before it is added */
    beforeAdd: {
      type: Function as PropType<(tag: string) => boolean | string>,
      default: undefined
    },
    /** Whether to show a clear-all button */
    clearable: Boolean,
    /** Whether the input is disabled */
    disabled: Boolean,
    /** Whether the input is readonly */
    readonly: Boolean,
    /** Name for the hidden input carrying the joined value */
    name: String,
    /** Id attribute applied to the inner text input */
    id: String,
    /** Aria-label template for tag remove buttons; supports {tag} */
    removeTagAriaLabel: String,
    /**
     * Internal shake trigger counter (used by FormItem)
     * @internal
     */
    _shakeTrigger: { type: Number, default: undefined },
    /** Additional CSS classes */
    className: String,
    /** Inline styles */
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
  setup(props, { emit, attrs }) {
    injectShakeStyle()
    const config = useTigerConfig()
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const effectiveStatus = computed(() =>
      props.status !== 'default' ? props.status : (formItemControl?.status.value ?? props.status)
    )
    const effectiveErrorMessage = computed(
      () => props.errorMessage ?? formItemControl?.errorMessage.value
    )
    const effectiveShakeTrigger = computed(
      () => props._shakeTrigger ?? formItemControl?.shakeTrigger.value
    )

    const labels = computed(() => getTagsInputLabels(config.value.locale))
    const instanceId = ++tagsInputIdCounter
    const errorMsgId = `tiger-tags-input-error-${instanceId}`

    const containerRef = ref<HTMLDivElement | null>(null)
    const inputRef = ref<HTMLInputElement | null>(null)
    const isControlled = computed(() => props.modelValue !== undefined)
    const innerTags = ref<string[]>([...props.defaultValue])
    const tags = computed(() => (isControlled.value ? (props.modelValue ?? []) : innerTags.value))
    const inputText = ref('')
    const highlightedIndex = ref<number | null>(null)

    watch([effectiveStatus, effectiveShakeTrigger] as const, ([newStatus]) => {
      if (newStatus === 'error' && containerRef.value) {
        const el = containerRef.value
        el.classList.remove(SHAKE_CLASS)
        void el.offsetWidth // force reflow to restart animation
        el.classList.add(SHAKE_CLASS)
      }
    })

    const isInteractive = computed(() => !props.disabled && !props.readonly)

    const setTags = (next: string[]) => {
      if (!isControlled.value) innerTags.value = next
      emit('update:modelValue', next)
    }

    const commitCandidates = (candidates: string[]): string[] => {
      const prepared: string[] = []
      for (const raw of candidates) {
        if (!props.beforeAdd) {
          prepared.push(raw)
          continue
        }
        const result = props.beforeAdd(raw.trim())
        if (result === false) continue
        prepared.push(typeof result === 'string' ? result : raw)
      }
      if (prepared.length === 0) return []
      const { tags: nextTags, added } = addTags(tags.value, prepared, {
        allowDuplicates: props.allowDuplicates,
        max: props.max
      })
      if (added.length > 0) {
        setTags(nextTags)
        added.forEach((tag) => emit('add', tag))
      }
      return added
    }

    const removeAt = (index: number) => {
      const tag = tags.value[index]
      if (tag === undefined) return
      setTags(removeTagAt(tags.value, index))
      emit('remove', tag, index)
    }

    const handleInput = (event: Event) => {
      if (!isInteractive.value) return
      highlightedIndex.value = null
      const target = event.target as HTMLInputElement
      const { candidates, pending } = extractTagCandidates(target.value, props.delimiters)
      if (candidates.length > 0) commitCandidates(candidates)
      inputText.value = pending
      target.value = pending
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (!isInteractive.value) return
      if (event.key === 'Enter') {
        event.preventDefault()
        if (inputText.value.trim()) {
          const added = commitCandidates([inputText.value])
          if (added.length > 0) inputText.value = ''
        }
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
      if (event.key === 'ArrowLeft' && inputText.value === '' && tags.value.length > 0) {
        highlightedIndex.value =
          highlightedIndex.value === null
            ? tags.value.length - 1
            : Math.max(0, highlightedIndex.value - 1)
        return
      }
      if (event.key === 'ArrowRight' && highlightedIndex.value !== null) {
        highlightedIndex.value =
          highlightedIndex.value >= tags.value.length - 1 ? null : highlightedIndex.value + 1
        return
      }
      if (event.key === 'Escape' && highlightedIndex.value !== null) {
        highlightedIndex.value = null
        return
      }
      if (highlightedIndex.value !== null) highlightedIndex.value = null
    }

    const handlePaste = (event: ClipboardEvent) => {
      if (!isInteractive.value) return
      const text = event.clipboardData?.getData('text') ?? ''
      const candidates = splitTagInput(text, props.delimiters)
      if (candidates.length <= 1) return
      event.preventDefault()
      commitCandidates(candidates)
      inputText.value = ''
      if (inputRef.value) inputRef.value.value = ''
    }

    const handleFocus = (event: FocusEvent) => emit('focus', event)

    const handleBlur = (event: FocusEvent) => {
      highlightedIndex.value = null
      if (props.addOnBlur && inputText.value.trim() && isInteractive.value) {
        const added = commitCandidates([inputText.value])
        if (added.length > 0) inputText.value = ''
      }
      emit('blur', event)
    }

    const handleClear = () => {
      if (!isInteractive.value || tags.value.length === 0) return
      setTags([])
      inputText.value = ''
      highlightedIndex.value = null
      emit('clear')
      inputRef.value?.focus()
    }

    const handleContainerClick = (event: MouseEvent) => {
      if (event.target === containerRef.value) inputRef.value?.focus()
    }

    return () => {
      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs
      const activeError = effectiveStatus.value === 'error' && !!effectiveErrorMessage.value
      const isFull = props.max !== undefined && tags.value.length >= props.max
      const removeLabelTemplate = props.removeTagAriaLabel ?? labels.value.removeTagLabel
      const tagSize = props.size === 'lg' ? 'md' : 'sm'

      const children: ReturnType<typeof h>[] = []

      tags.value.forEach((tag, index) => {
        children.push(
          h(
            Tag,
            {
              key: `${tag}-${index}`,
              size: tagSize,
              closable: isInteractive.value,
              closeAriaLabel: formatRemoveTagLabel(removeLabelTemplate, tag),
              class: index === highlightedIndex.value ? getTagsInputHighlightClasses() : undefined,
              onClose: (event: MouseEvent) => {
                event.preventDefault()
                removeAt(index)
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
          disabled: props.disabled,
          readonly: props.readonly,
          id: props.id ? `${props.id}-input` : props.id,
          ...(effectiveStatus.value === 'error' ? { 'aria-invalid': true } : {}),
          ...(activeError ? { 'aria-describedby': errorMsgId } : {}),
          onInput: handleInput,
          onKeydown: handleKeydown,
          onPaste: handlePaste,
          onFocus: handleFocus,
          onBlur: handleBlur
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
              onClick: handleClear,
              'aria-label': labels.value.clearAllLabel,
              tabindex: -1
            },
            '✕'
          )
        )
      }

      if (props.name) {
        children.push(
          h('input', {
            key: 'hidden',
            type: 'hidden',
            name: props.name,
            value: tags.value.join(',')
          })
        )
      }

      const containerNode = h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          id: props.id,
          class: classNames(
            getTagsInputContainerClasses(props.size, effectiveStatus.value, {
              disabled: props.disabled
            }),
            props.className,
            coerceClassValue(attrClass)
          ),
          style: mergeStyleValues(props.style, attrStyle as Record<string, unknown> | undefined),
          'data-state': isFull ? 'full' : undefined,
          onClick: handleContainerClick
        },
        children
      )

      if (!activeError) return containerNode
      return h('div', {}, [
        containerNode,
        h('div', { id: errorMsgId, class: getTagsInputErrorClasses() }, effectiveErrorMessage.value)
      ])
    }
  }
})

export default TagsInput
