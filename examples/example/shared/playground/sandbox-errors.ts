/** Chrome reports this when a ResizeObserver callback mutates observed layout. */
export const RESIZE_OBSERVER_LOOP_MESSAGE =
  'ResizeObserver loop completed with undelivered notifications'

export const RESIZE_OBSERVER_LOOP = new RegExp(RESIZE_OBSERVER_LOOP_MESSAGE, 'i')

export const WASM_OUT_OF_MEMORY = /WebAssembly\.instantiate[\s\S]*Out of memory/i

export function isBenignSandboxRuntimeError(message: string | undefined): boolean {
  return Boolean(message && RESIZE_OBSERVER_LOOP.test(message))
}

export function isWasmOutOfMemoryError(message: string | undefined): boolean {
  return Boolean(message && WASM_OUT_OF_MEMORY.test(message))
}

export function diagnosticsIncludeWasmOutOfMemory(
  diagnostics: Array<{ text: string }> | undefined
): boolean {
  return Boolean(diagnostics?.some((diagnostic) => isWasmOutOfMemoryError(diagnostic.text)))
}

/**
 * Chrome promotes the ResizeObserver loop notice to `window.onerror`.
 * Swallow it on the Example host so overlay autoUpdate does not paint a banner.
 */
export function installBenignSandboxErrorFilter(): () => void {
  const onError = (event: ErrorEvent) => {
    if (!isBenignSandboxRuntimeError(event.message)) return
    event.preventDefault()
  }
  window.addEventListener('error', onError)
  return () => window.removeEventListener('error', onError)
}
