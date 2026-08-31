import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  classNames,
  createBackTopVisibilityController,
  getBackTopLabels,
  getBackTopOffsetStyle,
  getBackTopPositionClasses,
  getBackTopVisibilityClasses,
  getScrollRootEventTarget,
  mergeTigerLocale,
  resolveScrollRoot,
  scrollToTop,
  backTopIconPath,
  type BackTopProps as CoreBackTopProps,
  type TigerLocale,
  type TigerLocaleBackTop
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface BackTopProps
  extends CoreBackTopProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  children?: React.ReactNode
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleBackTop>
}

const DefaultIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    className="h-5 w-5"
    aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d={backTopIconPath} />
  </svg>
)

export const BackTop = forwardRef<HTMLButtonElement, BackTopProps>(function BackTop(
  {
    visibilityHeight = 400,
    target,
    duration,
    position = 'auto',
    placement = 'bottom-right',
    offset,
    onClick,
    children,
    className,
    style,
    locale,
    labels,
    'aria-label': ariaLabel,
    ...props
  },
  ref
) {
  const [visible, setVisible] = useState(false)
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labelSet = getBackTopLabels(mergedLocale, labels)

  const resolved = resolveScrollRoot(target)
  const resolvedKey = resolved.isWindow ? 'window' : resolved.target
  const visibilityHeightRef = useRef(visibilityHeight)
  visibilityHeightRef.current = visibilityHeight
  const controllerRef = useRef<ReturnType<typeof createBackTopVisibilityController> | undefined>(
    undefined
  )

  useEffect(() => {
    const root = resolveScrollRoot(target)
    const eventTarget = getScrollRootEventTarget(root)
    const scrollNode = root.target
    if (!eventTarget || !scrollNode) return undefined

    const visibilityController = createBackTopVisibilityController({
      target: scrollNode as HTMLElement | Window,
      getVisibilityHeight: () => visibilityHeightRef.current,
      onChange: setVisible
    })
    controllerRef.current = visibilityController
    eventTarget.addEventListener('scroll', visibilityController.schedule, { passive: true })
    visibilityController.update()

    return () => {
      eventTarget.removeEventListener('scroll', visibilityController.schedule)
      visibilityController.cancel()
      controllerRef.current = undefined
    }
  }, [resolvedKey, target])

  useEffect(() => {
    controllerRef.current?.update()
  }, [visibilityHeight])

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const root = resolveScrollRoot(target)
      if (root.target) scrollToTop(root.target as HTMLElement | Window, duration)
      onClick?.(event)
    },
    [target, duration, onClick]
  )

  const buttonClasses = useMemo(
    () =>
      classNames(
        getBackTopPositionClasses({ position, placement }),
        getBackTopVisibilityClasses(visible),
        className
      ),
    [position, placement, visible, className]
  )

  const buttonStyle = useMemo(() => {
    const offsetStyle = getBackTopOffsetStyle(position, placement, offset)
    return offsetStyle ? { ...offsetStyle, ...style } : style
  }, [position, placement, offset, style])

  const resolvedAriaLabel =
    typeof ariaLabel === 'string' && ariaLabel.trim()
      ? ariaLabel
      : children
        ? undefined
        : labelSet.ariaLabel

  return (
    <button
      {...props}
      ref={ref}
      type="button"
      className={buttonClasses}
      style={buttonStyle}
      aria-label={resolvedAriaLabel}
      aria-hidden={visible ? undefined : true}
      tabIndex={visible ? 0 : -1}
      onClick={handleClick}>
      {children || <DefaultIcon />}
    </button>
  )
})

BackTop.displayName = 'BackTop'

export default BackTop
