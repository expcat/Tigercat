import { defineComponent, computed, h, ref, onMounted, onBeforeUnmount, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  calculateAffixState,
  resolveAffixTarget,
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
    const placeholderRef = ref<HTMLElement | null>(null)
    const state = ref<AffixState>({ affixed: false, style: {} })
    const originalRect = ref<{ top: number; left: number; width: number; height: number } | null>(
      null
    )

    const update = () => {
      if (!wrapperRef.value) return

      const el =
        state.value.affixed && placeholderRef.value ? placeholderRef.value : wrapperRef.value

      const rect = el.getBoundingClientRect()
      if (!originalRect.value || !state.value.affixed) {
        originalRect.value = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        }
      }

      const resolved = resolveAffixTarget(props.target)
      const containerRect = resolved.getRect()

      const newState = calculateAffixState(
        originalRect.value,
        containerRect,
        props.offsetBottom !== undefined ? undefined : props.offsetTop,
        props.offsetBottom,
        props.zIndex
      )

      if (newState.affixed !== state.value.affixed) {
        emit('change', newState.affixed)
      }
      state.value = newState
    }

    let scrollTarget: Element | Window | null = null
    onMounted(() => {
      const resolved = resolveAffixTarget(props.target)
      scrollTarget = resolved.element
      scrollTarget.addEventListener('scroll', update, { passive: true })
      window.addEventListener('resize', update, { passive: true })
      update()
    })
    onBeforeUnmount(() => {
      scrollTarget?.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    })

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const children = slots.default?.()

      if (state.value.affixed) {
        // Insert a placeholder to maintain layout, then render fixed content
        return h('div', { ref: placeholderRef }, [
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

      return h(
        'div',
        {
          ref: wrapperRef,
          ...attrs,
          class: classNames(props.className, coerceClassValue(attrsRecord.class)),
          style: mergeStyleValues(attrsRecord.style, props.style)
        },
        children
      )
    }
  }
})

export default Affix
