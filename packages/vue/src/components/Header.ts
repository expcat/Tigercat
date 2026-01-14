import { defineComponent, h, PropType, computed } from 'vue'
import { classNames, coerceClassValue, layoutHeaderClasses, mergeStyleValues } from '@tigercat/core'

export interface VueHeaderProps {
  className?: string
  height?: string
  style?: Record<string, string | number>
}

export const Header = defineComponent({
  name: 'TigerHeader',
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
     * Header height (CSS value)
     * @default '64px'
     */
    height: {
      type: String as PropType<string>,
      default: '64px'
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

    const headerClasses = computed(() =>
      classNames(layoutHeaderClasses, props.className, coerceClassValue(attrsRecord.class))
    )

    return () => {
      return h(
        'header',
        {
          ...attrs,
          class: headerClasses.value,
          style: mergeStyleValues(attrsRecord.style, props.style, {
            height: props.height
          })
        },
        slots.default?.()
      )
    }
  }
})

export default Header
