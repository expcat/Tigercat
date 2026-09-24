import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  captureRegionFocus,
  classNames,
  createLoadingDelayGate,
  getLoadingIndicator,
  getLoadingLabel,
  getLoadingTextClasses,
  mergeTigerLocale,
  restoreRegionFocus,
  DEFAULT_LOADING_BACKGROUND,
  loadingContainerBaseClasses,
  loadingFullscreenBaseClasses,
  loadingRegionBaseClasses,
  loadingRegionOverlayClasses,
  type LoadingIndicatorNode,
  type LoadingProps as CoreLoadingProps
} from '@expcat/tigercat-core'
import { useFocusTrap } from '../utils/overlay'
import { OverlayPortal } from '../utils/overlay-outlet'
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
  const gate = useRef(createLoadingDelayGate()).current
  const [visible, setVisible] = useState(() => gate.isShown())
  const regionRef = useRef<HTMLDivElement | null>(null)
  const layerRef = useRef<HTMLDivElement | null>(null)
  const rememberedFocus = useRef<HTMLElement | null>(null)
  const hasRegion = children != null && children !== false
  const showIndicator = visible
  const showFullscreen = Boolean(fullscreen && showIndicator)

  useEffect(() => gate.subscribe(() => setVisible(gate.isShown())), [gate])
  useEffect(() => {
    gate.sync(Boolean(spinning), delay)
  }, [gate, spinning, delay])
  useEffect(() => () => gate.dispose(), [gate])

  const wasRegionMasked = useRef(false)
  if (showIndicator && !showFullscreen && hasRegion && !wasRegionMasked.current) {
    rememberedFocus.current = captureRegionFocus(regionRef.current)
  }
  wasRegionMasked.current = Boolean(showIndicator && !showFullscreen && hasRegion)
  useLayoutEffect(() => {
    if (wasRegionMasked.current || !hasRegion || showFullscreen) return
    const remembered = rememberedFocus.current
    rememberedFocus.current = null
    restoreRegionFocus(regionRef.current, remembered)
  }, [hasRegion, showFullscreen, showIndicator])

  useFocusTrap({
    enabled: showFullscreen,
    containerRef: layerRef,
    inert: true,
    autoFocus: true,
    initialFocusRef: layerRef,
    lockScroll
  })

  const indicator = useMemo(
    () => getLoadingIndicator({ variant, size, color, customColor }),
    [variant, size, color, customColor]
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
    : {
        role: 'status' as const,
        'aria-label': label,
        ...(hasRegion ? {} : { 'aria-busy': true as const })
      }

  const fullscreenNode = showFullscreen ? (
    <OverlayPortal>
      <div
        {...props}
        ref={layerRef}
        tabIndex={-1}
        className={classNames(loadingFullscreenBaseClasses, className)}
        style={{
          ...(customColor ? { color: customColor } : null),
          backgroundColor: background,
          ...style
        }}
        {...statusProps}
        data-tiger-overlay-layer="">
        {indicatorNode}
        {textNode}
      </div>
    </OverlayPortal>
  ) : null

  if (hasRegion) {
    return (
      <div
        ref={regionRef}
        className={classNames(loadingRegionBaseClasses, !showFullscreen && className)}
        aria-busy={showIndicator || undefined}>
        <div inert={showIndicator && !showFullscreen ? true : undefined}>{children}</div>
        {showIndicator && !showFullscreen ? (
          <div
            {...props}
            className={loadingRegionOverlayClasses}
            style={{
              ...(customColor ? { color: customColor } : null),
              backgroundColor: background,
              ...style
            }}
            {...statusProps}>
            {indicatorNode}
            {textNode}
          </div>
        ) : null}
        {fullscreenNode}
      </div>
    )
  }

  if (showFullscreen) return fullscreenNode
  if (!showIndicator) return null

  return (
    <div
      {...props}
      className={classNames(loadingContainerBaseClasses, className)}
      style={{ ...(customColor ? { color: customColor } : null), ...style }}
      {...statusProps}>
      {indicatorNode}
      {textNode}
    </div>
  )
}
