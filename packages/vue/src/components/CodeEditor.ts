import { defineComponent, h, ref, computed, watch, inject, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getCodeEditorContainerClasses,
  getLineNumberClasses,
  getTokenClasses,
  generateLineNumbers,
  handleTabKey,
  getActiveLineIndex,
  getCodeEditorActiveLineClasses,
  codeEditorTextareaClasses,
  codeEditorHighlightClasses,
  codeEditorScrollerClasses,
  getCodeEditorWrapClass,
  getCodeEditorThemeVars,
  getCodeEditorHeightStyle,
  buildCodeEditorLineModels,
  resolveEditorTabAction,
  getCodeEditorLabels,
  mergeTigerLocale,
  type CodeLanguage,
  type CodeEditorTheme,
  type CodeHighlighter,
  type TigerLocale,
  type TigerLocaleCodeEditor
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

export interface VueCodeEditorProps {
  modelValue?: string
  defaultValue?: string
  language?: CodeLanguage
  theme?: CodeEditorTheme
  readOnly?: boolean
  lineNumbers?: boolean
  highlightActiveLine?: boolean
  tabSize?: number
  placeholder?: string
  wordWrap?: boolean
  minLines?: number
  maxLines?: number
  disabled?: boolean
  className?: string
  style?: Record<string, string | number>
  /**
   * Optional pluggable highlighter. Output is TRUSTED HTML — sanitise
   * inside the engine if the source is untrusted.
   */
  highlighter?: CodeHighlighter
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleCodeEditor>
  ariaLabel?: string
  name?: string
  id?: string
}

export const CodeEditor = defineComponent({
  name: 'TigerCodeEditor',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: '' },
    language: {
      type: String as PropType<CodeLanguage>,
      default: 'plain' as CodeLanguage
    },
    theme: {
      type: String as PropType<CodeEditorTheme>,
      default: 'light' as CodeEditorTheme
    },
    readOnly: { type: Boolean, default: false },
    lineNumbers: { type: Boolean, default: true },
    highlightActiveLine: { type: Boolean, default: true },
    tabSize: { type: Number, default: 2 },
    placeholder: { type: String, default: undefined },
    wordWrap: { type: Boolean, default: false },
    minLines: { type: Number, default: 3 },
    maxLines: { type: Number, default: 0 },
    disabled: { type: Boolean, default: false },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    },
    highlighter: {
      type: Object as PropType<CodeHighlighter>,
      default: undefined
    },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    labels: { type: Object as PropType<Partial<TigerLocaleCodeEditor>>, default: undefined },
    ariaLabel: { type: String, default: undefined },
    name: { type: String, default: undefined },
    id: { type: String, default: undefined }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs, expose }) {
    const config = useTigerConfig()
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const internalValue = ref(props.defaultValue || '')
    const textareaRef = ref<HTMLTextAreaElement | null>(null)
    const activeLine = ref(0)
    const allowTabExit = ref(false)
    const pendingSelection = ref<{ start: number; end: number } | null>(null)

    const formValue = computed(() => formItemControl?.value.value)
    const code = computed(() => {
      if (props.modelValue !== undefined) return props.modelValue
      if (typeof formValue.value === 'string') return formValue.value
      return internalValue.value
    })

    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const resolvedLabels = computed(() => getCodeEditorLabels(mergedLocale.value, props.labels))
    const effectiveId = computed(() => props.id ?? formItemControl?.id.value)
    const effectiveName = computed(() => props.name ?? formItemControl?.name.value)
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )

    expose({
      focus: () => textareaRef.value?.focus(),
      textarea: textareaRef
    })

    const updateActiveLine = () => {
      const ta = textareaRef.value
      if (!ta) return
      activeLine.value = getActiveLineIndex(ta.value, ta.selectionStart)
    }

    watch(
      () => props.modelValue,
      (v) => {
        if (v !== undefined) internalValue.value = v
      }
    )

    watch(
      code,
      () => {
        const pending = pendingSelection.value
        if (!pending) return
        pendingSelection.value = null
        const ta = textareaRef.value
        if (!ta) return
        ta.selectionStart = pending.start
        ta.selectionEnd = pending.end
      },
      { flush: 'post' }
    )

    const lineModel = computed(() =>
      buildCodeEditorLineModels({
        value: code.value,
        language: props.language,
        theme: props.theme,
        activeLine: activeLine.value,
        highlightActiveLine: props.highlightActiveLine,
        disabled: effectiveDisabled.value,
        highlighter: props.highlighter
      })
    )

    const lineNums = computed(() => generateLineNumbers(lineModel.value.lines.length))

    const containerClasses = computed(() =>
      classNames(
        getCodeEditorContainerClasses(props.theme, effectiveDisabled.value, props.className),
        coerceClassValue(attrs.class)
      )
    )

    const containerStyle = computed(() => {
      const height = getCodeEditorHeightStyle(props.minLines, props.maxLines)
      const themeVars = getCodeEditorThemeVars(props.theme)
      return {
        ...height,
        ...themeVars,
        ...(props.style as Record<string, string> | undefined),
        ...(attrs.style as Record<string, string> | undefined)
      }
    })

    function commitValue(val: string) {
      if (props.modelValue === undefined) internalValue.value = val
      emit('update:modelValue', val)
      emit('change', val)
      formItemControl?.onChange(val)
    }

    const onInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement
      commitValue(target.value)
      activeLine.value = getActiveLineIndex(target.value, target.selectionStart)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const action = resolveEditorTabAction(e, {
        readOnly: props.readOnly,
        disabled: effectiveDisabled.value,
        allowTabExit: allowTabExit.value
      })
      if (action === 'arm-exit') {
        allowTabExit.value = true
        return
      }
      if (action === 'passthrough') {
        if (e.key !== 'Tab') allowTabExit.value = false
        return
      }
      e.preventDefault()
      allowTabExit.value = false
      const ta = textareaRef.value
      if (!ta) return
      const result = handleTabKey(ta.value, ta.selectionStart, ta.selectionEnd, props.tabSize, {
        shift: action === 'outdent'
      })
      pendingSelection.value = { start: result.selectionStart, end: result.selectionEnd }
      commitValue(result.value)
    }

    return () => {
      const wrapClass = getCodeEditorWrapClass(props.wordWrap)
      const { class: _attrClass, style: _attrStyle, ...restAttrs } = attrs
      const model = lineModel.value

      const gutterNode = props.lineNumbers
        ? h(
            'div',
            {
              class: getLineNumberClasses(props.theme),
              'aria-hidden': 'true'
            },
            lineNums.value.map((n) => h('div', { key: n, class: 'min-h-[1.625rem]' }, String(n)))
          )
        : null

      const highlightNode =
        model.blockHtml !== null
          ? h('div', {
              class: classNames(codeEditorHighlightClasses, wrapClass),
              'aria-hidden': 'true',
              innerHTML: model.blockHtml
            })
          : h(
              'div',
              { class: classNames(codeEditorHighlightClasses, wrapClass), 'aria-hidden': 'true' },
              model.lines.map((line) => {
                const lineClass = classNames(
                  'min-h-[1.625rem]',
                  line.isActive && getCodeEditorActiveLineClasses(props.theme)
                )
                if (line.html !== null) {
                  return h('div', {
                    key: line.index,
                    class: lineClass,
                    'data-active-line': line.isActive ? '' : undefined,
                    innerHTML: line.html
                  })
                }
                const spans = (line.tokens ?? []).map((token, ti) => {
                  const cls = getTokenClasses(token.type, props.theme)
                  return cls ? h('span', { class: cls, key: ti }, token.value) : token.value
                })
                return h(
                  'div',
                  {
                    key: line.index,
                    class: lineClass,
                    'data-active-line': line.isActive ? '' : undefined
                  },
                  [...spans, line.text === '' ? '\n' : null]
                )
              })
            )

      const textareaNode = h('textarea', {
        ...restAttrs,
        ref: textareaRef,
        class: classNames(codeEditorTextareaClasses, wrapClass),
        value: code.value,
        onInput,
        onKeydown: onKeyDown,
        onSelect: updateActiveLine,
        onClick: updateActiveLine,
        onKeyup: updateActiveLine,
        onBlur: () => formItemControl?.onBlur(),
        readonly: props.readOnly || effectiveDisabled.value,
        disabled: effectiveDisabled.value,
        placeholder: props.placeholder,
        spellcheck: false,
        autocapitalize: 'off',
        autocomplete: 'off',
        autocorrect: 'off',
        'data-gramm': 'false',
        id: effectiveId.value,
        name: effectiveName.value,
        'aria-label':
          props.ariaLabel ??
          (restAttrs['aria-label'] as string | undefined) ??
          resolvedLabels.value.editorAriaLabel,
        'aria-labelledby':
          (restAttrs['aria-labelledby'] as string | undefined) ?? formItemControl?.labelId.value,
        'aria-multiline': 'true',
        'aria-describedby': formItemControl?.describedBy.value
      })

      return h(
        'div',
        {
          class: containerClasses.value,
          style: containerStyle.value,
          'data-language': props.language,
          'data-theme': props.theme
        },
        [
          h('div', { class: codeEditorScrollerClasses, 'data-tiger-code-scroller': '' }, [
            gutterNode,
            h('div', { class: 'relative flex-1' }, [highlightNode, textareaNode])
          ])
        ]
      )
    }
  }
})

export default CodeEditor
