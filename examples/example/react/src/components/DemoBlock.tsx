import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { CodeEditor } from '@expcat/tigercat-react/CodeEditor'
import { copyTextToClipboard } from '@expcat/tigercat-core'
import runtimeUrlsValue from 'virtual:tigercat-playground-runtime'
import type {
  DemoCompileResponse,
  DemoCompileSuccess,
  DemoDiagnostic,
  DemoModuleDescriptor,
  DemoSourceBundle
} from '@demo-shared/playground/types'
import {
  createSandboxDocument,
  getSandboxAttribute,
  isSandboxEvent
} from '@demo-shared/playground/sandbox'
import { useLang } from '../context/lang'
import stylesheetUrl from '../index.css?url'

interface DemoBlockProps {
  module: DemoModuleDescriptor
  className?: string
}

interface ConsoleEntry {
  level: string
  message: string
}

let compilerWorker: Worker | null = null
let nextRequestId = 1
const pendingCompiles = new Map<
  number,
  { resolve: (result: DemoCompileSuccess) => void; reject: (diagnostics: DemoDiagnostic[]) => void }
>()

function getCompilerWorker(): Worker {
  if (compilerWorker) return compilerWorker
  compilerWorker = new Worker(new URL('../playground/compiler.worker.ts', import.meta.url), {
    type: 'module'
  })
  compilerWorker.onmessage = (event: MessageEvent<DemoCompileResponse>) => {
    const pending = pendingCompiles.get(event.data.requestId)
    if (!pending) return
    pendingCompiles.delete(event.data.requestId)
    if (event.data.type === 'compiled') pending.resolve(event.data)
    else pending.reject(event.data.diagnostics)
  }
  return compilerWorker
}

function compileBundle(bundle: DemoSourceBundle): Promise<DemoCompileSuccess> {
  const requestId = nextRequestId++
  return new Promise((resolve, reject) => {
    pendingCompiles.set(requestId, { resolve, reject })
    getCompilerWorker().postMessage({ type: 'compile', requestId, bundle })
  })
}

function normalizeDiagnostics(error: unknown): DemoDiagnostic[] {
  if (Array.isArray(error)) return error as DemoDiagnostic[]
  return [{ text: error instanceof Error ? error.message : String(error) }]
}

function absoluteRuntimeUrls() {
  return Object.fromEntries(
    Object.entries(runtimeUrlsValue).map(([key, value]) => [
      key,
      value ? new URL(value, window.location.origin).href : value
    ])
  ) as typeof runtimeUrlsValue
}

function languageForFile(file: string): 'typescript' | 'javascript' | 'css' | 'json' | 'plain' {
  if (/\.tsx?$/.test(file)) return 'typescript'
  if (/\.jsx?$/.test(file)) return 'javascript'
  if (file.endsWith('.css')) return 'css'
  if (file.endsWith('.json')) return 'json'
  return 'plain'
}

export default function DemoBlock({ module, className }: DemoBlockProps) {
  const { lang } = useLang()
  const sectionRef = useRef<HTMLElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const latestRunRef = useRef(0)
  const sandboxReadyRef = useRef(false)
  const [visible, setVisible] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [originalBundle, setOriginalBundle] = useState<DemoSourceBundle | null>(null)
  const [files, setFiles] = useState<Record<string, string>>({})
  const [selectedFile, setSelectedFile] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'ready' | 'dirty' | 'compiling' | 'compile-error' | 'runtime-error'
  >('idle')
  const [diagnostics, setDiagnostics] = useState<DemoDiagnostic[]>([])
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([])
  const [compiled, setCompiled] = useState<DemoCompileSuccess | null>(null)
  const [sandbox, setSandbox] = useState<{ channelId: string; document: string } | null>(null)
  const [iframeHeight, setIframeHeight] = useState(module.meta.viewport?.height ?? 180)
  const [themeVersion, setThemeVersion] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '500px 0px' }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeVersion((value) => value + 1))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-tiger-style']
    })
    return () => observer.disconnect()
  }, [])

  const isDirty = useMemo(() => {
    if (!originalBundle) return false
    return Object.keys(files).some((file) => files[file] !== originalBundle.files[file])
  }, [files, originalBundle])

  const rebuildSandbox = useCallback(
    (result: DemoCompileSuccess) => {
      sandboxReadyRef.current = false
      const channelId = crypto.randomUUID()
      const dark = document.documentElement.classList.contains('dark')
      const modern = document.documentElement.dataset.tigerStyle === 'modern'
      setSandbox({
        channelId,
        document: createSandboxDocument({
          framework: 'react',
          meta: module.meta,
          js: result.js,
          css: result.css,
          imports: result.imports,
          runtimeUrls: absoluteRuntimeUrls(),
          stylesheetUrl: new URL(stylesheetUrl, window.location.origin).href,
          channelId,
          lang,
          dark,
          modern
        })
      })
    },
    [lang, module.meta]
  )

  const run = useCallback(
    async (bundle: DemoSourceBundle) => {
      const runId = ++latestRunRef.current
      setStatus('compiling')
      setDiagnostics([])
      setConsoleEntries([])
      try {
        const result = await compileBundle(bundle)
        if (runId !== latestRunRef.current) return
        setCompiled(result)
        rebuildSandbox(result)
      } catch (error) {
        if (runId !== latestRunRef.current) return
        setDiagnostics(normalizeDiagnostics(error))
        setStatus('compile-error')
      }
    },
    [rebuildSandbox]
  )

  useEffect(() => {
    if (!visible || originalBundle) return
    let cancelled = false
    setStatus('loading')
    module
      .loadSource()
      .then((bundle) => {
        if (cancelled) return
        setOriginalBundle(bundle)
        setFiles(bundle.files)
        setSelectedFile(bundle.entry)
        return run(bundle)
      })
      .catch((error) => {
        if (cancelled) return
        setDiagnostics([{ text: error instanceof Error ? error.message : String(error) }])
        setStatus('compile-error')
      })
    return () => {
      cancelled = true
    }
  }, [module, originalBundle, run, visible])

  useEffect(() => {
    if (compiled && sandboxReadyRef.current) rebuildSandbox(compiled)
    // themeVersion intentionally invalidates the sandbox without recompiling source.
  }, [compiled, rebuildSandbox, themeVersion])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        !sandbox ||
        event.source !== iframeRef.current?.contentWindow ||
        !isSandboxEvent(event.data)
      )
        return
      if (event.data.channelId !== sandbox.channelId) return
      if (event.data.type === 'ready') {
        sandboxReadyRef.current = true
        setStatus(isDirty ? 'dirty' : 'ready')
      }
      if (event.data.type === 'runtime-error') {
        setDiagnostics([{ text: event.data.message ?? '示例运行失败' }])
        setStatus('runtime-error')
      }
      if (event.data.type === 'console') {
        setConsoleEntries((entries) =>
          [
            ...entries,
            { level: event.data.level ?? 'log', message: event.data.message ?? '' }
          ].slice(-100)
        )
      }
      if (event.data.type === 'resize' && module.meta.viewport?.mode !== 'fixed') {
        const min = module.meta.viewport?.minHeight ?? 120
        const max = module.meta.viewport?.maxHeight ?? 720
        setIframeHeight(Math.min(max, Math.max(min, event.data.height ?? min)))
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [isDirty, module.meta.viewport, sandbox])

  const handleRun = () => {
    if (!originalBundle) return
    void run({ ...originalBundle, files })
  }

  const handleReset = () => {
    if (!originalBundle) return
    setFiles(originalBundle.files)
    setSelectedFile(originalBundle.entry)
    void run(originalBundle)
  }

  const sectionClasses = className ? `mb-12 ${className}` : 'mb-12'
  const selectedSource = files[selectedFile] ?? ''

  return (
    <section ref={sectionRef} className={sectionClasses} data-demo-id={module.meta.id}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2 dark:text-gray-100">{module.meta.title}</h2>
        {module.meta.description ? (
          <p className="text-gray-600 dark:text-gray-400">{module.meta.description}</p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/40">
        <div className="relative bg-white dark:bg-gray-950">
          {!sandbox ? (
            <div
              className="flex min-h-32 items-center justify-center text-sm text-gray-500"
              role="status">
              {status === 'compile-error' ? '示例编译失败' : '正在准备独立示例…'}
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              title={`${module.meta.title} 示例预览`}
              srcDoc={sandbox.document}
              sandbox={getSandboxAttribute(module.meta)}
              allow={
                (module.meta.permissions ?? []).includes('fullscreen') ? 'fullscreen' : undefined
              }
              className="block w-full border-0 bg-transparent"
              style={{ height: module.meta.viewport?.height ?? iframeHeight }}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 px-3 py-2 dark:border-gray-800">
          <Button size="sm" variant="secondary" onClick={() => setEditorOpen((open) => !open)}>
            {editorOpen ? '收起源码' : '编辑源码'}
          </Button>
          {editorOpen ? (
            <>
              <Button
                size="sm"
                onClick={handleRun}
                disabled={!originalBundle || status === 'compiling'}>
                {status === 'compiling' ? '编译中…' : '运行'}
              </Button>
              <Button size="sm" variant="secondary" onClick={handleReset} disabled={!isDirty}>
                重置
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void copyTextToClipboard(selectedSource)}>
                复制当前文件
              </Button>
            </>
          ) : null}
          <span className="ml-auto text-xs text-gray-500" aria-live="polite">
            {isDirty && status !== 'compiling' ? '已修改 · 尚未运行' : status}
          </span>
        </div>

        {editorOpen ? (
          <div className="border-t border-gray-200 p-3 dark:border-gray-800">
            <div className="mb-2 flex flex-wrap gap-1" role="tablist" aria-label="示例文件">
              {Object.keys(files)
                .sort()
                .map((file) => (
                  <button
                    key={file}
                    type="button"
                    role="tab"
                    aria-selected={selectedFile === file}
                    className={`rounded px-2 py-1 text-xs ${
                      selectedFile === file
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                    }`}
                    onClick={() => setSelectedFile(file)}>
                    {file.slice(1)}
                  </button>
                ))}
            </div>
            <div
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  event.preventDefault()
                  handleRun()
                }
              }}>
              <CodeEditor
                value={selectedSource}
                language={languageForFile(selectedFile)}
                theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                minLines={8}
                maxLines={24}
                onChange={(value) => {
                  setFiles((current) => ({ ...current, [selectedFile]: value }))
                  setStatus('dirty')
                }}
              />
            </div>
          </div>
        ) : null}

        {diagnostics.length > 0 ? (
          <div className="border-t border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            {diagnostics.map((diagnostic, index) => (
              <div key={`${diagnostic.text}-${index}`}>
                {diagnostic.file
                  ? `${diagnostic.file}:${diagnostic.line ?? 0}:${diagnostic.column ?? 0} `
                  : ''}
                {diagnostic.text}
              </div>
            ))}
          </div>
        ) : null}

        {editorOpen && consoleEntries.length > 0 ? (
          <details className="border-t border-gray-200 p-3 text-xs dark:border-gray-800">
            <summary className="cursor-pointer">控制台（{consoleEntries.length}）</summary>
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap">
              {consoleEntries.map((entry) => `[${entry.level}] ${entry.message}`).join('\n')}
            </pre>
          </details>
        ) : null}
      </div>
    </section>
  )
}
