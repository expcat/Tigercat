import { defineComponent, computed, h, PropType, Component, resolveDynamicComponent } from 'vue'
import {
  coerceClassValue,
  getContainerClasses,
  getContainerMaxWidthStyle,
  type ContainerMaxWidth
} from '@expcat/tigercat-core'

export interface VueContainerProps {
  as?: string | Component
  maxWidth?: ContainerMaxWidth
  center?: boolean
  padding?: boolean
  className?: string
}

export const Container = defineComponent({
  name: 'TigerContainer',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<string | Component>,
      default: 'div'
    },
    maxWidth: {
      type: [String, Boolean] as PropType<ContainerMaxWidth>,
      default: false
    },
    center: {
      type: Boolean,
      default: true
    },
    padding: {
      type: Boolean,
      default: true
    },
    className: {
      type: String as PropType<string>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const containerClasses = computed(() =>
      getContainerClasses({
        maxWidth: props.maxWidth,
        center: props.center,
        padding: props.padding,
        className: props.className
      })
    )
    const maxWidthStyle = computed(() => getContainerMaxWidthStyle(props.maxWidth))

    return () => {
      const { class: attrsClass, style: attrsStyle, ...restAttrs } = attrs
      const tag = resolveDynamicComponent(props.as) as string | Component
      return h(
        tag,
        {
          ...restAttrs,
          class: [containerClasses.value, coerceClassValue(attrsClass)],
          style: [maxWidthStyle.value, attrsStyle]
        },
        slots.default?.()
      )
    }
  }
})

export default Container
