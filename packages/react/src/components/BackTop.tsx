import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  classNames,
  createBackTopVisibilityController,
  scrollToTop,
  backTopButtonClasses,
  backTopContainerClasses,
  backTopHiddenClasses,
  backTopVisibleClasses,
  backTopIconPath,
  isBrowser,
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
  onClick,
  children,
  className,
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
      !targetElement || targetElement === window ? backTopButtonClasses : backTopContainerClasses
    return classNames(
      positionClasses,
      visible ? backTopVisibleClasses : backTopHiddenClasses,
      className
    )
  }, [targetElement, visible, className])

  return (
    <button
      type="button"
      className={buttonClasses}
      aria-label={ariaLabel}
      onClick={handleClick}
      {...props}>
      {children || <DefaultIcon />}
    </button>
  )
}

export default BackTop
