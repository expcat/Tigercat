import { defineComponent, h, PropType, computed } from 'vue'
import { classNames, coerceClassValue, getLayoutContentClasses } from '@expcat/tigercat-core'

export interface VueContentProps {
  className?: string
  padding?: boolean | string
  style?: Record<string, string | number>
}

export const Content = defineComponent({
  name: 'TigerContent',
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
     * Built-in content padding.
     * @default true
     */
    padding: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: true
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
    const contentClasses = computed(() =>
      classNames(
        getLayoutContentClasses(props.padding),
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    return () =>
      h('main', { ...attrs, class: contentClasses.value, style: props.style }, slots.default?.())
  }
})

export default Content
