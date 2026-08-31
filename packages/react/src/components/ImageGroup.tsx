import React, { useState, useCallback, useMemo, useRef, createContext } from 'react'
import {
  clampImageGroupPreviewIndex,
  getImageGroupClasses,
  getImageGroupItemIndex,
  getImageGroupLightboxItems,
  getImageLabels,
  registerImageGroupItem,
  resolveImageGroupName,
  unregisterImageGroupItem,
  type ImageGroupItem
} from '@expcat/tigercat-core'
import { ImagePreview } from './ImagePreview'
import { useTigerConfig } from './ConfigProvider'

export interface ImageGroupContextValue {
  preview: boolean
  register: (item: ImageGroupItem) => void
  unregister: (id: string) => void
  openPreview: (id: string) => void
}

export const ImageGroupContext = createContext<ImageGroupContextValue | null>(null)

export interface ImageGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to enable preview for all child images
   * @default true
   */
  preview?: boolean
  /**
   * Callback when preview open state changes
   */
  onPreviewOpenChange?: (open: boolean) => void
}

export const ImageGroup: React.FC<ImageGroupProps> = ({
  preview = true,
  onPreviewOpenChange,
  children,
  className,
  id,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  ...rest
}) => {
  const config = useTigerConfig()
  const labels = useMemo(() => getImageLabels(config.locale), [config.locale])
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [items, setItems] = useState<ImageGroupItem[]>([])
  const itemsRef = useRef(items)
  itemsRef.current = items

  const register = useCallback((item: ImageGroupItem) => {
    setItems((current) => registerImageGroupItem(current, item).items)
  }, [])

  const unregister = useCallback((itemId: string) => {
    setItems((current) => unregisterImageGroupItem(current, itemId))
  }, [])

  const openPreview = useCallback(
    (itemId: string) => {
      if (!preview) return
      const index = getImageGroupItemIndex(itemsRef.current, itemId)
      if (index < 0) return
      setPreviewIndex(index)
      setPreviewVisible(true)
      onPreviewOpenChange?.(true)
    },
    [preview, onPreviewOpenChange]
  )

  const contextValue = useMemo(
    () => ({ preview, register, unregister, openPreview }),
    [preview, register, unregister, openPreview]
  )

  const images = getImageGroupLightboxItems(items)
  const currentIndex = clampImageGroupPreviewIndex(previewIndex, images.length)
  const groupName = resolveImageGroupName({
    ariaLabel,
    ariaLabelledby,
    localeLabel: labels.groupAriaLabel
  })

  return (
    <ImageGroupContext.Provider value={contextValue}>
      <div
        {...rest}
        id={id}
        style={style}
        className={getImageGroupClasses(className)}
        role={groupName.role}
        aria-label={groupName['aria-label']}
        aria-labelledby={groupName['aria-labelledby']}>
        {children}
        {preview && (
          <ImagePreview
            open={previewVisible && images.length > 0}
            images={images}
            currentIndex={currentIndex}
            onOpenChange={(val: boolean) => {
              setPreviewVisible(val)
              if (!val) onPreviewOpenChange?.(false)
            }}
            onCurrentIndexChange={setPreviewIndex}
          />
        )}
      </div>
    </ImageGroupContext.Provider>
  )
}
