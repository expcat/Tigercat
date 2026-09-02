import type {
  DemoCompileResponse,
  DemoCompileSuccess,
  DemoDiagnostic,
  DemoSourceBundle
} from './types'
import { diagnosticsIncludeWasmOutOfMemory } from './sandbox-errors'

export interface CompilerClient {
  compile(bundle: DemoSourceBundle): Promise<DemoCompileSuccess>
}

/** Drop a long-lived worker before Chrome hits the per-origin Wasm instance cap. */
const RECYCLE_AFTER_COMPILES = 24

/**
 * Shared Example compiler host. Vue and React each pass their worker URL.
 * On Wasm OOM the worker is terminated and the compile is retried once so a
 * long SPA session does not leave a dead worker permanently failing every demo.
 */
export function createCompilerClient(createWorker: () => Worker): CompilerClient {
  let worker: Worker | null = null
  let nextRequestId = 1
  let compilesSinceReset = 0
  let oomRecovery: Promise<void> | null = null
  const pending = new Map<
    number,
    {
      resolve: (result: DemoCompileSuccess) => void
      reject: (diagnostics: DemoDiagnostic[]) => void
    }
  >()

  function failAll(diagnostics: DemoDiagnostic[]): void {
    const waiting = [...pending.values()]
    pending.clear()
    for (const entry of waiting) entry.reject(diagnostics)
  }

  function resetWorker(): void {
    if (!worker) return
    worker.terminate()
    worker = null
    compilesSinceReset = 0
  }

  function recoverFromOom(diagnostics: DemoDiagnostic[]): Promise<void> {
    if (!oomRecovery) {
      resetWorker()
      failAll(diagnostics)
      oomRecovery = Promise.resolve().then(() => {
        oomRecovery = null
      })
    }
    return oomRecovery
  }

  function attach(next: Worker): void {
    next.onmessage = (event: MessageEvent<DemoCompileResponse>) => {
      const queued = pending.get(event.data.requestId)
      if (!queued) return
      pending.delete(event.data.requestId)
      if (event.data.type === 'compiled') queued.resolve(event.data)
      else queued.reject(event.data.diagnostics)
    }
    next.onmessageerror = () => {
      resetWorker()
      failAll([{ text: '示例编译通道中断，请重试' }])
    }
    next.onerror = (event: ErrorEvent) => {
      const message = event.message?.trim() ? event.message : '示例编译失败'
      resetWorker()
      failAll([{ text: message }])
    }
  }

  function getWorker(): Worker {
    if (worker) return worker
    worker = createWorker()
    attach(worker)
    return worker
  }

  function post(bundle: DemoSourceBundle): Promise<DemoCompileSuccess> {
    const requestId = nextRequestId++
    return new Promise((resolve, reject) => {
      pending.set(requestId, { resolve, reject })
      getWorker().postMessage({ type: 'compile', requestId, bundle })
    })
  }

  return {
    async compile(bundle: DemoSourceBundle): Promise<DemoCompileSuccess> {
      try {
        const result = await post(bundle)
        compilesSinceReset++
        if (compilesSinceReset >= RECYCLE_AFTER_COMPILES && pending.size === 0) {
          resetWorker()
        }
        return result
      } catch (error) {
        if (!diagnosticsIncludeWasmOutOfMemory(error as DemoDiagnostic[])) throw error
        await recoverFromOom(error as DemoDiagnostic[])
        return post(bundle)
      }
    }
  }
}
