import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import {
  classNames,
  calculateAffixState,
  resolveScrollRoot,
  createAffixObserver,
  type AffixProps as CoreAffixProps,
  type AffixState
} from '@expcat/tigercat-core'

export interface AffixProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>, CoreAffixProps {
  children?: React.ReactNode
  /** Callback when affixed state changes */
  onChange?: (affixed: boolean) => void
}

export const Affix: React.FC<AffixProps> = ({
  offsetTop = 0,
  offsetBottom,
  target,
  zIndex = 10,
  className,
  style,
  children,
  onChange,
  ...props
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const originalRectRef = useRef<{
    top: number
    left: number
    width: number
    height: number
  } | null>(null)
  const [state, setState] = useState<AffixState>({ affixed: false, style: {} })
  const stateRef = useRef(state)
  stateRef.current = state
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const recalcStyle = useCallback(
    (affixed: boolean) => {
      const el = wrapperRef.current
      if (!el) return

      if (!stateRef.current.affixed) {
        const rect = el.getBoundingClientRect()
        originalRectRef.current = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        }
      }
      if (!originalRectRef.current) return

      const resolved = resolveScrollRoot(target)
      const containerRect = resolved.getRect()

      if (!affixed) {
        if (stateRef.current.affixed) {
          setState({ affixed: false, style: {} })
          onChangeRef.current?.(false)
        }
        return
      }

      const forcedTop =
        offsetBottom !== undefined
          ? containerRect.bottom - originalRectRef.current.height + offsetBottom + 1
          : -1
      const next = calculateAffixState(
        {
          top: forcedTop,
          left: originalRectRef.current.left,
          width: originalRectRef.current.width,
          height: originalRectRef.current.height
        },
        containerRect,
        offsetBottom !== undefined ? undefined : offsetTop,
        offsetBottom,
        zIndex
      )
      if (!next.affixed) {
        if (stateRef.current.affixed) {
          setState({ affixed: false, style: {} })
          onChangeRef.current?.(false)
        }
        return
      }
      const wasAffixed = stateRef.current.affixed
      setState(next)
      if (!wasAffixed) onChangeRef.current?.(true)
    },
    [offsetTop, offsetBottom, target, zIndex]
  )

  useEffect(() => {
    if (!sentinelRef.current) return undefined
    const resolved = resolveScrollRoot(target)
    const root = resolved.isWindow ? null : (resolved.target as Element | null)
    const stop = createAffixObserver(sentinelRef.current, {
      offsetTop,
      offsetBottom,
      root,
      onToggle: (affixed) => recalcStyle(affixed)
    })

    let resizeObs: ResizeObserver | null = null
    const onResize = () => {
      if (stateRef.current.affixed) recalcStyle(true)
    }
    if (typeof ResizeObserver !== 'undefined' && wrapperRef.current) {
      resizeObs = new ResizeObserver(() => onResize())
      resizeObs.observe(wrapperRef.current)
    }
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      stop()
      resizeObs?.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [offsetTop, offsetBottom, target, recalcStyle])

  const wrapperClasses = useMemo(() => classNames(className), [className])
  const wrapperStyle = useMemo(
    () => (state.affixed ? { ...(state.style as React.CSSProperties), ...style } : style),
    [state.affixed, state.style, style]
  )

  const sentinel = (
    <div
      ref={sentinelRef}
      aria-hidden="true"
      style={{ display: 'block', width: 0, height: 0, pointerEvents: 'none' }}
    />
  )

  const content = (
    <div ref={wrapperRef} className={wrapperClasses} style={wrapperStyle} {...props}>
      {children}
    </div>
  )

  const placeholder = state.affixed ? (
    <div
      style={{
        width: originalRectRef.current?.width ?? 0,
        height: originalRectRef.current?.height ?? 0
      }}
    />
  ) : null

  // offsetTop: sentinel before content (original top). offsetBottom: after
  // the wrapper, or after the placeholder when affixed (content bottom).
  if (offsetBottom !== undefined) {
    return (
      <div>
        {placeholder}
        {content}
        {sentinel}
      </div>
    )
  }

  return (
    <div>
      {sentinel}
      {placeholder}
      {content}
    </div>
  )
}
