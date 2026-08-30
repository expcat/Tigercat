import React, { forwardRef, useCallback, useLayoutEffect, useState } from 'react'
import {
  getMarqueeCloneAttributes,
  getMarqueeContentClasses,
  getMarqueeContentStyle,
  getMarqueeRootClasses,
  getMarqueeTrackClasses,
  getMarqueeTrackStyle,
  injectMarqueeStyles,
  isMarqueeFocusInside,
  isMarqueePaused,
  resolveMarqueeDirection,
  resolveMarqueePauseOnFocus,
  resolveMarqueePauseOnHover,
  resolveMarqueeRegion,
  resolveMarqueeRepeat,
  type MarqueeProps as CoreMarqueeProps
} from '@expcat/tigercat-core'

export interface MarqueeProps
  extends
    Omit<CoreMarqueeProps, 'style'>,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CoreMarqueeProps> {
  children?: React.ReactNode
  style?: React.CSSProperties
}

export const Marquee = forwardRef<HTMLDivElement, MarqueeProps>(
  (
    {
      direction,
      duration,
      pauseOnHover,
      pauseOnFocus,
      paused: pausedProp,
      gap,
      repeat,
      ariaLabel,
      className,
      style,
      children,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    useLayoutEffect(() => {
      injectMarqueeStyles()
    }, [])

    const [hovered, setHovered] = useState(false)
    const [focused, setFocused] = useState(false)
    const resolvedDirection = resolveMarqueeDirection(direction)
    const resolvedPauseOnHover = resolveMarqueePauseOnHover(pauseOnHover)
    const resolvedPauseOnFocus = resolveMarqueePauseOnFocus(pauseOnFocus)
    const copies = resolveMarqueeRepeat(repeat)
    const paused = isMarqueePaused({
      paused: pausedProp,
      pauseOnHover: resolvedPauseOnHover,
      pauseOnFocus: resolvedPauseOnFocus,
      hovered,
      focused
    })
    const { 'aria-label': ariaLabelAttr, 'aria-labelledby': ariaLabelledByAttr, ...domProps } = rest
    const region = resolveMarqueeRegion({
      ariaLabel: typeof ariaLabelAttr === 'string' ? ariaLabelAttr : ariaLabel,
      labelledBy: typeof ariaLabelledByAttr === 'string' ? ariaLabelledByAttr : undefined
    })

    const handleMouseEnter = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (resolvedPauseOnHover) setHovered(true)
        onMouseEnter?.(event)
      },
      [onMouseEnter, resolvedPauseOnHover]
    )

    const handleMouseLeave = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (resolvedPauseOnHover) setHovered(false)
        onMouseLeave?.(event)
      },
      [onMouseLeave, resolvedPauseOnHover]
    )

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLDivElement>) => {
        if (resolvedPauseOnFocus) setFocused(true)
        onFocus?.(event)
      },
      [onFocus, resolvedPauseOnFocus]
    )

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLDivElement>) => {
        if (
          resolvedPauseOnFocus &&
          !isMarqueeFocusInside(event.currentTarget, event.relatedTarget)
        ) {
          setFocused(false)
        }
        onBlur?.(event)
      },
      [onBlur, resolvedPauseOnFocus]
    )

    return (
      <div
        {...domProps}
        ref={ref}
        role={region.role}
        aria-label={region.ariaLabel}
        aria-labelledby={typeof ariaLabelledByAttr === 'string' ? ariaLabelledByAttr : undefined}
        data-marquee=""
        data-marquee-direction={resolvedDirection}
        data-marquee-paused={paused ? 'true' : 'false'}
        data-marquee-pause-on-hover={resolvedPauseOnHover ? 'true' : 'false'}
        data-marquee-pause-on-focus={resolvedPauseOnFocus ? 'true' : 'false'}
        className={getMarqueeRootClasses({
          direction: resolvedDirection,
          pauseOnHover: resolvedPauseOnHover,
          pauseOnFocus: resolvedPauseOnFocus,
          paused: pausedProp,
          repeat: copies,
          className
        })}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}>
        <div
          data-marquee-track=""
          className={getMarqueeTrackClasses(resolvedDirection)}
          style={getMarqueeTrackStyle({ duration, gap, repeat: copies })}>
          {Array.from({ length: copies }, (_, index) => {
            const clone = index > 0
            return (
              <div
                key={clone ? `clone-${index}` : 'content'}
                className={getMarqueeContentClasses({
                  direction: resolvedDirection,
                  clone
                })}
                data-marquee-content=""
                style={getMarqueeContentStyle({ clone, index })}
                {...(clone ? getMarqueeCloneAttributes() : {})}>
                {children}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
Marquee.displayName = 'Marquee'

export default Marquee
