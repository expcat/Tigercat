import React, { Fragment, forwardRef, isValidElement } from 'react'
import {
  formatKbdSeparatorText,
  getKbdParts,
  getKbdRootClasses,
  kbdKeyClasses,
  kbdSeparatorClasses,
  type KbdProps as CoreKbdProps
} from '@expcat/tigercat-core'

export interface KbdProps
  extends
    Omit<CoreKbdProps, 'style'>,
    Omit<React.ComponentPropsWithoutRef<'kbd'>, keyof CoreKbdProps> {
  children?: React.ReactNode
  style?: React.CSSProperties
}

function hasRenderableChildren(children: React.ReactNode): boolean {
  if (children == null || typeof children === 'boolean') return false
  if (typeof children === 'string') return children.length > 0
  if (typeof children === 'number') return true
  if (Array.isArray(children)) return children.some(hasRenderableChildren)
  if (isValidElement(children) && children.type === Fragment) {
    return hasRenderableChildren((children.props as { children?: React.ReactNode }).children)
  }
  return true
}

export const Kbd = forwardRef<HTMLElement, KbdProps>(
  (
    { keys, separator, size = 'md', variant = 'default', className, style, children, ...rest },
    ref
  ) => {
    const parts = getKbdParts(keys, separator)
    const hasChildren = hasRenderableChildren(children)
    const isEmpty = !hasChildren && parts.length === 0

    return (
      <kbd
        ref={ref}
        data-kbd=""
        data-kbd-size={size}
        data-kbd-variant={variant}
        className={getKbdRootClasses({ size, variant, className })}
        style={style}
        {...rest}
        aria-hidden={isEmpty ? true : rest['aria-hidden']}>
        {parts.map((part, index) =>
          part.type === 'separator' ? (
            <span key={`sep-${index}`} className={kbdSeparatorClasses} data-kbd-separator="">
              {` ${part.value} `}
            </span>
          ) : (
            <kbd key={`key-${index}`} className={kbdKeyClasses} data-kbd-key="">
              {part.value}
            </kbd>
          )
        )}
        {hasChildren && parts.length > 0 ? (
          <span className={kbdSeparatorClasses} data-kbd-separator="">
            {formatKbdSeparatorText(separator)}
          </span>
        ) : null}
        {hasChildren ? children : null}
      </kbd>
    )
  }
)
Kbd.displayName = 'Kbd'

export default Kbd
