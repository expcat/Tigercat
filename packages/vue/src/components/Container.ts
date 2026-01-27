import { defineComponent, computed, h, PropType, Component, resolveDynamicComponent } from 'vue'
import { getContainerClasses, type ContainerMaxWidth } from '@expcat/tigercat-core'

export const Container = defineComponent({
  name: 'TigerContainer',
  inheritAttrs: false,
  props: {
    /**
     * HTML element or component to render as
     * @default 'div'
     */
    as: {
      type: [String, Object] as PropType<string | Component>,
      default: 'div'
    },
    /**
     * Maximum width constraint (false for no constraint)
     * @default false
     */
    maxWidth: {
      type: [String, Boolean] as PropType<ContainerMaxWidth>,
      default: false
    },
    /**
     * Center container horizontally
     * @default true
     */
    center: {
      type: Boolean,
      default: true
    },
    /**
     * Add responsive horizontal padding
     * @default true
     */
    padding: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { slots, attrs }) {
    const containerClasses = computed(() =>
      getContainerClasses({
        maxWidth: props.maxWidth,
        center: props.center,
        padding: props.padding
      })
    )

    return () => {
      const { class: attrsClass, style: attrsStyle, ...restAttrs } = attrs
      const tag = resolveDynamicComponent(props.as) as string | Component
      return h(
        tag,
        {
          ...restAttrs,
          class: [containerClasses.value, attrsClass],
          style: attrsStyle
        },
        slots.default?.()
      )
    }
  }
})

export default Container
