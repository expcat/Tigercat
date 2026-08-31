import React from 'react'
import {
  getMenuCollapsedInitial,
  getMenuPlainText,
  menuCollapsedIconClasses,
  menuItemIconClasses,
  resolveMenuIconKind,
  type MenuKey
} from '@expcat/tigercat-core'
import { Icon } from '../Icon'

export function renderMenuIcon(icon: unknown, collapsed: boolean): React.ReactNode {
  const kind = resolveMenuIconKind(icon)
  if (kind === 'none') return null
  const iconClasses = collapsed ? menuCollapsedIconClasses : menuItemIconClasses
  if (kind === 'name') {
    return (
      <span className={iconClasses}>
        <Icon name={icon as string} />
      </span>
    )
  }
  return <span className={iconClasses}>{icon as React.ReactNode}</span>
}

export function renderCollapsedLabel(text: string | null, icon: unknown): React.ReactNode {
  if (resolveMenuIconKind(icon) !== 'none') {
    return text ? <span className="sr-only">{text}</span> : null
  }
  const initial = getMenuCollapsedInitial(text)
  return (
    <>
      {initial ? (
        <span className="flex-1 text-center" aria-hidden="true">
          {initial}
        </span>
      ) : null}
      {text ? <span className="sr-only">{text}</span> : null}
    </>
  )
}

export function getReactMenuPlainText(children: React.ReactNode): string | null {
  return getMenuPlainText(
    React.Children.toArray(children).map((child) => {
      if (typeof child === 'string' || typeof child === 'number') return child
      return child
    })
  )
}

export function collectReactMenuKeys(children: React.ReactNode): MenuKey[] {
  const keys: MenuKey[] = []
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    const props = child.props as { itemKey?: MenuKey; children?: React.ReactNode }
    if (props.itemKey != null) keys.push(props.itemKey)
    if (props.children) keys.push(...collectReactMenuKeys(props.children))
  })
  return keys
}

const MENU_CHILD_NAMES = new Set([
  'MenuItem',
  'SubMenu',
  'MenuItemGroup',
  'TigerMenuItem',
  'TigerSubMenu',
  'TigerMenuItemGroup'
])

export function isMenuChildElement(
  child: React.ReactElement
): child is React.ReactElement<{ level?: number; collapsed?: boolean }> {
  if (typeof child.type !== 'function' && typeof child.type !== 'object') return false
  const type = child.type as { displayName?: string; name?: string }
  return MENU_CHILD_NAMES.has(type.displayName ?? type.name ?? '')
}

export function mapMenuChildren(
  children: React.ReactNode,
  next: { level?: number; collapsed?: boolean }
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child
    if (!isMenuChildElement(child)) return child
    return React.cloneElement(child, next)
  })
}
