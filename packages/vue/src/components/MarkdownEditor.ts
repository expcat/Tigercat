import { defineComponent, h, ref, computed, watch, inject, PropType } from 'vue'
import {
  applyMarkdownToolbarAction,
  classNames,
  coerceClassValue,
  createDefaultMarkdownToolbar,
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
  parseMarkdownHeight,
  renderMarkdownToHtml,
  mergeTigerLocale,
  getMarkdownEditorLabels,
  handleTabKey,
  resolveEditorTabAction,
  nextToolbarRovingIndex,
  getMarkdownToolbarButtons,
  type MarkdownEditorMode,
  type MarkdownRenderer,
  type MarkdownToolbarButton,
  type MarkdownToolbarItem,
  type TigerLocale,
  type TigerLocaleMarkdownEditor
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

const modes: MarkdownEditorMode[] = ['edit', 'split', 'preview']

export interface VueMarkdownEditorProps {
  modelValue?: string
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
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleMarkdownEditor>
  className?: string
  style?: Record<string, string | number>
  tabSize?: number
  ariaLabel?: string
  name?: string
  id?: string
}

export const MarkdownEditor = defineComponent({
  name: 'TigerMarkdownEditor',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
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
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    labels: { type: Object as PropType<Partial<TigerLocaleMarkdownEditor>>, default: undefined },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    },
    tabSize: { type: Number, default: 2 },
    ariaLabel: { type: String, default: undefined },
    name: { type: String, default: undefined },
    id: { type: String, default: undefined }
  },
  emits: ['update:modelValue', 'change', 'update:mode', 'mode-change'],
  setup(props, { emit, attrs, expose }) {
    const config = useTigerConfig()
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const internalValue = ref(props.defaultValue || '')
    const internalMode = ref<MarkdownEditorMode>(props.defaultMode)
    const textareaRef = ref<HTMLTextAreaElement | null>(null)
    const allowTabExit = ref(false)
    const pendingSelection = ref<{ start: number; end: number } | null>(null)
    const formatToolbarIndex = ref(0)

    const formValue = computed(() => formItemControl?.value.value)
    const currentValue = computed(() => {
      if (props.modelValue !== undefined) return props.modelValue
      if (typeof formValue.value === 'string') return formValue.value
      return internalValue.value
    })
    const currentMode = computed(() => props.mode ?? internalMode.value)
    const previewHtml = computed(() => renderMarkdownToHtml(currentValue.value, props.renderer))
    const canEdit = computed(() => currentMode.value === 'edit' || currentMode.value === 'split')
    const showFormattingToolbar = computed(
      () => props.toolbar !== false && canEdit.value && !props.readOnly
    )
    const showTopbar = computed(() => showFormattingToolbar.value || props.showModeSwitch)
    const showEditor = computed(() => canEdit.value)
    const showPreview = computed(
      () => currentMode.value === 'preview' || currentMode.value === 'split'
    )
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getMarkdownEditorLabels(mergedLocale.value, props.labels))
    const toolbarItems = computed(() =>
      props.toolbar === false ? [] : (props.toolbar ?? createDefaultMarkdownToolbar(labels.value))
    )
    const toolbarButtons = computed(() => getMarkdownToolbarButtons(toolbarItems.value))
    const modeLabels = computed<Record<MarkdownEditorMode, string>>(() => ({
      edit: labels.value.editModeLabel,
      split: labels.value.splitModeLabel,
      preview: labels.value.previewModeLabel
    }))
    const effectiveId = computed(() => props.id ?? formItemControl?.id.value)
    const effectiveName = computed(() => props.name ?? formItemControl?.name.value)
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )

    expose({
      focus: () => textareaRef.value?.focus(),
      textarea: textareaRef
    })

    const containerClasses = computed(() =>
      classNames(
        getMarkdownContainerClasses(effectiveDisabled.value, props.className),
        coerceClassValue(attrs.class)
      )
    )

    const containerStyle = computed(() => {
      const parsedHeight = parseMarkdownHeight(props.height)
      return {
        ...(parsedHeight ? { height: parsedHeight } : {}),
        ...(props.style as Record<string, string | number> | undefined),
        ...(attrs.style as Record<string, string> | undefined)
      }
    })

    function commitValue(nextValue: string) {
      if (props.modelValue === undefined) internalValue.value = nextValue
      emit('update:modelValue', nextValue)
      emit('change', nextValue)
      formItemControl?.onChange(nextValue)
    }

    function commitMode(nextMode: MarkdownEditorMode) {
      if (props.mode === undefined) internalMode.value = nextMode
      emit('update:mode', nextMode)
      emit('mode-change', nextMode)
    }

    watch(
      currentValue,
      () => {
        const pending = pendingSelection.value
        if (!pending) return
        pendingSelection.value = null
        const textarea = textareaRef.value
        if (!textarea) return
        textarea.selectionStart = pending.start
        textarea.selectionEnd = pending.end
        textarea.focus()
      },
      { flush: 'post' }
    )

    function applyToolbarButton(button: MarkdownToolbarButton) {
      if (props.readOnly || effectiveDisabled.value || !canEdit.value) return
      const textarea = textareaRef.value
      if (!textarea) return
      const selection = {
        value: currentValue.value,
        selectionStart: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd
      }
      const result = applyMarkdownToolbarAction(button, selection, labels.value)
      pendingSelection.value = { start: result.selectionStart, end: result.selectionEnd }
      commitValue(result.value)
    }

    function handleKeydown(event: KeyboardEvent) {
      const action = resolveEditorTabAction(event, {
        readOnly: props.readOnly,
        disabled: effectiveDisabled.value,
        allowTabExit: allowTabExit.value
      })
      if (action === 'arm-exit') {
        allowTabExit.value = true
        return
      }
      if (action === 'indent' || action === 'outdent') {
        event.preventDefault()
        allowTabExit.value = false
        const textarea = event.currentTarget as HTMLTextAreaElement
        const result = handleTabKey(
          textarea.value,
          textarea.selectionStart,
          textarea.selectionEnd,
          props.tabSize,
          { shift: action === 'outdent' }
        )
        pendingSelection.value = { start: result.selectionStart, end: result.selectionEnd }
        commitValue(result.value)
        return
      }
      if (event.key !== 'Tab') allowTabExit.value = false

      if (props.readOnly || effectiveDisabled.value) return
      const match = findMarkdownHotkeyMatch(toolbarItems.value, event)
      if (match) {
        event.preventDefault()
        applyToolbarButton(match)
      }
    }

    function handleFormatToolbarKeydown(event: KeyboardEvent) {
      const next = nextToolbarRovingIndex(
        formatToolbarIndex.value,
        toolbarButtons.value.length,
        event.key
      )
      if (next === null) return
      event.preventDefault()
      formatToolbarIndex.value = next
      const buttons = (event.currentTarget as HTMLElement).querySelectorAll('button')
      buttons[next]?.focus()
    }

    return () => {
      const { class: _attrClass, style: _attrStyle, ...restAttrs } = attrs
      const toolbarNode = showTopbar.value
        ? h('div', { class: markdownEditorToolbarClasses }, [
            showFormattingToolbar.value
              ? h(
                  'div',
                  {
                    class: markdownEditorToolbarGroupClasses,
                    role: 'toolbar',
                    'aria-label': labels.value.formattingToolbarAriaLabel,
                    onKeydown: handleFormatToolbarKeydown
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
                    const buttonIndex = toolbarButtons.value.findIndex(
                      (entry) => entry.name === item.name
                    )
                    return h(
                      'button',
                      {
                        key: item.name,
                        type: 'button',
                        class: getMarkdownToolbarButtonClasses(false),
                        title: item.tooltip ?? item.label,
                        'aria-label': item.tooltip ?? item.label,
                        tabindex: buttonIndex === formatToolbarIndex.value ? 0 : -1,
                        disabled: effectiveDisabled.value || props.readOnly,
                        onMousedown: (event: Event) => event.preventDefault(),
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
                    'aria-label': labels.value.modeToolbarAriaLabel
                  },
                  modes.map((item) =>
                    h(
                      'button',
                      {
                        key: item,
                        type: 'button',
                        class: getMarkdownToolbarButtonClasses(currentMode.value === item),
                        'aria-label': modeLabels.value[item],
                        'aria-pressed': currentMode.value === item,
                        disabled: effectiveDisabled.value,
                        onClick: () => commitMode(item)
                      },
                      modeLabels.value[item]
                    )
                  )
                )
              : null
          ])
        : null

      const textareaNode = showEditor.value
        ? h('textarea', {
            ...restAttrs,
            ref: textareaRef,
            class: markdownEditorTextareaClasses,
            value: currentValue.value,
            onInput: (event: Event) => commitValue((event.target as HTMLTextAreaElement).value),
            onKeydown: handleKeydown,
            onBlur: () => formItemControl?.onBlur(),
            placeholder: props.placeholder,
            readonly: props.readOnly || effectiveDisabled.value,
            disabled: effectiveDisabled.value,
            spellcheck: true,
            id: effectiveId.value,
            name: effectiveName.value,
            'aria-label':
              props.ariaLabel ??
              (restAttrs['aria-label'] as string | undefined) ??
              labels.value.editorAriaLabel,
            'aria-labelledby':
              (restAttrs['aria-labelledby'] as string | undefined) ??
              formItemControl?.labelId.value,
            'aria-multiline': true
          })
        : null

      const previewNode = showPreview.value
        ? h(
            'div',
            {
              class: classNames(
                markdownEditorPreviewClasses,
                currentMode.value === 'split' ? markdownEditorSplitDividerClasses : undefined,
                !currentValue.value ? markdownEditorEmptyPreviewClasses : undefined
              ),
              role: 'region',
              'aria-label': labels.value.previewAriaLabel,
              ...(currentValue.value ? { innerHTML: previewHtml.value } : {})
            },
            currentValue.value ? undefined : props.placeholder
          )
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
