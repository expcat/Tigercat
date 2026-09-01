/**
 * CropUpload session: pick file, object URL, generation, confirm/cancel.
 */

import type { CropResult } from '../types/image'
import { isBrowser } from './env'
import { formatBytes } from './file-utils'
import { validateFileSize, validateFileType } from './upload-utils'
import { classNames } from './class-names'

export const cropUploadTriggerClasses =
  'tiger-motion-aware inline-flex items-center justify-center gap-2.5 px-5 py-2.5 border-2 border-dashed border-[var(--tiger-border,#d1d5db)] rounded-[var(--tiger-radius-lg,0.75rem)] text-[var(--tiger-text-muted,#4b5563)] bg-[var(--tiger-surface-muted,#f9fafb)] hover:bg-[var(--tiger-surface,#ffffff)] hover:border-[var(--tiger-primary,#2563eb)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'

export const cropUploadTriggerDisabledClasses =
  'inline-flex items-center justify-center gap-2.5 px-5 py-2.5 border-2 border-dashed border-[var(--tiger-border,#d1d5db)] rounded-[var(--tiger-radius-lg,0.75rem)] text-[var(--tiger-text-muted,#9ca3af)] bg-[var(--tiger-surface-muted,#f9fafb)] cursor-not-allowed opacity-60'

/** @deprecated Use Icon name="plus". */
export const uploadPlusIconPath = 'M12 4v16m8-8H4'

export function validateUploadFile(file: File | null | undefined, maxSize?: number): Error | null {
  if (!file) return null
  if (!validateFileSize(file, maxSize)) {
    return new Error(`File size exceeds maximum of ${formatBytes(maxSize)}`)
  }
  return null
}

export function fileFromCropResult(result: CropResult, originalName: string): File {
  const type = result.blob.type || 'image/png'
  return new File([result.blob], originalName || result.file?.name || 'crop.png', {
    type,
    lastModified: Date.now()
  })
}

export function withCropFile(result: CropResult, originalName: string): CropResult {
  const file = fileFromCropResult(result, originalName)
  return { ...result, file }
}

export interface CropUploadSessionState {
  generation: number
  modalOpen: boolean
  imageSrc: string
  originalFile: File | null
  cropperReady: boolean
  cropping: boolean
}

export interface CropUploadSession {
  getState(): CropUploadSessionState
  selectFile(file: File | null | undefined): boolean
  markReady(): void
  markLoadError(error?: Error): void
  beginCrop(): boolean
  endCrop(): void
  close(): void
  dispose(): void
}

function emptyState(generation = 0): CropUploadSessionState {
  return {
    generation,
    modalOpen: false,
    imageSrc: '',
    originalFile: null,
    cropperReady: false,
    cropping: false
  }
}

export function createCropUploadSession(options: {
  getAccept: () => string | undefined
  getMaxSize: () => number | undefined
  getSizeError: (maxSize: number) => string
  getTypeError: () => string
  onState: (state: CropUploadSessionState) => void
  onError: (error: Error) => void
}): CropUploadSession {
  let state = emptyState()
  let currentUrl = ''

  const createUrl = (file: File): string => {
    if (!isBrowser() || typeof URL.createObjectURL !== 'function') return ''
    return URL.createObjectURL(file)
  }
  const revokeUrl = (url: string): void => {
    if (url && isBrowser() && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(url)
    }
  }

  const setState = (patch: Partial<CropUploadSessionState>): void => {
    state = { ...state, ...patch }
    options.onState(state)
  }

  const clearImage = (generation = state.generation): void => {
    if (currentUrl) {
      revokeUrl(currentUrl)
      currentUrl = ''
    }
    setState({
      generation,
      modalOpen: false,
      imageSrc: '',
      originalFile: null,
      cropperReady: false,
      cropping: false
    })
  }

  return {
    getState: () => state,
    selectFile(file) {
      if (!file) return false
      const accept = options.getAccept() ?? 'image/*'
      if (!validateFileType(file, accept)) {
        options.onError(new Error(options.getTypeError()))
        return false
      }
      const maxSize = options.getMaxSize()
      if (!validateFileSize(file, maxSize)) {
        options.onError(new Error(options.getSizeError(maxSize ?? 0)))
        return false
      }
      const generation = state.generation + 1
      if (currentUrl) revokeUrl(currentUrl)
      currentUrl = createUrl(file)
      setState({
        generation,
        modalOpen: true,
        imageSrc: currentUrl,
        originalFile: file,
        cropperReady: false,
        cropping: false
      })
      return true
    },
    markReady() {
      if (!state.modalOpen) return
      setState({ cropperReady: true })
    },
    markLoadError(error) {
      options.onError(error ?? new Error('Image not loaded'))
    },
    beginCrop() {
      if (!state.cropperReady || state.cropping) return false
      setState({ cropping: true })
      return true
    },
    endCrop() {
      setState({ cropping: false })
    },
    close() {
      clearImage(state.generation + 1)
    },
    dispose() {
      clearImage(state.generation + 1)
    }
  }
}

export function getCropUploadTriggerClasses(disabled: boolean, className?: string): string {
  return classNames(
    disabled ? cropUploadTriggerDisabledClasses : cropUploadTriggerClasses,
    className
  )
}

/** @deprecated Vue ImageCropper expose is typed; call getCropResult directly. */
export async function getCropperResult(
  cropper: { getCropResult: () => Promise<CropResult> } | null | undefined
): Promise<CropResult | null> {
  if (!cropper) return null
  return await cropper.getCropResult()
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => resolve((ev.target?.result as string) ?? '')
    reader.onerror = () => reject(reader.error ?? new Error('Failed to load file'))
    reader.readAsDataURL(file)
  })
}
