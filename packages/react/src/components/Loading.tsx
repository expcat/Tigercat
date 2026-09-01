import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  classNames,
  getLoadingIndicator,
  getLoadingLabel,
  getLoadingTextClasses,
  mergeTigerLocale,
  DEFAULT_LOADING_BACKGROUND,
  loadingContainerBaseClasses,
  loadingFullscreenBaseClasses,
  loadingRegionBaseClasses,
  loadingRegionOverlayClasses,
  type LoadingIndicatorNode,
  type LoadingProps as CoreLoadingProps
} from '@expcat/tigercat-core'
import { renderBodyPortal, useBackgroundInert, useBodyScrollLock } from '../utils/overlay'
import { useTigerConfig } from './ConfigProvider'

export interface LoadingProps
  extends CoreLoadingProps, Omit<React.HTMLAttributes<HTMLDivElement>, keyof CoreLoadingProps> {
  children?: React.ReactNode
}

function renderIndicator(node: LoadingIndicatorNode): React.ReactNode {
  if (node.kind === 'items') {
    return (
      <div className={node.className} aria-hidden="true">
        {node.items.map((item, index) => (
          <div key={index} className={item.className} />
        ))}
      </div>
    )
  }

  return (
    <svg
      className={node.className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox={node.viewBox}
      aria-hidden="true"
      focusable="false">
      {node.elements.map((el, index) => React.createElement(el.type, { key: index, ...el.attrs }))}
    </svg>
  )
}

export const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  text,
  spinning = true,
  fullscreen = false,
  delay = 0,
  background = DEFAULT_LOADING_BACKGROUND,
  customColor,
  lockScroll = true,
  className,
  style,
  locale,
  children,
  ...props
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const [visible, setVisible] = useState(delay <= 0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const hasRegion = children != null && children !== false
  const showIndicator = visible && spinning
  const showFullscreen = fullscreen && showIndicator && !hasRegion

  useBodyScrollLock({ enabled: showFullscreen && lockScroll })
  useBackgroundInert({ enabled: showFullscreen, containerRef })

  useEffect(() => {
    if (delay <= 0) {
      setVisible(true)
      return
    }
    setVisible(false)
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const indicator = useMemo(
    () => getLoadingIndicator({ variant, size, color, customColor }),
    [variant, size, color, customColor]
  )

  const inlineStyle = useMemo<React.CSSProperties>(
    () => ({
      ...(customColor ? { color: customColor } : null),
      ...(fullscreen ? { backgroundColor: background } : null),
      ...style
    }),
    [customColor, fullscreen, background, style]
  )

  const overlayStyle = useMemo<React.CSSProperties>(
    () => ({
      ...(customColor ? { color: customColor } : null),
      backgroundColor: background,
      ...style
    }),
    [customColor, background, style]
  )

  const label = getLoadingLabel(mergedLocale, text)
  const indicatorNode = renderIndicator(indicator)
  const textNode = text ? (
    <div className={getLoadingTextClasses(size, color, customColor)}>{text}</div>
  ) : null
  const decorative =
    props['aria-hidden'] === true ||
    props['aria-hidden'] === 'true' ||
    props.role === 'presentation'
  const statusProps = decorative
    ? { role: 'presentation' as const, 'aria-hidden': true as const }
    : { role: 'status' as const, 'aria-label': label, 'aria-busy': true as const }

  if (hasRegion) {
    return (
      <div className={classNames(loadingRegionBaseClasses, className)}>
        <div inert={showIndicator || undefined}>{children}</div>
        {showIndicator ? (
          <div
            {...props}
            ref={containerRef}
            className={loadingRegionOverlayClasses}
            style={overlayStyle}
            {...statusProps}>
            {indicatorNode}
            {textNode}
          </div>
        ) : null}
      </div>
    )
  }

  if (!showIndicator) {
    return null
  }

  const loadingNode = (
    <div
      {...props}
      ref={containerRef}
      className={classNames(
        fullscreen ? loadingFullscreenBaseClasses : loadingContainerBaseClasses,
        className
      )}
      style={inlineStyle}
      {...statusProps}>
      {indicatorNode}
      {textNode}
    </div>
  )

  if (fullscreen) {
    return renderBodyPortal(loadingNode)
  }

  return loadingNode
}
