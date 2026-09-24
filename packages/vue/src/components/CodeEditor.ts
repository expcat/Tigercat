import { defineComponent, h, ref, computed, watch, inject, onMounted, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getCodeEditorContainerClasses,
  getLineNumberClasses,
  generateLineNumbers,
  handleTabKey,
  getActiveLineIndex,
  getCodeEditorActiveLineClasses,
  codeEditorTextareaClasses,
  codeEditorHighlightClasses,
  codeEditorScrollerClasses,
  getCodeEditorWrapClass,
  resolveCodeEditorTheme,
  codeEditorLineWindow,
  findCodeMatches,
  getW9DataLabels,
  matchBrackets,
  registerCodeEditorLanguage,
  registeredCodeEditorLanguage,
  replaceCodeMatches,
  scrollCodeEditorCaretIntoView,
  shouldCommitEditorValue,
  syncEditorTextareaValue,
  clampTabSize,
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
import { useTigerConfig } from './tiger-config'
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
  /** Optional pluggable highlighter. Returns tokens drawn as text. */
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
      type: String as PropType<CodeEditorTheme | 'auto'>,
      default: undefined
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
    bind: {
      type: Object as PropType<{
        query?: string
        replacement?: string
        caret?: number
        scrollTop?: number
        viewportHeight?: number
        lineHeight?: number
        lineCount?: number
        language?: { id: string; keywords?: string[] }
      }>,
      default: undefined
    },
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
    const scrollerRef = ref<HTMLElement | null>(null)
    const gutterRef = ref<HTMLElement | null>(null)
    const composing = ref(false)
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

    onMounted(() => {
      syncEditorTextareaValue(textareaRef.value, code.value, false)
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
      (value) => {
        syncEditorTextareaValue(textareaRef.value, value, composing.value)
        const pending = pendingSelection.value
        if (!pending || composing.value) return
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
        theme: resolveCodeEditorTheme(props.theme),
        activeLine: activeLine.value,
        highlightActiveLine: props.highlightActiveLine,
        disabled: effectiveDisabled.value,
        highlighter: props.highlighter
      })
    )

    const lineNums = computed(() => generateLineNumbers(lineModel.value.lines.length))
    const resolvedTheme = computed(() => resolveCodeEditorTheme(props.theme))

    const containerClasses = computed(() =>
      classNames(
        getCodeEditorContainerClasses(
          resolvedTheme.value,
          effectiveDisabled.value,
          props.className
        ),
        coerceClassValue(attrs.class)
      )
    )
    const scrollStyle = computed(() => ({
      ...getCodeEditorHeightStyle(props.minLines, props.maxLines),
      tabSize: clampTabSize(props.tabSize),
      flex: '1 1 auto'
    }))
    const containerStyle = computed(() => ({
      ...(props.style as Record<string, string> | undefined),
      ...(attrs.style as Record<string, string> | undefined)
    }))

    function commitValue(val: string) {
      if (props.modelValue === undefined) internalValue.value = val
      emit('update:modelValue', val)
      emit('change', val)
      formItemControl?.onChange(val)
    }

    const revealCaret = () => {
      scrollCodeEditorCaretIntoView(textareaRef.value, scrollerRef.value)
    }

    const onInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement
      const native = e as InputEvent
      if (!shouldCommitEditorValue(composing.value || native.isComposing)) return
      commitValue(target.value)
      activeLine.value = getActiveLineIndex(target.value, target.selectionStart)
      revealCaret()
    }

    const onCompositionStart = () => {
      composing.value = true
    }

    const onCompositionEnd = (e: CompositionEvent) => {
      composing.value = false
      const target = e.target as HTMLTextAreaElement
      commitValue(target.value)
      activeLine.value = getActiveLineIndex(target.value, target.selectionStart)
      revealCaret()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (composing.value) return
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

      const themeName = resolvedTheme.value
      const tabWidth = clampTabSize(props.tabSize)
      const gridChildren = model.lines.flatMap((line, lineIndex) => {
        const lineClass = classNames(
          'min-h-[1.625rem] px-3',
          line.isActive && getCodeEditorActiveLineClasses(themeName)
        )
        const spans = line.tokens.map((token, ti) =>
          token.className ? h('span', { class: token.className, key: ti }, token.text) : token.text
        )
        const codeCell = h(
          'div',
          {
            key: `code-${line.index}`,
            class: lineClass,
            'data-active-line': line.isActive ? '' : undefined
          },
          [...spans, line.text === '' ? '\n' : null]
        )
        if (!props.lineNumbers) return [codeCell]
        const numberCell = h(
          'div',
          {
            key: `n-${line.index}`,
            ref: lineIndex === 0 ? gutterRef : undefined,
            class: classNames(getLineNumberClasses(themeName), 'min-h-[1.625rem]')
          },
          String(lineNums.value[lineIndex] ?? line.index + 1)
        )
        return [numberCell, codeCell]
      })

      const textareaNode = h('textarea', {
        ...restAttrs,
        ref: textareaRef,
        class: classNames(codeEditorTextareaClasses, wrapClass),
        style: {
          insetInlineStart: '0',
          width: '100%',
          height: '100%',
          paddingInlineStart: props.lineNumbers
            ? 'calc(var(--tiger-code-gutter, 3rem) + 0.75rem)'
            : '0.75rem',
          tabSize: String(tabWidth)
        },
        onInput,
        onCompositionstart: onCompositionStart,
        onCompositionend: onCompositionEnd,
        onKeydown: onKeyDown,
        onSelect: () => {
          updateActiveLine()
          revealCaret()
        },
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
          'data-theme': themeName
        },
        [
          props.bind
            ? h('div', { 'data-tiger-code-bind': '' }, [
                ...findCodeMatches(
                  props.modelValue ?? internalValue.value,
                  props.bind.query ?? ''
                ).map((match, index) =>
                  h('span', {
                    key: index,
                    'data-code-match': String(match.index)
                  })
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    'data-tiger-replace': '',
                    onClick: () => {
                      const next = replaceCodeMatches(
                        props.modelValue ?? internalValue.value,
                        props.bind?.query ?? '',
                        props.bind?.replacement ?? '',
                        true
                      )
                      commitValue(next)
                    }
                  },
                  getW9DataLabels().replaceAll
                ),
                h('span', {
                  'data-bracket': (() => {
                    const pair = matchBrackets(
                      props.modelValue ?? internalValue.value,
                      props.bind?.caret ?? 0
                    )
                    return pair ? `${pair.open}-${pair.close}` : ''
                  })()
                }),
                h('span', {
                  'data-line-window': (() => {
                    if (props.bind?.language) {
                      registerCodeEditorLanguage({
                        id: props.bind.language.id,
                        keywords: props.bind.language.keywords
                      })
                    }
                    const window = codeEditorLineWindow({
                      scrollTop: props.bind?.scrollTop ?? 0,
                      viewportHeight: props.bind?.viewportHeight ?? 0,
                      lineHeight: props.bind?.lineHeight ?? 20,
                      lineCount: props.bind?.lineCount ?? 0
                    })
                    const registered = props.bind?.language
                      ? registeredCodeEditorLanguage(props.bind.language.id)?.id
                      : ''
                    return `${window.start}-${window.end}:${registered ?? ''}`
                  })()
                })
              ])
            : null,
          h(
            'div',
            {
              ref: (el: unknown) => {
                const node = el as HTMLElement | null
                scrollerRef.value = node
                const gutter = gutterRef.value
                if (node && gutter)
                  node.style.setProperty('--tiger-code-gutter', `${gutter.offsetWidth}px`)
              },
              class: codeEditorScrollerClasses,
              style: scrollStyle.value,
              'data-tiger-code-scroller': ''
            },
            [
              h('div', { class: 'relative min-w-full', style: { tabSize: String(tabWidth) } }, [
                h(
                  'div',
                  {
                    class: classNames('grid py-3', wrapClass),
                    style: {
                      gridTemplateColumns: props.lineNumbers
                        ? 'auto minmax(0, 1fr)'
                        : 'minmax(0, 1fr)'
                    },
                    'aria-hidden': 'true'
                  },
                  gridChildren
                ),
                textareaNode
              ])
            ]
          )
        ]
      )
    }
  }
})

export default CodeEditor
