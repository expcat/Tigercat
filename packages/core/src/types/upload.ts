/**
 * Upload component types and interfaces
 */

import type { TigerLocale } from './locale'

/**
 * File status type
 */
export type UploadFileStatus = 'ready' | 'uploading' | 'success' | 'error'

export type UploadQueueStatus = 'queued' | 'uploading' | 'success' | 'error'

export interface UploadChunk {
  index: number
  start: number
  end: number
  size: number
  blob: Blob
}

export interface UploadQueueItem {
  id: string
  file: File
  status: UploadQueueStatus
  progress: number
  chunks: UploadChunk[]
  error?: string
}

/**
 * List type for file display
 */
export type UploadListType = 'text' | 'picture' | 'picture-card'

/**
 * Upload file interface
 */
export interface UploadFile {
  /**
   * Unique identifier for the file
   */
  uid: string

  /**
   * File name
   */
  name: string

  /**
   * File status
   */
  status?: UploadFileStatus

  /**
   * Upload progress (0-100)
   */
  progress?: number

  /**
   * File size in bytes
   */
  size?: number

  /**
   * File type/mime type
   */
  type?: string

  /**
   * File URL (for preview or download)
   */
  url?: string

  /**
   * Native File object
   */
  file?: File

  /**
   * Error message if upload failed
   */
  error?: string
}

/**
 * Base upload props interface
 */
export interface UploadProps {
  /**
   * Accepted file types (same as HTML accept attribute)
   * @example 'image/*' or '.jpg,.png'
   */
  accept?: string

  /**
   * Whether to allow multiple file selection
   * @default false
   */
  multiple?: boolean

  /**
   * Maximum number of files
   */
  limit?: number

  /**
   * Maximum file size in bytes
   */
  maxSize?: number

  /**
   * Whether the upload is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether to enable drag and drop
   * @default false
   */
  drag?: boolean

  /**
   * List type for displaying files
   * @default 'text'
   */
  listType?: UploadListType

  /**
   * List of uploaded files
   */
  fileList?: UploadFile[]

  /**
   * Whether to show the file list
   * @default true
   */
  showFileList?: boolean

  /**
   * Whether to auto upload when file is selected
   * @default true
   */
  autoUpload?: boolean

  /**
   * Enable queued upload execution for selected files.
   * @default false
   */
  queue?: boolean

  /**
   * Maximum concurrent uploads when queue is enabled.
   * @default 2
   */
  maxConcurrent?: number

  /**
   * Chunk size in bytes. When set, customRequest is called once per chunk.
   */
  chunkSize?: number

  /**
   * Whether chunked uploads should expose a stable resume key.
   * @default false
   */
  resumable?: boolean

  /**
   * Custom upload request
   */
  customRequest?: (options: UploadRequestOptions) => void

  /**
   * Queue change callback.
   */
  onQueueChange?: (queue: UploadQueueItem[]) => void

  /**
   * Chunk progress callback.
   */
  onChunkProgress?: (chunk: UploadChunk, progress: number, file: UploadFile) => void

  /**
   * File change callback
   */
  onChange?: (file: UploadFile, fileList: UploadFile[]) => void

  /**
   * File remove callback
   */
  onRemove?: (file: UploadFile, fileList: UploadFile[]) => void | boolean

  /**
   * File preview callback
   */
  onPreview?: (file: UploadFile) => void

  /**
   * Before upload callback - return false to prevent upload
   */
  beforeUpload?: (file: File) => boolean | Promise<boolean>

  /**
   * Upload progress callback
   */
  onProgress?: (progress: number, file: UploadFile) => void

  /**
   * Upload success callback
   */
  onSuccess?: (response: unknown, file: UploadFile) => void

  /**
   * Upload error callback
   */
  onError?: (error: Error, file: UploadFile) => void

  /**
   * Exceed limit callback
   */
  onExceed?: (files: File[], fileList: UploadFile[]) => void

  /**
   * Locale overrides for Upload UI text.
   */
  locale?: Partial<TigerLocale>

  /**
   * Upload UI labels for i18n.
   * When provided, merges with locale-based defaults.
   */
  labels?: Partial<UploadLabels>
}

export interface UploadLabels {
  dragAreaAriaLabel: string
  buttonAriaLabel: string
  clickToUploadText: string
  dragAndDropText: string
  acceptInfoText: string
  maxSizeInfoText: string
  selectFileText: string
  uploadedFilesAriaLabel: string
  successAriaLabel: string
  errorAriaLabel: string
  uploadingAriaLabel: string
  removeFileAriaLabel: string
  previewFileAriaLabel: string
}

/**
 * Upload request options
 */
export interface UploadRequestOptions {
  /**
   * The file to upload
   */
  file: File

  /** Original selected file when `file` is a chunk wrapper. */
  originalFile?: File

  /** Current chunk metadata for chunked uploads. */
  chunk?: UploadChunk

  /** Current chunk index, 0-based. */
  chunkIndex?: number

  /** Total chunk count for the original file. */
  totalChunks?: number

  /** Stable resume key for the original file. */
  resumeKey?: string

  /**
   * Progress callback
   */
  onProgress?: (progress: number) => void

  /**
   * Success callback
   */
  onSuccess?: (response: unknown) => void

  /**
   * Error callback
   */
  onError?: (error: Error) => void
}
