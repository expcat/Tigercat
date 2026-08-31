import {
  defineComponent,
  h,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  onUpdated,
  watch,
  PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  createAffixController,
  getAffixSentinelStyle,
  resolveScrollRoot,
  type AffixState,
  type ScrollRootInput,
  AFFIX_UNPINNED_STATE
} from '@expcat/tigercat-core'

export interface VueAffixProps {
  offsetTop?: number
  offsetBottom?: number
  target?: ScrollRootInput
  zIndex?: number
  className?: string
  style?: Record<string, string | number>
}

export type AffixProps = VueAffixProps

export const Affix = defineComponent({
  name: 'TigerAffix',
  inheritAttrs: false,
  props: {
    offsetTop: { type: Number, default: 0 },
    offsetBottom: { type: Number, default: undefined },
    target: {
      type: [String, Object, Function] as PropType<ScrollRootInput>,
      default: undefined
    },
    zIndex: { type: Number, default: 10 },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['change'],
  setup(props, { slots, emit, attrs, expose }) {
    const wrapperRef = ref<HTMLElement | null>(null)
    const sentinelRef = ref<HTMLElement | null>(null)
    const placeholderRef = ref<HTMLElement | null>(null)
    const state = ref<AffixState>({ ...AFFIX_UNPINNED_STATE })

    const controller = createAffixController({
      getSentinel: () => sentinelRef.value,
      getPlaceholder: () => placeholderRef.value,
      getContent: () => wrapperRef.value,
      getTarget: () => props.target,
      getOffsetTop: () => props.offsetTop,
      getOffsetBottom: () => props.offsetBottom,
      getZIndex: () => props.zIndex,
      onState: (next) => {
        state.value = next
      },
      onChange: (affixed) => emit('change', affixed)
    })

    const resolvedTargetKey = computed(() => {
      const resolved = resolveScrollRoot(props.target)
      return resolved.isWindow ? 'window' : resolved.target
    })

    onMounted(() => {
      controller.bind()
    })

    watch([resolvedTargetKey, () => props.offsetTop, () => props.offsetBottom], () => {
      controller.bind()
    })

    watch(
      () => props.zIndex,
      () => {
        controller.updateStyle()
      }
    )

    onUpdated(() => {
      controller.observeFlow()
    })

    onBeforeUnmount(() => {
      controller.unbind()
    })

    expose({
      getElement: () => wrapperRef.value
    })

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const children = slots.default?.()
      const useBottom = props.offsetBottom !== undefined
      const sentinel = h('div', {
        ref: sentinelRef,
        'aria-hidden': 'true',
        style: getAffixSentinelStyle()
      })

      const contentStyle = state.value.affixed
        ? mergeStyleValues(attrsRecord.style, props.style, state.value.style)
        : mergeStyleValues(attrsRecord.style, props.style)

      const content = h(
        'div',
        {
          ref: wrapperRef,
          ...attrs,
          class: classNames(props.className, coerceClassValue(attrsRecord.class)),
          style: contentStyle
        },
        children
      )

      const placeholder = state.value.affixed
        ? h('div', {
            ref: placeholderRef,
            'aria-hidden': 'true',
            style: {
              width: state.value.placeholder.width,
              height: state.value.placeholder.height
            }
          })
        : null

      return h(
        'div',
        { style: { display: 'contents' } },
        useBottom ? [placeholder, content, sentinel] : [sentinel, placeholder, content]
      )
    }
  }
})

export default Affix
