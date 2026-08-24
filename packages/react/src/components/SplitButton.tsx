import React, { useMemo } from 'react'
import {
  DROPDOWN_CHEVRON_PATH,
  getDropdownChevronClasses,
  getSplitButtonPrimaryClasses,
  getSplitButtonRootClasses,
  getSplitButtonTriggerClasses,
  resolveSplitButtonSize,
  resolveSplitButtonTriggerAriaLabel,
  resolveSplitButtonVariant,
  type FloatingPlacement,
  type SplitButtonProps as CoreSplitButtonProps
} from '@expcat/tigercat-core'
import { Button } from './Button'
import { ButtonGroup } from './ButtonGroup'
import { Dropdown, DropdownItem, DropdownMenu } from './Dropdown'

export interface SplitButtonProps
  extends
    Omit<CoreSplitButtonProps, 'style'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick' | 'style'> {
  style?: React.CSSProperties
  icon?: React.ReactNode
  loadingIcon?: React.ReactNode
  /**
   * Custom chevron trigger content. Defaults to a rotating chevron.
   */
  trigger?: React.ReactNode
  /**
   * Menu content. Takes precedence over a `DropdownMenu` found in `children`.
   */
  menu?: React.ReactNode
  /**
   * Dropdown placement relative to the chevron trigger
   * @default 'bottom-end'
   */
  placement?: FloatingPlacement
  /**
   * Offset distance from the chevron trigger
   * @default 4
   */
  offset?: number
  /**
   * Primary action click handler. Does not open the menu.
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  /**
   * Called when the dropdown open state changes
   */
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

function wrapMenu(nodes: React.ReactNode): React.ReactNode {
  if (nodes == null || typeof nodes === 'boolean') return null
  if (React.isValidElement(nodes) && nodes.type === DropdownMenu) return nodes

  const array = React.Children.toArray(nodes)
  if (array.length === 0) return null

  const existing = array.find((child) => React.isValidElement(child) && child.type === DropdownMenu)
  if (existing) return existing

  return <DropdownMenu>{nodes}</DropdownMenu>
}

function partitionChildren(children: React.ReactNode): {
  primary: React.ReactNode[]
  menu: React.ReactNode
} {
  const primary: React.ReactNode[] = []
  const menuItems: React.ReactElement[] = []
  let menu: React.ReactElement | null = null

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      if (child != null && typeof child !== 'boolean') primary.push(child)
      return
    }
    if (child.type === DropdownMenu) {
      menu = child
      return
    }
    if (child.type === DropdownItem) {
      menuItems.push(child)
      return
    }
    primary.push(child)
  })

  if (!menu && menuItems.length > 0) {
    menu = <DropdownMenu>{menuItems}</DropdownMenu>
  }

  return { primary, menu }
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={getDropdownChevronClasses(open)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false">
      <path d={DROPDOWN_CHEVRON_PATH} />
    </svg>
  )
}

export const SplitButton: React.FC<SplitButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  danger = false,
  block = false,
  htmlType = 'button',
  iconPosition = 'left',
  icon,
  loadingIcon,
  trigger,
  triggerAriaLabel,
  open,
  defaultOpen = false,
  closeOnClick = true,
  portal = true,
  placement = 'bottom-end',
  offset = 4,
  menu,
  onClick,
  onOpenChange,
  className,
  style,
  children,
  ...rest
}) => {
  const resolvedVariant = resolveSplitButtonVariant(variant)
  const resolvedSize = resolveSplitButtonSize(size)
  const isDisabled = disabled || loading
  const triggerLabel = resolveSplitButtonTriggerAriaLabel(triggerAriaLabel)
  const partitioned = useMemo(() => partitionChildren(children), [children])
  const menuNode = menu != null ? wrapMenu(menu) : partitioned.menu

  const rootClasses = getSplitButtonRootClasses({ block, className })
  const primaryClasses = getSplitButtonPrimaryClasses({ block })
  const triggerClasses = getSplitButtonTriggerClasses({ size: resolvedSize })

  return (
    <ButtonGroup
      size={resolvedSize}
      className={rootClasses}
      style={style}
      data-split-button=""
      {...rest}>
      <Button
        variant={resolvedVariant}
        size={resolvedSize}
        disabled={disabled}
        loading={loading}
        danger={danger}
        htmlType={htmlType}
        iconPosition={iconPosition}
        icon={icon}
        loadingIcon={loadingIcon}
        className={primaryClasses}
        data-split-button-primary=""
        onClick={onClick}>
        {partitioned.primary}
      </Button>
      <Dropdown
        trigger="click"
        showArrow={false}
        disabled={isDisabled}
        open={open}
        defaultOpen={defaultOpen}
        closeOnClick={closeOnClick}
        portal={portal}
        placement={placement}
        offset={offset}
        onOpenChange={onOpenChange}
        renderTrigger={({ open: menuOpen }) => (
          <Button
            variant={resolvedVariant}
            size={resolvedSize}
            disabled={isDisabled}
            danger={danger}
            htmlType="button"
            className={triggerClasses}
            aria-label={triggerLabel}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            data-split-button-trigger="">
            {trigger ?? <Chevron open={menuOpen} />}
          </Button>
        )}>
        {menuNode}
      </Dropdown>
    </ButtonGroup>
  )
}

export default SplitButton
