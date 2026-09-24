import { defineComponent, h, PropType, computed, inject } from 'vue'
import {
  classNames,
  coerceClassValue,
  getLayoutFooterClasses,
  mergeStyleValues,
  resolveLayoutSectionTag
} from '@expcat/tigercat-core'
import { LayoutContextKey } from '../utils/layout-context'

export interface VueFooterProps {
  className?: string
  as?: string
  height?: string
  size?: 'default' | 'compact'
  style?: Record<string, string | number>
}

export const Footer = defineComponent({
  name: 'TigerFooter',
  inheritAttrs: false,
  props: {
    className: {
      type: String as PropType<string>,
      default: undefined
    },
    as: {
      type: String as PropType<string>,
      default: undefined
    },
    height: {
      type: String as PropType<string>,
      default: undefined
    },
    size: {
      type: String as PropType<'default' | 'compact'>,
      default: 'default'
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const layout = inject(LayoutContextKey, null)
    const footerClasses = computed(() =>
      classNames(
        getLayoutFooterClasses(props.size),
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    return () =>
      h(
        resolveLayoutSectionTag({
          kind: 'footer',
          nested: Boolean(layout?.nested.value),
          explicit: props.as
        }),
        {
          ...attrs,
          class: footerClasses.value,
          style: mergeStyleValues(props.style, props.height ? { height: props.height } : undefined)
        },
        slots.default?.()
      )
  }
})

export default Footer
