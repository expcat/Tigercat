import { defineComponent, h, PropType, computed } from 'vue'
import {
  classNames,
  coerceClassValue,
  getLayoutHeaderClasses,
  injectLayoutGridStyles,
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
    className: {
      type: String as PropType<string>,
      default: undefined
    },
    variant: {
      type: String as PropType<HeaderVariant>,
      default: 'default' as HeaderVariant
    },
    height: {
      type: String as PropType<string>,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    injectLayoutGridStyles()
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
          style: mergeStyleValues(props.style, props.height ? { height: props.height } : undefined)
        },
        slots.default?.()
      )
  }
})

export default Header
