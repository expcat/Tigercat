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

export type UploadRejectReason =
  'exceed' | 'type' | 'size' | 'before-upload' | 'before-upload-error' | 'directory'

export interface UploadRejectedFile {
  file: File
  reason: UploadRejectReason
  error?: Error
}

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
   * Maximum file size in bytes. `undefined` or `0` means no limit.
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
   * Controlled file list. `undefined` is uncontrolled; `[]` is a real empty list.
   */
  fileList?: UploadFile[]

  /**
   * Uncontrolled initial file list.
   */
  defaultFileList?: UploadFile[]

  /**
   * Native form field name. Each listed file is submitted as a hidden input
   * (`uid` or `url`). The hidden `<input type="file">` is not named, so a reset
   * file picker cannot submit an empty FileList.
   */
  name?: string

  /**
   * Visual validation status. Do not spread as a DOM attribute.
   */
  status?: import('./input').InputStatus

  /**
   * Upload URL. Used when `customRequest` is omitted. Posts `FormData` with
   * the file under `name` (default `'file'`).
   */
  action?: string

  /**
   * HTTP method for `action`.
   * @default 'POST'
   */
  method?: string

  /**
   * Extra headers for the default `action` request.
   */
  headers?: Record<string, string>

  /**
   * Extra `FormData` fields for the default `action` request.
   */
  data?: Record<string, string | Blob>

  /**
   * Whether the default `action` request should send cookies.
   * @default false
   */
  withCredentials?: boolean

  /**
   * Whether to show the file list
   * @default true
   */
  showFileList?: boolean

  /**
   * Whether to start uploading as soon as files are accepted.
   * When `false`, files stay `ready` until `submit()`.
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
   * When true, pass `resumeKey` (`name:size:lastModified`) into `customRequest`.
   * Does not skip completed chunks or persist progress.
   * @default false
   */
  resumable?: boolean

  /**
   * Custom upload request. Return `{ abort }` or call `options.onAbort` in the
   * same tick so `abort()` can cancel in-flight work. Omit together with
   * `action` to keep files at `ready` (never fake `success`).
   */
  customRequest?: (options: UploadRequestOptions) => void | { abort?: () => void }

  /**
   * Queue change callback.
   */
  onQueueChange?: (queue: UploadQueueItem[]) => void

  /**
   * Chunk progress callback.
   */
  onChunkProgress?: (chunk: UploadChunk, progress: number, file: UploadFile) => void

  /**
   * File change callback. First argument is the changed file; second is the
   * full list. FormItem writes the **list** (`UploadFile[]`), not the file.
   */
  onChange?: (file: UploadFile, fileList: UploadFile[]) => void

  /**
   * File remove callback. Return `false` or `Promise<false>` to keep the file.
   */
  onRemove?: (file: UploadFile, fileList: UploadFile[]) => void | boolean | Promise<void | boolean>

  /**
   * Rejected files (type, size, beforeUpload, limit, directory drop).
   */
  onReject?: (files: UploadRejectedFile[]) => void

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

  /**
   * Register an abort callback in the same tick as `customRequest`.
   */
  onAbort?: (abort: () => void) => void
}
