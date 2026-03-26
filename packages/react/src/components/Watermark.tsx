import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import {
  classNames,
  watermarkDefaults,
  watermarkWrapperClasses,
  resolveWatermarkFont,
  renderWatermarkCanvas,
  getWatermarkOverlayStyle,
  type WatermarkProps as CoreWatermarkProps
} from '@expcat/tigercat-core'

export interface WatermarkProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>, CoreWatermarkProps {
  children?: React.ReactNode
}

export const Watermark: React.FC<WatermarkProps> = ({
  content,
  image,
  width = watermarkDefaults.width,
  height = watermarkDefaults.height,
  rotate = watermarkDefaults.rotate,
  zIndex = watermarkDefaults.zIndex,
  gapX = watermarkDefaults.gapX,
  gapY = watermarkDefaults.gapY,
  offsetX = watermarkDefaults.offsetX,
  offsetY = watermarkDefaults.offsetY,
  font,
  className,
  children,
  ...props
}) => {
  const [base64, setBase64] = useState<string | undefined>()
  const wrapperRef = useRef<HTMLDivElement>(null)

  const resolvedFont = useMemo(() => resolveWatermarkFont(font), [font])

  const generate = useCallback(() => {
    if (image) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const dpr = window.devicePixelRatio || 1
        canvas.width = width * dpr
        canvas.height = height * dpr
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.scale(dpr, dpr)
        ctx.translate(width / 2, height / 2)
        ctx.rotate((rotate * Math.PI) / 180)
        ctx.translate(-width / 2, -height / 2)
        ctx.drawImage(img, 0, 0, width, height)
        setBase64(canvas.toDataURL())
      }
      img.src = image
    } else {
      setBase64(
        renderWatermarkCanvas({
          content,
          width,
          height,
          rotate,
          font: resolvedFont
        })
      )
    }
  }, [content, image, width, height, rotate, resolvedFont])

  useEffect(() => {
    generate()
  }, [generate])

  // MutationObserver: re-apply if overlay is removed
  useEffect(() => {
    if (typeof MutationObserver === 'undefined' || !wrapperRef.current) return
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of Array.from(m.removedNodes)) {
          if ((node as HTMLElement).dataset?.watermark === 'true') {
            generate()
            return
          }
        }
      }
    })
    observer.observe(wrapperRef.current, { childList: true })
    return () => observer.disconnect()
  }, [generate])

  const overlayStyle = useMemo(
    () =>
      getWatermarkOverlayStyle({
        base64Url: base64,
        width,
        height,
        gapX,
        gapY,
        offsetX,
        offsetY,
        zIndex
      }),
    [base64, width, height, gapX, gapY, offsetX, offsetY, zIndex]
  )

  const wrapperClasses = useMemo(() => classNames(watermarkWrapperClasses, className), [className])

  return (
    <div ref={wrapperRef} className={wrapperClasses} {...props}>
      {children}
      <div data-watermark="true" aria-hidden="true" style={overlayStyle} />
    </div>
  )
}
