import { defineComponent, computed, h, inject, PropType } from 'vue'
import {
  composeComponentClasses,
  mergeStyleValues,
  resolveButtonClasses,
  resolveButtonHtmlType,
  resolveButtonIconPlacement,
  getButtonIconSlotClasses,
  getButtonSpinnerClasses,
  getSpinnerSVG,
  normalizeSvgAttrs,
  omitUnsupportedColorProp,
  warnMissingAccessibleName,
  TIGER_CHROME_ATTR,
  type ButtonVariant,
  type ButtonSize,
  type ButtonIconPosition,
  type ButtonHtmlType
} from '@expcat/tigercat-core'
import { BUTTON_GROUP_INJECTION_KEY, type ButtonGroupContext } from './ButtonGroup'

export interface VueButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  block?: boolean
  iconPosition?: ButtonIconPosition
  htmlType?: ButtonHtmlType
  type?: ButtonHtmlType
  danger?: boolean
  className?: string
  style?: Record<string, unknown>
}

function hasSlotContent(nodes: unknown): boolean {
  if (nodes == null || nodes === false) return false
  if (Array.isArray(nodes)) return nodes.some(hasSlotContent)
  return true
}

const createLoadingSpinner = (size: ButtonSize) => {
  const spinnerSvg = getSpinnerSVG('spinner')
  return h(
    'svg',
    {
      class: getButtonSpinnerClasses(size),
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
    variant: {
      type: String as PropType<ButtonVariant>,
      default: 'primary'
    },
    size: {
      type: String as PropType<ButtonSize>,
      default: undefined
    },
    disabled: Boolean,
    loading: Boolean,
    block: Boolean,
    iconPosition: {
      type: String as PropType<ButtonIconPosition>,
      default: 'start'
    },
    htmlType: {
      type: String as PropType<ButtonHtmlType>,
      default: undefined
    },
    type: {
      type: String as PropType<ButtonHtmlType>,
      default: undefined
    },
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
    const group = inject<ButtonGroupContext | null>(BUTTON_GROUP_INJECTION_KEY, null)
    const resolvedSize = computed<ButtonSize>(() => props.size ?? group?.size ?? 'md')

    const buttonClasses = computed(() =>
      composeComponentClasses(
        resolveButtonClasses({
          variant: props.variant,
          danger: props.danger,
          size: resolvedSize.value,
          disabled: props.disabled,
          loading: props.loading,
          block: props.block,
          className: props.className
        }),
        attrs.class
      )
    )

    const mergedStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    return () => {
      const restAttrs = omitUnsupportedColorProp('Button', {
        ...(attrs as Record<string, unknown>)
      })
      const {
        class: _class,
        style: _style,
        type: attrType,
        onClick: _onClick,
        ...domAttrs
      } = restAttrs
      const htmlType = resolveButtonHtmlType(props.htmlType, props.type ?? attrType)
      const label = slots.default?.()
      const hasLabel = hasSlotContent(label)
      warnMissingAccessibleName('Button', {
        text: hasLabel ? 'named' : '',
        ariaLabel: domAttrs['aria-label'],
        ariaLabelledby: domAttrs['aria-labelledby']
      })

      const placement = resolveButtonIconPlacement(props.iconPosition)
      const slotClass = getButtonIconSlotClasses(placement, hasLabel)
      const loadingNode = props.loading
        ? h(
            'span',
            { class: slotClass || undefined, 'aria-hidden': 'true' },
            slots['loading-icon']
              ? slots['loading-icon']()
              : createLoadingSpinner(resolvedSize.value)
          )
        : null
      const iconNode =
        !props.loading && slots.icon
          ? h('span', { class: slotClass || undefined, 'aria-hidden': 'true' }, slots.icon())
          : null
      const chrome = loadingNode ?? iconNode
      const children = placement === 'end' ? [label, chrome] : [chrome, label]

      return h(
        'button',
        {
          ...domAttrs,
          [TIGER_CHROME_ATTR]: '',
          class: buttonClasses.value,
          style: mergedStyle.value,
          'aria-busy': attrs['aria-busy'] ?? (props.loading ? 'true' : undefined),
          'aria-disabled': attrs['aria-disabled'] ?? (props.disabled ? 'true' : undefined),
          disabled: props.disabled ? true : undefined,
          type: htmlType,
          onClick: (event: MouseEvent) => {
            if (props.disabled || props.loading) {
              event.preventDefault()
              return
            }
            emit('click', event)
          }
        },
        children
      )
    }
  }
})

export default Button
