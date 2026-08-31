import { defineComponent, h, PropType, computed } from 'vue'
import {
  classNames,
  coerceClassValue,
  injectLayoutGridStyles,
  layoutFooterClasses,
  mergeStyleValues
} from '@expcat/tigercat-core'

export interface VueFooterProps {
  className?: string
  as?: string
  height?: string
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
      default: 'footer'
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
    const footerClasses = computed(() =>
      classNames(
        layoutFooterClasses,
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    return () =>
      h(
        props.as || 'footer',
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
