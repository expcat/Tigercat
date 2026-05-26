import { defineComponent, h, ref, computed, PropType, nextTick } from 'vue'
import {
  applyMarkdownToolbarAction,
  classNames,
  coerceClassValue,
  defaultMarkdownToolbar,
  findMarkdownHotkeyMatch,
  getMarkdownBodyClasses,
  getMarkdownContainerClasses,
  getMarkdownToolbarButtonClasses,
  isMarkdownToolbarSeparator,
  markdownEditorEmptyPreviewClasses,
  markdownEditorPreviewClasses,
  markdownEditorSplitDividerClasses,
  markdownEditorTextareaClasses,
  markdownEditorToolbarClasses,
  markdownEditorToolbarGroupClasses,
  markdownEditorToolbarSeparatorClasses,
  markdownModeLabels,
  parseMarkdownHeight,
  renderMarkdownToHtml,
  type MarkdownEditorMode,
  type MarkdownRenderer,
  type MarkdownToolbarButton,
  type MarkdownToolbarItem
} from '@expcat/tigercat-core'

const modes: MarkdownEditorMode[] = ['edit', 'split', 'preview']

export interface VueMarkdownEditorProps {
  value?: string
  defaultValue?: string
  placeholder?: string
  mode?: MarkdownEditorMode
  defaultMode?: MarkdownEditorMode
  toolbar?: MarkdownToolbarItem[] | false
  showModeSwitch?: boolean
  height?: number | string
  readOnly?: boolean
  disabled?: boolean
  renderer?: MarkdownRenderer
  className?: string
  style?: Record<string, string | number>
}

export const MarkdownEditor = defineComponent({
  name: 'TigerMarkdownEditor',
  props: {
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: '' },
    placeholder: { type: String, default: undefined },
    mode: {
      type: String as PropType<MarkdownEditorMode>,
      default: undefined
    },
    defaultMode: {
      type: String as PropType<MarkdownEditorMode>,
      default: 'split' as MarkdownEditorMode
    },
    toolbar: {
      type: [Array, Boolean] as PropType<MarkdownToolbarItem[] | false>,
      default: undefined
    },
    showModeSwitch: { type: Boolean, default: true },
    height: {
      type: [Number, String] as PropType<number | string>,
      default: 360
    },
    readOnly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    renderer: {
      type: Object as PropType<MarkdownRenderer>,
      default: undefined
    },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['update:value', 'change', 'update:mode', 'mode-change'],
  setup(props, { emit, attrs }) {
    const internalValue = ref(props.defaultValue || '')
    const internalMode = ref<MarkdownEditorMode>(props.defaultMode)
    const textareaRef = ref<HTMLTextAreaElement | null>(null)

    const currentValue = computed(() =>
      props.value !== undefined ? props.value : internalValue.value
    )
    const currentMode = computed(() => props.mode ?? internalMode.value)
    const toolbarItems = computed(() =>
      props.toolbar === false ? [] : (props.toolbar ?? defaultMarkdownToolbar)
    )
    const previewHtml = computed(() => renderMarkdownToHtml(currentValue.value, props.renderer))
    const showFormattingToolbar = computed(() => props.toolbar !== false)
    const showTopbar = computed(() => showFormattingToolbar.value || props.showModeSwitch)
    const showEditor = computed(() => currentMode.value === 'edit' || currentMode.value === 'split')
    const showPreview = computed(
      () => currentMode.value === 'preview' || currentMode.value === 'split'
    )

    const containerClasses = computed(() =>
      classNames(
        getMarkdownContainerClasses(props.disabled, props.className),
        coerceClassValue(attrs.class)
      )
    )

    const containerStyle = computed(() => {
      const parsedHeight = parseMarkdownHeight(props.height)
      return {
        ...(parsedHeight ? { height: parsedHeight } : {}),
        ...(props.style as Record<string, string | number> | undefined)
      }
    })

    function commitValue(nextValue: string) {
      if (props.value === undefined) internalValue.value = nextValue
      emit('update:value', nextValue)
      emit('change', nextValue)
    }

    function commitMode(nextMode: MarkdownEditorMode) {
      if (props.mode === undefined) internalMode.value = nextMode
      emit('update:mode', nextMode)
      emit('mode-change', nextMode)
    }

    async function restoreSelection(selectionStart: number, selectionEnd: number) {
      await nextTick()
      const textarea = textareaRef.value
      if (!textarea) return
      textarea.selectionStart = selectionStart
      textarea.selectionEnd = selectionEnd
      textarea.focus()
    }

    function applyToolbarButton(button: MarkdownToolbarButton) {
      if (props.readOnly || props.disabled) return
      const textarea = textareaRef.value
      const selection = {
        value: currentValue.value,
        selectionStart: textarea?.selectionStart ?? currentValue.value.length,
        selectionEnd: textarea?.selectionEnd ?? currentValue.value.length
      }
      const result = applyMarkdownToolbarAction(button, selection)
      commitValue(result.value)
      void restoreSelection(result.selectionStart, result.selectionEnd)
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Tab') {
        event.preventDefault()
        const textarea = event.currentTarget as HTMLTextAreaElement
        const before = textarea.value.slice(0, textarea.selectionStart)
        const after = textarea.value.slice(textarea.selectionEnd)
        const result = {
          value: `${before}  ${after}`,
          selectionStart: textarea.selectionStart + 2,
          selectionEnd: textarea.selectionStart + 2
        }
        commitValue(result.value)
        void restoreSelection(result.selectionStart, result.selectionEnd)
        return
      }

      const match = findMarkdownHotkeyMatch(toolbarItems.value, event)
      if (match) {
        event.preventDefault()
        applyToolbarButton(match)
      }
    }

    return () => {
      const toolbarNode = showTopbar.value
        ? h('div', { class: markdownEditorToolbarClasses }, [
            showFormattingToolbar.value
              ? h(
                  'div',
                  {
                    class: markdownEditorToolbarGroupClasses,
                    role: 'toolbar',
                    'aria-label': 'Markdown formatting'
                  },
                  toolbarItems.value.map((item, index) => {
                    if (isMarkdownToolbarSeparator(item)) {
                      return h('div', {
                        key: `separator-${index}`,
                        class: markdownEditorToolbarSeparatorClasses,
                        role: 'separator',
                        'aria-orientation': 'vertical'
                      })
                    }
                    return h(
                      'button',
                      {
                        key: item.name,
                        type: 'button',
                        class: getMarkdownToolbarButtonClasses(false),
                        title: item.tooltip ?? item.label,
                        'aria-label': item.tooltip ?? item.label,
                        disabled: props.disabled || props.readOnly,
                        onClick: () => applyToolbarButton(item)
                      },
                      item.icon ? h('span', { innerHTML: item.icon }) : item.label
                    )
                  })
                )
              : h('span'),
            props.showModeSwitch
              ? h(
                  'div',
                  {
                    class: markdownEditorToolbarGroupClasses,
                    role: 'toolbar',
                    'aria-label': 'Markdown view mode'
                  },
                  modes.map((item) =>
                    h(
                      'button',
                      {
                        key: item,
                        type: 'button',
                        class: getMarkdownToolbarButtonClasses(currentMode.value === item),
                        'aria-label': markdownModeLabels[item],
                        'aria-pressed': currentMode.value === item,
                        disabled: props.disabled,
                        onClick: () => commitMode(item)
                      },
                      markdownModeLabels[item]
                    )
                  )
                )
              : null
          ])
        : null

      const textareaNode = showEditor.value
        ? h('textarea', {
            ref: textareaRef,
            class: markdownEditorTextareaClasses,
            value: currentValue.value,
            onInput: (event: Event) => commitValue((event.target as HTMLTextAreaElement).value),
            onKeydown: handleKeydown,
            placeholder: props.placeholder,
            readonly: props.readOnly || props.disabled,
            disabled: props.disabled,
            spellcheck: true,
            'aria-label': 'Markdown editor',
            'aria-multiline': true
          })
        : null

      const previewNode = showPreview.value
        ? h('div', {
            class: classNames(
              markdownEditorPreviewClasses,
              currentMode.value === 'split' ? markdownEditorSplitDividerClasses : undefined,
              !currentValue.value ? markdownEditorEmptyPreviewClasses : undefined
            ),
            role: 'region',
            'aria-label': 'Markdown preview',
            innerHTML: currentValue.value ? previewHtml.value : props.placeholder || ''
          })
        : null

      return h(
        'div',
        {
          class: containerClasses.value,
          style: containerStyle.value,
          'data-mode': currentMode.value
        },
        [
          toolbarNode,
          h('div', { class: getMarkdownBodyClasses(currentMode.value) }, [
            textareaNode,
            previewNode
          ])
        ]
      )
    }
  }
})

export default MarkdownEditor
