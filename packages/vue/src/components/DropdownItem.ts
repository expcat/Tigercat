import { defineComponent, inject, computed, h, PropType } from 'vue'
import {
  classNames,
  getDropdownItemClasses,
} from '@tigercat/core'
import { DropdownContextKey, type DropdownContext } from './Dropdown'

export const DropdownItem = defineComponent({
  name: 'TigerDropdownItem',
  props: {
    /**
     * Unique key for the dropdown item
     */
    itemKey: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    /**
     * Whether the item is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the item is divided from previous item
     * @default false
     */
    divided: {
      type: Boolean,
      default: false,
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined,
    },
  },
  emits: ['click'],
  setup(props, { slots, emit }) {
    // Get dropdown context
    const context = inject<DropdownContext | null>(DropdownContextKey, null)

    // Handle click
    const handleClick = (event: MouseEvent) => {
      if (props.disabled) {
        event.preventDefault()
        return
      }

      emit('click', event)
      
      // Notify dropdown to close if closeOnClick is true
      if (context?.closeOnClick) {
        context.handleItemClick()
      }
    }

    // Item classes
    const itemClasses = computed(() => {
      return classNames(
        getDropdownItemClasses(props.disabled, props.divided),
        props.className
      )
    })

    return () => {
      return h(
        'div',
        {
          class: itemClasses.value,
          role: 'menuitem',
          'aria-disabled': props.disabled,
          onClick: handleClick,
        },
        slots.default?.()
      )
    }
  },
})

export default DropdownItem
