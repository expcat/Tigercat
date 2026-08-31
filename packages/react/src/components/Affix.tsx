import React, { forwardRef, useLayoutEffect, useRef, useState, useMemo } from 'react'
import {
  classNames,
  createAffixController,
  getAffixSentinelStyle,
  resolveScrollRoot,
  type AffixProps as CoreAffixProps,
  type AffixState,
  AFFIX_UNPINNED_STATE
} from '@expcat/tigercat-core'

export interface AffixProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>, CoreAffixProps {
  children?: React.ReactNode
  onChange?: (affixed: boolean) => void
}

export const Affix = forwardRef<HTMLDivElement, AffixProps>(function Affix(
  {
    offsetTop = 0,
    offsetBottom,
    target,
    zIndex = 10,
    className,
    style,
    children,
    onChange,
    ...props
  },
  ref
) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<AffixState>({ ...AFFIX_UNPINNED_STATE })
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const targetRef = useRef(target)
  targetRef.current = target
  const offsetTopRef = useRef(offsetTop)
  offsetTopRef.current = offsetTop
  const offsetBottomRef = useRef(offsetBottom)
  offsetBottomRef.current = offsetBottom
  const zIndexRef = useRef(zIndex)
  zIndexRef.current = zIndex

  const controllerRef = useRef<ReturnType<typeof createAffixController> | null>(null)
  if (controllerRef.current === null) {
    controllerRef.current = createAffixController({
      getSentinel: () => sentinelRef.current,
      getPlaceholder: () => placeholderRef.current,
      getContent: () => wrapperRef.current,
      getTarget: () => targetRef.current,
      getOffsetTop: () => offsetTopRef.current,
      getOffsetBottom: () => offsetBottomRef.current,
      getZIndex: () => zIndexRef.current,
      onState: setState,
      onChange: (affixed) => onChangeRef.current?.(affixed)
    })
  }

  const resolved = resolveScrollRoot(target)
  const resolvedKey = resolved.isWindow ? 'window' : resolved.target

  useLayoutEffect(() => {
    controllerRef.current?.bind()
    return () => {
      controllerRef.current?.unbind()
    }
  }, [resolvedKey, offsetTop, offsetBottom])

  useLayoutEffect(() => {
    controllerRef.current?.updateStyle()
  }, [zIndex])

  useLayoutEffect(() => {
    controllerRef.current?.observeFlow()
  })

  const setContentRef = (node: HTMLDivElement | null) => {
    wrapperRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const wrapperClasses = useMemo(() => classNames(className), [className])
  const wrapperStyle = useMemo(
    () =>
      (state.affixed ? { ...style, ...(state.style as React.CSSProperties) } : style) as
        React.CSSProperties | undefined,
    [state.affixed, state.style, style]
  )

  const sentinel = <div ref={sentinelRef} aria-hidden="true" style={getAffixSentinelStyle()} />

  const content = (
    <div ref={setContentRef} className={wrapperClasses} style={wrapperStyle} {...props}>
      {children}
    </div>
  )

  const placeholder = state.affixed ? (
    <div
      ref={placeholderRef}
      aria-hidden="true"
      style={{
        width: state.placeholder.width,
        height: state.placeholder.height
      }}
    />
  ) : null

  if (offsetBottom !== undefined) {
    return (
      <div style={{ display: 'contents' }}>
        {placeholder}
        {content}
        {sentinel}
      </div>
    )
  }

  return (
    <div style={{ display: 'contents' }}>
      {sentinel}
      {placeholder}
      {content}
    </div>
  )
})

Affix.displayName = 'Affix'
