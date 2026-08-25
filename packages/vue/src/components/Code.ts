import { computed, defineComponent, h, onBeforeUnmount, PropType, ref } from 'vue'
import {
  coerceClassValue,
  codeBlockPreClasses,
  copyTextToClipboard,
  getCodeBlockContainerClasses,
  getCodeBlockCopyButtonClasses,
  getCodeLabels,
  mergeStyleValues,
  mergeTigerLocale,
  resolveLocaleText,
  type CodeCopyButtonStatus,
  type CodeProps as CoreCodeProps,
  type TigerLocale,
  type TigerLocaleCode
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueCodeProps extends CoreCodeProps {
  className?: string
  style?: Record<string, string | number>
}

export const Code = defineComponent({
  name: 'TigerCode',
  inheritAttrs: false,
  props: {
    code: {
      type: String,
      required: true
    },
    copyable: {
      type: Boolean,
      default: true
    },
    copyLabel: {
      type: String,
      default: undefined
    },
    copiedLabel: {
      type: String,
      default: undefined
    },
    copyFailedLabel: {
      type: String,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleCode>>,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['copy'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const copyStatus = ref<CodeCopyButtonStatus>('idle')
    const timerRef = ref<number | null>(null)

    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getCodeLabels(mergedLocale.value, props.labels))
    const resolvedCopyLabel = computed(() =>
      resolveLocaleText(labels.value.copyLabel, props.copyLabel)
    )
    const resolvedCopiedLabel = computed(() =>
      resolveLocaleText(labels.value.copiedLabel, props.copiedLabel)
    )
    const resolvedCopyFailedLabel = computed(() =>
      resolveLocaleText(labels.value.copyFailedLabel, props.copyFailedLabel)
    )
    const buttonLabel = computed(() => {
      if (copyStatus.value === 'failed') return resolvedCopyFailedLabel.value
      if (copyStatus.value === 'copied') return resolvedCopiedLabel.value
      return resolvedCopyLabel.value
    })

    const containerClasses = computed(() => {
      const attrsRecord = attrs as Record<string, unknown>
      return getCodeBlockContainerClasses(props.className, coerceClassValue(attrsRecord.class))
    })

    const copyButtonClasses = computed(() => {
      return getCodeBlockCopyButtonClasses(copyStatus.value)
    })

    const clearTimer = () => {
      if (timerRef.value != null) {
        window.clearTimeout(timerRef.value)
        timerRef.value = null
      }
    }

    const handleCopy = async () => {
      if (!props.copyable) return
      const ok = await copyTextToClipboard(props.code)
      clearTimer()
      if (ok) {
        copyStatus.value = 'copied'
        emit('copy', props.code)
      } else {
        copyStatus.value = 'failed'
      }
      timerRef.value = window.setTimeout(() => {
        copyStatus.value = 'idle'
        timerRef.value = null
      }, 1500)
    }

    onBeforeUnmount(() => {
      clearTimer()
    })

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: containerClasses.value,
          style: mergeStyleValues((attrs as Record<string, unknown>).style, props.style)
        },
        [
          h('pre', { class: codeBlockPreClasses }, [h('code', { class: 'block' }, props.code)]),
          props.copyable
            ? h(
                'button',
                {
                  type: 'button',
                  class: copyButtonClasses.value,
                  onClick: handleCopy,
                  'aria-label': buttonLabel.value
                },
                buttonLabel.value
              )
            : null
        ]
      )
  }
})

export default Code
