import { defineComponent, h, PropType, type VNode } from 'vue'
import {
  DROPDOWN_CHEVRON_PATH,
  composeComponentClasses,
  getDropdownChevronClasses,
  getSplitButtonPrimaryClasses,
  getSplitButtonRootClasses,
  getSplitButtonTriggerClasses,
  mergeStyleValues,
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
import { ButtonGroup } from './ButtonGroup'
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
  placement?: FloatingPlacement
  offset?: number
  className?: string
  style?: Record<string, unknown>
}

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

function createChevron(open: boolean) {
  return h(
    'svg',
    {
      class: getDropdownChevronClasses(open),
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
    /**
     * Visual variant applied to the primary action and the menu trigger
     * @default 'primary'
     */
    variant: {
      type: String as PropType<ButtonVariant>,
      default: 'primary'
    },
    /**
     * Size applied to the primary action and the menu trigger
     * @default 'md'
     */
    size: {
      type: String as PropType<ButtonSize>,
      default: 'md'
    },
    /**
     * Whether both the primary action and the menu trigger are disabled
     */
    disabled: Boolean,
    /**
     * Whether the primary action is in a loading state. Also disables the menu trigger.
     */
    loading: Boolean,
    /**
     * Whether to apply danger/destructive styling to both buttons
     */
    danger: Boolean,
    /**
     * Whether the split control should take the full width of its parent
     */
    block: Boolean,
    /**
     * HTML button type for the primary action
     * @default 'button'
     */
    htmlType: {
      type: String as PropType<ButtonHtmlType>,
      default: 'button'
    },
    /**
     * Position of the icon relative to the primary action text
     * @default 'left'
     */
    iconPosition: {
      type: String as PropType<ButtonIconPosition>,
      default: 'left'
    },
    /**
     * Whether the menu is open (controlled mode)
     */
    open: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    },
    /**
     * Default open state (uncontrolled mode)
     * @default false
     */
    defaultOpen: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to close the menu when a menu item is clicked
     * @default true
     */
    closeOnClick: {
      type: Boolean,
      default: true
    },
    /**
     * Render the menu into document.body (Teleport)
     * @default true
     */
    portal: {
      type: Boolean,
      default: true
    },
    /**
     * Accessible name for the chevron menu trigger
     * @default 'More options'
     */
    triggerAriaLabel: {
      type: String,
      default: undefined
    },
    /**
     * Dropdown placement relative to the chevron trigger
     * @default 'bottom-end'
     */
    placement: {
      type: String as PropType<FloatingPlacement>,
      default: 'bottom-end' as FloatingPlacement
    },
    /**
     * Offset distance from the chevron trigger
     * @default 4
     */
    offset: {
      type: Number,
      default: 4
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },
    /**
     * Inline styles
     */
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: ['click', 'update:open', 'open-change'],
  setup(props, { slots, emit, attrs }) {
    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const {
        class: _class,
        style: _style,
        ...restAttrs
      } = attrsRecord as {
        class?: unknown
        style?: unknown
      } & Record<string, unknown>

      const variant = resolveSplitButtonVariant(props.variant)
      const size = resolveSplitButtonSize(props.size)
      const isDisabled = props.disabled || props.loading
      const triggerLabel = resolveSplitButtonTriggerAriaLabel(props.triggerAriaLabel)

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
          htmlType: props.htmlType,
          iconPosition: props.iconPosition,
          className: getSplitButtonPrimaryClasses({ block: props.block }),
          'data-split-button-primary': '',
          onClick: (event: MouseEvent) => emit('click', event)
        },
        {
          default: () => partitioned.primary,
          icon: slots.icon,
          'loading-icon': slots['loading-icon']
        }
      )

      const dropdown = h(
        Dropdown,
        {
          trigger: 'click' as const,
          showArrow: false,
          disabled: isDisabled,
          open: props.open,
          defaultOpen: props.defaultOpen,
          closeOnClick: props.closeOnClick,
          portal: props.portal,
          placement: props.placement,
          offset: props.offset,
          'onUpdate:open': (visible: boolean) => emit('update:open', visible),
          onOpenChange: (visible: boolean) => emit('open-change', visible)
        },
        {
          trigger: ({ open }: { open: boolean }) =>
            h(
              Button,
              {
                variant,
                size,
                disabled: isDisabled,
                danger: props.danger,
                htmlType: 'button',
                className: getSplitButtonTriggerClasses({ size }),
                'aria-label': triggerLabel,
                'aria-haspopup': 'menu',
                'aria-expanded': open,
                'data-split-button-trigger': ''
              },
              {
                default: () => slots.trigger?.({ open }) ?? createChevron(open)
              }
            ),
          default: () => menuNode
        }
      )

      return h(
        ButtonGroup,
        {
          ...restAttrs,
          size,
          className: composeComponentClasses(
            getSplitButtonRootClasses({
              block: props.block,
              className: props.className
            }),
            attrsRecord.class
          ),
          style: mergeStyleValues(attrsRecord.style, props.style),
          'data-split-button': ''
        },
        { default: () => [primaryButton, dropdown] }
      )
    }
  }
})

export default SplitButton
