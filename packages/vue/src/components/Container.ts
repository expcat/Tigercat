import { defineComponent, computed, h, PropType } from 'vue'
import { classNames, type ContainerMaxWidth } from '@tigercat/core'

const maxWidthClasses: Record<Exclude<ContainerMaxWidth, false>, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'w-full',
}

export const Container = defineComponent({
  name: 'TigerContainer',
  props: {
    maxWidth: {
      type: [String, Boolean] as PropType<ContainerMaxWidth>,
      default: false,
    },
    center: {
      type: Boolean,
      default: true,
    },
    padding: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { slots, attrs }) {
    const containerClasses = computed(() => {
      const baseClasses = classNames(
        'w-full',
        props.maxWidth !== false && maxWidthClasses[props.maxWidth],
        props.center && 'mx-auto',
        props.padding && 'px-4 sm:px-6 lg:px-8'
      )
      
      // Handle attrs.class which can be string, array, or object
      const attrsClass = attrs.class
      if (typeof attrsClass === 'string') {
        return classNames(baseClasses, attrsClass)
      } else if (Array.isArray(attrsClass)) {
        return classNames(baseClasses, ...attrsClass)
      } else if (attrsClass && typeof attrsClass === 'object') {
        // Convert object class to string
        const objectClasses = Object.keys(attrsClass).filter(key => (attrsClass as Record<string, unknown>)[key])
        return classNames(baseClasses, ...objectClasses)
      }
      
      return baseClasses
    })

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { class: _class, ...restAttrs } = attrs
      return h(
        'div',
        {
          ...restAttrs,
          class: containerClasses.value,
        },
        slots.default?.()
      )
    }
  },
})

export default Container
