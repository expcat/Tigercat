/**
 * Upload utility functions
 */

import type {
  UploadFile,
  UploadFileStatus,
  UploadRejectedFile,
  UploadRejectReason
} from '../types/upload'
import { classNames } from './class-names'
import { isBrowser } from './env'
import { formatBytes, getFileExtensionName } from './file-utils'
import { resolveButtonClasses } from './button-utils'

export type UploadStatusIconSize = 'sm' | 'lg'

export const uploadStatusIconSizeClasses: Record<UploadStatusIconSize, string> = {
  sm: 'w-5 h-5',
  lg: 'w-8 h-8'
}

export const uploadStatusIconColorClasses: Record<UploadFileStatus, string> = {
  ready: 'text-[var(--tiger-text-secondary)]',
  queued: 'text-[var(--tiger-text-secondary)]',
  uploading: 'text-[var(--tiger-primary)]',
  success: 'text-[var(--tiger-success)]',
  error: 'text-[var(--tiger-error)]'
}

export function getUploadStatusIconClasses(
  status: UploadFileStatus,
  size: UploadStatusIconSize,
  options?: { spinning?: boolean }
): string {
  return classNames(
    uploadStatusIconSizeClasses[size],
    uploadStatusIconColorClasses[status],
    options?.spinning ? 'animate-spin tiger-motion-aware motion-reduce:animate-none' : ''
  )
}

export type BeforeUploadHandler = (file: File) => boolean | Promise<boolean>

export type { UploadRejectedFile, UploadRejectReason }

export interface PrepareUploadFilesOptions {
  currentCount: number
  incomingFiles: File[]
  limit?: number
  accept?: string
  maxSize?: number
  multiple?: boolean
  beforeUpload?: BeforeUploadHandler
}

export interface PrepareUploadFilesResult {
  acceptedFiles: File[]
  rejectedFiles: UploadRejectedFile[]
  rejectedExceedFiles: File[]
}

export interface UploadDataTransferLike {
  files?: ArrayLike<File> | null
}

export interface UploadDragEventLike {
  preventDefault: () => void
  dataTransfer?: UploadDataTransferLike | null
  relatedTarget?: EventTarget | null
  currentTarget?: EventTarget | null
}

export interface UploadDragResult {
  handled: boolean
  isDragging: boolean
  files: File[]
}

function coerceToError(error: unknown): Error {
  if (error instanceof Error) return error
  if (typeof error === 'string') return new Error(error)
  try {
    return new Error(JSON.stringify(error))
  } catch {
    return new Error('Unknown error')
  }
}

export async function prepareUploadFiles(
  options: PrepareUploadFilesOptions
): Promise<PrepareUploadFilesResult> {
  const { currentCount, incomingFiles, limit, accept, maxSize, multiple, beforeUpload } = options

  if (incomingFiles.length === 0) {
    return {
      acceptedFiles: [],
      rejectedFiles: [],
      rejectedExceedFiles: []
    }
  }

  const rejectedFiles: UploadRejectedFile[] = []
  const validated: File[] = []

  for (const file of incomingFiles) {
    if (!validateFileType(file, accept)) {
      rejectedFiles.push({ file, reason: 'type' })
      continue
    }

    if (!validateFileSize(file, maxSize)) {
      rejectedFiles.push({ file, reason: 'size' })
      continue
    }

    if (beforeUpload) {
      try {
        const result = await beforeUpload(file)
        if (result === false) {
          rejectedFiles.push({ file, reason: 'before-upload' })
          continue
        }
      } catch (error) {
        rejectedFiles.push({
          file,
          reason: 'before-upload-error',
          error: coerceToError(error)
        })
        continue
      }
    }

    validated.push(file)
  }

  let acceptedFiles = validated
  const rejectedExceedFiles: File[] = []

  if (multiple === false && acceptedFiles.length > 1) {
    const rest = acceptedFiles.slice(1)
    acceptedFiles = acceptedFiles.slice(0, 1)
    rejectedFiles.push(...rest.map((file) => ({ file, reason: 'single' as const })))
  }

  if (limit !== undefined) {
    const remainingSlots = Math.max(0, limit - currentCount)
    if (validated.length > remainingSlots) {
      acceptedFiles = validated.slice(0, remainingSlots)
      const exceed = validated.slice(remainingSlots)
      rejectedExceedFiles.push(...exceed)
      rejectedFiles.push(...exceed.map((file) => ({ file, reason: 'exceed' as const })))
    }
  }

  return {
    acceptedFiles,
    rejectedFiles,
    rejectedExceedFiles
  }
}

export function getUploadDataTransferFiles(dataTransfer?: UploadDataTransferLike | null): File[] {
  return Array.from(dataTransfer?.files ?? [])
}

export function handleUploadDragOver(
  event: UploadDragEventLike,
  disabled: boolean = false
): UploadDragResult {
  event.preventDefault()
  if (disabled) {
    return { handled: true, isDragging: false, files: [] }
  }
  return { handled: true, isDragging: true, files: [] }
}

function isNodeInside(
  root: EventTarget | null | undefined,
  node: EventTarget | null | undefined
): boolean {
  if (!root || !node) return false
  if (!(root instanceof Node) || !(node instanceof Node)) return false
  return root.contains(node)
}

export function handleUploadDragLeave(
  event: UploadDragEventLike,
  disabled: boolean = false,
  currentTarget?: EventTarget | null
): UploadDragResult {
  event.preventDefault()
  if (disabled) {
    return { handled: true, isDragging: false, files: [] }
  }

  const root = currentTarget ?? event.currentTarget
  if (isNodeInside(root, event.relatedTarget)) {
    return { handled: true, isDragging: true, files: [] }
  }
  return { handled: true, isDragging: false, files: [] }
}

export function handleUploadDrop(
  event: UploadDragEventLike,
  disabled: boolean = false
): UploadDragResult {
  event.preventDefault()
  if (disabled) {
    return { handled: true, isDragging: false, files: [] }
  }
  return {
    handled: true,
    isDragging: false,
    files: getUploadDataTransferFiles(event.dataTransfer)
  }
}

/**
 * Generate a unique ID for uploaded files
 * Uses timestamp and random string for uniqueness
 * @returns Unique file ID string
 */
export function generateFileId(): string {
  return `upload-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Extract file extension from filename
 * @param fileName - Name of the file
 * @returns File extension with dot (e.g., '.png') or empty string
 */
function getFileExtension(fileName: string): string {
  return getFileExtensionName(fileName, { includeDot: true })
}

/**
 * Create an UploadFile object from a File
 */
export function fileToUploadFile(file: File): UploadFile {
  return {
    uid: generateFileId(),
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'ready',
    file
  }
}

/**
 * Validate file type against accept pattern
 * @param file - File to validate
 * @param accept - Accept pattern (e.g., 'image/*', '.png,.jpg', 'image/png')
 * @returns True if file type is accepted
 */
const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.svg',
  '.ico',
  '.avif',
  '.tif',
  '.tiff'
])

export function validateFileType(file: File, accept?: string): boolean {
  if (!accept) return true

  const acceptList = accept
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
  const fileType = (file.type || '').toLowerCase()
  const fileExtension = getFileExtension(file.name)

  return acceptList.some((acceptItem) => {
    if (acceptItem === '*/*') return true

    if (acceptItem.startsWith('.')) {
      return fileExtension === acceptItem
    }

    if (acceptItem.endsWith('/*')) {
      const baseType = acceptItem.slice(0, -2)
      if (!baseType || baseType === '*') return true
      if (fileType.startsWith(`${baseType}/`)) return true
      if (
        baseType === 'image' &&
        (fileType === '' || fileType === 'application/octet-stream') &&
        IMAGE_EXTENSIONS.has(fileExtension)
      ) {
        return true
      }
      return false
    }

    if (acceptItem === fileType) return true
    return false
  })
}

/**
 * Validate file size
 * @param file - File to validate
 * @param maxSize - Maximum file size in bytes (`0` or `undefined` means no limit)
 * @returns True if file size is within limit
 */
export function validateFileSize(file: File, maxSize?: number): boolean {
  if (maxSize == null || maxSize <= 0) return true
  return file.size <= maxSize
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  return formatBytes(bytes, { precision: 2 })
}

/**
 * Get upload button classes
 * @param disabled - Whether the button is disabled
 * @returns Complete button class string
 */
export function getUploadButtonClasses(disabled: boolean): string {
  return resolveButtonClasses({ variant: 'outline', size: 'sm', disabled })
}

/**
 * Get drag area classes
 * @param isDragging - Whether currently dragging
 * @param disabled - Whether the drag area is disabled
 * @returns Complete drag area class string
 */
export function getDragAreaClasses(isDragging: boolean, disabled: boolean): string {
  const baseClasses = [
    'tiger-motion-aware',
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
    'w-full',
    'px-6',
    'py-8',
    'border-2',
    'border-dashed',
    'rounded-[var(--tiger-radius-md)]',
    '[transition:var(--tiger-transition-base)]',
    'focus:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--tiger-focus-ring)]'
  ]

  let stateClasses: string[]
  if (disabled) {
    stateClasses = [
      'border-[var(--tiger-border)]',
      'bg-[var(--tiger-surface-muted)]',
      'cursor-not-allowed',
      'text-[var(--tiger-text-secondary)]'
    ]
  } else if (isDragging) {
    stateClasses = [
      'border-[var(--tiger-primary)]',
      'bg-[var(--tiger-primary)]/10',
      'cursor-copy',
      'text-[var(--tiger-text)]'
    ]
  } else {
    stateClasses = [
      'border-[var(--tiger-border)]',
      'bg-[var(--tiger-surface)]',
      'hover:border-[var(--tiger-primary)]',
      'hover:bg-[var(--tiger-surface-muted)]',
      'cursor-pointer',
      'text-[var(--tiger-text)]'
    ]
  }

  return classNames(...baseClasses, ...stateClasses)
}

/**
 * File list item status classes (constant for performance)
 */
const FILE_LIST_STATUS_CLASSES: Record<NonNullable<UploadFileStatus>, string[]> = {
  ready: ['bg-[var(--tiger-surface-muted)]', 'hover:bg-[var(--tiger-surface-muted)]'],
  queued: ['bg-[var(--tiger-surface-muted)]', 'hover:bg-[var(--tiger-surface-muted)]'],
  uploading: ['bg-[var(--tiger-primary)]/10', 'text-[var(--tiger-text)]'],
  success: ['bg-[var(--tiger-success)]/10', 'text-[var(--tiger-text)]'],
  error: ['bg-[var(--tiger-error)]/10', 'text-[var(--tiger-text)]']
}

const PICTURE_CARD_STATUS_CLASSES: Record<NonNullable<UploadFileStatus>, string[]> = {
  ready: ['border-[var(--tiger-border)]'],
  queued: ['border-[var(--tiger-border)]'],
  uploading: ['border-[var(--tiger-primary)]', 'bg-[var(--tiger-primary)]/10'],
  success: ['border-[var(--tiger-border)]', 'hover:border-[var(--tiger-primary)]'],
  error: ['border-[var(--tiger-error)]', 'bg-[var(--tiger-error)]/10']
}

/**
 * Get file list item classes based on status
 * @param status - Upload file status
 * @returns Complete file list item class string
 */
export function getFileListItemClasses(status?: UploadFileStatus): string {
  const baseClasses = [
    'flex',
    'items-center',
    'justify-between',
    'px-3',
    'py-2',
    'rounded',
    'tiger-motion-aware',
    '[transition:var(--tiger-transition-base)]'
  ]

  const stateClasses = status ? FILE_LIST_STATUS_CLASSES[status] : FILE_LIST_STATUS_CLASSES.ready

  return classNames(...baseClasses, ...stateClasses)
}

/**
 * Get picture card item classes
 * @param status - Upload file status
 * @returns Complete picture card class string
 */
export function getPictureCardClasses(status?: UploadFileStatus): string {
  const baseClasses = [
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'w-32',
    'h-32',
    'border',
    'rounded-[var(--tiger-radius-md)]',
    'tiger-motion-aware',
    '[transition:var(--tiger-transition-base)]'
  ]

  const stateClasses = status
    ? PICTURE_CARD_STATUS_CLASSES[status]
    : PICTURE_CARD_STATUS_CLASSES.ready

  return classNames(...baseClasses, ...stateClasses)
}

export const uploadFileInputClasses = 'sr-only'
export const uploadListClasses = 'mt-4 flex flex-col gap-2'
export const uploadPictureListClasses = 'mt-4 flex flex-wrap gap-2'
export const uploadItemActionsClasses = 'flex items-center gap-2 ms-4'
export const uploadPictureOverlayClasses =
  'absolute inset-0 flex items-center justify-center gap-2 bg-[var(--tiger-text)]/50 opacity-0 hover:opacity-100 focus-within:opacity-100 tiger-motion-aware [transition:var(--tiger-transition-base)]'
export const uploadPictureImageWrapClasses =
  'absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none'
export const uploadProgressTrackClasses =
  'mt-1 h-1 w-full overflow-hidden rounded-full bg-[var(--tiger-border)]'
export const uploadProgressValueClasses =
  'h-full bg-[var(--tiger-primary)] tiger-motion-aware [transition:var(--tiger-transition-base)]'
export const uploadIconActionClasses =
  'inline-flex items-center justify-center text-[var(--tiger-text-secondary)] hover:text-[var(--tiger-error)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)] rounded-sm tiger-motion-aware [transition:var(--tiger-transition-base)] disabled:pointer-events-none disabled:opacity-50'

export function isImageUploadFile(file: Pick<UploadFile, 'type' | 'name' | 'url'>): boolean {
  if (file.type && file.type.toLowerCase().startsWith('image/')) return true
  if (file.url && /\.(avif|bmp|gif|ico|jpe?g|png|svg|tiff?|webp)(\?|$)/i.test(file.url)) return true
  return IMAGE_EXTENSIONS.has(getFileExtension(file.name))
}

export function isSubmittableUploadUrl(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false
  try {
    const protocol = new URL(url).protocol
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

/** Usable URL from an upload response. Missing URL must not fall back to the uid. */
export function readUploadResponseUrl(response: unknown): string | undefined {
  if (typeof response === 'string') {
    return isSubmittableUploadUrl(response) ? response : undefined
  }
  if (!response || typeof response !== 'object') return undefined
  const record = response as Record<string, unknown>
  for (const key of ['url', 'fileUrl', 'src']) {
    const value = record[key]
    if (typeof value === 'string' && isSubmittableUploadUrl(value)) return value
  }
  if (record.data && typeof record.data === 'object') return readUploadResponseUrl(record.data)
  return undefined
}

/**
 * Preview only `blob:` URLs and http(s) origins the caller listed.
 * `allowedOrigins` entries are origins (`https://cdn.example`) or full URL prefixes.
 */
export function filterUploadPreviewUrl(
  url: string | undefined,
  allowedOrigins?: readonly string[]
): string | undefined {
  if (!url) return undefined
  if (url.startsWith('blob:')) return url
  if (!isSubmittableUploadUrl(url)) return undefined
  if (!allowedOrigins || allowedOrigins.length === 0) return url
  let origin = ''
  try {
    origin = new URL(url).origin
  } catch {
    return undefined
  }
  const allowed = allowedOrigins.some(
    (entry) => entry === origin || entry === url || url.startsWith(entry)
  )
  return allowed ? url : undefined
}

/** URLs that native submit should include. Uids are never submitted. */
export function uploadSubmitValues(files: readonly UploadFile[]): string[] {
  const values: string[] = []
  for (const file of files) {
    if (file.url && isSubmittableUploadUrl(file.url)) values.push(file.url)
  }
  return values
}

export interface UploadPreviewUrlCache {
  get(file: UploadFile): string | undefined
  sync(files: UploadFile[]): void
  dispose(): void
}

export function createUploadPreviewUrlCache(): UploadPreviewUrlCache {
  const urls = new Map<string, string>()

  return {
    get(file) {
      return urls.get(file.uid) ?? file.url
    },
    sync(files) {
      const active = new Set(files.map((file) => file.uid))
      urls.forEach((url, uid) => {
        if (!active.has(uid)) {
          if (isBrowser()) URL.revokeObjectURL(url)
          urls.delete(uid)
        }
      })
      if (!isBrowser()) return
      for (const file of files) {
        if (file.url || !file.file || urls.has(file.uid) || !isImageUploadFile(file)) continue
        urls.set(file.uid, URL.createObjectURL(file.file))
      }
    },
    dispose() {
      if (isBrowser()) {
        urls.forEach((url) => URL.revokeObjectURL(url))
      }
      urls.clear()
    }
  }
}

export interface UploadDataTransferItemLike {
  kind?: string
  type?: string
  getAsFile?: () => File | null
  webkitGetAsEntry?: () => { isDirectory?: boolean; isFile?: boolean } | null
}

export interface UploadDropReadResult {
  files: File[]
  rejectedDirectories: File[]
}

export function readUploadDropFiles(
  dataTransfer?: (UploadDataTransferLike & { items?: ArrayLike<UploadDataTransferItemLike> }) | null
): UploadDropReadResult {
  const items = dataTransfer?.items
  if (!items || items.length === 0) {
    return { files: getUploadDataTransferFiles(dataTransfer), rejectedDirectories: [] }
  }

  const files: File[] = []
  const rejectedDirectories: File[] = []
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]
    const entry = item.webkitGetAsEntry?.() ?? null
    const file = item.getAsFile?.() ?? null
    if (entry?.isDirectory) {
      if (file) rejectedDirectories.push(file)
      else rejectedDirectories.push(new File([], 'directory'))
      continue
    }
    if (file) files.push(file)
  }
  return { files, rejectedDirectories }
}

export function startXhrUpload(options: {
  file: File
  action: string
  filename?: string
  method?: string
  headers?: Record<string, string>
  data?: Record<string, string | Blob>
  withCredentials?: boolean
  onProgress?: (progress: number) => void
  onSuccess?: (response: unknown) => void
  onError?: (error: Error) => void
}): { abort: () => void } {
  if (!isBrowser()) {
    options.onError?.(new Error('Upload is only available in the browser'))
    return { abort() {} }
  }

  const xhr = new XMLHttpRequest()
  const form = new FormData()
  form.append(options.filename ?? 'file', options.file)
  if (options.data) {
    for (const [key, value] of Object.entries(options.data)) {
      form.append(key, value)
    }
  }

  xhr.upload.onprogress = (event) => {
    if (!event.lengthComputable) return
    options.onProgress?.(Math.round((event.loaded / event.total) * 100))
  }
  xhr.onerror = () => options.onError?.(new Error('Network error'))
  xhr.onabort = () => options.onError?.(new Error('Upload aborted'))
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      const text = xhr.responseText
      try {
        options.onSuccess?.(text ? JSON.parse(text) : text)
      } catch {
        options.onSuccess?.(text)
      }
      return
    }
    options.onError?.(new Error(`Upload failed with status ${xhr.status}`))
  }

  xhr.open(options.method ?? 'POST', options.action)
  if (options.withCredentials) xhr.withCredentials = true
  if (options.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      xhr.setRequestHeader(key, value)
    }
  }
  xhr.send(form)
  return { abort: () => xhr.abort() }
}
