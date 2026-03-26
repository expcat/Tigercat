import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import {
  classNames,
  calculateAffixState,
  resolveAffixTarget,
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
  const placeholderRef = useRef<HTMLDivElement>(null)
  const originalRectRef = useRef<{
    top: number
    left: number
    width: number
    height: number
  } | null>(null)
  const [state, setState] = useState<AffixState>({ affixed: false, style: {} })
  const prevAffixed = useRef(false)

  const update = useCallback(() => {
    const el =
      prevAffixed.current && placeholderRef.current ? placeholderRef.current : wrapperRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    if (!originalRectRef.current || !prevAffixed.current) {
      originalRectRef.current = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      }
    }

    const resolved = resolveAffixTarget(target)
    const containerRect = resolved.getRect()

    const newState = calculateAffixState(
      originalRectRef.current,
      containerRect,
      offsetBottom !== undefined ? undefined : offsetTop,
      offsetBottom,
      zIndex
    )

    if (newState.affixed !== prevAffixed.current) {
      prevAffixed.current = newState.affixed
      onChange?.(newState.affixed)
    }
    setState(newState)
  }, [offsetTop, offsetBottom, target, zIndex, onChange])

  useEffect(() => {
    const resolved = resolveAffixTarget(target)
    const scrollEl = resolved.element
    scrollEl.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    update()
    return () => {
      scrollEl.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [target, update])

  const wrapperClasses = useMemo(() => classNames(className), [className])

  if (state.affixed) {
    return (
      <div ref={placeholderRef}>
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
    <div ref={wrapperRef} className={wrapperClasses} {...props}>
      {children}
    </div>
  )
}
