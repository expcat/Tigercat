import React, { useEffect, useRef, useState } from 'react'
import {
  createTypeaheadHighlight,
  getDropdownSeparatorClasses,
  getMenuItems,
  getPopupMenuItemClasses,
  getPopupMenuShortcutClasses,
  POPUP_MENU_SUBMENU_SURFACE_CLASSES,
  markTypeaheadMatch,
  getNavLabels,
  nextPopupMenuCheck,
  popupMenuAccessibleName,
  popupMenuItemCloses,
  popupMenuItemHref,
  popupMenuItemRole,
  resolvePopupMenuItemType,
  type PopupMenuCheckChange,
  type PopupMenuItem
} from '@expcat/tigercat-core'

import { useTigerConfig } from './tiger-config'

export interface PopupMenuListProps {
  items: readonly PopupMenuItem[]
  onCheck?: (change: PopupMenuCheckChange) => void
  onSelect?: (item: PopupMenuItem) => void
  onClose?: () => void
}

export function PopupMenuList({ items, onCheck, onSelect, onClose }: PopupMenuListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const typeaheadRef = useRef(createTypeaheadHighlight())

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const nodes = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[data-tiger-popup-item]') ?? []
    )
    const labels = nodes.map((node) => node.textContent ?? '')
    const current = event.target instanceof HTMLElement ? event.target : null
    const from = current ? Math.max(0, nodes.indexOf(current)) : 0
    const hit = typeaheadRef.current.push(
      event.key,
      labels,
      from,
      nodes.map((node) => node.matches(':disabled, [aria-disabled="true"]'))
    )
    if (hit && hit.index >= 0) {
      event.preventDefault()
      event.stopPropagation()
      markTypeaheadMatch(nodes, hit.index)
      nodes[hit.index]?.focus()
      return
    }

    if (event.key !== ' ' && event.key !== 'Enter') return
    const key = current?.getAttribute('data-tiger-popup-key')
    if (key == null) return
    const item = items.find((entry) => String(entry.key) === key)
    if (!item) return
    const type = resolvePopupMenuItemType(item)
    if (type !== 'checkbox' && type !== 'radio') return
    const change = nextPopupMenuCheck(items, item.key)
    if (!change) return
    event.preventDefault()
    event.stopPropagation()
    onCheck?.(change)
  }

  return (
    <div ref={listRef} role="none" onKeyDown={handleKeyDown}>
      {items.map((item) => (
        <PopupMenuNode
          key={item.key}
          item={item}
          items={items}
          onCheck={onCheck}
          onSelect={onSelect}
          onClose={onClose}
        />
      ))}
    </div>
  )
}

function PopupMenuNode({
  item,
  items,
  onCheck,
  onSelect,
  onClose
}: {
  item: PopupMenuItem
  items: readonly PopupMenuItem[]
  onCheck?: (change: PopupMenuCheckChange) => void
  onSelect?: (item: PopupMenuItem) => void
  onClose?: () => void
}) {
  const config = useTigerConfig()
  const navLabels = getNavLabels(config.locale)
  const type = resolvePopupMenuItemType(item)
  const [submenuOpen, setSubmenuOpen] = useState(false)
  const submenuRef = useRef<HTMLDivElement>(null)
  const focusSubmenuOnOpenRef = useRef(false)

  useEffect(() => {
    if (!submenuOpen || !focusSubmenuOnOpenRef.current) return
    focusSubmenuOnOpenRef.current = false
    const menu = submenuRef.current
    if (!menu) return
    getMenuItems(menu)[0]?.focus()
  }, [submenuOpen])

  if (type === 'separator') {
    return <div role="separator" className={getDropdownSeparatorClasses()} />
  }

  if (type === 'submenu') {
    const expanded = submenuOpen && !item.disabled
    const openKey =
      (config.direction ?? config.locale?.direction) === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
    const openSubmenu = (focusChild: boolean) => {
      if (item.disabled) return
      if (!focusChild) {
        setSubmenuOpen(true)
        return
      }
      focusSubmenuOnOpenRef.current = true
      if (submenuOpen && submenuRef.current) {
        getMenuItems(submenuRef.current)[0]?.focus()
        focusSubmenuOnOpenRef.current = false
        return
      }
      setSubmenuOpen(true)
    }
    return (
      <div
        className="relative"
        onMouseEnter={() => {
          if (!item.disabled) setSubmenuOpen(true)
        }}
        onMouseLeave={() => setSubmenuOpen(false)}>
        <button
          type="button"
          role="menuitem"
          aria-haspopup="menu"
          aria-expanded={expanded}
          data-tiger-popup-item=""
          data-tiger-popup-key={String(item.key)}
          disabled={item.disabled}
          className={getPopupMenuItemClasses(Boolean(item.disabled), false)}
          onClick={() => openSubmenu(false)}
          onKeyDown={(event) => {
            if (event.key !== openKey) return
            event.preventDefault()
            event.stopPropagation()
            openSubmenu(true)
          }}>
          <span className="flex-1">{item.label}</span>
          {item.shortcut ? (
            <span className={getPopupMenuShortcutClasses()}>{item.shortcut}</span>
          ) : null}
        </button>
        {expanded && item.children && item.children.length > 0 ? (
          <div
            ref={submenuRef}
            role="menu"
            data-tiger-popup-submenu=""
            className={`absolute top-0 start-full z-10 min-w-40 ${POPUP_MENU_SUBMENU_SURFACE_CLASSES} p-1`}>
            <PopupMenuList
              items={item.children}
              onCheck={onCheck}
              onSelect={onSelect}
              onClose={onClose}
            />
          </div>
        ) : null}
      </div>
    )
  }

  const href = popupMenuItemHref(item)
  const danger = type === 'danger'
  const role = popupMenuItemRole(type)
  const shortcut = item.shortcut
  const activate = (event: React.MouseEvent<HTMLElement>) => {
    if (item.disabled) {
      event.preventDefault()
      return
    }
    if (type === 'checkbox' || type === 'radio') {
      event.preventDefault()
      const change = nextPopupMenuCheck(items, item.key)
      if (change) onCheck?.(change)
      return
    }
    onSelect?.(item)
    if (popupMenuItemCloses(type)) onClose?.()
  }
  const className = getPopupMenuItemClasses(Boolean(item.disabled), danger)
  const body = (
    <>
      <span className="flex-1">{item.label}</span>
      {shortcut ? <span className={getPopupMenuShortcutClasses()}>{shortcut}</span> : null}
      {danger ? <span className="sr-only">{`, ${navLabels.dangerItem}`}</span> : null}
    </>
  )
  const shared = {
    role,
    'aria-disabled': item.disabled || undefined,
    'aria-checked': type === 'checkbox' || type === 'radio' ? Boolean(item.checked) : undefined,
    'aria-label': danger ? popupMenuAccessibleName(item, navLabels.dangerItem) : undefined,
    'data-tiger-popup-item': '' as const,
    'data-tiger-popup-key': String(item.key),
    className,
    onClick: activate
  }

  if (href) {
    return (
      <a href={href} {...shared}>
        {body}
      </a>
    )
  }

  return (
    <button type="button" disabled={item.disabled} {...shared}>
      {body}
    </button>
  )
}
