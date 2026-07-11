/// <reference lib="webworker" />

import * as esbuild from 'esbuild-wasm'
import wasmUrl from 'esbuild-wasm/esbuild.wasm?url'
import {
  isAllowedImport,
  isBareImport,
  loaderForFile,
  normalizeDemoPath,
  resolveDemoFile,
  toDiagnostics
} from '@demo-shared/playground/compiler-utils'
import type {
  DemoCompileRequest,
  DemoCompileResponse,
  DemoCompileSuccess
} from '@demo-shared/playground/types'

let initializePromise: Promise<void> | null = null

function ensureEsbuild() {
  initializePromise ??= esbuild.initialize({ wasmURL: wasmUrl, worker: false })
  return initializePromise
}

self.onmessage = async (event: MessageEvent<DemoCompileRequest>) => {
  const request = event.data
  if (request.type !== 'compile') return

  try {
    await ensureEsbuild()
    const files = Object.fromEntries(
      Object.entries(request.bundle.files).map(([path, source]) => [
        normalizeDemoPath(path),
        source
      ])
    )
    const imports = new Set<string>()
    const result = await esbuild.build({
      entryPoints: [normalizeDemoPath(request.bundle.entry)],
      absWorkingDir: '/',
      bundle: true,
      write: false,
      outdir: '/out',
      format: 'esm',
      platform: 'browser',
      target: ['es2020'],
      jsx: 'automatic',
      sourcemap: 'inline',
      plugins: [
        {
          name: 'demo-files',
          setup(build) {
            build.onResolve({ filter: /.*/ }, (args) => {
              if (isBareImport(args.path)) {
                if (!isAllowedImport(args.path)) {
                  return { errors: [{ text: `不允许导入外部模块：${args.path}` }] }
                }
                imports.add(args.path)
                return { path: args.path, external: true }
              }
              if (args.kind === 'entry-point') {
                return { path: normalizeDemoPath(args.path), namespace: 'demo' }
              }
              const resolved = resolveDemoFile(files, args.importer, args.path)
              return resolved
                ? { path: resolved, namespace: 'demo' }
                : { errors: [{ text: `找不到示例文件：${args.path}` }] }
            })
            build.onLoad({ filter: /.*/, namespace: 'demo' }, (args) => ({
              contents: files[args.path],
              loader: loaderForFile(args.path)
            }))
          }
        }
      ]
    })

    const js = result.outputFiles.find((file) => file.path.endsWith('.js'))?.text ?? ''
    const css = result.outputFiles.find((file) => file.path.endsWith('.css'))?.text ?? ''
    const response: DemoCompileSuccess = {
      type: 'compiled',
      requestId: request.requestId,
      js,
      css,
      imports: [...imports].sort()
    }
    self.postMessage(response satisfies DemoCompileResponse)
  } catch (error) {
    const diagnostics =
      error && typeof error === 'object' && 'errors' in error
        ? toDiagnostics((error as { errors: esbuild.Message[] }).errors)
        : [{ text: error instanceof Error ? error.message : String(error) }]
    self.postMessage({
      type: 'compile-error',
      requestId: request.requestId,
      diagnostics
    } satisfies DemoCompileResponse)
  }
}
