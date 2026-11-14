import React, { useId } from 'react'
import {
  classNames,
  getMenuItemIndent,
  menuItemGroupTitleClasses,
  shouldIndentMenuItem
} from '@expcat/tigercat-core'
import { useMenuContext } from './context'
import { mapMenuChildren } from './render'
import type { MenuItemGroupProps } from './types'

export const MenuItemGroup: React.FC<MenuItemGroupProps> = ({
  title,
  className,
  children,
  level = 0,
  collapsed,
  style,
  ...rest
}) => {
  const menuContext = useMenuContext()
  const titleId = useId()
  const hidden = Boolean(collapsed ?? menuContext?.collapsed)
  const usesMenuRole = Boolean(menuContext)
  const indentStyle =
    menuContext && shouldIndentMenuItem(menuContext.mode, level)
      ? getMenuItemIndent(level, menuContext.inlineIndent)
      : undefined

  return (
    <li role={usesMenuRole ? 'none' : undefined}>
      {title ? (
        <div
          id={titleId}
          role={usesMenuRole ? 'presentation' : undefined}
          className={classNames(menuItemGroupTitleClasses, hidden && 'sr-only')}
          style={indentStyle}>
          {title}
        </div>
      ) : null}
      <ul
        {...rest}
        style={style}
        role={usesMenuRole ? 'group' : undefined}
        className={className}
        aria-labelledby={title ? titleId : undefined}>
        {mapMenuChildren(children, { level, collapsed })}
      </ul>
    </li>
  )
}

MenuItemGroup.displayName = 'MenuItemGroup'
