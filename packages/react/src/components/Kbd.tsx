import React, { forwardRef } from 'react'
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
  if (typeof children === 'string' && children.length === 0) return false
  return true
}

export const Kbd = forwardRef<HTMLElement, KbdProps>(
  (
    { keys, separator, size = 'md', variant = 'default', className, style, children, ...rest },
    ref
  ) => {
    const parts = getKbdParts(keys, separator)
    const hasChildren = hasRenderableChildren(children)

    return (
      <kbd
        ref={ref}
        data-kbd=""
        data-kbd-size={size}
        data-kbd-variant={variant}
        className={getKbdRootClasses({ size, variant, className })}
        style={style}
        {...rest}>
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
