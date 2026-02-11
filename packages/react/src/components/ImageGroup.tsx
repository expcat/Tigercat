import React, { useState, useCallback, useMemo, createContext, useRef } from 'react'
import { ImagePreview } from './ImagePreview'

export interface ImageGroupContextValue {
  register: (src: string) => number
  unregister: (src: string) => void
  openPreview: (index: number) => void
}

export const ImageGroupContext = createContext<ImageGroupContextValue | null>(null)

export interface ImageGroupProps {
  /**
   * Whether to enable preview for all child images
   * @default true
   */
  preview?: boolean
  /**
   * Callback when preview visibility changes
   */
  onPreviewVisibleChange?: (visible: boolean) => void
  /**
   * Children
   */
  children?: React.ReactNode
  /**
   * Additional CSS classes
   */
  className?: string
}

export const ImageGroup: React.FC<ImageGroupProps> = ({
  preview = true,
  onPreviewVisibleChange,
  children,
  className
}) => {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const imagesRef = useRef<string[]>([])

  const register = useCallback((src: string): number => {
    const idx = imagesRef.current.length
    imagesRef.current = [...imagesRef.current, src]
    return idx
  }, [])

  const unregister = useCallback((src: string) => {
    imagesRef.current = imagesRef.current.filter((s) => s !== src)
  }, [])

  const openPreview = useCallback(
    (index: number) => {
      if (!preview) return
      setPreviewIndex(index)
      setPreviewVisible(true)
      onPreviewVisibleChange?.(true)
    },
    [preview, onPreviewVisibleChange]
  )

  const contextValue = useMemo(
    () => ({ register, unregister, openPreview }),
    [register, unregister, openPreview]
  )

  return (
    <ImageGroupContext.Provider value={contextValue}>
      <div className={className || 'tiger-image-group'} role="group">
        {children}
        {preview && (
          <ImagePreview
            visible={previewVisible}
            images={imagesRef.current}
            currentIndex={previewIndex}
            onVisibleChange={(val) => {
              setPreviewVisible(val)
              if (!val) onPreviewVisibleChange?.(false)
            }}
            onCurrentIndexChange={setPreviewIndex}
          />
        )}
      </div>
    </ImageGroupContext.Provider>
  )
}
