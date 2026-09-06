import { defineComponent, computed, h, onBeforeUnmount, ref, PropType } from 'vue'
import {
  copyTextToClipboard,
  createCopyStatusReset,
  getCodeLabels,
  getIconDefinition,
  getTextClasses,
  isTextCopyable,
  mergeTigerLocale,
  resolveLocaleText,
  resolveTextCopyableOptions,
  resolveTextCopyContent,
  resolveTextTag,
  textCopyableBodyClasses,
  textCopyableButtonClasses,
  textCopyableLiveClasses,
  textCopyableRootClasses,
  type CodeCopyButtonStatus,
  type TextCopyable,
  type TextProps,
  type TextTag,
  type TextSize,
  type TextWeight,
  type TextAlign,
  type TextColor,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export type VueTextProps = TextProps

const copyIcon = getIconDefinition('copy')

export const Text = defineComponent({
  name: 'TigerText',
  inheritAttrs: false,
  props: {
    tag: {
      type: String as PropType<TextTag>,
      default: 'p' as TextTag
    },
    size: {
      type: String as PropType<TextSize>,
      default: 'base' as TextSize
    },
    weight: {
      type: String as PropType<TextWeight>,
      default: 'normal' as TextWeight
    },
    align: {
      type: String as PropType<TextAlign>
    },
    color: {
      type: String as PropType<TextColor>,
      default: 'default' as TextColor
    },
    truncate: {
      type: Boolean,
      default: false
    },
    italic: {
      type: Boolean,
      default: false
    },
    underline: {
      type: Boolean,
      default: false
    },
    lineThrough: {
      type: Boolean,
      default: false
    },
    copyable: {
      type: [Boolean, Object] as PropType<TextCopyable>,
      default: false
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    }
  },
  emits: ['copy'],
  setup(props, { slots, attrs, emit }) {
    const config = useTigerConfig()
    const textClasses = computed(() => getTextClasses(props))
    const resolvedTag = computed(() => resolveTextTag(props.tag))
    const copyable = computed(() => isTextCopyable(props.copyable))
    const copyOptions = computed(() => resolveTextCopyableOptions(props.copyable))
    const bodyRef = ref<HTMLElement | null>(null)
    const copyStatus = ref<CodeCopyButtonStatus>('idle')
    const reset = createCopyStatusReset((status) => {
      copyStatus.value = status
    })

    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getCodeLabels(mergedLocale.value))
    const idleLabel = computed(() =>
      resolveLocaleText(labels.value.copyLabel, copyOptions.value?.tooltip)
    )
    const buttonLabel = computed(() => {
      if (copyStatus.value === 'failed') return labels.value.copyFailedLabel
      if (copyStatus.value === 'copied') return labels.value.copiedLabel
      return idleLabel.value
    })
    const liveText = computed(() => (copyStatus.value === 'idle' ? '' : buttonLabel.value))

    const handleCopy = async () => {
      const options = copyOptions.value
      if (!options) return
      const fallback = bodyRef.value?.textContent ?? ''
      const text = resolveTextCopyContent(options, fallback)
      const ok = await copyTextToClipboard(text)
      if (ok) {
        reset.schedule('copied')
        options.onCopy?.(text)
        emit('copy', text)
      } else {
        reset.schedule('failed')
      }
    }

    onBeforeUnmount(() => {
      reset.dispose()
    })

    return () => {
      const content = slots.default?.()
      if (!copyable.value) {
        return h(resolvedTag.value, { ...attrs, class: [textClasses.value, attrs.class] }, content)
      }

      const bodyClass = [
        textCopyableBodyClasses,
        props.truncate ? 'truncate' : undefined,
        textClasses.value
      ]
      const copySvg = copyIcon
        ? h(
            'svg',
            {
              xmlns: 'http://www.w3.org/2000/svg',
              viewBox: copyIcon.viewBox,
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '1.5',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              class: 'h-3.5 w-3.5',
              'aria-hidden': 'true'
            },
            copyIcon.paths.map((d) => h('path', { d }))
          )
        : undefined

      return h(resolvedTag.value, { ...attrs, class: [textCopyableRootClasses, attrs.class] }, [
        h(
          'span',
          {
            ref: bodyRef,
            class: bodyClass
          },
          content
        ),
        h(
          'button',
          {
            type: 'button',
            class: textCopyableButtonClasses,
            'aria-label': buttonLabel.value,
            title: buttonLabel.value,
            onClick: handleCopy
          },
          copySvg
        ),
        h('span', { class: textCopyableLiveClasses, 'aria-live': 'polite' }, liveText.value)
      ])
    }
  }
})

export default Text
