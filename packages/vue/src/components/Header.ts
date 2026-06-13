import { defineComponent, h, PropType, computed } from 'vue'
import {
  classNames,
  coerceClassValue,
  getLayoutHeaderClasses,
  mergeStyleValues
} from '@expcat/tigercat-core'
import type { HeaderVariant } from '@expcat/tigercat-core'

export interface VueHeaderProps {
  className?: string
  variant?: HeaderVariant
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
     * Header visual style.
     * @default 'default'
     */
    variant: {
      type: String as PropType<HeaderVariant>,
      default: 'default' as HeaderVariant
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
    const headerClasses = computed(() =>
      classNames(
        getLayoutHeaderClasses(props.variant),
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    return () =>
      h(
        'header',
        {
          ...attrs,
          class: headerClasses.value,
          style: mergeStyleValues(props.style, { height: props.height })
        },
        slots.default?.()
      )
  }
})

export default Header
