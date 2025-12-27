import { defineComponent, h, PropType, computed } from 'vue'
import { classNames } from '@tigercat/core'

export const Footer = defineComponent({
  name: 'TigerFooter',
  props: {
    className: {
      type: String as PropType<string>,
      default: '',
    },
    height: {
      type: String as PropType<string>,
      default: 'auto',
    },
  },
  setup(props, { slots }) {
    const footerClasses = computed(() => classNames(
      'tiger-footer',
      'bg-white border-t border-gray-200 p-4',
      props.className
    ))

    return () => {
      return h(
        'footer',
        {
          class: footerClasses.value,
          style: {
            height: props.height,
          },
        },
        slots.default?.()
      )
    }
  },
})

export default Footer
