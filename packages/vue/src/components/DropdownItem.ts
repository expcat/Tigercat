import { defineComponent, inject, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getDropdownItemClasses
} from '@tigercat/core'
import { DropdownContextKey, type DropdownContext } from './Dropdown'

import type { DropdownItemProps as CoreDropdownItemProps } from '@tigercat/core'

export interface VueDropdownItemProps extends CoreDropdownItemProps {
  itemKey?: string | number
}

export const DropdownItem = defineComponent({
  name: 'TigerDropdownItem',
  inheritAttrs: false,
  props: {
    /**
     * Unique key for the dropdown item
     */
    itemKey: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    /**
     * Whether the item is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Whether the item is divided from previous item
     * @default false
     */
    divided: {
      type: Boolean,
      default: false
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: ['click'],
  setup(props, { slots, emit, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>
    const attrsClass = (attrsRecord as { class?: unknown }).class
    const attrsStyle = (attrsRecord as { style?: unknown }).style

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
        props.className,
        coerceClassValue(attrsClass)
      )
    })

    const mergedStyle = computed(() => mergeStyleValues(attrsStyle, props.style))

    return () => {
      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrsRecord as {
        class?: unknown
        style?: unknown
      } & Record<string, unknown>

      return h(
        'button',
        {
          ...restAttrs,
          type: 'button',
          class: itemClasses.value,
          role: 'menuitem',
          'aria-disabled': props.disabled,
          disabled: props.disabled,
          onClick: handleClick,
          style: mergedStyle.value
        },
        slots.default?.()
      )
    }
  }
})

export default DropdownItem
