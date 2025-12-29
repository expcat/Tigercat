/**
 * Upload utility functions
 */

import type { UploadFile, UploadFileStatus } from '../types/upload'

/**
 * Generate a unique ID for uploaded files
 */
export function generateFileId(): string {
  return `upload-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
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
    file,
  }
}

/**
 * Validate file type against accept pattern
 */
export function validateFileType(file: File, accept?: string): boolean {
  if (!accept) return true

  const acceptList = accept.split(',').map((item) => item.trim())
  const fileName = file.name
  const fileType = file.type
  const fileExtension = fileName.includes('.') ? `.${fileName.split('.').pop()}` : ''

  return acceptList.some((acceptItem) => {
    // Check for exact MIME type match (e.g., 'image/png')
    if (acceptItem === fileType) return true

    // Check for wildcard MIME type (e.g., 'image/*')
    if (acceptItem.endsWith('/*')) {
      const baseType = acceptItem.split('/')[0]
      return fileType.startsWith(`${baseType}/`)
    }

    // Check for file extension match (e.g., '.png')
    if (acceptItem.startsWith('.')) {
      return fileExtension.toLowerCase() === acceptItem.toLowerCase()
    }

    return false
  })
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSize?: number): boolean {
  if (!maxSize) return true
  return file.size <= maxSize
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`
}

/**
 * Get upload button classes
 */
export function getUploadButtonClasses(drag: boolean, disabled: boolean): string {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'px-4',
    'py-2',
    'border',
    'border-gray-300',
    'rounded-md',
    'shadow-sm',
    'text-sm',
    'font-medium',
    'transition-colors',
    'duration-200',
  ]

  if (disabled) {
    baseClasses.push(
      'bg-gray-100',
      'text-gray-400',
      'cursor-not-allowed'
    )
  } else {
    baseClasses.push(
      'bg-white',
      'text-gray-700',
      'hover:bg-gray-50',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'focus:ring-[var(--tiger-primary,#2563eb)]',
      'cursor-pointer'
    )
  }

  return baseClasses.join(' ')
}

/**
 * Get drag area classes
 */
export function getDragAreaClasses(isDragging: boolean, disabled: boolean): string {
  const baseClasses = [
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
    'w-full',
    'px-6',
    'py-8',
    'border-2',
    'border-dashed',
    'rounded-lg',
    'transition-all',
    'duration-200',
  ]

  if (disabled) {
    baseClasses.push(
      'border-gray-200',
      'bg-gray-50',
      'cursor-not-allowed',
      'text-gray-400'
    )
  } else if (isDragging) {
    baseClasses.push(
      'border-[var(--tiger-primary,#2563eb)]',
      'bg-blue-50',
      'cursor-copy'
    )
  } else {
    baseClasses.push(
      'border-gray-300',
      'hover:border-[var(--tiger-primary,#2563eb)]',
      'hover:bg-gray-50',
      'cursor-pointer'
    )
  }

  return baseClasses.join(' ')
}

/**
 * Get file list item classes based on status
 */
export function getFileListItemClasses(status?: UploadFileStatus): string {
  const baseClasses = [
    'flex',
    'items-center',
    'justify-between',
    'px-3',
    'py-2',
    'rounded',
    'transition-colors',
    'duration-200',
  ]

  switch (status) {
    case 'uploading':
      baseClasses.push('bg-blue-50', 'text-blue-700')
      break
    case 'success':
      baseClasses.push('bg-green-50', 'text-green-700', 'hover:bg-green-100')
      break
    case 'error':
      baseClasses.push('bg-red-50', 'text-red-700', 'hover:bg-red-100')
      break
    default:
      baseClasses.push('bg-gray-50', 'hover:bg-gray-100')
  }

  return baseClasses.join(' ')
}

/**
 * Get picture card item classes
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
    'rounded-lg',
    'overflow-hidden',
    'transition-all',
    'duration-200',
  ]

  switch (status) {
    case 'uploading':
      baseClasses.push('border-blue-400', 'bg-blue-50')
      break
    case 'success':
      baseClasses.push('border-gray-300', 'hover:border-blue-400')
      break
    case 'error':
      baseClasses.push('border-red-400', 'bg-red-50')
      break
    default:
      baseClasses.push('border-gray-300')
  }

  return baseClasses.join(' ')
}
