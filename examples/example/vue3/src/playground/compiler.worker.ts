/// <reference lib="webworker" />

import {
  compileDemoBundle,
  toDiagnostic,
  transformModule
} from '@demo-shared/playground/compiler-utils'
import type {
  DemoCompileRequest,
  DemoCompileResponse,
  DemoCompileSuccess
} from '@demo-shared/playground/types'
import { compileVueFile } from './vue-sfc'

self.onmessage = async (event: MessageEvent<DemoCompileRequest>) => {
  const request = event.data
  if (request.type !== 'compile') return

  try {
    const compiled = await compileDemoBundle({
      bundle: request.bundle,
      compileFile(filename, source) {
        if (filename.endsWith('.vue')) return compileVueFile(filename, source)
        return {
          code: transformModule(source, { filename, jsx: false }),
          css: ''
        }
      }
    })
    const response: DemoCompileSuccess = {
      type: 'compiled',
      requestId: request.requestId,
      js: compiled.js,
      css: compiled.css,
      imports: compiled.imports,
      modules: compiled.modules
    }
    self.postMessage(response satisfies DemoCompileResponse)
  } catch (error) {
    self.postMessage({
      type: 'compile-error',
      requestId: request.requestId,
      diagnostics: [toDiagnostic(error)]
    } satisfies DemoCompileResponse)
  }
}
