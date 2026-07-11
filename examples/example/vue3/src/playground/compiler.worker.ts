/// <reference lib="webworker" />

import * as esbuild from 'esbuild-wasm'
import wasmUrl from 'esbuild-wasm/esbuild.wasm?url'
import { compileScript, compileStyle, compileTemplate, parse } from '@vue/compiler-sfc'
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

function hashText(value: string): string {
  let hash = 2166136261
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

function compileVueFile(filename: string, source: string): { code: string; css: string } {
  const parsed = parse(source, { filename })
  if (parsed.errors.length > 0) throw parsed.errors[0]

  const descriptor = parsed.descriptor
  const id = hashText(`${filename}:${source}`)
  let code: string

  if (descriptor.script || descriptor.scriptSetup) {
    const script = compileScript(descriptor, {
      id,
      inlineTemplate: true,
      genDefaultAs: '__sfc__'
    })
    code = `${script.content}\nexport default __sfc__`
  } else if (descriptor.template) {
    const template = compileTemplate({
      id,
      filename,
      source: descriptor.template.content,
      scoped: descriptor.styles.some((style) => style.scoped)
    })
    if (template.errors.length > 0) throw template.errors[0]
    code = `${template.code.replace('export function render', 'function render')}\nexport default { render }`
  } else {
    code = 'export default {}'
  }

  if (descriptor.styles.some((style) => style.scoped)) {
    code += `\n__sfc__.__scopeId = "data-v-${id}"`
  }

  const css = descriptor.styles
    .map((style, index) => {
      if (style.lang && style.lang !== 'css') {
        throw new Error(`浏览器示例仅支持原生 CSS，不支持 <style lang="${style.lang}">`)
      }
      const result = compileStyle({
        id: `data-v-${id}`,
        filename: `${filename}?style=${index}`,
        source: style.content,
        scoped: style.scoped
      })
      if (result.errors.length > 0) throw result.errors[0]
      return result.code
    })
    .join('\n')

  return { code, css }
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
    const vueCss: string[] = []
    const result = await esbuild.build({
      entryPoints: [normalizeDemoPath(request.bundle.entry)],
      absWorkingDir: '/',
      bundle: true,
      write: false,
      outdir: '/out',
      format: 'esm',
      platform: 'browser',
      target: ['es2020'],
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
            build.onLoad({ filter: /.*/, namespace: 'demo' }, (args) => {
              if (args.path.endsWith('.vue')) {
                const compiled = compileVueFile(args.path, files[args.path])
                vueCss.push(compiled.css)
                return { contents: compiled.code, loader: 'ts' }
              }
              return { contents: files[args.path], loader: loaderForFile(args.path) }
            })
          }
        }
      ]
    })

    const js = result.outputFiles.find((file) => file.path.endsWith('.js'))?.text ?? ''
    const bundledCss = result.outputFiles.find((file) => file.path.endsWith('.css'))?.text ?? ''
    const response: DemoCompileSuccess = {
      type: 'compiled',
      requestId: request.requestId,
      js,
      css: [...vueCss, bundledCss].filter(Boolean).join('\n'),
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
