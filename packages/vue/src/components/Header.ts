import { defineComponent, h, PropType, computed, inject } from 'vue'
import {
  classNames,
  coerceClassValue,
  getLayoutHeaderClasses,
  mergeStyleValues,
  resolveHeaderSticky,
  resolveLayoutSectionTag
} from '@expcat/tigercat-core'
import type { HeaderVariant } from '@expcat/tigercat-core'
import { LayoutContextKey } from '../utils/layout-context'

export interface VueHeaderProps {
  className?: string
  variant?: HeaderVariant
  height?: string
  sticky?: boolean
  as?: string
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
    sticky: {
      type: Boolean,
      default: false
    },
    as: {
      type: String as PropType<string>,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const layout = inject(LayoutContextKey, null)
    const headerClasses = computed(() =>
      classNames(
        getLayoutHeaderClasses(props.variant, {
          sticky: resolveHeaderSticky({
            sticky: props.sticky,
            fullHeightShell: Boolean(layout?.fullHeight.value)
          })
        }),
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    return () =>
      h(
        resolveLayoutSectionTag({
          kind: 'header',
          nested: Boolean(layout?.nested.value),
          explicit: props.as
        }),
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
