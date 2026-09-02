/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { createCompilerClient } from '../../examples/example/shared/playground/compiler-client'
import { createSandboxDocument } from '../../examples/example/shared/playground/sandbox'
import {
  diagnosticsIncludeWasmOutOfMemory,
  isBenignSandboxRuntimeError,
  isWasmOutOfMemoryError
} from '../../examples/example/shared/playground/sandbox-errors'
import type {
  DemoCompileRequest,
  DemoSourceBundle
} from '../../examples/example/shared/playground/types'

const WASM_OOM =
  'WebAssembly.instantiate(): Out of memory: Cannot allocate Wasm memory for new instance'

const bundle: DemoSourceBundle = {
  entry: '/App.vue',
  files: { '/App.vue': '<template><div /></template>' },
  sourceHash: 'test'
}

function sandboxOptions(enableTailwindJit?: boolean) {
  return {
    framework: 'vue' as const,
    meta: { id: 'demo', title: 'Demo', entry: '/App.vue', order: 1 },
    js: 'export default {}',
    css: '',
    imports: [] as string[],
    runtimeUrls: {
      framework: '/vue.js',
      tigercat: '/tigercat.js',
      core: '/core.js',
      shared: '/shared.js',
      tailwind: '/tailwind.js'
    },
    stylesheetUrl: '/parent.css',
    channelId: 'channel-1',
    lang: 'zh-CN' as const,
    theme: 'classic',
    colorScheme: 'light' as const,
    cssVars: '',
    enableTailwindJit
  }
}

describe('example playground sandbox', () => {
  it('treats Chrome ResizeObserver loop notices as benign', () => {
    expect(
      isBenignSandboxRuntimeError('ResizeObserver loop completed with undelivered notifications.')
    ).toBe(true)
    expect(isBenignSandboxRuntimeError('TypeError: boom')).toBe(false)
  })

  it('detects Wasm out-of-memory compile diagnostics', () => {
    expect(isWasmOutOfMemoryError(WASM_OOM)).toBe(true)
    expect(diagnosticsIncludeWasmOutOfMemory([{ text: WASM_OOM }])).toBe(true)
    expect(diagnosticsIncludeWasmOutOfMemory([{ text: 'syntax error' }])).toBe(false)
  })

  it('does not load Tailwind browser Wasm for stock demos', () => {
    const stock = createSandboxDocument(sandboxOptions())
    expect(stock).toContain('/parent.css')
    expect(stock).not.toContain('/tailwind.js')

    const edited = createSandboxDocument(sandboxOptions(true))
    expect(edited).toContain('/tailwind.js')
  })

  it('terminates the compiler worker and retries once after Wasm OOM', async () => {
    let created = 0
    let attempts = 0

    const client = createCompilerClient(() => {
      created += 1
      return {
        onmessage: null,
        onmessageerror: null,
        onerror: null,
        postMessage(data: DemoCompileRequest) {
          attempts += 1
          queueMicrotask(() => {
            const payload =
              attempts === 1
                ? {
                    type: 'compile-error' as const,
                    requestId: data.requestId,
                    diagnostics: [{ text: WASM_OOM }]
                  }
                : {
                    type: 'compiled' as const,
                    requestId: data.requestId,
                    js: 'ok',
                    css: '',
                    imports: []
                  }
            this.onmessage?.({ data: payload } as MessageEvent)
          })
        },
        terminate() {}
      } as unknown as Worker
    })

    const result = await client.compile(bundle)
    expect(result.js).toBe('ok')
    expect(created).toBe(2)
    expect(attempts).toBe(2)
  })
})
