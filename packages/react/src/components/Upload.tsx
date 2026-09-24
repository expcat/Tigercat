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
  coerceArrayFormValue,
  createUploadController,
  createUploadPreviewUrlCache,
  filterUploadPreviewUrl,
  formatFileSize,
  getDragAreaClasses,
  getFileListItemClasses,
  getPictureCardClasses,
  getUploadLabels,
  getUploadStatusIconClasses,
  handleUploadDragLeave,
  handleUploadDragOver,
  handleUploadDrop,
  interpolateUploadLabel,
  isImageUploadFile,
  mergeAriaDescribedBy,
  resolveFormItemSeed,
  mergeTigerLocale,
  readUploadDropFiles,
  runShakeAnimation,
  uploadQueuedStatusText,
  uploadRetryFileAriaLabel,
  uploadSingleFileText,
  uploadSubmitValues,
  uploadFileInputClasses,
  uploadIconActionClasses,
  uploadItemActionsClasses,
  uploadListClasses,
  uploadPictureImageWrapClasses,
  uploadPictureListClasses,
  uploadPictureOverlayClasses,
  uploadProgressTrackClasses,
  uploadProgressValueClasses,
  type InputStatus,
  type UploadFile,
  type UploadLabels,
  type UploadProps as CoreUploadProps
} from '@expcat/tigercat-core'

import { useControlledState } from '../hooks/useControlledState'
import { Button } from './Button'
import { useTigerConfig } from './tiger-config'
import { useFormItemControlContext } from './FormItemContext'
import { Icon } from './Icon'
import { ImagePreview } from './ImagePreview'

export interface UploadProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onError' | 'onProgress'>,
    Omit<CoreUploadProps, 'onChange' | 'onRemove'> {
  onChange?: (file: UploadFile, fileList: UploadFile[]) => void
  onRemove?: (file: UploadFile, fileList: UploadFile[]) => void | boolean | Promise<void | boolean>
}

export interface UploadRef {
  focus: () => void
  submit: () => Promise<void>
  abort: (uid?: string) => void
  retry: (file: UploadFile) => Promise<void>
}

function UploadStatusIcon({
  status,
  labels,
  size
}: {
  status?: UploadFile['status']
  labels: UploadLabels
  size: 'sm' | 'lg'
}): React.ReactElement | null {
  if (status === 'success') {
    return (
      <Icon
        name="success"
        className={getUploadStatusIconClasses('success', size)}
        role="img"
        aria-label={labels.successAriaLabel}
      />
    )
  }
  if (status === 'error') {
    return (
      <Icon
        name="error"
        className={getUploadStatusIconClasses('error', size)}
        role="img"
        aria-label={labels.errorAriaLabel}
      />
    )
  }
  if (status === 'uploading') {
    return (
      <Icon
        name="refresh"
        className={getUploadStatusIconClasses('uploading', size, { spinning: true })}
        role="img"
        aria-label={labels.uploadingAriaLabel}
      />
    )
  }
  return null
}

export const Upload = forwardRef<UploadRef, UploadProps>(function Upload(
  {
    accept,
    multiple = false,
    limit,
    maxSize,
    disabled = false,
    drag = false,
    listType = 'text',
    fileList: fileListProp,
    defaultFileList,
    name,
    fileFieldName,
    allowedPreviewOrigins,
    readOnly = false,
    status: statusProp,
    action,
    method,
    headers,
    data,
    withCredentials,
    showFileList = true,
    autoUpload = true,
    queue = false,
    maxConcurrent = 2,
    chunkSize,
    resumable = false,
    customRequest,
    onQueueChange,
    onChunkProgress,
    onChange,
    onRemove,
    onPreview,
    onReject,
    beforeUpload,
    onProgress,
    onSuccess,
    onError,
    onExceed,
    locale,
    labels: labelsOverrides,
    children,
    className,
    style,
    id,
    onBlur,
    ...divProps
  },
  ref
) {
  const config = useTigerConfig()
  const formItemControl = useFormItemControlContext()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getUploadLabels(mergedLocale, labelsOverrides),
    [mergedLocale, labelsOverrides]
  )
  const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
  const isReadOnly = Boolean(readOnly)
  const canMutate = !effectiveDisabled && !isReadOnly
  const status: InputStatus = statusProp ?? formItemControl?.status ?? 'default'
  const reactId = useId()
  const triggerId = id ?? formItemControl?.id ?? `tiger-upload-${reactId}`
  const inputId = `${triggerId}-input`
  const describedBy = mergeAriaDescribedBy(
    typeof divProps['aria-describedby'] === 'string' ? divProps['aria-describedby'] : undefined,
    formItemControl?.describedBy
  )
  const labelledby =
    typeof divProps['aria-labelledby'] === 'string'
      ? divProps['aria-labelledby']
      : formItemControl?.labelId
  const fieldName = name ?? formItemControl?.name

  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLElement>(null)
  const previewUrls = useRef(createUploadPreviewUrlCache())
  const seededRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [singleFileNote, setSingleFileNote] = useState('')

  const [fileList, setFileList] = useControlledState<UploadFile[], [UploadFile?]>({
    value: resolveFormItemSeed(
      fileListProp,
      formItemControl?.name,
      formItemControl?.value,
      coerceArrayFormValue<UploadFile>
    ),
    defaultValue: defaultFileList ?? [],
    onChange: (nextList, file) => {
      if (file) onChange?.(file, nextList)
      formItemControl?.onChange?.(nextList)
    }
  })

  const fileListRef = useRef(fileList)
  fileListRef.current = fileList

  const callbacksRef = useRef({
    onRemove,
    onProgress,
    onSuccess,
    onError,
    onExceed,
    onReject,
    onQueueChange,
    onChunkProgress
  })
  callbacksRef.current = {
    onRemove,
    onProgress,
    onSuccess,
    onError,
    onExceed,
    onReject,
    onQueueChange,
    onChunkProgress
  }

  const configRef = useRef({
    accept,
    limit,
    maxSize,
    autoUpload,
    queue,
    maxConcurrent,
    chunkSize,
    resumable,
    action,
    fileFieldName,
    multiple,
    name: fieldName,
    method,
    headers,
    data,
    withCredentials,
    customRequest,
    beforeUpload
  })
  configRef.current = {
    accept,
    limit,
    maxSize,
    autoUpload,
    queue,
    maxConcurrent,
    chunkSize,
    resumable,
    action,
    fileFieldName,
    multiple,
    name: fieldName,
    method,
    headers,
    data,
    withCredentials,
    customRequest,
    beforeUpload
  }

  const controllerRef = useRef(
    createUploadController({
      host: {
        getFileList: () => fileListRef.current,
        setFileList: (list, changed) => {
          fileListRef.current = list
          setFileList(list, changed)
        }
      },
      getConfig: () => ({
        ...configRef.current,
        autoUpload: configRef.current.autoUpload,
        queue: configRef.current.queue,
        maxConcurrent: configRef.current.maxConcurrent ?? 2,
        resumable: Boolean(configRef.current.resumable)
      }),
      callbacks: {
        onRemove: (file, list) => callbacksRef.current.onRemove?.(file, list),
        onProgress: (progress, file) => callbacksRef.current.onProgress?.(progress, file),
        onSuccess: (response, file) => callbacksRef.current.onSuccess?.(response, file),
        onError: (error, file) => callbacksRef.current.onError?.(error, file),
        onExceed: (files, list) => callbacksRef.current.onExceed?.(files, list),
        onReject: (files) => {
          callbacksRef.current.onReject?.(files)
          setSingleFileNote(
            files.some((item) => item.reason === 'single') ? uploadSingleFileText : ''
          )
        },
        onQueueChange: (queueItems) => callbacksRef.current.onQueueChange?.(queueItems),
        onChunkProgress: (chunk, progress, file) =>
          callbacksRef.current.onChunkProgress?.(chunk, progress, file)
      }
    })
  )

  useEffect(() => {
    previewUrls.current.sync(fileList)
  }, [fileList])

  useEffect(() => {
    if (seededRef.current) return
    seededRef.current = true
    if (!formItemControl?.name || fileListProp !== undefined) return
    const raw = formItemControl.value
    if (raw !== '' && raw != null) return
    if (defaultFileList === undefined) return
    formItemControl.onChange?.(defaultFileList)
  }, [defaultFileList, fileListProp, formItemControl])

  const previewUrlFor = useCallback(
    (file: UploadFile) =>
      filterUploadPreviewUrl(previewUrls.current.get(file), allowedPreviewOrigins),
    [allowedPreviewOrigins]
  )

  useEffect(
    () => () => {
      previewUrls.current.dispose()
      controllerRef.current.dispose()
    },
    []
  )

  useEffect(() => {
    if (status === 'error') runShakeAnimation(rootRef.current)
  }, [status, formItemControl?.shakeTrigger])

  useImperativeHandle(
    ref,
    () => ({
      focus: () => triggerRef.current?.focus(),
      submit: () => controllerRef.current.submit(),
      abort: (uid) => controllerRef.current.abort(uid),
      retry: (file) => controllerRef.current.retry(file)
    }),
    []
  )

  const openPicker = useCallback(() => {
    if (!canMutate) return
    inputRef.current?.click()
  }, [canMutate])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation()
    const files = Array.from(event.target.files || [])
    await controllerRef.current.processFiles(files)
    event.target.value = ''
  }

  const handleRemove = async (file: UploadFile) => {
    if (!canMutate) return
    await controllerRef.current.remove(file)
  }

  const handleRetry = (file: UploadFile) => {
    if (!canMutate) return
    void controllerRef.current.retry(file)
  }

  const handlePreview = (file: UploadFile) => {
    if (effectiveDisabled) return
    if (onPreview) {
      onPreview(file)
      return
    }
    const url = previewUrlFor(file)
    if (url && isImageUploadFile(file)) setPreviewSrc(url)
  }

  const handleFocusOut = (event: React.FocusEvent<HTMLDivElement>) => {
    onBlur?.(event)
    const next = event.relatedTarget as Node | null
    if (next && event.currentTarget.contains(next)) return
    formItemControl?.onBlur?.()
  }

  const triggerAria = {
    id: triggerId,
    'aria-invalid': status === 'error' ? true : divProps['aria-invalid'],
    'aria-required': formItemControl?.required || divProps['aria-required'] ? true : undefined,
    'aria-describedby': describedBy,
    'aria-labelledby': labelledby,
    'aria-controls': inputId
  }

  const renderTrigger = () => {
    if (drag) {
      return (
        <div
          ref={triggerRef as React.RefObject<HTMLDivElement>}
          className={getDragAreaClasses(isDragging, effectiveDisabled)}
          onClick={openPicker}
          onKeyDown={(event) => {
            if (!canMutate) return
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openPicker()
            }
          }}
          onDragOver={(event) => {
            const result = handleUploadDragOver(event, !canMutate)
            if (!result.handled) return
            setIsDragging(result.isDragging)
          }}
          onDragLeave={(event) => {
            const result = handleUploadDragLeave(event, !canMutate, event.currentTarget)
            if (!result.handled) return
            setIsDragging(result.isDragging)
          }}
          onDrop={async (event) => {
            const result = handleUploadDrop(event, !canMutate)
            if (!result.handled || !canMutate) {
              setIsDragging(false)
              return
            }
            setIsDragging(false)
            const read = readUploadDropFiles(event.dataTransfer)
            if (read.rejectedDirectories.length > 0) {
              onReject?.(
                read.rejectedDirectories.map((file) => ({ file, reason: 'directory' as const }))
              )
            }
            await controllerRef.current.processFiles(read.files)
          }}
          role="button"
          tabIndex={effectiveDisabled ? -1 : 0}
          aria-disabled={effectiveDisabled}
          aria-label={children ? undefined : labels.dragAreaAriaLabel}
          {...triggerAria}>
          {children || (
            <>
              <Icon
                name="upload"
                className="w-12 h-12 mb-3 text-[var(--tiger-text-secondary)]"
                aria-hidden
              />
              <p className="mb-2 text-sm">
                <span className="font-semibold">{labels.clickToUploadText}</span>{' '}
                {labels.dragAndDropText}
              </p>
              {accept && (
                <p className="text-xs text-[var(--tiger-text-secondary)]">
                  {interpolateUploadLabel(labels.acceptInfoText, { accept })}
                </p>
              )}
              {maxSize ? (
                <p className="text-xs text-[var(--tiger-text-secondary)]">
                  {interpolateUploadLabel(labels.maxSizeInfoText, {
                    maxSize: formatFileSize(maxSize)
                  })}
                </p>
              ) : null}
            </>
          )}
        </div>
      )
    }

    return (
      <Button
        ref={triggerRef as React.RefObject<HTMLButtonElement>}
        type="button"
        variant="outline"
        size="sm"
        disabled={effectiveDisabled}
        onClick={openPicker}
        aria-label={children ? undefined : labels.buttonAriaLabel}
        {...triggerAria}>
        {children || labels.selectFileText}
      </Button>
    )
  }

  const renderProgress = (file: UploadFile, errorId?: string) => (
    <>
      {file.status === 'uploading' ? (
        <div
          className={uploadProgressTrackClasses}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={file.progress ?? 0}>
          <div className={uploadProgressValueClasses} style={{ width: `${file.progress ?? 0}%` }} />
        </div>
      ) : null}
      {file.status === 'error' && file.error ? (
        <p id={errorId} className="text-xs text-[var(--tiger-error)]">
          {file.error}
        </p>
      ) : null}
    </>
  )

  const renderActions = (file: UploadFile, picture: boolean) => {
    const safePreview = previewUrlFor(file)
    const canPreview = onPreview ? true : Boolean(isImageUploadFile(file) && safePreview)
    return (
      <>
        {canPreview ? (
          <button
            type="button"
            className={
              picture
                ? 'text-[var(--tiger-on-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)] rounded-sm'
                : uploadIconActionClasses
            }
            disabled={effectiveDisabled}
            tabIndex={effectiveDisabled ? -1 : 0}
            onClick={() => handlePreview(file)}
            aria-label={interpolateUploadLabel(labels.previewFileAriaLabel, {
              fileName: file.name
            })}>
            <Icon name="eye" className={picture ? 'w-6 h-6' : 'w-5 h-5'} aria-hidden />
          </button>
        ) : null}
        {file.status === 'error' ? (
          <button
            type="button"
            className={uploadIconActionClasses}
            disabled={!canMutate}
            tabIndex={effectiveDisabled ? -1 : 0}
            onClick={() => handleRetry(file)}
            aria-label={interpolateUploadLabel(uploadRetryFileAriaLabel, { fileName: file.name })}>
            <Icon name="refresh" className={picture ? 'w-6 h-6' : 'w-5 h-5'} aria-hidden />
          </button>
        ) : null}
        <button
          type="button"
          className={
            picture
              ? 'text-[var(--tiger-on-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)] rounded-sm'
              : uploadIconActionClasses
          }
          disabled={!canMutate}
          tabIndex={effectiveDisabled ? -1 : 0}
          onClick={() => handleRemove(file)}
          aria-label={interpolateUploadLabel(labels.removeFileAriaLabel, { fileName: file.name })}>
          <Icon
            name={picture ? 'trash' : 'close'}
            className={picture ? 'w-6 h-6' : 'w-5 h-5'}
            aria-hidden
          />
        </button>
      </>
    )
  }

  const renderTextItem = (file: UploadFile) => {
    const errorId = file.status === 'error' && file.error ? `${file.uid}-error` : undefined
    const thumb = listType === 'picture' ? previewUrlFor(file) : undefined
    return (
      <li key={file.uid} className={getFileListItemClasses(file.status)} aria-describedby={errorId}>
        <div className="flex items-center flex-1 min-w-0 gap-2">
          {listType === 'picture' ? (
            thumb ? (
              <img src={thumb} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
            ) : (
              <Icon name="document" className="w-5 h-5 flex-shrink-0" aria-hidden />
            )
          ) : (
            <Icon name="document" className="w-5 h-5 flex-shrink-0" aria-hidden />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            {file.size != null ? (
              <p className="text-xs text-[var(--tiger-text-secondary)]">
                {formatFileSize(file.size)}
              </p>
            ) : null}
            {file.status === 'queued' ? (
              <p className="text-xs text-[var(--tiger-text-secondary)]" role="status">
                {uploadQueuedStatusText}
              </p>
            ) : null}
            {renderProgress(file, errorId)}
          </div>
        </div>
        <div className={uploadItemActionsClasses}>
          <UploadStatusIcon status={file.status} labels={labels} size="sm" />
          {renderActions(file, false)}
        </div>
      </li>
    )
  }

  const renderPictureCard = (file: UploadFile) => {
    const imageUrl = previewUrlFor(file)
    const errorId = file.status === 'error' && file.error ? `${file.uid}-error` : undefined
    return (
      <div key={file.uid} className={getPictureCardClasses(file.status)} aria-describedby={errorId}>
        <div className={uploadPictureImageWrapClasses}>
          {imageUrl ? (
            <img src={imageUrl} alt={file.name} className="w-full h-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center px-2 text-xs text-center text-[var(--tiger-text-secondary)]">
              {file.name}
            </span>
          )}
        </div>
        <div className={uploadPictureOverlayClasses}>{renderActions(file, true)}</div>
        {file.status === 'uploading' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--tiger-surface)]/80">
            <UploadStatusIcon status="uploading" labels={labels} size="lg" />
            {renderProgress(file)}
          </div>
        ) : null}
        {file.status === 'error' && file.error ? (
          <p
            id={errorId}
            className="absolute bottom-1 inset-x-1 text-[10px] text-[var(--tiger-error)] truncate">
            {file.error}
          </p>
        ) : null}
      </div>
    )
  }

  const renderFileList = () => {
    if (!showFileList || fileList.length === 0) return null
    if (listType === 'picture-card') {
      return <div className={uploadPictureListClasses}>{fileList.map(renderPictureCard)}</div>
    }
    return (
      <ul className={uploadListClasses} role="list" aria-label={labels.uploadedFilesAriaLabel}>
        {fileList.map(renderTextItem)}
      </ul>
    )
  }

  return (
    <div
      {...divProps}
      ref={rootRef}
      className={classNames('tiger-upload', className)}
      style={style}
      onBlur={handleFocusOut}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={effectiveDisabled}
        className={uploadFileInputClasses}
        onChange={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />
      {fieldName ? (
        uploadSubmitValues(fileList).length > 0 ? (
          uploadSubmitValues(fileList).map((url, index) => (
            <input
              key={`${url}-${index}`}
              type="hidden"
              name={fieldName}
              value={url}
              disabled={effectiveDisabled || undefined}
            />
          ))
        ) : (
          <input
            type="hidden"
            name={fieldName}
            value=""
            disabled={effectiveDisabled || undefined}
          />
        )
      ) : null}
      {singleFileNote ? (
        <p role="status" aria-live="polite">
          {singleFileNote}
        </p>
      ) : null}
      {renderTrigger()}
      {renderFileList()}
      {previewSrc ? (
        <ImagePreview
          images={[previewSrc]}
          open
          onOpenChange={(open) => !open && setPreviewSrc(null)}
        />
      ) : null}
    </div>
  )
})

Upload.displayName = 'Upload'
