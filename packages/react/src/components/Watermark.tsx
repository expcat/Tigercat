import React, { forwardRef, useEffect, useRef, useState } from 'react'
import {
  classNames,
  watermarkDefaults,
  watermarkWrapperClasses,
  resolveWatermarkFont,
  createWatermarkRenderController,
  getWatermarkLabels,
  getWatermarkOverlayStyle,
  mergeTigerLocale,
  paintWatermark,
  watermarkOverlayClasses,
  type WatermarkRenderController,
  type WatermarkProps as CoreWatermarkProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

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
  const [imageFailed, setImageFailed] = useState(false)
  const config = useTigerConfig()
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
      render: async (options) => {
        const painted = await paintWatermark(options)
        setImageFailed(painted.imageFailed)
        return painted.url
      },
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
      <div data-watermark="true" aria-hidden="true" className={watermarkOverlayClasses} style={overlayStyle} />
      {imageFailed ? (
        <p className="text-sm text-[var(--tiger-text-secondary)]">
          {getWatermarkLabels(mergeTigerLocale(config.locale)).imageErrorText}
        </p>
      ) : null}
    </div>
  )
})
