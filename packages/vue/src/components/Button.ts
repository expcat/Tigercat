import {
  Comment,
  Fragment,
  Text,
  defineComponent,
  computed,
  h,
  inject,
  isVNode,
  PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  resolveButtonClasses,
  resolveButtonType,
  resolveButtonIconPlacement,
  getButtonIconSlotClasses,
  getButtonSpinnerClasses,
  getSpinnerSVG,
  normalizeSvgAttrs,
  warnMissingAccessibleName,
  TIGER_CHROME_ATTR,
  type ButtonVariant,
  type ButtonSize,
  type ButtonIconPosition,
  type ButtonHtmlType
} from '@expcat/tigercat-core'
import { BUTTON_GROUP_INJECTION_KEY, type ButtonGroupContext } from './ButtonGroup'
import { useTigerConfig } from './tiger-config'

export interface VueButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  block?: boolean
  iconPosition?: ButtonIconPosition
  type?: ButtonHtmlType
  danger?: boolean
  className?: string
  style?: Record<string, unknown>
}

function hasLabelContent(nodes: unknown): boolean {
  if (nodes == null || typeof nodes === 'boolean') return false
  if (typeof nodes === 'string' || typeof nodes === 'number') return String(nodes).trim().length > 0
  if (Array.isArray(nodes)) return nodes.some(hasLabelContent)
  if (!isVNode(nodes) || nodes.type === Comment) return false
  const hidden = nodes.props?.['aria-hidden']
  if (hidden === true || hidden === '' || hidden === 'true') return false
  if (nodes.type === Text || nodes.type === Fragment || typeof nodes.type === 'string') {
    return hasLabelContent(nodes.children)
  }
  // A component's rendered content is only known after it renders.
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
    const config = useTigerConfig()
    const resolvedSize = computed<ButtonSize>(() => props.size ?? group?.size ?? 'md')

    const mergedStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    return () => {
      const restAttrs = attrs as Record<string, unknown>
      const {
        class: _class,
        style: _style,
        type: attrType,
        onClick: _onClick,
        ...domAttrs
      } = restAttrs
      const buttonType = resolveButtonType(props.type ?? attrType)
      const label = slots.default?.()
      const hasLabel = hasLabelContent(label)
      warnMissingAccessibleName('Button', {
        text: hasLabel ? 'named' : '',
        ariaLabel: domAttrs['aria-label'],
        ariaLabelledby: domAttrs['aria-labelledby']
      })
      const buttonClasses = classNames(
        resolveButtonClasses({
          variant: props.variant,
          danger: props.danger,
          size: resolvedSize.value,
          disabled: props.disabled,
          loading: props.loading,
          joined: group != null,
          block: props.block,
          iconOnly: !hasLabel,
          className: props.className
        }),
        coerceClassValue(attrs.class)
      )

      const placement = resolveButtonIconPlacement(props.iconPosition)
      const slotClass = getButtonIconSlotClasses(placement, hasLabel)
      const loadingText = config.value.locale?.common?.loadingText || 'Loading...'
      const loadingNode = props.loading
        ? h('span', { class: slotClass || undefined }, [
            h('span', { class: 'sr-only' }, loadingText),
            h(
              'span',
              { 'aria-hidden': 'true' },
              slots['loading-icon']
                ? slots['loading-icon']()
                : createLoadingSpinner(resolvedSize.value)
            )
          ])
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
          class: buttonClasses,
          style: mergedStyle.value,
          'aria-busy': attrs['aria-busy'] ?? (props.loading ? 'true' : undefined),
          'aria-disabled':
            attrs['aria-disabled'] ?? (props.disabled || props.loading ? 'true' : undefined),
          disabled: props.disabled || props.loading ? true : undefined,
          type: buttonType,
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
