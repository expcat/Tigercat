import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  classNames,
  getScrollTop,
  scrollToTop,
  backTopButtonClasses,
  backTopHiddenClasses,
  backTopVisibleClasses,
  backTopIconPath,
  type BackTopProps as CoreBackTopProps
} from '@expcat/tigercat-core'

export interface BackTopProps
  extends CoreBackTopProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /**
   * Target element to listen for scroll events
   * @default () => window
   */
  target?: () => HTMLElement | Window
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

export const BackTop: React.FC<BackTopProps> = ({
  visibilityHeight = 400,
  target = () => window,
  duration = 450,
  onClick,
  children,
  className,
  'aria-label': ariaLabel = 'Back to top',
  ...props
}) => {
  const [visible, setVisible] = useState(false)

  const handleScroll = useCallback(() => {
    const targetElement = target()
    const scrollTop = getScrollTop(targetElement)
    setVisible(scrollTop >= visibilityHeight)
  }, [target, visibilityHeight])

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const targetElement = target()
      scrollToTop(targetElement, duration)
      onClick?.(event)
    },
    [target, duration, onClick]
  )

  useEffect(() => {
    const targetElement = target()
    targetElement.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      targetElement.removeEventListener('scroll', handleScroll)
    }
  }, [target, handleScroll])

  const buttonClasses = useMemo(
    () =>
      classNames(
        backTopButtonClasses,
        visible ? backTopVisibleClasses : backTopHiddenClasses,
        className
      ),
    [visible, className]
  )

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
