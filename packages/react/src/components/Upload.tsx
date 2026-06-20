import React, { useRef, useState, useCallback, useMemo } from 'react'
import {
  type UploadProps as CoreUploadProps,
  type UploadFile,
  type UploadLabels,
  classNames,
  icon20ViewBox,
  closeSolidIcon20PathD,
  successCircleSolidIcon20PathD,
  errorCircleSolidIcon20PathD,
  getSpinnerSVG,
  getUploadLabels,
  interpolateUploadLabel,
  mergeTigerLocale,
  prepareUploadFiles,
  fileToUploadFile,
  createUploadChunks,
  createUploadQueueItem,
  getUploadResumeKey,
  runUploadQueue,
  handleUploadDragOver,
  handleUploadDragLeave,
  handleUploadDrop,
  formatFileSize,
  getUploadButtonClasses,
  getDragAreaClasses,
  getFileListItemClasses,
  getPictureCardClasses,
  getUploadStatusIconClasses
} from '@expcat/tigercat-core'

import { useTigerConfig } from './ConfigProvider'
import { useControlledState } from '../hooks/useControlledState'

const spinnerSvg = getSpinnerSVG('spinner')

export interface UploadProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onError' | 'onProgress'>,
    Omit<CoreUploadProps, 'onChange' | 'onRemove'> {
  /**
   * File list change callback
   */
  onChange?: (file: UploadFile, fileList: UploadFile[]) => void

  /**
   * File remove callback
   */
  onRemove?: (file: UploadFile, fileList: UploadFile[]) => void | boolean

  // children/className/style 等由 React.HTMLAttributes<HTMLDivElement> 提供
}

export const Upload: React.FC<UploadProps> = ({
  accept,
  multiple = false,
  limit,
  maxSize,
  disabled = false,
  drag = false,
  listType = 'text',
  fileList: controlledFileList,
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
  ...divProps
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels: UploadLabels = useMemo(
    () => getUploadLabels(mergedLocale, labelsOverrides),
    [mergedLocale, labelsOverrides]
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileList, setFileList] = useControlledState<UploadFile[]>(controlledFileList, [])

  const updateFileList = useCallback(
    (newFileList: UploadFile[]) => {
      setFileList(newFileList)
    },
    [setFileList]
  )

  const handleClick = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    await processFiles(files)
    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = ''
    }
  }

  const processFiles = async (incomingFiles: File[]) => {
    if (incomingFiles.length === 0) return

    const prepared = await prepareUploadFiles({
      currentCount: fileList.length,
      incomingFiles,
      limit,
      accept,
      maxSize,
      beforeUpload
    })

    if (prepared.rejectedExceedFiles.length > 0) {
      onExceed?.(prepared.rejectedExceedFiles, fileList)
    }

    // Important: fileList is a snapshot (state/props). Use a local accumulator
    // to avoid overwriting previous files when selecting multiple at once.
    let nextFileList = [...fileList]

    for (const file of prepared.acceptedFiles) {
      const uploadFile = fileToUploadFile(file)

      // Add to file list
      nextFileList = [...nextFileList, uploadFile]
      updateFileList(nextFileList)

      if (onChange) {
        onChange(uploadFile, nextFileList)
      }

      if (autoUpload && !queue) {
        await uploadOne(file, uploadFile, () => updateFileList([...nextFileList]))
      }
    }

    if (autoUpload && queue) {
      const queueItems = prepared.acceptedFiles.map((file) =>
        createUploadQueueItem(file, nextFileList.find((item) => item.file === file)?.uid, chunkSize)
      )
      onQueueChange?.(queueItems)
      await runUploadQueue(
        queueItems,
        async (item) => {
          const uploadFile = nextFileList.find((candidate) => candidate.uid === item.id)
          if (!uploadFile) return
          await uploadOne(item.file, uploadFile, () => updateFileList([...nextFileList]))
        },
        { concurrency: maxConcurrent, onChange: onQueueChange }
      )
    }
  }

  const uploadOne = async (
    file: File,
    uploadFile: UploadFile,
    notify: () => void
  ): Promise<void> => {
    uploadFile.status = 'uploading'
    notify()

    if (!customRequest) {
      uploadFile.progress = 100
      uploadFile.status = 'success'
      notify()
      return
    }

    const chunks = chunkSize ? createUploadChunks(file, chunkSize) : []
    const resumeKey = resumable ? getUploadResumeKey(file) : undefined

    if (chunks.length <= 1) {
      await requestUpload(file, uploadFile, notify, { resumeKey })
      return
    }

    for (const chunk of chunks) {
      const chunkFile = new File([chunk.blob], file.name, {
        type: file.type,
        lastModified: file.lastModified
      })
      await requestUpload(chunkFile, uploadFile, notify, {
        originalFile: file,
        chunk,
        totalChunks: chunks.length,
        resumeKey
      })
    }

    uploadFile.progress = 100
    uploadFile.status = 'success'
    onSuccess?.({ chunks: chunks.length, resumeKey }, uploadFile)
    notify()
  }

  const requestUpload = (
    file: File,
    uploadFile: UploadFile,
    notify: () => void,
    options: {
      originalFile?: File
      chunk?: ReturnType<typeof createUploadChunks>[number]
      totalChunks?: number
      resumeKey?: string
    }
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      customRequest?.({
        file,
        originalFile: options.originalFile,
        chunk: options.chunk,
        chunkIndex: options.chunk?.index,
        totalChunks: options.totalChunks,
        resumeKey: options.resumeKey,
        onProgress: (progress: number) => {
          const nextProgress = options.chunk
            ? Math.round(
                ((options.chunk.index + progress / 100) / (options.totalChunks ?? 1)) * 100
              )
            : progress
          uploadFile.progress = nextProgress
          if (options.chunk) {
            onChunkProgress?.(options.chunk, progress, uploadFile)
          }
          onProgress?.(nextProgress, uploadFile)
          notify()
        },
        onSuccess: (response: unknown) => {
          if (!options.chunk) {
            uploadFile.status = 'success'
            uploadFile.progress = 100
            onSuccess?.(response, uploadFile)
            notify()
          }
          resolve()
        },
        onError: (error: Error) => {
          uploadFile.status = 'error'
          uploadFile.error = error.message
          onError?.(error, uploadFile)
          notify()
          reject(error)
        }
      })
    })
  }

  const handleRemove = (file: UploadFile) => {
    const newFileList = fileList.filter((f) => f.uid !== file.uid)

    const removeResult = onRemove?.(file, newFileList)
    if (removeResult === false) return

    updateFileList(newFileList)
    // Keep controlled mode in sync (demo relies on onChange)
    onChange?.(file, newFileList)
  }

  const handlePreview = (file: UploadFile) => {
    onPreview?.(file)
  }

  const handleDragOver = (event: React.DragEvent) => {
    const result = handleUploadDragOver(event, disabled)
    if (!result.handled) return
    setIsDragging(result.isDragging)
  }

  const handleDragKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  const handleDragLeave = (event: React.DragEvent) => {
    const result = handleUploadDragLeave(event, disabled)
    if (!result.handled) return
    setIsDragging(result.isDragging)
  }

  const handleDrop = async (event: React.DragEvent) => {
    const result = handleUploadDrop(event, disabled)
    if (!result.handled) return
    setIsDragging(result.isDragging)

    await processFiles(result.files)
  }

  const renderUploadButton = () => {
    if (drag) {
      return (
        <div
          className={getDragAreaClasses(isDragging, disabled)}
          onClick={handleClick}
          onKeyDown={handleDragKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          aria-label={labels.dragAreaAriaLabel}>
          <svg
            className="w-12 h-12 mb-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mb-2 text-sm">
            <span className="font-semibold">{labels.clickToUploadText}</span>{' '}
            {labels.dragAndDropText}
          </p>
          {accept && (
            <p className="text-xs text-gray-500">
              {interpolateUploadLabel(labels.acceptInfoText, { accept })}
            </p>
          )}
          {maxSize && (
            <p className="text-xs text-gray-500">
              {interpolateUploadLabel(labels.maxSizeInfoText, {
                maxSize: formatFileSize(maxSize)
              })}
            </p>
          )}
        </div>
      )
    }

    return (
      <button
        type="button"
        className={getUploadButtonClasses(disabled)}
        onClick={handleClick}
        disabled={disabled}
        aria-label={labels.buttonAriaLabel}>
        {children || labels.selectFileText}
      </button>
    )
  }

  const renderFileList = () => {
    if (!showFileList || fileList.length === 0) {
      return null
    }

    if (listType === 'picture-card') {
      return (
        <div className="flex flex-wrap gap-2 mt-4">
          {fileList.map((file) => renderPictureCard(file))}
        </div>
      )
    }

    return (
      <ul className="mt-4 space-y-2" role="list" aria-label={labels.uploadedFilesAriaLabel}>
        {fileList.map((file) => renderFileItem(file))}
      </ul>
    )
  }

  const renderFileItem = (file: UploadFile) => {
    return (
      <li key={file.uid} className={getFileListItemClasses(file.status)}>
        <div className="flex items-center flex-1 min-w-0">
          {/* File icon */}
          <svg
            className="w-5 h-5 mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {/* File name and size */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            {file.size && <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>}
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          {/* Status icon */}
          {file.status === 'success' && (
            <svg
              className={getUploadStatusIconClasses('success', 'sm')}
              fill="currentColor"
              viewBox={icon20ViewBox}
              aria-label={labels.successAriaLabel}>
              <path fillRule="evenodd" d={successCircleSolidIcon20PathD} clipRule="evenodd" />
            </svg>
          )}
          {file.status === 'error' && (
            <svg
              className={getUploadStatusIconClasses('error', 'sm')}
              fill="currentColor"
              viewBox={icon20ViewBox}
              aria-label={labels.errorAriaLabel}>
              <path fillRule="evenodd" d={errorCircleSolidIcon20PathD} clipRule="evenodd" />
            </svg>
          )}
          {file.status === 'uploading' && (
            <svg
              className={getUploadStatusIconClasses('uploading', 'sm', {
                spinning: true
              })}
              fill="none"
              viewBox={spinnerSvg.viewBox}
              aria-label={labels.uploadingAriaLabel}>
              {spinnerSvg.elements.map((el, index) => {
                if (el.type === 'circle') return <circle key={index} {...el.attrs} />
                if (el.type === 'path') return <path key={index} {...el.attrs} />
                return null
              })}
            </svg>
          )}
          {/* Remove button */}
          <button
            type="button"
            className="text-gray-400 hover:text-red-500 transition-colors"
            onClick={() => handleRemove(file)}
            aria-label={interpolateUploadLabel(labels.removeFileAriaLabel, {
              fileName: file.name
            })}>
            <svg className="w-5 h-5" fill="currentColor" viewBox={icon20ViewBox} aria-hidden="true">
              <path fillRule="evenodd" d={closeSolidIcon20PathD} clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </li>
    )
  }

  const renderPictureCard = (file: UploadFile) => {
    const imageUrl = file.url || (file.file ? URL.createObjectURL(file.file) : '')

    return (
      <div key={file.uid} className={getPictureCardClasses(file.status)}>
        {/* Image preview */}
        {imageUrl && <img src={imageUrl} alt={file.name} className="w-full h-full object-cover" />}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center space-x-2 opacity-0 hover:opacity-100">
          {/* Preview button */}
          <button
            type="button"
            className="text-white hover:text-blue-200 transition-colors"
            onClick={() => handlePreview(file)}
            aria-label={interpolateUploadLabel(labels.previewFileAriaLabel, {
              fileName: file.name
            })}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          {/* Remove button */}
          <button
            type="button"
            className="text-white hover:text-red-200 transition-colors"
            onClick={() => handleRemove(file)}
            aria-label={interpolateUploadLabel(labels.removeFileAriaLabel, {
              fileName: file.name
            })}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        {/* Status indicator */}
        {file.status === 'uploading' && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <svg
              className={getUploadStatusIconClasses('uploading', 'lg', {
                spinning: true
              })}
              fill="none"
              viewBox={spinnerSvg.viewBox}>
              {spinnerSvg.elements.map((el, index) => {
                if (el.type === 'circle') return <circle key={index} {...el.attrs} />
                if (el.type === 'path') return <path key={index} {...el.attrs} />
                return null
              })}
            </svg>
          </div>
        )}
      </div>
    )
  }

  return (
    <div {...divProps} className={classNames('tiger-upload', className)} style={style}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-hidden="true"
      />
      {renderUploadButton()}
      {renderFileList()}
    </div>
  )
}
