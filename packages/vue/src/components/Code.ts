import { computed, defineComponent, h, onBeforeUnmount, PropType, ref, type VNodeChild } from 'vue'

function renderHighlightTokens(lines: HighlightToken[][]): VNodeChild[] {
  return lines.map((tokens, lineIndex) =>
    h('span', { key: lineIndex }, [
      lineIndex > 0 ? '\n' : null,
      ...tokens.map((token, tokenIndex) =>
        token.className
          ? h('span', { key: tokenIndex, class: token.className }, token.text)
          : token.text
      )
    ])
  )
}
import {
  coerceClassValue,
  codeBlockCopyStatusLiveClasses,
  codeBlockPreClasses,
  copyTextToClipboard,
  createCopyStatusReset,
  getCodeBlockContainerClasses,
  getCodeBlockCopyButtonClasses,
  getCodeLabels,
  mergeStyleValues,
  mergeTigerLocale,
  highlightToTokens,
  resolveCodeHighlightTheme,
  type HighlightToken,
  resolveLocaleText,
  type CodeCopyButtonStatus,
  type CodeHighlighter,
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
    language: {
      type: String,
      default: undefined
    },
    highlighter: {
      type: Object as PropType<CodeHighlighter>,
      default: undefined
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
    const reset = createCopyStatusReset((status) => {
      copyStatus.value = status
    })

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
    const liveText = computed(() => (copyStatus.value === 'idle' ? '' : buttonLabel.value))

    const containerClasses = computed(() => {
      const attrsRecord = attrs as Record<string, unknown>
      return getCodeBlockContainerClasses(props.className, coerceClassValue(attrsRecord.class))
    })

    const copyButtonClasses = computed(() => {
      return getCodeBlockCopyButtonClasses(copyStatus.value)
    })

    const handleCopy = async () => {
      if (!props.copyable) return
      const ok = await copyTextToClipboard(props.code)
      if (ok) {
        reset.schedule('copied')
        emit('copy', props.code)
      } else {
        reset.schedule('failed')
      }
    }

    onBeforeUnmount(() => {
      reset.dispose()
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
          h(
            'pre',
            {
              class: codeBlockPreClasses,
              tabindex: 0,
              'aria-label': labels.value.scrollLabel
            },
            [
            (() => {
              const highlighted = highlightToTokens(
                props.code,
                props.language,
                props.highlighter,
                resolveCodeHighlightTheme(config.value.colorScheme)
              )
              return highlighted == null
                ? h('code', { class: 'block' }, props.code)
                : h('code', { class: 'block' }, renderHighlightTokens(highlighted))
            })()
            ]
          ),
          props.copyable
            ? h(
                'button',
                {
                  type: 'button',
                  class: copyButtonClasses.value,
                  onClick: handleCopy
                },
                buttonLabel.value
              )
            : null,
          props.copyable
            ? h(
                'span',
                {
                  class: codeBlockCopyStatusLiveClasses,
                  'aria-live': 'polite'
                },
                liveText.value
              )
            : null
        ]
      )
  }
})

export default Code
