import React, { useEffect, useRef, useState, useMemo } from 'react'
import {
  classNames,
  watermarkDefaults,
  watermarkWrapperClasses,
  resolveWatermarkFont,
  createWatermarkRenderController,
  getWatermarkOverlayStyle,
  type WatermarkRenderController,
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
  const renderControllerRef = useRef<WatermarkRenderController | null>(null)

  const resolvedFont = useMemo(() => resolveWatermarkFont(font), [font])

  useEffect(() => {
    const target = wrapperRef.current
    if (!target) return

    const controller = createWatermarkRenderController({
      getRenderOptions: () => ({
        content,
        image,
        width,
        height,
        rotate,
        font: resolvedFont
      }),
      onRender: setBase64
    })

    renderControllerRef.current = controller
    controller.observe(target)
    controller.render()

    return () => {
      controller.disconnect()
      if (renderControllerRef.current === controller) {
        renderControllerRef.current = null
      }
    }
  }, [content, image, width, height, rotate, resolvedFont])

  // MutationObserver: re-apply if overlay is removed
  useEffect(() => {
    if (typeof MutationObserver === 'undefined' || !wrapperRef.current) return
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of Array.from(m.removedNodes)) {
          if ((node as HTMLElement).dataset?.watermark === 'true') {
            renderControllerRef.current?.render()
            return
          }
        }
      }
    })
    observer.observe(wrapperRef.current, { childList: true })
    return () => observer.disconnect()
  }, [])

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
