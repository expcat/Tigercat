import { defineComponent, h, PropType, type VNode } from 'vue'
import {
  DROPDOWN_CHEVRON_PATH,
  composeComponentClasses,
  getDropdownChevronClasses,
  getSplitButtonPrimaryClasses,
  getSplitButtonRootClasses,
  getSplitButtonTriggerClasses,
  mergeStyleValues,
  splitButtonDropdownClasses,
  resolveLocaleText,
  resolveSplitButtonSize,
  resolveSplitButtonTriggerAriaLabel,
  resolveSplitButtonVariant,
  type ButtonHtmlType,
  type ButtonIconPosition,
  type ButtonSize,
  type ButtonVariant,
  type FloatingPlacement
} from '@expcat/tigercat-core'
import { flattenSlotVNodes } from '../utils/flatten-vnodes'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'
import { Dropdown, DropdownItem, DropdownMenu } from './Dropdown'

export interface VueSplitButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  danger?: boolean
  block?: boolean
  htmlType?: ButtonHtmlType
  iconPosition?: ButtonIconPosition
  open?: boolean
  defaultOpen?: boolean
  closeOnClick?: boolean
  portal?: boolean
  triggerAriaLabel?: string
  primaryAriaLabel?: string
  placement?: FloatingPlacement
  offset?: number
  className?: string
  style?: Record<string, unknown>
}

export type SplitButtonProps = VueSplitButtonProps

function wrapMenu(nodes: VNode[] | undefined): VNode | null {
  const flattened = flattenSlotVNodes(nodes)
  if (flattened.length === 0) return null
  const existing = flattened.find((node) => node.type === DropdownMenu)
  if (existing) return existing
  return h(DropdownMenu, null, { default: () => flattened })
}

function partitionDefaultSlot(nodes: VNode[] | undefined): {
  primary: VNode[]
  menu: VNode | null
} {
  const primary: VNode[] = []
  const menuItems: VNode[] = []
  let menu: VNode | null = null

  for (const node of flattenSlotVNodes(nodes)) {
    if (node.type === DropdownMenu) {
      menu = node
      continue
    }
    if (node.type === DropdownItem) {
      menuItems.push(node)
      continue
    }
    primary.push(node)
  }

  if (!menu && menuItems.length > 0) {
    menu = h(DropdownMenu, null, { default: () => menuItems })
  }

  return { primary, menu }
}

function createChevron(open: boolean, size: ButtonSize) {
  return h(
    'svg',
    {
      class: getDropdownChevronClasses(open, { tone: 'current', size }),
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': 'true',
      focusable: 'false'
    },
    [h('path', { d: DROPDOWN_CHEVRON_PATH })]
  )
}

export const SplitButton = defineComponent({
  name: 'TigerSplitButton',
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<ButtonVariant>,
      default: 'primary'
    },
    size: {
      type: String as PropType<ButtonSize>,
      default: 'md'
    },
    disabled: Boolean,
    loading: Boolean,
    danger: Boolean,
    block: Boolean,
    htmlType: {
      type: String as PropType<ButtonHtmlType>,
      default: undefined
    },
    iconPosition: {
      type: String as PropType<ButtonIconPosition>,
      default: 'left'
    },
    open: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    },
    defaultOpen: {
      type: Boolean,
      default: false
    },
    closeOnClick: {
      type: Boolean,
      default: true
    },
    portal: {
      type: Boolean,
      default: true
    },
    triggerAriaLabel: {
      type: String,
      default: undefined
    },
    primaryAriaLabel: {
      type: String,
      default: undefined
    },
    placement: {
      type: String as PropType<FloatingPlacement>,
      default: 'bottom-end' as FloatingPlacement
    },
    offset: {
      type: Number,
      default: 4
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
  emits: ['click', 'update:open', 'open-change'],
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const {
        class: _class,
        style: _style,
        type: attrType,
        ...restAttrs
      } = attrsRecord as {
        class?: unknown
        style?: unknown
        type?: unknown
      } & Record<string, unknown>

      const variant = resolveSplitButtonVariant(props.variant)
      const size = resolveSplitButtonSize(props.size)
      const triggerLabel = resolveSplitButtonTriggerAriaLabel(
        props.triggerAriaLabel,
        resolveLocaleText('More options', config.value.locale?.common?.moreOptionsText)
      )
      const htmlType = props.htmlType ?? (attrType as ButtonHtmlType | undefined) ?? 'button'

      const partitioned = partitionDefaultSlot(slots.default?.())
      const menuNode = wrapMenu(slots.menu?.()) ?? partitioned.menu

      const primaryButton = h(
        Button,
        {
          variant,
          size,
          disabled: props.disabled,
          loading: props.loading,
          danger: props.danger,
          htmlType,
          iconPosition: props.iconPosition,
          className: getSplitButtonPrimaryClasses({ block: props.block }),
          'aria-label': props.primaryAriaLabel,
          'data-split-button-primary': '',
          onClick: (event: MouseEvent) => emit('click', event)
        },
        {
          default: () => partitioned.primary,
          icon: slots.icon,
          'loading-icon': slots['loading-icon']
        }
      )

      const dropdown = menuNode
        ? h(
            Dropdown,
            {
              className: splitButtonDropdownClasses,
              trigger: 'click' as const,
              showArrow: false,
              asChild: true,
              disabled: props.disabled,
              open: props.open,
              defaultOpen: props.defaultOpen,
              closeOnClick: props.closeOnClick,
              portal: props.portal,
              placement: props.placement,
              offset: props.offset,
              'onUpdate:open': (visible: boolean) => {
                if (props.loading) return
                emit('update:open', visible)
              },
              onOpenChange: (visible: boolean) => {
                if (props.loading) return
                emit('open-change', visible)
              }
            },
            {
              trigger: ({ open }: { open: boolean }) =>
                h(
                  Button,
                  {
                    variant,
                    size,
                    disabled: props.disabled,
                    danger: props.danger,
                    htmlType: 'button',
                    className: getSplitButtonTriggerClasses({ size }),
                    'aria-label': triggerLabel,
                    'aria-disabled': props.loading || undefined,
                    'data-split-button-trigger': '',
                    onClick: (event: MouseEvent) => {
                      if (props.loading) event.preventDefault()
                    }
                  },
                  {
                    default: () => slots.trigger?.({ open }) ?? createChevron(open, size)
                  }
                ),
              default: () => menuNode
            }
          )
        : null

      return h(
        'div',
        {
          ...restAttrs,
          class: composeComponentClasses(
            getSplitButtonRootClasses({
              block: props.block,
              className: props.className
            }),
            attrsRecord.class
          ),
          style: mergeStyleValues(attrsRecord.style, props.style),
          role: 'group',
          'data-split-button': ''
        },
        [primaryButton, dropdown]
      )
    }
  }
})

export default SplitButton
