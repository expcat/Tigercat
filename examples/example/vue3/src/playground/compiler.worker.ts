/// <reference lib="webworker" />

import { scanImports, toDiagnostic, transformModule } from '@demo-shared/playground/compiler-utils'
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
    const source = request.bundle.files[request.bundle.entry]
    if (source === undefined) throw new Error(`找不到示例入口：${request.bundle.entry}`)
    const compiled = compileVueFile(request.bundle.entry, source)
    const js = transformModule(compiled.code, { filename: request.bundle.entry, jsx: false })
    const imports = await scanImports(js)
    const response: DemoCompileSuccess = {
      type: 'compiled',
      requestId: request.requestId,
      js,
      css: compiled.css,
      imports
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
