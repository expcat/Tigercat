import { defineComponent, h, PropType, computed } from 'vue'
import { classNames } from '@tigercat/core'

export const Header = defineComponent({
  name: 'TigerHeader',
  props: {
    className: {
      type: String as PropType<string>,
      default: '',
    },
    height: {
      type: String as PropType<string>,
      default: '64px',
    },
  },
  setup(props, { slots }) {
    const headerClasses = computed(() => classNames(
      'tiger-header',
      'bg-white border-b border-gray-200',
      props.className
    ))

    return () => {
      return h(
        'header',
        {
          class: headerClasses.value,
          style: {
            height: props.height,
          },
        },
        slots.default?.()
      )
    }
  },
})

export default Header
