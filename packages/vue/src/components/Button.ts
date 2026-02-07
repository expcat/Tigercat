import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  buttonBaseClasses,
  buttonSizeClasses,
  buttonDisabledClasses,
  getButtonVariantClasses,
  getSpinnerSVG,
  normalizeSvgAttrs,
  type ButtonVariant,
  type ButtonSize
} from '@expcat/tigercat-core'

export interface VueButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  block?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  style?: Record<string, unknown>
}

const spinnerSvg = getSpinnerSVG('spinner')

const LoadingSpinner = h(
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
     * HTML button type
     * @default 'button'
     */
    type: {
      type: String as PropType<'button' | 'submit' | 'reset'>,
      default: 'button'
    },

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
      return classNames(
        buttonBaseClasses,
        getButtonVariantClasses(props.variant),
        buttonSizeClasses[props.size],
        (props.disabled || props.loading) && buttonDisabledClasses,
        props.block && 'w-full',
        props.className,
        coerceClassValue(attrs.class)
      )
    })

    const mergedStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    return () => {
      const isDisabled = props.disabled || props.loading

      return h(
        'button',
        {
          ...attrs,
          class: buttonClasses.value,
          style: mergedStyle.value,
          'aria-busy': attrs['aria-busy'] ?? (props.loading ? 'true' : undefined),
          'aria-disabled': attrs['aria-disabled'] ?? (isDisabled ? 'true' : undefined),
          disabled: isDisabled,
          type: props.type,
          onClick: isDisabled ? undefined : (event: MouseEvent) => emit('click', event)
        },
        [
          props.loading &&
            h(
              'span',
              { class: 'mr-2' },
              slots['loading-icon'] ? slots['loading-icon']() : LoadingSpinner
            ),
          slots.default?.()
        ]
      )
    }
  }
})

export default Button
