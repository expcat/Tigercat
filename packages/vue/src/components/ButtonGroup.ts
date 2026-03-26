import { defineComponent, h, PropType, provide } from 'vue'
import {
  classNames,
  coerceClassValue,
  buttonGroupBaseClasses,
  buttonGroupHorizontalClasses,
  buttonGroupVerticalClasses,
  buttonGroupItemClasses,
  buttonGroupItemVerticalClasses,
  type ButtonSize
} from '@expcat/tigercat-core'

export const BUTTON_GROUP_INJECTION_KEY = Symbol('TigerButtonGroup')

export interface ButtonGroupContext {
  size?: ButtonSize
}

export interface VueButtonGroupProps {
  size?: ButtonSize
  vertical?: boolean
  className?: string
}

export const ButtonGroup = defineComponent({
  name: 'TigerButtonGroup',
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<ButtonSize>,
      default: undefined
    },
    vertical: Boolean,
    className: {
      type: String,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    provide<ButtonGroupContext>(BUTTON_GROUP_INJECTION_KEY, {
      get size() {
        return props.size
      }
    })

    return () => {
      const classes = classNames(
        buttonGroupBaseClasses,
        props.vertical ? buttonGroupVerticalClasses : buttonGroupHorizontalClasses,
        props.vertical ? buttonGroupItemVerticalClasses : buttonGroupItemClasses,
        props.className,
        coerceClassValue(attrs.class)
      )

      return h(
        'div',
        {
          ...attrs,
          class: classes,
          role: 'group'
        },
        slots.default?.()
      )
    }
  }
})

export default ButtonGroup
