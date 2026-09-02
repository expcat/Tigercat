import React, { forwardRef, useMemo } from 'react'
import {
  DROPDOWN_CHEVRON_PATH,
  getDropdownChevronClasses,
  getSplitButtonPrimaryClasses,
  getSplitButtonRootClasses,
  getSplitButtonTriggerClasses,
  resolveLocaleText,
  splitButtonDropdownClasses,
  resolveSplitButtonSize,
  resolveSplitButtonTriggerAriaLabel,
  resolveSplitButtonVariant,
  type FloatingPlacement,
  type SplitButtonProps as CoreSplitButtonProps
} from '@expcat/tigercat-core'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'
import { Dropdown, DropdownItem, DropdownMenu } from './Dropdown'

export interface SplitButtonProps
  extends
    Omit<CoreSplitButtonProps, 'style'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick' | 'style'> {
  style?: React.CSSProperties
  icon?: React.ReactNode
  loadingIcon?: React.ReactNode
  trigger?: React.ReactNode
  menu?: React.ReactNode
  placement?: FloatingPlacement
  offset?: number
  onClick?: React.MouseEventHandler<HTMLButtonElement>
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

function Chevron({ open, size }: { open: boolean; size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) {
  return (
    <svg
      className={getDropdownChevronClasses(open, { tone: 'current', size })}
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

export const SplitButton = forwardRef<HTMLButtonElement, SplitButtonProps>(function SplitButton(
  {
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
    primaryAriaLabel,
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
  },
  forwardedRef
) {
  const { locale } = useTigerConfig()
  const resolvedVariant = resolveSplitButtonVariant(variant)
  const resolvedSize = resolveSplitButtonSize(size)
  const triggerLabel = resolveSplitButtonTriggerAriaLabel(
    triggerAriaLabel,
    resolveLocaleText('More options', locale?.common?.moreOptionsText)
  )
  const partitioned = useMemo(() => partitionChildren(children), [children])
  const menuNode = menu != null ? wrapMenu(menu) : partitioned.menu
  const hasMenu = menuNode != null

  const rootClasses = getSplitButtonRootClasses({ block, className })
  const primaryClasses = getSplitButtonPrimaryClasses({ block })
  const triggerClasses = getSplitButtonTriggerClasses({ size: resolvedSize })

  return (
    <div className={rootClasses} style={style} role="group" data-split-button="" {...rest}>
      <Button
        ref={forwardedRef}
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
        aria-label={primaryAriaLabel}
        data-split-button-primary=""
        onClick={onClick}>
        {partitioned.primary}
      </Button>
      {hasMenu ? (
        <Dropdown
          className={splitButtonDropdownClasses}
          trigger="click"
          showArrow={false}
          asChild
          disabled={disabled}
          open={open}
          defaultOpen={defaultOpen}
          closeOnClick={closeOnClick}
          portal={portal}
          placement={placement}
          offset={offset}
          onOpenChange={(next) => {
            if (loading) return
            onOpenChange?.(next)
          }}
          renderTrigger={({ open: menuOpen }) => (
            <Button
              variant={resolvedVariant}
              size={resolvedSize}
              disabled={disabled}
              danger={danger}
              htmlType="button"
              className={triggerClasses}
              aria-label={triggerLabel}
              aria-disabled={loading || undefined}
              data-split-button-trigger=""
              onClick={(event) => {
                if (loading) event.preventDefault()
              }}>
              {trigger ?? <Chevron open={menuOpen} size={resolvedSize} />}
            </Button>
          )}>
          {menuNode}
        </Dropdown>
      ) : null}
    </div>
  )
})

SplitButton.displayName = 'SplitButton'

export default SplitButton
