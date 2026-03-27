import { defineComponent, h, ref, computed, watch, onMounted, onBeforeUnmount, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getRichTextContainerClasses,
  getToolbarButtonClasses,
  getEditorAreaClasses,
  richTextToolbarClasses,
  richTextPlaceholderClasses,
  defaultToolbar,
  mapToolbarAction,
  isInlineFormat,
  findHotkeyMatch,
  sanitizeHtml,
  isContentEmpty,
  parseHeight,
  isValidUrl,
  type RichTextEditorMode,
  type ToolbarButton
} from '@expcat/tigercat-core'

export interface VueRichTextEditorProps {
  value?: string
  defaultValue?: string
  placeholder?: string
  mode?: RichTextEditorMode
  toolbar?: ToolbarButton[]
  height?: number | string
  readOnly?: boolean
  disabled?: boolean
  className?: string
}

export const RichTextEditor = defineComponent({
  name: 'TigerRichTextEditor',
  props: {
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: '' },
    placeholder: { type: String, default: undefined },
    mode: {
      type: String as PropType<RichTextEditorMode>,
      default: 'html' as RichTextEditorMode
    },
    toolbar: {
      type: Array as PropType<ToolbarButton[]>,
      default: undefined
    },
    height: {
      type: [Number, String] as PropType<number | string>,
      default: 300
    },
    readOnly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    className: { type: String, default: undefined }
  },
  emits: ['update:value', 'change'],
  setup(props, { emit, attrs }) {
    const editorRef = ref<HTMLDivElement | null>(null)
    const internalValue = ref(props.defaultValue || '')
    const activeFormats = ref<Set<string>>(new Set())

    const isControlled = computed(() => props.value !== undefined)
    const currentContent = computed(() => (isControlled.value ? props.value! : internalValue.value))
    const toolbarButtons = computed(() => props.toolbar ?? defaultToolbar)
    const isEmpty = computed(() => isContentEmpty(currentContent.value))

    // Sync editor content when controlled value changes
    watch(
      () => props.value,
      (newVal) => {
        if (newVal !== undefined && editorRef.value) {
          const sanitized = sanitizeHtml(newVal)
          if (editorRef.value.innerHTML !== sanitized) {
            editorRef.value.innerHTML = sanitized
          }
        }
      }
    )

    onMounted(() => {
      if (editorRef.value) {
        const initial = sanitizeHtml(currentContent.value)
        if (initial) {
          editorRef.value.innerHTML = initial
        }
      }
    })

    // ── Active format detection ──
    function updateActiveFormats() {
      if (typeof document === 'undefined') return
      const next = new Set<string>()
      if (document.queryCommandState('bold')) next.add('bold')
      if (document.queryCommandState('italic')) next.add('italic')
      if (document.queryCommandState('underline')) next.add('underline')
      if (document.queryCommandState('strikeThrough')) next.add('strikethrough')
      if (document.queryCommandState('insertUnorderedList')) next.add('bulletList')
      if (document.queryCommandState('insertOrderedList')) next.add('orderedList')
      activeFormats.value = next
    }

    // ── Toolbar action handler ──
    function execAction(actionName: string) {
      if (props.readOnly || props.disabled) return
      // focus the editor first
      editorRef.value?.focus()

      const mapping = mapToolbarAction(actionName)
      if (mapping) {
        document.execCommand(mapping.command, false, mapping.argument)
        handleInput()
        updateActiveFormats()
        return
      }

      // Custom actions
      if (actionName === 'codeBlock') {
        document.execCommand('formatBlock', false, 'PRE')
        handleInput()
        return
      }
      if (actionName === 'link') {
        const url = typeof window !== 'undefined' ? window.prompt('Enter URL:') : null
        if (url && isValidUrl(url)) {
          document.execCommand('createLink', false, url)
          handleInput()
        }
        return
      }
      if (actionName === 'image') {
        const url = typeof window !== 'undefined' ? window.prompt('Enter image URL:') : null
        if (url && isValidUrl(url)) {
          document.execCommand('insertImage', false, url)
          handleInput()
        }
      }
    }

    // ── Input handler ──
    function handleInput() {
      if (!editorRef.value) return
      const html = editorRef.value.innerHTML
      const sanitized = sanitizeHtml(html)
      if (!isControlled.value) {
        internalValue.value = sanitized
      }
      emit('update:value', sanitized)
      emit('change', sanitized)
    }

    // ── Keyboard handler ──
    function handleKeydown(e: KeyboardEvent) {
      const match = findHotkeyMatch(toolbarButtons.value, e)
      if (match) {
        e.preventDefault()
        execAction(match)
      }
    }

    // ── Selection change listener for active state ──
    let selectionHandler: (() => void) | null = null

    onMounted(() => {
      if (typeof document !== 'undefined') {
        selectionHandler = updateActiveFormats
        document.addEventListener('selectionchange', selectionHandler)
      }
    })

    onBeforeUnmount(() => {
      if (selectionHandler && typeof document !== 'undefined') {
        document.removeEventListener('selectionchange', selectionHandler)
      }
    })

    const containerClasses = computed(() =>
      classNames(
        getRichTextContainerClasses(props.disabled, props.className),
        coerceClassValue(attrs.class)
      )
    )

    const editorAreaClasses = computed(() => getEditorAreaClasses(props.readOnly))

    const containerStyle = computed(() => {
      const ht = parseHeight(props.height)
      if (!ht) return undefined
      return { height: ht }
    })

    return () => {
      // Toolbar
      const toolbarEl = h(
        'div',
        {
          class: richTextToolbarClasses,
          role: 'toolbar',
          'aria-label': 'Text formatting'
        },
        toolbarButtons.value.map((btn) =>
          h(
            'button',
            {
              key: btn.name,
              type: 'button',
              class: getToolbarButtonClasses(activeFormats.value.has(btn.name)),
              title: btn.tooltip ?? btn.label,
              'aria-label': btn.label,
              'aria-pressed': isInlineFormat(btn.name)
                ? activeFormats.value.has(btn.name)
                : undefined,
              disabled: props.disabled || props.readOnly,
              onClick: (e: Event) => {
                e.preventDefault()
                execAction(btn.name)
              }
            },
            btn.label
          )
        )
      )

      // Editable area
      const editorEl = h('div', {
        ref: editorRef,
        class: editorAreaClasses.value,
        contenteditable: !(props.readOnly || props.disabled),
        role: 'textbox',
        'aria-multiline': true,
        'aria-readonly': props.readOnly || undefined,
        'aria-disabled': props.disabled || undefined,
        'aria-placeholder': props.placeholder,
        'data-placeholder': props.placeholder,
        onInput: handleInput,
        onKeydown: handleKeydown
      })

      // Placeholder overlay
      const placeholderEl =
        isEmpty.value && props.placeholder
          ? h(
              'div',
              {
                class: `${richTextPlaceholderClasses} absolute top-0 left-0 p-4 pointer-events-none text-sm`,
                'aria-hidden': true
              },
              props.placeholder
            )
          : null

      // Editor wrapper (relative for placeholder positioning)
      const editorWrapper = h('div', { class: 'relative flex-1 overflow-hidden' }, [
        editorEl,
        placeholderEl
      ])

      return h(
        'div',
        {
          class: containerClasses.value,
          style: containerStyle.value
        },
        [toolbarEl, editorWrapper]
      )
    }
  }
})

export default RichTextEditor
