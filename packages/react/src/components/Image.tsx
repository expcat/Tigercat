import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useMemo,
  useContext,
  useCallback,
  useId
} from 'react'
import {
  applyImageLoadError,
  applyImageLoadSuccess,
  classNames,
  createImageLoadState,
  formatImagePreviewAriaLabel,
  getImageImgClasses,
  getImageLabels,
  imageBaseClasses,
  imageFrameClasses,
  imageErrorClasses,
  imageErrorIconPath,
  imageLoadingClasses,
  imageLoadingOverlayClasses,
  imageLoadingSpinnerClasses,
  imageLoadingSpinnerPath,
  imagePreviewCursorClass,
  imagePreviewHostClasses,
  isImageHoverPreviewEnabled,
  resetImageLoadState,
  resolveImageHoverPlacement,
  resolveImagePreviewEnabled,
  resolveImagePreviewSrc,
  toCSSSize,
  type ImageProps as CoreImageProps
} from '@expcat/tigercat-core'
import { usePopup } from '../utils/use-popup'
import { renderOverlayPortal } from '../utils/overlay'
import { ImageGroupContext } from './ImageGroup'
import { ImagePreview } from './ImagePreview'
import { useTigerConfig } from './ConfigProvider'

export interface ImageProps
  extends
    Omit<CoreImageProps, 'className'>,
    Omit<
      React.HTMLAttributes<HTMLElement>,
      'width' | 'height' | 'onLoad' | 'onError' | 'crossOrigin'
    > {
  /**
   * Custom error placeholder
   */
  errorRender?: React.ReactNode
  /**
   * Custom loading placeholder
   */
  placeholderRender?: React.ReactNode
  /**
   * Callback when preview visibility changes
   */
  onPreviewOpenChange?: (open: boolean) => void
  onLoad?: React.ReactEventHandler<HTMLImageElement>
  onError?: React.ReactEventHandler<HTMLImageElement>
}

const SvgIcon: React.FC<{ d: string; className?: string }> = ({ d, className = 'w-8 h-8' }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={d} />
  </svg>
)

const LoadingSpinner: React.FC = () => (
  <svg
    className={imageLoadingSpinnerClasses}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden>
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path className="opacity-75" fill="currentColor" d={imageLoadingSpinnerPath} />
  </svg>
)

export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src,
    alt = '',
    width,
    height,
    fit = 'cover',
    fallbackSrc,
    preview = true,
    previewTrigger = 'click',
    lazy = false,
    srcSet,
    sizes,
    crossOrigin,
    decoding,
    referrerPolicy,
    fetchPriority,
    className,
    errorRender,
    placeholderRender,
    onPreviewOpenChange,
    onClick,
    onKeyDown,
    onLoad,
    onError,
    onFocus,
    onBlur,
    style,
    ...props
  },
  forwardedRef
) {
  const config = useTigerConfig()
  const labels = useMemo(() => getImageLabels(config.locale), [config.locale])
  const [loadState, setLoadState] = useState(() => createImageLoadState(src, lazy))
  const [previewVisible, setPreviewVisible] = useState(false)
  const containerRef = useRef<HTMLElement | null>(null)
  const inViewRef = useRef(!lazy)
  const group = useContext(ImageGroupContext)
  const instanceId = useId()

  const previewEnabled = resolveImagePreviewEnabled(preview, group?.preview)
  const hoverPreviewEnabled = isImageHoverPreviewEnabled(
    previewEnabled,
    previewTrigger,
    Boolean(group)
  )
  const clickPreviewEnabled = previewEnabled
  const hoverPlacement = resolveImageHoverPlacement(config.direction)

  const {
    currentVisible: hoverVisible,
    triggerRef: hoverTriggerRef,
    floatingRef: hoverFloatingRef,
    floatingStyles: hoverFloatingStyles,
    floatingClasses: hoverFloatingClasses,
    positioned: hoverPositioned,
    overlayTarget: hoverOverlayTarget,
    setVisible: setHoverVisible,
    triggerHandlers: hoverTriggerHandlers
  } = usePopup({
    trigger: 'hover',
    placement: hoverPlacement,
    offset: 12,
    disabled: !hoverPreviewEnabled
  })

  const setRootRef = useCallback(
    (el: HTMLElement | null) => {
      containerRef.current = el
      hoverTriggerRef.current = el as HTMLDivElement | null
    },
    [hoverTriggerRef]
  )

  useEffect(() => {
    if (!group) return
    if (!src) {
      group.unregister(instanceId)
      return
    }
    group.register({ id: instanceId, src, alt })
    return () => {
      group.unregister(instanceId)
    }
  }, [group, instanceId, src, alt])

  useEffect(() => {
    if (!lazy) {
      inViewRef.current = true
      setLoadState(resetImageLoadState(src, false, true))
      return
    }

    setLoadState(resetImageLoadState(src, true, inViewRef.current))
    if (inViewRef.current) return

    const root = containerRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        inViewRef.current = true
        setLoadState(resetImageLoadState(src, true, true))
        observer.disconnect()
      },
      { threshold: 0.01 }
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [lazy, src])

  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      setLoadState((current) => applyImageLoadSuccess(current))
      onLoad?.(event)
    },
    [onLoad]
  )

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      setLoadState((current) => applyImageLoadError(current, fallbackSrc))
      onError?.(event)
    },
    [fallbackSrc, onError]
  )

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event)
      if (event.defaultPrevented || !clickPreviewEnabled) return
      if (group) {
        group.openPreview(instanceId)
        return
      }
      setPreviewVisible(true)
      onPreviewOpenChange?.(true)
    },
    [clickPreviewEnabled, group, instanceId, onClick, onPreviewOpenChange]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event)
    },
    [onKeyDown]
  )

  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      onFocus?.(event)
      if (hoverPreviewEnabled) setHoverVisible(true)
    },
    [hoverPreviewEnabled, onFocus, setHoverVisible]
  )

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      onBlur?.(event)
      if (hoverPreviewEnabled) setHoverVisible(false)
    },
    [hoverPreviewEnabled, onBlur, setHoverVisible]
  )

  const containerClasses = useMemo(
    () =>
      classNames(
        previewEnabled ? imagePreviewHostClasses : imageBaseClasses,
        previewEnabled && imagePreviewCursorClass,
        className
      ),
    [previewEnabled, className]
  )

  const imgClasses = useMemo(() => getImageImgClasses(fit), [fit])

  const containerStyle = useMemo(() => {
    const next: React.CSSProperties = { ...style }
    const w = toCSSSize(width)
    const h = toCSSSize(height)
    if (w) next.width = w
    if (h) next.height = h
    return next
  }, [width, height, style])

  const previewSrc = resolveImagePreviewSrc(loadState, src)
  const previewName = formatImagePreviewAriaLabel(
    labels.previewAriaLabel,
    alt,
    labels.previewFallbackAlt
  )
  const loadingPlaceholder = placeholderRender ?? (
    <div className={loadState.actualSrc ? imageLoadingOverlayClasses : imageLoadingClasses}>
      <LoadingSpinner />
    </div>
  )
  const errorPlaceholder = errorRender ?? (
    <div className={imageErrorClasses}>
      <SvgIcon d={imageErrorIconPath} />
    </div>
  )

  let content: React.ReactNode
  if (loadState.error) {
    content = errorPlaceholder
  } else if (!loadState.actualSrc) {
    content = loadingPlaceholder
  } else {
    content = (
      <>
        <img
          ref={forwardedRef}
          src={loadState.actualSrc}
          alt={previewEnabled ? '' : alt}
          className={imgClasses}
          srcSet={srcSet}
          sizes={sizes}
          crossOrigin={crossOrigin}
          decoding={decoding}
          referrerPolicy={referrerPolicy}
          fetchPriority={fetchPriority}
          onLoad={handleLoad}
          onError={handleError}
        />
        {loadState.loading ? loadingPlaceholder : null}
      </>
    )
  }

  const hostTag = previewEnabled ? 'button' : 'div'

  return (
    <>
      {React.createElement(
        hostTag,
        {
          ...props,
          ref: setRootRef,
          className: containerClasses,
          style: containerStyle,
          type: previewEnabled ? 'button' : undefined,
          'aria-label': previewEnabled ? previewName : undefined,
          onClick: handleClick,
          onKeyDown: handleKeyDown,
          onFocus: handleFocus,
          onBlur: handleBlur,
          ...(hoverPreviewEnabled ? hoverTriggerHandlers : {})
        },
        previewEnabled
          ? React.createElement('span', { className: imageFrameClasses }, content)
          : content
      )}
      {!group && previewVisible && previewSrc && (
        <ImagePreview
          open={previewVisible}
          images={[{ src: previewSrc, alt }]}
          currentIndex={0}
          onOpenChange={(val) => {
            setPreviewVisible(val)
            onPreviewOpenChange?.(val)
          }}
        />
      )}
      {hoverPreviewEnabled &&
        hoverVisible &&
        previewSrc &&
        renderOverlayPortal(
          <div
            ref={hoverFloatingRef}
            style={hoverFloatingStyles}
            className={classNames(
              hoverFloatingClasses,
              'rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] p-1 shadow-lg'
            )}
            data-positioned={hoverPositioned}
            aria-hidden>
            <img
              src={previewSrc}
              alt=""
              className="block max-w-[16rem] max-h-[16rem] object-contain"
            />
          </div>,
          hoverOverlayTarget
        )}
    </>
  )
})
