import { defineComponent, h } from 'vue'
import {
  classNames,
  getDropdownMenuClasses,
} from '@tigercat/core'

export const DropdownMenu = defineComponent({
  name: 'TigerDropdownMenu',
  props: {
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const menuClasses = classNames(
      getDropdownMenuClasses(),
      props.className
    )

    return () => {
      return h(
        'div',
        {
          class: menuClasses,
          role: 'menu',
        },
        slots.default?.()
      )
    }
  },
})

export default DropdownMenu
