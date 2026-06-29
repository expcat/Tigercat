import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  classNames,
  createBackTopVisibilityController,
  scrollToTop,
  backTopBaseClasses,
  backTopButtonClasses,
  backTopContainerClasses,
  backTopHiddenClasses,
  backTopVisibleClasses,
  backTopIconPath,
  getViewportOffsetStyle,
  isBrowser,
  viewportFloatingBaseClasses,
  viewportPlacementClasses,
  type BackTopProps as CoreBackTopProps
} from '@expcat/tigercat-core'

export interface BackTopProps
  extends CoreBackTopProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /**
   * Target element to listen for scroll events
   * @default () => window
   */
  target?: () => HTMLElement | Window | null
  /**
   * Click event handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /**
   * Custom content for the button
   */
  children?: React.ReactNode
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

const getDefaultTarget = () => (isBrowser() ? window : null)

export const BackTop: React.FC<BackTopProps> = ({
  visibilityHeight = 400,
  target = getDefaultTarget,
  duration = 450,
  position = 'auto',
  placement = 'bottom-right',
  offset,
  onClick,
  children,
  className,
  style,
  'aria-label': ariaLabel = 'Back to top',
  ...props
}) => {
  const [visible, setVisible] = useState(false)
  const [targetElement, setTargetElement] = useState<HTMLElement | Window | null>(null)

  useEffect(() => {
    const el = target()
    setTargetElement(el)
    if (!el) return

    const visibilityController = createBackTopVisibilityController({
      target: el,
      getVisibilityHeight: () => visibilityHeight,
      onChange: setVisible
    })

    el.addEventListener('scroll', visibilityController.schedule, { passive: true })
    visibilityController.update()

    return () => {
      el.removeEventListener('scroll', visibilityController.schedule)
      visibilityController.cancel()
      setTargetElement(null)
    }
  }, [target, visibilityHeight])

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const el = target()
      if (el) scrollToTop(el, duration)
      onClick?.(event)
    },
    [target, duration, onClick]
  )

  const buttonClasses = useMemo(() => {
    const positionClasses =
      position === 'fixed'
        ? classNames(
            viewportFloatingBaseClasses,
            viewportPlacementClasses[placement],
            backTopBaseClasses
          )
        : position === 'sticky'
          ? backTopContainerClasses
          : !targetElement || targetElement === window
            ? backTopButtonClasses
            : backTopContainerClasses
    return classNames(
      positionClasses,
      visible ? backTopVisibleClasses : backTopHiddenClasses,
      className
    )
  }, [position, placement, targetElement, visible, className])

  const buttonStyle = useMemo(
    () =>
      position === 'fixed' ? { ...getViewportOffsetStyle(placement, offset), ...style } : style,
    [position, placement, offset, style]
  )

  return (
    <button
      type="button"
      className={buttonClasses}
      style={buttonStyle}
      aria-label={ariaLabel}
      onClick={handleClick}
      {...props}>
      {children || <DefaultIcon />}
    </button>
  )
}

export default BackTop
