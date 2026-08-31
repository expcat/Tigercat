import React, { forwardRef, useEffect, useRef, useState } from 'react'
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

export const Watermark = forwardRef<HTMLDivElement, WatermarkProps>(function Watermark(
  {
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
  },
  ref
) {
  const [base64, setBase64] = useState<string | undefined>()
  const [overlayKey, setOverlayKey] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const renderControllerRef = useRef<WatermarkRenderController | null>(null)
  const optionsRef = useRef({ content, image, width, height, rotate, gapX, gapY, font })
  optionsRef.current = { content, image, width, height, rotate, gapX, gapY, font }

  useEffect(() => {
    const target = wrapperRef.current
    if (!target) return

    const controller = createWatermarkRenderController({
      getRenderOptions: () => {
        const next = optionsRef.current
        return {
          content: next.content,
          image: next.image,
          width: next.width,
          height: next.height,
          gapX: next.gapX,
          gapY: next.gapY,
          rotate: next.rotate,
          font: resolveWatermarkFont(next.font)
        }
      },
      onRender: setBase64,
      onTamper: () => setOverlayKey((key) => key + 1)
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
  }, [])

  const fontKey = `${font?.fontSize ?? ''}|${font?.fontFamily ?? ''}|${font?.fontWeight ?? ''}|${font?.color ?? ''}`
  const contentKey = Array.isArray(content) ? content.join('\n') : (content ?? '')

  useEffect(() => {
    renderControllerRef.current?.render()
  }, [contentKey, image, width, height, rotate, gapX, gapY, fontKey])

  const overlayStyle = getWatermarkOverlayStyle({
    base64Url: base64,
    width,
    height,
    gapX,
    gapY,
    offsetX,
    offsetY,
    zIndex
  })

  return (
    <div
      ref={(node) => {
        wrapperRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className={classNames(watermarkWrapperClasses, className)}
      {...props}>
      {children}
      <div key={overlayKey} data-watermark="true" aria-hidden="true" style={overlayStyle} />
    </div>
  )
})
