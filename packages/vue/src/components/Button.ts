import { defineComponent, computed, h, PropType } from 'vue'
import {
  composeComponentClasses,
  mergeStyleValues,
  buttonBaseClasses,
  buttonSizeClasses,
  buttonDisabledClasses,
  buttonDangerClasses,
  getButtonVariantClasses,
  getSpinnerSVG,
  normalizeSvgAttrs,
  type ButtonVariant,
  type ButtonSize,
  type ButtonIconPosition,
  type ButtonHtmlType
} from '@expcat/tigercat-core'

export interface VueButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  block?: boolean
  iconPosition?: ButtonIconPosition
  htmlType?: ButtonHtmlType
  danger?: boolean
  className?: string
  style?: Record<string, unknown>
}

// Factory — must NOT be hoisted to module scope. Returning a fresh vnode per call
// avoids cross-instance vnode reuse during SSR / concurrent renders.
const createLoadingSpinner = () => {
  const spinnerSvg = getSpinnerSVG('spinner')
  return h(
    'svg',
    {
      class: 'animate-spin h-4 w-4',
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: spinnerSvg.viewBox,
      'aria-hidden': 'true',
      focusable: 'false'
    },
    spinnerSvg.elements.map((el) => h(el.type, normalizeSvgAttrs(el.attrs)))
  )
}

export const Button = defineComponent({
  name: 'TigerButton',
  inheritAttrs: false,
  props: {
    /**
     * Button variant style
     * @default 'primary'
     */
    variant: {
      type: String as PropType<ButtonVariant>,
      default: 'primary'
    },
    /**
     * Button size
     * @default 'md'
     */
    size: {
      type: String as PropType<ButtonSize>,
      default: 'md'
    },
    /**
     * Whether the button is disabled
     */
    disabled: Boolean,
    /**
     * Whether the button is in loading state
     */
    loading: Boolean,

    /**
     * Whether the button should take full width of its parent
     */
    block: Boolean,

    /**
     * Icon position relative to button text
     * @default 'left'
     */
    iconPosition: {
      type: String as PropType<ButtonIconPosition>,
      default: 'left'
    },

    /**
     * HTML button type
     * @default 'button'
     */
    htmlType: {
      type: String as PropType<ButtonHtmlType>,
      default: 'button'
    },

    /**
     * Whether to apply danger/destructive styling
     */
    danger: Boolean,

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
    const buttonClasses = computed(() => {
      const variantClasses = props.danger
        ? (buttonDangerClasses[props.variant] ?? buttonDangerClasses.primary)
        : getButtonVariantClasses(props.variant)

      return composeComponentClasses(
        buttonBaseClasses,
        variantClasses,
        buttonSizeClasses[props.size],
        (props.disabled || props.loading) && buttonDisabledClasses,
        props.block && 'w-full',
        props.className,
        attrs.class
      )
    })

    const mergedStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    return () => {
      const isDisabled = props.disabled || props.loading
      const iconIsRight = props.iconPosition === 'right'

      const loadingNode = props.loading
        ? h(
            'span',
            { class: iconIsRight ? 'ml-2 order-1' : 'mr-2' },
            slots['loading-icon'] ? slots['loading-icon']() : createLoadingSpinner()
          )
        : null

      const iconNode =
        !props.loading && slots.icon
          ? h('span', { class: iconIsRight ? 'ml-2 order-1' : 'mr-2' }, slots.icon())
          : null

      return h(
        'button',
        {
          ...attrs,
          class: buttonClasses.value,
          style: mergedStyle.value,
          'aria-busy': attrs['aria-busy'] ?? (props.loading ? 'true' : undefined),
          'aria-disabled': attrs['aria-disabled'] ?? (isDisabled ? 'true' : undefined),
          disabled: isDisabled,
          type: props.htmlType,
          onClick: isDisabled ? undefined : (event: MouseEvent) => emit('click', event)
        },
        [loadingNode, iconNode, slots.default?.()]
      )
    }
  }
})

export default Button
