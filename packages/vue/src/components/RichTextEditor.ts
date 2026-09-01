import {
  defineComponent,
  h,
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  inject,
  PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  getRichTextContainerClasses,
  getToolbarButtonClasses,
  getEditorAreaClasses,
  richTextToolbarClasses,
  richTextToolbarSeparatorClasses,
  richTextPlaceholderClasses,
  createDefaultRichTextToolbar,
  findHotkeyMatch,
  isContentEmpty,
  parseHeight,
  builtinRichTextEngine,
  isToolbarSeparator,
  mergeTigerLocale,
  getRichTextEditorLabels,
  getToolbarButtons,
  nextToolbarRovingIndex,
  type RichTextEditorMode,
  type ToolbarButton,
  type ToolbarItem,
  type RichTextEngine,
  type RichTextEngineInstance,
  type TigerLocale,
  type TigerLocaleRichTextEditor
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

export interface VueRichTextEditorProps {
  modelValue?: string
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
  ariaLabel?: string
  name?: string
  id?: string
  /**
   * Optional pluggable editor engine. Custom engines are TRUSTED and
   * must sanitise untrusted HTML themselves.
   */
  engine?: RichTextEngine
  onRequestUrl?: (kind: 'link' | 'image') => string | null
}

export const RichTextEditor = defineComponent({
  name: 'TigerRichTextEditor',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
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
    ariaLabel: { type: String, default: undefined },
    name: { type: String, default: undefined },
    id: { type: String, default: undefined },
    engine: {
      type: Object as PropType<RichTextEngine>,
      default: undefined
    },
    onRequestUrl: {
      type: Function as PropType<(kind: 'link' | 'image') => string | null>,
      default: undefined
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs, expose }) {
    const config = useTigerConfig()
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const editorRef = ref<HTMLDivElement | null>(null)
    const internalValue = ref(props.defaultValue || '')
    const activeFormats = ref<Set<string>>(new Set())
    const toolbarIndex = ref(0)
    let engineInstance: RichTextEngineInstance | null = null

    const formValue = computed(() => formItemControl?.value.value)
    const isControlled = computed(() => props.modelValue !== undefined)
    const currentContent = computed(() => {
      if (props.modelValue !== undefined) return props.modelValue
      if (typeof formValue.value === 'string') return formValue.value
      return internalValue.value
    })
    const isEmpty = computed(() => isContentEmpty(currentContent.value))
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getRichTextEditorLabels(mergedLocale.value, props.labels))
    const toolbarItems = computed(() =>
      props.mode === 'plain' ? [] : (props.toolbar ?? createDefaultRichTextToolbar(labels.value))
    )
    const toolbarButtons = computed(() => getToolbarButtons(toolbarItems.value))
    const effectiveId = computed(() => props.id ?? formItemControl?.id.value)
    const effectiveName = computed(() => props.name ?? formItemControl?.name.value)
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )

    expose({
      focus: () => editorRef.value?.focus(),
      editor: editorRef
    })

    function commit(html: string) {
      if (!isControlled.value) internalValue.value = html
      emit('update:modelValue', html)
      emit('change', html)
      formItemControl?.onChange(html)
    }

    function mountEngine() {
      engineInstance?.destroy()
      engineInstance = null
      if (!editorRef.value) return
      const engine = props.engine ?? builtinRichTextEngine
      engineInstance = engine.create({
        element: editorRef.value,
        initialValue: currentContent.value,
        mode: props.mode,
        readOnly: props.readOnly,
        disabled: effectiveDisabled.value,
        placeholder: props.placeholder,
        toolbar: toolbarItems.value,
        requestUrl: props.onRequestUrl,
        notifyChange: commit,
        notifyActiveFormats(next) {
          activeFormats.value = next
        }
      })
    }

    watch(
      () => props.modelValue,
      (newVal) => {
        if (newVal !== undefined && engineInstance) {
          engineInstance.setValue(newVal)
        }
      }
    )

    watch(
      () => [props.readOnly, effectiveDisabled.value] as const,
      ([ro, dis]) => {
        engineInstance?.setReadOnly(ro, dis)
      }
    )

    watch(
      () => props.mode,
      (mode) => {
        engineInstance?.setMode(mode)
      }
    )

    watch(
      () => toolbarItems.value,
      (items) => {
        engineInstance?.setToolbar(items)
      }
    )

    watch(
      () => props.engine,
      () => {
        mountEngine()
      }
    )

    onMounted(() => {
      mountEngine()
    })

    onBeforeUnmount(() => {
      engineInstance?.destroy()
      engineInstance = null
    })

    function execButtonAction(btn: ToolbarButton) {
      if (props.readOnly || effectiveDisabled.value) return
      engineInstance?.exec(btn.name)
    }

    function handleKeydown(e: KeyboardEvent) {
      if (props.readOnly || effectiveDisabled.value) return
      const match = findHotkeyMatch(toolbarItems.value, e)
      if (match) {
        e.preventDefault()
        execButtonAction(match)
      }
    }

    function handleToolbarKeydown(e: KeyboardEvent) {
      const next = nextToolbarRovingIndex(toolbarIndex.value, toolbarButtons.value.length, e.key)
      if (next === null) return
      e.preventDefault()
      toolbarIndex.value = next
      const buttons = editorRef.value
        ?.closest('[data-tiger-rte]')
        ?.querySelectorAll('[role="toolbar"] button')
      const target = buttons?.[next] as HTMLButtonElement | undefined
      target?.focus()
    }

    const containerClasses = computed(() =>
      classNames(
        getRichTextContainerClasses(effectiveDisabled.value, props.className),
        coerceClassValue(attrs.class)
      )
    )

    const editorAreaClasses = computed(() => getEditorAreaClasses(props.readOnly))

    const containerStyle = computed(() => {
      const ht = parseHeight(props.height)
      return {
        ...(ht ? { height: ht } : {}),
        ...(attrs.style as Record<string, string> | undefined)
      }
    })

    return () => {
      const { class: _attrClass, style: _attrStyle, ...restAttrs } = attrs
      const showToolbar = toolbarItems.value.length > 0
      const toolbarEl = showToolbar
        ? h(
            'div',
            {
              class: richTextToolbarClasses,
              role: 'toolbar',
              'aria-label': labels.value.formattingToolbarAriaLabel,
              onKeydown: handleToolbarKeydown
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
              const buttonIndex = toolbarButtons.value.indexOf(btn)
              return h(
                'button',
                {
                  key: btn.name,
                  type: 'button',
                  class: getToolbarButtonClasses(activeFormats.value.has(btn.name)),
                  title: btn.tooltip ?? btn.label,
                  'aria-label': btn.label,
                  'aria-pressed': activeFormats.value.has(btn.name),
                  tabindex: buttonIndex === toolbarIndex.value ? 0 : -1,
                  disabled: effectiveDisabled.value || props.readOnly,
                  onMousedown: (e: Event) => e.preventDefault(),
                  onClick: () => execButtonAction(btn)
                },
                btn.icon ? h('span', { innerHTML: btn.icon }) : btn.label
              )
            })
          )
        : null

      const editorEl = h('div', {
        ...restAttrs,
        ref: editorRef,
        class: editorAreaClasses.value,
        role: 'textbox',
        id: effectiveId.value,
        'aria-label':
          props.ariaLabel ??
          (restAttrs['aria-label'] as string | undefined) ??
          labels.value.editorAriaLabel,
        'aria-labelledby':
          (restAttrs['aria-labelledby'] as string | undefined) ?? formItemControl?.labelId.value,
        'aria-multiline': true,
        'aria-readonly': props.readOnly || undefined,
        'aria-disabled': effectiveDisabled.value || undefined,
        'aria-placeholder': props.placeholder,
        'data-placeholder': props.placeholder,
        'data-name': effectiveName.value,
        tabindex: props.readOnly && !effectiveDisabled.value ? 0 : undefined,
        onKeydown: handleKeydown,
        onBlur: () => formItemControl?.onBlur()
      })

      const placeholderEl =
        isEmpty.value && props.placeholder
          ? h(
              'div',
              {
                class: `${richTextPlaceholderClasses} absolute top-0 start-0 p-4 pointer-events-none text-sm`,
                'aria-hidden': true
              },
              props.placeholder
            )
          : null

      const editorWrapper = h('div', { class: 'relative flex-1 overflow-hidden' }, [
        editorEl,
        placeholderEl
      ])

      return h(
        'div',
        {
          class: containerClasses.value,
          style: containerStyle.value,
          'data-tiger-rte': ''
        },
        [toolbarEl, editorWrapper]
      )
    }
  }
})

export default RichTextEditor
