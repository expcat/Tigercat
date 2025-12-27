import { defineComponent, h, PropType, computed } from 'vue'
import { classNames } from '@tigercat/core'

export const Content = defineComponent({
  name: 'TigerContent',
  props: {
    className: {
      type: String as PropType<string>,
      default: '',
    },
  },
  setup(props, { slots }) {
    const contentClasses = computed(() => classNames(
      'tiger-content',
      'flex-1 bg-gray-50 p-6',
      props.className
    ))

    return () => {
      return h(
        'main',
        {
          class: contentClasses.value,
        },
        slots.default?.()
      )
    }
  },
})

export default Content
