import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import {
  classNames,
  calculateAffixState,
  resolveAffixTarget,
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

      const resolved = resolveAffixTarget(target)
      const containerRect = resolved.getRect()

      if (!affixed) {
        if (stateRef.current.affixed) {
          setState({ affixed: false, style: {} })
          onChangeRef.current?.(false)
        }
        return
      }

      const next = calculateAffixState(
        {
          top: -1,
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
    const resolved = resolveAffixTarget(target)
    const root = resolved.element === window ? null : (resolved.element as Element)
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

  const sentinel = (
    <div
      ref={sentinelRef}
      aria-hidden="true"
      style={{ display: 'block', width: 0, height: 0, pointerEvents: 'none' }}
    />
  )

  if (state.affixed) {
    return (
      <div>
        {sentinel}
        <div
          style={{
            width: originalRectRef.current?.width ?? 0,
            height: originalRectRef.current?.height ?? 0
          }}
        />
        <div
          ref={wrapperRef}
          className={wrapperClasses}
          style={state.style as React.CSSProperties}
          {...props}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div>
      {sentinel}
      <div ref={wrapperRef} className={wrapperClasses} {...props}>
        {children}
      </div>
    </div>
  )
}
