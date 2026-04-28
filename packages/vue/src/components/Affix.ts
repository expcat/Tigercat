import { defineComponent, h, ref, onMounted, onBeforeUnmount, watch, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  calculateAffixState,
  resolveAffixTarget,
  createAffixObserver,
  type AffixState
} from '@expcat/tigercat-core'

export interface VueAffixProps {
  offsetTop?: number
  offsetBottom?: number
  target?: string
  zIndex?: number
  className?: string
  style?: Record<string, string | number>
}

export const Affix = defineComponent({
  name: 'TigerAffix',
  inheritAttrs: false,
  props: {
    offsetTop: { type: Number, default: 0 },
    offsetBottom: { type: Number, default: undefined },
    target: { type: String, default: undefined },
    zIndex: { type: Number, default: 10 },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['change'],
  setup(props, { slots, emit, attrs }) {
    const wrapperRef = ref<HTMLElement | null>(null)
    const sentinelRef = ref<HTMLElement | null>(null)
    const state = ref<AffixState>({ affixed: false, style: {} })
    const originalRect = ref<{ top: number; left: number; width: number; height: number } | null>(
      null
    )

    const recalcStyle = (affixed: boolean) => {
      const el = wrapperRef.value
      if (!el) return

      // Capture original layout rect when not affixed
      if (!state.value.affixed) {
        const rect = el.getBoundingClientRect()
        originalRect.value = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        }
      }
      if (!originalRect.value) return

      const resolved = resolveAffixTarget(props.target)
      const containerRect = resolved.getRect()

      if (!affixed) {
        if (state.value.affixed) {
          state.value = { affixed: false, style: {} }
          emit('change', false)
        }
        return
      }

      // Force-affixed: build the fixed style using the captured rect.
      const next = calculateAffixState(
        // Force the calc into the affix branch by lifting the element above the threshold
        {
          top: -1,
          left: originalRect.value.left,
          width: originalRect.value.width,
          height: originalRect.value.height
        },
        containerRect,
        props.offsetBottom !== undefined ? undefined : props.offsetTop,
        props.offsetBottom,
        props.zIndex
      )
      if (!next.affixed) {
        // Calc didn't think we should affix (e.g. container changed). Mirror it.
        if (state.value.affixed) {
          state.value = { affixed: false, style: {} }
          emit('change', false)
        }
        return
      }
      const wasAffixed = state.value.affixed
      state.value = next
      if (!wasAffixed) emit('change', true)
    }

    let stopObserver: (() => void) | null = null
    let resizeObserver: ResizeObserver | null = null

    const setupObserver = () => {
      stopObserver?.()
      const sentinel = sentinelRef.value
      if (!sentinel) return
      const resolved = resolveAffixTarget(props.target)
      const root = resolved.element === window ? null : (resolved.element as Element)
      stopObserver = createAffixObserver(sentinel, {
        offsetTop: props.offsetTop,
        offsetBottom: props.offsetBottom,
        root,
        onToggle: (affixed) => recalcStyle(affixed)
      })
    }

    const onResize = () => {
      if (state.value.affixed) recalcStyle(true)
    }

    onMounted(() => {
      setupObserver()
      if (typeof ResizeObserver !== 'undefined' && wrapperRef.value) {
        resizeObserver = new ResizeObserver(() => onResize())
        resizeObserver.observe(wrapperRef.value)
      }
      window.addEventListener('resize', onResize, { passive: true })
    })

    watch(
      () => [props.target, props.offsetTop, props.offsetBottom],
      () => setupObserver()
    )

    onBeforeUnmount(() => {
      stopObserver?.()
      resizeObserver?.disconnect()
      window.removeEventListener('resize', onResize)
    })

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const children = slots.default?.()

      // The sentinel is always rendered at the original DOM position so the
      // IntersectionObserver can detect when scroll passes it.
      const sentinel = h('div', {
        ref: sentinelRef,
        'aria-hidden': 'true',
        style: { display: 'block', width: '0', height: '0', pointerEvents: 'none' }
      })

      if (state.value.affixed) {
        return h('div', [
          sentinel,
          // placeholder reserves layout space
          h('div', {
            style: {
              width: `${originalRect.value?.width ?? 0}px`,
              height: `${originalRect.value?.height ?? 0}px`
            }
          }),
          h(
            'div',
            {
              ref: wrapperRef,
              ...attrs,
              class: classNames(props.className, coerceClassValue(attrsRecord.class)),
              style: mergeStyleValues(state.value.style, props.style)
            },
            children
          )
        ])
      }

      return h('div', [
        sentinel,
        h(
          'div',
          {
            ref: wrapperRef,
            ...attrs,
            class: classNames(props.className, coerceClassValue(attrsRecord.class)),
            style: mergeStyleValues(attrsRecord.style, props.style)
          },
          children
        )
      ])
    }
  }
})

export default Affix
