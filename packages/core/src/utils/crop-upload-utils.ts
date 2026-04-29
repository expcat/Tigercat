/**
 * CropUpload shared helpers
 *
 * Pure file-handling helpers extracted from Vue / React CropUpload.
 * No framework imports — both wrappers can delegate input change handling
 * to the same validation + read pipeline.
 */

import type { CropResult } from '../types/image'

/**
 * Validate an upload candidate against an optional `maxSize` (bytes).
 *
 * Returns `null` when the file is missing or `maxSize` is undefined / passed.
 * Returns an `Error` describing the violation otherwise (caller emits / calls onError).
 */
export function validateUploadFile(file: File | null | undefined, maxSize?: number): Error | null {
  if (!file) return null
  if (typeof maxSize === 'number' && maxSize > 0 && file.size > maxSize) {
    return new Error(`File size exceeds maximum of ${maxSize} bytes`)
  }
  return null
}

/**
 * Read a `File` as a `data:` URL using `FileReader`.
 *
 * Resolves with the URL string on success, rejects with the underlying
 * `FileReader` error otherwise.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => resolve((ev.target?.result as string) ?? '')
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Awaits the cropper's `getCropResult()` with consistent null-handling.
 *
 * Returns `null` when no cropper instance is provided so the caller can
 * short-circuit without a try/catch wrapper around a `?.` chain.
 */
export async function getCropperResult(
  cropper: { getCropResult: () => Promise<CropResult> } | null | undefined
): Promise<CropResult | null> {
  if (!cropper) return null
  return await cropper.getCropResult()
}
