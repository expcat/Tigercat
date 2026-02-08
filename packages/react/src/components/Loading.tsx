import React, { useEffect, useState, useMemo } from 'react'
import {
  classNames,
  getLoadingBarClasses,
  getLoadingBarsWrapperClasses,
  getLoadingClasses,
  getLoadingDotClasses,
  getLoadingDotsWrapperClasses,
  getLoadingTextClasses,
  getSpinnerSVG,
  loadingContainerBaseClasses,
  loadingFullscreenBaseClasses,
  loadingColorClasses,
  injectLoadingAnimationStyles,
  type LoadingProps as CoreLoadingProps
} from '@expcat/tigercat-core'

export interface LoadingProps
  extends CoreLoadingProps, Omit<React.HTMLAttributes<HTMLDivElement>, keyof CoreLoadingProps> {}

export const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  text,
  fullscreen = false,
  delay = 0,
  background = 'rgba(255, 255, 255, 0.9)',
  customColor,
  className,
  style,
  ...props
}) => {
  useEffect(() => {
    injectLoadingAnimationStyles()
  }, [])

  const [visible, setVisible] = useState(delay <= 0)

  useEffect(() => {
    if (delay <= 0) {
      setVisible(true)
      return
    }
    setVisible(false)
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const containerClasses = useMemo(
    () =>
      classNames(
        fullscreen ? loadingFullscreenBaseClasses : loadingContainerBaseClasses,
        className
      ),
    [fullscreen, className]
  )

  const mergedStyle = useMemo<React.CSSProperties>(
    () => ({
      ...(customColor ? { color: customColor } : null),
      ...(fullscreen ? { backgroundColor: background } : null),
      ...style
    }),
    [customColor, fullscreen, background, style]
  )

  const renderSpinner = () => {
    const svg = getSpinnerSVG(variant)
    const spinnerClasses = getLoadingClasses(variant, size, color, customColor)

    return (
      <svg
        className={spinnerClasses}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox={svg.viewBox}>
        {svg.elements.map((el, index) => {
          if (el.type === 'circle') {
            return <circle key={index} {...el.attrs} />
          } else if (el.type === 'path') {
            return <path key={index} {...el.attrs} />
          }
          return null
        })}
      </svg>
    )
  }

  const renderDots = () => {
    const colorClass = customColor ? '' : loadingColorClasses[color]
    const steps = [0, 1, 2] as const

    return (
      <div className={getLoadingDotsWrapperClasses(size)}>
        {steps.map((i) => (
          <div key={i} className={getLoadingDotClasses(size, i, colorClass)} />
        ))}
      </div>
    )
  }

  const renderBars = () => {
    const colorClass = customColor ? '' : loadingColorClasses[color]
    const steps = [0, 1, 2] as const

    return (
      <div className={getLoadingBarsWrapperClasses(size)}>
        {steps.map((i) => (
          <div key={i} className={getLoadingBarClasses(size, i, colorClass)} />
        ))}
      </div>
    )
  }

  const renderIndicator = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'bars':
        return renderBars()
      case 'spinner':
      case 'ring':
      case 'pulse':
      default:
        return renderSpinner()
    }
  }

  if (!visible) {
    return null
  }

  return (
    <div
      className={containerClasses}
      style={mergedStyle}
      role="status"
      aria-label={text || 'Loading'}
      aria-live="polite"
      aria-busy={true}
      {...props}>
      {renderIndicator()}
      {text && <div className={getLoadingTextClasses(size, color, customColor)}>{text}</div>}
    </div>
  )
}
