import { computed, defineComponent, h, onBeforeUnmount, PropType, ref } from 'vue'
import {
  classNames,
  coerceClassValue,
  codeBlockContainerClasses,
  codeBlockCopyButtonBaseClasses,
  codeBlockCopyButtonCopiedClasses,
  codeBlockPreClasses,
  copyTextToClipboard,
  type CodeProps as CoreCodeProps
} from '@expcat/tigercat-core'

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
      default: '复制'
    },
    copiedLabel: {
      type: String,
      default: '已复制'
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
    const isCopied = ref(false)
    const timerRef = ref<number | null>(null)

    const containerClasses = computed(() => {
      const attrsRecord = attrs as Record<string, unknown>
      return classNames(
        codeBlockContainerClasses,
        props.className,
        coerceClassValue(attrsRecord.class)
      )
    })

    const copyButtonClasses = computed(() => {
      return classNames(
        codeBlockCopyButtonBaseClasses,
        isCopied.value && codeBlockCopyButtonCopiedClasses
      )
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
      if (!ok) return

      isCopied.value = true
      emit('copy', props.code)
      clearTimer()
      timerRef.value = window.setTimeout(() => {
        isCopied.value = false
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
          style: props.style
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
                  'aria-label': isCopied.value ? props.copiedLabel : props.copyLabel
                },
                isCopied.value ? props.copiedLabel : props.copyLabel
              )
            : null
        ]
      )
  }
})

export default Code
