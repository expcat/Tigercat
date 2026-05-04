import { defineComponent, h, ref, computed, watch, nextTick, onBeforeUnmount, PropType } from 'vue'
import { classNames, coerceClassValue } from '@expcat/tigercat-core'
import type { MentionsSize, MentionOption } from '@expcat/tigercat-core'
import {
  getMentionsInputClasses,
  mentionsDropdownClasses,
  getMentionsOptionClasses,
  extractMentionQuery,
  positionMentionsDropdown
} from '@expcat/tigercat-core'

export interface VueMentionsProps {
  modelValue?: string
  prefix?: string
  options?: MentionOption[]
  placeholder?: string
  disabled?: boolean
  size?: MentionsSize
  rows?: number
}

export const Mentions = defineComponent({
  name: 'TigerMentions',
  props: {
    modelValue: { type: String, default: '' },
    prefix: { type: String, default: '@' },
    options: { type: Array as PropType<MentionOption[]>, default: () => [] },
    placeholder: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<MentionsSize>, default: 'md' },
    rows: { type: Number, default: 3 }
  },
  emits: ['update:modelValue', 'change', 'select'],
  setup(props, { emit, attrs }) {
    const isOpen = ref(false)
    const activeIndex = ref(0)
    const mentionStartPos = ref(-1)
    const query = ref('')
    const textareaRef = ref<HTMLTextAreaElement | null>(null)
    const dropdownRef = ref<HTMLDivElement | null>(null)
    const containerRef = ref<HTMLDivElement | null>(null)

    const filteredOptions = computed(() => {
      if (!query.value) return props.options || []
      const q = query.value.toLowerCase()
      return (props.options || []).filter((o) => !o.disabled && o.label.toLowerCase().includes(q))
    })

    function handleInput(e: Event) {
      const target = e.target as HTMLTextAreaElement
      const value = target.value
      emit('update:modelValue', value)
      emit('change', value)

      const cursorPos = target.selectionStart ?? value.length
      const result = extractMentionQuery(value, cursorPos, props.prefix!)
      if (result && filteredOptions.value.length > 0) {
        query.value = result.query
        mentionStartPos.value = result.startPos
        isOpen.value = true
        activeIndex.value = 0
      } else {
        isOpen.value = false
      }
    }

    function selectOption(option: MentionOption) {
      if (option.disabled) return
      const val = props.modelValue || ''
      const before = val.slice(0, mentionStartPos.value)
      const after = val.slice(textareaRef.value?.selectionStart ?? val.length)
      const newValue = `${before}${props.prefix}${option.value} ${after}`
      emit('update:modelValue', newValue)
      emit('change', newValue)
      emit('select', option)
      isOpen.value = false
    }

    function handleKeydown(e: KeyboardEvent) {
      if (!isOpen.value) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        activeIndex.value = (activeIndex.value + 1) % filteredOptions.value.length
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        activeIndex.value =
          (activeIndex.value - 1 + filteredOptions.value.length) % filteredOptions.value.length
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const opt = filteredOptions.value[activeIndex.value]
        if (opt) selectOption(opt)
      } else if (e.key === 'Escape') {
        isOpen.value = false
      }
    }

    // Click outside
    function onClickOutside(e: MouseEvent) {
      if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
        isOpen.value = false
      }
    }

    watch(isOpen, (val) => {
      if (val) document.addEventListener('mousedown', onClickOutside)
      else document.removeEventListener('mousedown', onClickOutside)
    })

    watch(
      [isOpen, filteredOptions],
      async () => {
        if (!isOpen.value || filteredOptions.value.length === 0) return
        await nextTick()
        if (!textareaRef.value || !dropdownRef.value) return
        await positionMentionsDropdown(textareaRef.value, dropdownRef.value)
      },
      { flush: 'post' }
    )

    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', onClickOutside)
    })

    return () => {
      const wrapperClass = classNames('relative', coerceClassValue(attrs.class))

      return h('div', { ref: containerRef, class: wrapperClass }, [
        h('textarea', {
          ref: textareaRef,
          value: props.modelValue,
          class: getMentionsInputClasses(props.size!, props.disabled!),
          placeholder: props.placeholder,
          disabled: props.disabled,
          rows: props.rows,
          onInput: handleInput,
          onKeydown: handleKeydown
        }),
        isOpen.value && filteredOptions.value.length > 0
          ? h(
              'div',
              { ref: dropdownRef, class: mentionsDropdownClasses, role: 'listbox' },
              filteredOptions.value.map((opt, i) =>
                h(
                  'div',
                  {
                    key: opt.value,
                    class: getMentionsOptionClasses(i === activeIndex.value, !!opt.disabled),
                    role: 'option',
                    'aria-selected': i === activeIndex.value,
                    onClick: () => selectOption(opt)
                  },
                  opt.label
                )
              )
            )
          : null
      ])
    }
  }
})

export default Mentions
