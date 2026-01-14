import { defineComponent, computed, h, PropType } from 'vue'
import { getContainerClasses, type ContainerMaxWidth } from '@tigercat/core'

export const Container = defineComponent({
  name: 'TigerContainer',
  inheritAttrs: false,
  props: {
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
      return h(
        'div',
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
