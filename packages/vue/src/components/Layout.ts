import { defineComponent, h, PropType, computed } from 'vue'
import { classNames } from '@tigercat/core'

export const Layout = defineComponent({
  name: 'TigerLayout',
  props: {
    className: {
      type: String as PropType<string>,
      default: '',
    },
  },
  setup(props, { slots }) {
    const layoutClasses = computed(() => classNames(
      'tiger-layout',
      'flex flex-col min-h-screen',
      props.className
    ))

    return () => {
      return h(
        'div',
        {
          class: layoutClasses.value,
        },
        slots.default?.()
      )
    }
  },
})

export default Layout
