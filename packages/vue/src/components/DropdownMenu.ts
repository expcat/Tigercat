import { defineComponent, h, computed, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getDropdownMenuClasses
} from '@expcat/tigercat-core'

import type { DropdownMenuProps as CoreDropdownMenuProps } from '@expcat/tigercat-core'

export interface VueDropdownMenuProps extends CoreDropdownMenuProps {}

export const DropdownMenu = defineComponent({
  name: 'TigerDropdownMenu',
  inheritAttrs: false,
  props: {
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
  setup(props, { slots, attrs }) {
    const attrsRecord = attrs as Record<string, unknown>
    const attrsClass = (attrsRecord as { class?: unknown }).class
    const attrsStyle = (attrsRecord as { style?: unknown }).style

    const menuClasses = computed(() =>
      classNames(getDropdownMenuClasses(), props.className, coerceClassValue(attrsClass))
    )

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
        'div',
        {
          ...restAttrs,
          class: menuClasses.value,
          role: 'menu',
          style: mergedStyle.value
        },
        slots.default?.()
      )
    }
  }
})

export default DropdownMenu
