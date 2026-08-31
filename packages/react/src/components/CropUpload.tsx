import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  classNames,
  createCropUploadSession,
  formatBytes,
  getCropUploadTriggerClasses,
  getImageEditorLabels,
  handleUploadDragLeave,
  handleUploadDragOver,
  handleUploadDrop,
  interpolateUploadLabel,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  withCropFile,
  type CropResult,
  type ImageCropperProps as CoreImageCropperProps,
  type TigerLocale
} from '@expcat/tigercat-core'
import { Modal } from './Modal'
import { ImageCropper, type ImageCropperRef } from './ImageCropper'
import { Button } from './Button'
import { Icon } from './Icon'
import { useTigerConfig } from './ConfigProvider'
import { useFormItemControlContext } from './FormItemContext'

export interface CropUploadProps {
  locale?: Partial<TigerLocale>
  accept?: string
  disabled?: boolean
  maxSize?: number
  cropperProps?: Partial<Omit<CoreImageCropperProps, 'src'>>
  modalTitle?: string
  modalWidth?: number
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  onCropComplete?: (result: CropResult) => void
  onError?: (error: Error) => void
}

export interface CropUploadRef {
  focus: () => void
}

export const CropUpload = forwardRef<HTMLLabelElement, CropUploadProps>(function CropUpload(
  {
    locale,
    accept = 'image/*',
    disabled = false,
    maxSize,
    cropperProps,
    modalTitle,
    modalWidth = 520,
    className,
    style,
    children,
    onCropComplete,
    onError,
    ...rest
  },
  ref
) {
  const config = useTigerConfig()
  const formItemControl = useFormItemControlContext()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(() => getImageEditorLabels(mergedLocale), [mergedLocale])
  const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
  const reactId = useId()
  const triggerId =
    (rest as { id?: string }).id ?? formItemControl?.id ?? `tiger-crop-upload-${reactId}`
  const inputId = `${triggerId}-input`
  const describedBy = mergeAriaDescribedBy(
    typeof (rest as { 'aria-describedby'?: string })['aria-describedby'] === 'string'
      ? (rest as { 'aria-describedby'?: string })['aria-describedby']
      : undefined,
    formItemControl?.describedBy
  )

  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLLabelElement>(null)
  const cropperRef = useRef<ImageCropperRef>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [sessionState, setSessionState] = useState(() => ({
    generation: 0,
    modalOpen: false,
    imageSrc: '',
    originalFile: null as File | null,
    cropperReady: false,
    cropping: false
  }))

  const labelsRef = useRef(labels)
  labelsRef.current = labels
  const acceptRef = useRef(accept)
  acceptRef.current = accept
  const maxSizeRef = useRef(maxSize)
  maxSizeRef.current = maxSize
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const sessionHolder = useRef<ReturnType<typeof createCropUploadSession> | null>(null)
  if (!sessionHolder.current) {
    sessionHolder.current = createCropUploadSession({
      getAccept: () => acceptRef.current,
      getMaxSize: () => maxSizeRef.current,
      getSizeError: (limit) =>
        interpolateUploadLabel(labelsRef.current.fileTooLargeText, { maxSize: formatBytes(limit) }),
      getTypeError: () => labelsRef.current.fileTypeRejectedText,
      onState: setSessionState,
      onError: (error) => onErrorRef.current?.(error)
    })
  }
  const session = sessionHolder.current

  useEffect(() => () => session.dispose(), [session])
  useImperativeHandle(ref, () => triggerRef.current as HTMLLabelElement, [])

  const handleFiles = useCallback(
    (file?: File | null) => {
      if (effectiveDisabled) return
      session.selectFile(file)
      if (inputRef.current) inputRef.current.value = ''
    },
    [effectiveDisabled, session]
  )

  const handleConfirm = async () => {
    if (!session.beginCrop()) return
    try {
      const raw = await cropperRef.current?.getCropResult()
      if (!raw) return
      const originalName = session.getState().originalFile?.name ?? raw.file.name
      const result = withCropFile(raw, originalName)
      onCropComplete?.(result)
      formItemControl?.onChange?.(result.file)
      session.close()
    } catch (error) {
      onError?.(error as Error)
      session.endCrop()
    }
  }

  const handleCancel = () => session.close()

  const cropperLocale = locale ?? cropperProps?.locale
  const userReady = cropperProps?.onReady
  const {
    onReady: _ignoredReady,
    locale: _ignoredLocale,
    className: cropperClassName,
    ...restCropper
  } = cropperProps ?? {}

  return (
    <div className="tiger-crop-upload inline-block">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={effectiveDisabled}
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files?.[0])}
        tabIndex={-1}
      />
      <label
        {...(rest as React.LabelHTMLAttributes<HTMLLabelElement>)}
        ref={triggerRef}
        id={triggerId}
        htmlFor={effectiveDisabled ? undefined : inputId}
        className={getCropUploadTriggerClasses(effectiveDisabled, className)}
        style={style}
        aria-disabled={effectiveDisabled || undefined}
        aria-describedby={describedBy}
        aria-label={children ? undefined : labels.selectImageAriaLabel}
        onDragOver={(event) => {
          const result = handleUploadDragOver(event, effectiveDisabled)
          if (result.handled) setIsDragging(result.isDragging)
        }}
        onDragLeave={(event) => {
          const result = handleUploadDragLeave(event, effectiveDisabled, event.currentTarget)
          if (result.handled) setIsDragging(result.isDragging)
        }}
        onDrop={(event) => {
          const result = handleUploadDrop(event, effectiveDisabled)
          if (!result.handled) return
          setIsDragging(false)
          handleFiles(result.files[0])
        }}
        data-dragging={isDragging ? 'true' : undefined}>
        {children || (
          <>
            <Icon name="plus" className="w-5 h-5" aria-hidden />
            <span>{labels.selectImageText}</span>
          </>
        )}
      </label>
      <Modal
        open={sessionState.modalOpen}
        width={modalWidth}
        title={modalTitle ?? labels.cropModalTitle}
        closable
        maskClosable={false}
        destroyOnClose
        onClose={handleCancel}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={handleCancel}>
              {labels.cropCancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              loading={sessionState.cropping}
              disabled={!sessionState.cropperReady}>
              {labels.cropConfirmText}
            </Button>
          </div>
        }>
        {sessionState.imageSrc ? (
          <ImageCropper
            ref={cropperRef}
            src={sessionState.imageSrc}
            className={cropperClassName}
            locale={cropperLocale}
            {...restCropper}
            onReady={() => {
              session.markReady()
              userReady?.()
            }}
            onError={(error) => {
              session.markLoadError(error)
              cropperProps?.onError?.(error)
            }}
          />
        ) : null}
      </Modal>
    </div>
  )
})

CropUpload.displayName = 'CropUpload'
