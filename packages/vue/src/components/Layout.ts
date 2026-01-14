import { defineComponent, h, PropType, computed } from 'vue'
import { classNames, coerceClassValue, layoutRootClasses, mergeStyleValues } from '@tigercat/core'

export interface VueLayoutProps {
  className?: string
  style?: Record<string, string | number>
}

export const Layout = defineComponent({
  name: 'TigerLayout',
  inheritAttrs: false,
  props: {
    /**
     * Additional CSS classes
     */
    className: {
      type: String as PropType<string>,
      default: undefined
    },

    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>

    const layoutClasses = computed(() =>
      classNames(layoutRootClasses, props.className, coerceClassValue(attrsRecord.class))
    )

    return () => {
      return h(
        'div',
        {
          ...attrs,
          class: layoutClasses.value,
          style: mergeStyleValues(attrsRecord.style, props.style)
        },
        slots.default?.()
      )
    }
  }
})

export default Layout
