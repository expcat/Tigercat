import React, { useState, useRef, useEffect, useMemo, useContext, useCallback } from 'react'
import {
  classNames,
  imageBaseClasses,
  getImageImgClasses,
  imageErrorClasses,
  imageLoadingClasses,
  imagePreviewCursorClass,
  imageErrorIconPath,
  toCSSSize,
  type ImageProps as CoreImageProps
} from '@expcat/tigercat-core'
import { ImageGroupContext } from './ImageGroup'
import { ImagePreview } from './ImagePreview'

export interface ImageProps
  extends
    Omit<CoreImageProps, 'className'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'width' | 'height'> {
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
  onPreviewVisibleChange?: (visible: boolean) => void
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

export const Image: React.FC<ImageProps> = ({
  src,
  alt = '',
  width,
  height,
  fit = 'cover',
  fallbackSrc,
  preview = true,
  lazy = false,
  className,
  errorRender,
  placeholderRender,
  onPreviewVisibleChange,
  onClick,
  onKeyDown,
  style,
  ...props
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [actualSrc, setActualSrc] = useState(lazy ? '' : src)
  const [previewVisible, setPreviewVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const group = useContext(ImageGroupContext)
  const registeredIndexRef = useRef(-1)

  // Register/unregister with group
  useEffect(() => {
    if (group && src) {
      registeredIndexRef.current = group.register(src)
      return () => {
        group.unregister(src)
      }
    }
  }, [group, src])

  // Lazy loading
  useEffect(() => {
    if (!lazy || !containerRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setActualSrc(src)
          observer.disconnect()
        }
      },
      { threshold: 0.01 }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [lazy, src])

  // Update actualSrc when src changes (non-lazy)
  useEffect(() => {
    if (!lazy) {
      setActualSrc(src)
      setError(false)
      setLoading(true)
    }
  }, [src, lazy])

  const handleLoad = useCallback(() => {
    setLoading(false)
    setError(false)
  }, [])

  const handleError = useCallback(() => {
    setLoading(false)
    setError(true)
    if (fallbackSrc && actualSrc !== fallbackSrc) {
      setActualSrc(fallbackSrc)
      setError(false)
      setLoading(true)
    }
  }, [fallbackSrc, actualSrc])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e)
      if (!preview) return
      if (group) {
        group.openPreview(registeredIndexRef.current >= 0 ? registeredIndexRef.current : 0)
      } else {
        setPreviewVisible(true)
        onPreviewVisibleChange?.(true)
      }
    },
    [preview, group, onClick, onPreviewVisibleChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e)
      if (preview && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        handleClick(e as unknown as React.MouseEvent<HTMLDivElement>)
      }
    },
    [preview, handleClick, onKeyDown]
  )

  const containerClasses = useMemo(
    () => classNames(imageBaseClasses, preview && imagePreviewCursorClass, className),
    [preview, className]
  )

  const imgClasses = useMemo(() => getImageImgClasses(fit!), [fit])

  const containerStyle = useMemo(() => {
    const s: React.CSSProperties = { ...style }
    const w = toCSSSize(width)
    const h = toCSSSize(height)
    if (w) s.width = w
    if (h) s.height = h
    return s
  }, [width, height, style])

  let content: React.ReactNode
  if (error && !fallbackSrc) {
    content = errorRender || (
      <div className={imageErrorClasses}>
        <SvgIcon d={imageErrorIconPath} />
      </div>
    )
  } else if (loading && !actualSrc) {
    content = placeholderRender || (
      <div className={imageLoadingClasses}>
        <SvgIcon d={imageErrorIconPath} />
      </div>
    )
  } else {
    content = (
      <img
        src={actualSrc}
        alt={alt}
        className={imgClasses}
        onLoad={handleLoad}
        onError={handleError}
      />
    )
  }

  return (
    <>
      <div
        {...props}
        ref={containerRef}
        className={containerClasses}
        style={containerStyle}
        role={preview ? 'button' : undefined}
        tabIndex={preview ? 0 : undefined}
        aria-label={preview ? `Preview ${alt || 'image'}` : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}>
        {content}
      </div>
      {!group && previewVisible && src && (
        <ImagePreview
          visible={previewVisible}
          images={[src]}
          currentIndex={0}
          onVisibleChange={(val) => {
            setPreviewVisible(val)
            onPreviewVisibleChange?.(val)
          }}
        />
      )}
    </>
  )
}
