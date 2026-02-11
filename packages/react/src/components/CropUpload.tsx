import React, { useState, useRef, useCallback, useMemo } from 'react'
import {
  classNames,
  cropUploadTriggerClasses,
  cropUploadTriggerDisabledClasses,
  uploadPlusIconPath,
  type ImageCropperProps as CoreImageCropperProps,
  type CropResult
} from '@expcat/tigercat-core'
import { Modal } from './Modal'
import { ImageCropper, type ImageCropperRef } from './ImageCropper'
import { Button } from './Button'

export interface CropUploadProps {
  /**
   * Accepted file types
   * @default 'image/*'
   */
  accept?: string
  /**
   * Whether the component is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Maximum file size in bytes
   */
  maxSize?: number
  /**
   * Props to pass to the internal ImageCropper
   */
  cropperProps?: Partial<Omit<CoreImageCropperProps, 'src'>>
  /**
   * Title for the crop modal
   * @default '裁剪图片'
   */
  modalTitle?: string
  /**
   * Width of the crop modal
   * @default 520
   */
  modalWidth?: number
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom trigger content
   */
  children?: React.ReactNode
  /**
   * Callback after cropping completes
   */
  onCropComplete?: (result: CropResult) => void
  /**
   * Callback on error
   */
  onError?: (error: Error) => void
}

export const CropUpload: React.FC<CropUploadProps> = ({
  accept = 'image/*',
  disabled = false,
  maxSize,
  cropperProps,
  modalTitle = '裁剪图片',
  modalWidth = 520,
  className,
  children,
  onCropComplete,
  onError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cropperRef = useRef<ImageCropperRef>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [imageSrc, setImageSrc] = useState('')
  const [cropping, setCropping] = useState(false)

  const handleTriggerClick = useCallback(() => {
    if (disabled) return
    fileInputRef.current?.click()
  }, [disabled])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (maxSize && file.size > maxSize) {
        onError?.(new Error(`File size exceeds maximum of ${maxSize} bytes`))
        e.target.value = ''
        return
      }

      const reader = new FileReader()
      reader.onload = (ev) => {
        setImageSrc(ev.target?.result as string)
        setModalVisible(true)
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    },
    [maxSize, onError]
  )

  const handleConfirm = useCallback(async () => {
    if (!cropperRef.current) return
    setCropping(true)
    try {
      const result = await cropperRef.current.getCropResult()
      onCropComplete?.(result)
      setModalVisible(false)
    } catch (err) {
      onError?.(err as Error)
    } finally {
      setCropping(false)
    }
  }, [onCropComplete, onError])

  const handleCancel = useCallback(() => {
    setModalVisible(false)
    setImageSrc('')
  }, [])

  const triggerClasses = useMemo(
    () =>
      classNames(disabled ? cropUploadTriggerDisabledClasses : cropUploadTriggerClasses, className),
    [disabled, className]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleTriggerClick()
      }
    },
    [handleTriggerClick]
  )

  return (
    <div className="tiger-crop-upload inline-block">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div
        className={triggerClasses}
        onClick={handleTriggerClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Select image to crop and upload"
        aria-disabled={disabled ? 'true' : undefined}
        onKeyDown={handleKeyDown}>
        {children || (
          <>
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={uploadPlusIconPath}
              />
            </svg>
            <span>选择图片</span>
          </>
        )}
      </div>
      <Modal
        visible={modalVisible}
        size="lg"
        title={modalTitle}
        closable
        maskClosable={false}
        onClose={handleCancel}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={handleCancel}>
              取消
            </Button>
            <Button onClick={handleConfirm} loading={cropping}>
              确认裁剪
            </Button>
          </div>
        }>
        {imageSrc && <ImageCropper ref={cropperRef} src={imageSrc} {...cropperProps} />}
      </Modal>
    </div>
  )
}
