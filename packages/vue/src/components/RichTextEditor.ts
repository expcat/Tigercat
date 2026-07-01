import { defineComponent, h, ref, computed, watch, onMounted, onBeforeUnmount, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getRichTextContainerClasses,
  getToolbarButtonClasses,
  getEditorAreaClasses,
  richTextToolbarClasses,
  richTextToolbarSeparatorClasses,
  richTextPlaceholderClasses,
  defaultToolbar,
  isInlineFormat,
  findHotkeyMatch,
  isContentEmpty,
  parseHeight,
  builtinRichTextEngine,
  isToolbarSeparator,
  mergeTigerLocale,
  getRichTextEditorLabels,
  type RichTextEditorMode,
  type ToolbarButton,
  type ToolbarItem,
  type RichTextEngine,
  type RichTextEngineInstance,
  type TigerLocale,
  type TigerLocaleRichTextEditor
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueRichTextEditorProps {
  value?: string
  defaultValue?: string
  placeholder?: string
  mode?: RichTextEditorMode
  toolbar?: ToolbarItem[]
  height?: number | string
  readOnly?: boolean
  disabled?: boolean
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleRichTextEditor>
  className?: string
  /**
   * Optional pluggable editor engine (PR-17). Defaults to the
   * built-in `contenteditable` + `document.execCommand` engine. Pass a
   * custom engine to swap in Quill / TipTap / ProseMirror without
   * touching this component.
   */
  engine?: RichTextEngine
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
      type: Array as PropType<ToolbarItem[]>,
      default: undefined
    },
    height: {
      type: [Number, String] as PropType<number | string>,
      default: 300
    },
    readOnly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    labels: { type: Object as PropType<Partial<TigerLocaleRichTextEditor>>, default: undefined },
    className: { type: String, default: undefined },
    engine: {
      type: Object as PropType<RichTextEngine>,
      default: undefined
    }
  },
  emits: ['update:value', 'change'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const editorRef = ref<HTMLDivElement | null>(null)
    const internalValue = ref(props.defaultValue || '')
    const activeFormats = ref<Set<string>>(new Set())
    let engineInstance: RichTextEngineInstance | null = null

    const isControlled = computed(() => props.value !== undefined)
    const currentContent = computed(() =>
      props.value !== undefined ? props.value : internalValue.value
    )
    const toolbarItems = computed(() => props.toolbar ?? defaultToolbar)
    const isEmpty = computed(() => isContentEmpty(currentContent.value))
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getRichTextEditorLabels(mergedLocale.value, props.labels))

    // Sync editor content when controlled value changes
    watch(
      () => props.value,
      (newVal) => {
        if (newVal !== undefined && engineInstance) {
          engineInstance.setValue(newVal)
        }
      }
    )

    // React to readOnly/disabled changes after mount
    watch(
      () => [props.readOnly, props.disabled] as const,
      ([ro, dis]) => {
        engineInstance?.setReadOnly(ro, dis)
      }
    )

    onMounted(() => {
      if (!editorRef.value) return
      const engine = props.engine ?? builtinRichTextEngine
      engineInstance = engine.create({
        element: editorRef.value,
        initialValue: currentContent.value,
        mode: props.mode,
        readOnly: props.readOnly,
        disabled: props.disabled,
        placeholder: props.placeholder,
        toolbar: toolbarItems.value,
        notifyChange(html) {
          if (!isControlled.value) internalValue.value = html
          emit('update:value', html)
          emit('change', html)
        },
        notifyActiveFormats(next) {
          activeFormats.value = next
        }
      })
    })

    onBeforeUnmount(() => {
      engineInstance?.destroy()
      engineInstance = null
    })

    // ── Toolbar action handler ──

    /** Execute action for a specific button (supports custom action) */
    function execButtonAction(btn: ToolbarButton) {
      if (props.readOnly || props.disabled) return
      engineInstance?.exec(btn.name)
    }

    // ── Keyboard handler ──
    function handleKeydown(e: KeyboardEvent) {
      const match = findHotkeyMatch(toolbarItems.value, e)
      if (match) {
        e.preventDefault()
        execButtonAction(match)
      }
    }

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
          'aria-label': labels.value.formattingToolbarAriaLabel
        },
        toolbarItems.value.map((item, idx) => {
          if (isToolbarSeparator(item)) {
            return h('div', {
              key: `sep-${idx}`,
              class: richTextToolbarSeparatorClasses,
              role: 'separator',
              'aria-orientation': 'vertical'
            })
          }
          const btn = item
          return h(
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
                execButtonAction(btn)
              }
            },
            btn.icon ? h('span', { innerHTML: btn.icon }) : btn.label
          )
        })
      )

      // Editable area
      const editorEl = h('div', {
        ref: editorRef,
        class: editorAreaClasses.value,
        role: 'textbox',
        'aria-label': labels.value.editorAriaLabel,
        'aria-multiline': true,
        'aria-readonly': props.readOnly || undefined,
        'aria-disabled': props.disabled || undefined,
        'aria-placeholder': props.placeholder,
        'data-placeholder': props.placeholder,
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
