import React, { useState, useCallback, useMemo, createContext, useRef } from 'react'
import {
  getImageGroupClasses,
  registerImageGroupItem,
  unregisterImageGroupItem
} from '@expcat/tigercat-core'
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
    const result = registerImageGroupItem(imagesRef.current, src)
    imagesRef.current = result.items
    return result.index
  }, [])

  const unregister = useCallback((src: string) => {
    imagesRef.current = unregisterImageGroupItem(imagesRef.current, src)
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
      <div className={getImageGroupClasses(className)} role="group">
        {children}
        {preview && (
          <ImagePreview
            open={previewVisible}
            images={imagesRef.current}
            currentIndex={previewIndex}
            onOpenChange={(val: boolean) => {
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
