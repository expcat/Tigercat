import { defineComponent, h, ref, computed, watch, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getCodeEditorContainerClasses,
  getLineNumberClasses,
  getTokenClasses,
  tokenizeLine,
  countLines,
  generateLineNumbers,
  handleTabKey,
  codeEditorTextareaClasses,
  codeEditorHighlightClasses,
  type CodeLanguage,
  type CodeEditorTheme
} from '@expcat/tigercat-core'

export interface VueCodeEditorProps {
  value?: string
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
}

export const CodeEditor = defineComponent({
  name: 'TigerCodeEditor',
  props: {
    value: { type: String, default: undefined },
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
    }
  },
  emits: ['update:value', 'change'],
  setup(props, { emit, attrs }) {
    const internalValue = ref(props.defaultValue || '')
    const textareaRef = ref<HTMLTextAreaElement | null>(null)

    const code = computed(() => (props.value !== undefined ? props.value : internalValue.value))

    watch(
      () => props.value,
      (v) => {
        if (v !== undefined) internalValue.value = v
      }
    )

    const lines = computed(() => code.value.split('\n'))
    const lineCount = computed(() => countLines(code.value))
    const lineNums = computed(() => generateLineNumbers(lineCount.value))

    const containerClasses = computed(() =>
      classNames(
        getCodeEditorContainerClasses(props.theme, props.disabled, props.className),
        coerceClassValue(attrs.class)
      )
    )

    const containerStyle = computed(() => {
      const lineHeight = 1.625 // leading-relaxed ≈ 1.625rem
      const s: Record<string, string> = {}
      if (props.minLines > 0) {
        s.minHeight = `${props.minLines * lineHeight + 1.5}rem`
      }
      if (props.maxLines > 0) {
        s.maxHeight = `${props.maxLines * lineHeight + 1.5}rem`
      }
      return s
    })

    const onInput = (e: Event) => {
      const val = (e.target as HTMLTextAreaElement).value
      internalValue.value = val
      emit('update:value', val)
      emit('change', val)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const ta = textareaRef.value
        if (!ta) return
        const result = handleTabKey(ta.value, ta.selectionStart, ta.selectionEnd, props.tabSize)
        internalValue.value = result.value
        emit('update:value', result.value)
        emit('change', result.value)
        // Restore cursor position
        requestAnimationFrame(() => {
          ta.selectionStart = result.selectionStart
          ta.selectionEnd = result.selectionStart
        })
      }
    }

    const renderHighlightedLine = (line: string, lineIndex: number) => {
      const tokens = tokenizeLine(line, props.language)
      const spans = tokens.map((token, ti) => {
        const cls = getTokenClasses(token.type, props.theme)
        return cls ? h('span', { class: cls, key: ti }, token.value) : token.value
      })
      return h('div', { key: lineIndex, class: 'min-h-[1.625rem]' }, [
        ...spans,
        line === '' ? '\n' : null
      ])
    }

    return () => {
      const wrapClass = props.wordWrap ? 'whitespace-pre-wrap break-all' : ''

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

      const highlightNode = h(
        'div',
        { class: classNames(codeEditorHighlightClasses, wrapClass), 'aria-hidden': 'true' },
        lines.value.map((line, i) => renderHighlightedLine(line, i))
      )

      const textareaNode = h('textarea', {
        ref: textareaRef,
        class: classNames(codeEditorTextareaClasses, wrapClass),
        value: code.value,
        onInput,
        onKeydown: onKeyDown,
        readonly: props.readOnly || props.disabled,
        disabled: props.disabled,
        placeholder: props.placeholder,
        spellcheck: false,
        autocapitalize: 'off',
        autocomplete: 'off',
        autocorrect: 'off',
        'data-gramm': 'false',
        'aria-label': 'Code editor',
        role: 'textbox',
        'aria-multiline': 'true'
      })

      return h(
        'div',
        {
          class: containerClasses.value,
          style: { ...containerStyle.value, ...(props.style as Record<string, string>) },
          'data-language': props.language,
          'data-theme': props.theme
        },
        [
          h('div', { class: 'flex h-full' }, [
            gutterNode,
            h('div', { class: 'relative flex-1 overflow-auto' }, [highlightNode, textareaNode])
          ])
        ]
      )
    }
  }
})

export default CodeEditor
