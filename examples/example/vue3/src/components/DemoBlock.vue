<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { CodeEditor } from '@expcat/tigercat-vue/CodeEditor'
import { copyTextToClipboard } from '@expcat/tigercat-core'
import runtimeUrlsValue from 'virtual:tigercat-playground-runtime'
import type { DemoLang } from '@demo-shared/app-config'
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
import stylesheetUrl from '../style.css?url'

const props = defineProps<{
  module: DemoModuleDescriptor
  class?: string
}>()

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

function languageForFile(
  file: string
): 'typescript' | 'javascript' | 'html' | 'css' | 'json' | 'plain' {
  if (/\.tsx?$/.test(file)) return 'typescript'
  if (/\.jsx?$/.test(file)) return 'javascript'
  if (file.endsWith('.vue')) return 'html'
  if (file.endsWith('.css')) return 'css'
  if (file.endsWith('.json')) return 'json'
  return 'plain'
}

const demoLang = inject<Ref<DemoLang>>('demo-lang', ref<DemoLang>('zh-CN'))
const sectionRef = ref<HTMLElement | null>(null)
const iframeRef = ref<HTMLIFrameElement | null>(null)
const visible = ref(false)
const editorOpen = ref(false)
const originalBundle = ref<DemoSourceBundle | null>(null)
const files = ref<Record<string, string>>({})
const selectedFile = ref('')
const status = ref<
  'idle' | 'loading' | 'ready' | 'dirty' | 'compiling' | 'compile-error' | 'runtime-error'
>('idle')
const diagnostics = ref<DemoDiagnostic[]>([])
const consoleEntries = ref<ConsoleEntry[]>([])
const compiled = ref<DemoCompileSuccess | null>(null)
const sandbox = ref<{ channelId: string; document: string } | null>(null)
const iframeHeight = ref(props.module.meta.viewport?.height ?? 180)
const themeVersion = ref(0)
let latestRun = 0
let intersectionObserver: IntersectionObserver | null = null
let themeObserver: MutationObserver | null = null

const isDirty = computed(() => {
  if (!originalBundle.value) return false
  return Object.keys(files.value).some(
    (file) => files.value[file] !== originalBundle.value?.files[file]
  )
})
const selectedSource = computed(() => files.value[selectedFile.value] ?? '')
const sectionClasses = computed(() => (props.class ? `mb-12 ${props.class}` : 'mb-12'))
const editorTheme = computed(() =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light'
)

function rebuildSandbox(result: DemoCompileSuccess) {
  const channelId = crypto.randomUUID()
  sandbox.value = {
    channelId,
    document: createSandboxDocument({
      framework: 'vue',
      meta: props.module.meta,
      js: result.js,
      css: result.css,
      imports: result.imports,
      runtimeUrls: absoluteRuntimeUrls(),
      stylesheetUrl: new URL(stylesheetUrl, window.location.origin).href,
      channelId,
      lang: demoLang.value,
      dark: document.documentElement.classList.contains('dark'),
      modern: document.documentElement.dataset.tigerStyle === 'modern'
    })
  }
}

async function run(bundle: DemoSourceBundle) {
  const runId = ++latestRun
  status.value = 'compiling'
  diagnostics.value = []
  consoleEntries.value = []
  try {
    const result = await compileBundle(bundle)
    if (runId !== latestRun) return
    compiled.value = result
    rebuildSandbox(result)
  } catch (error) {
    if (runId !== latestRun) return
    diagnostics.value = normalizeDiagnostics(error)
    status.value = 'compile-error'
  }
}

async function loadAndRun() {
  if (originalBundle.value) return
  status.value = 'loading'
  try {
    const bundle = await props.module.loadSource()
    originalBundle.value = bundle
    files.value = { ...bundle.files }
    selectedFile.value = bundle.entry
    await run(bundle)
  } catch (error) {
    diagnostics.value = [{ text: error instanceof Error ? error.message : String(error) }]
    status.value = 'compile-error'
  }
}

function handleRun() {
  if (!originalBundle.value) return
  void run({ ...originalBundle.value, files: { ...files.value } })
}

function handleReset() {
  if (!originalBundle.value) return
  files.value = { ...originalBundle.value.files }
  selectedFile.value = originalBundle.value.entry
  void run({ ...originalBundle.value, files: { ...originalBundle.value.files } })
}

function updateSelectedSource(value: string) {
  files.value = { ...files.value, [selectedFile.value]: value }
  status.value = 'dirty'
}

function handleEditorKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault()
    handleRun()
  }
}

function onMessage(event: MessageEvent) {
  if (
    !sandbox.value ||
    event.source !== iframeRef.value?.contentWindow ||
    !isSandboxEvent(event.data) ||
    event.data.channelId !== sandbox.value.channelId
  ) {
    return
  }
  if (event.data.type === 'ready') status.value = isDirty.value ? 'dirty' : 'ready'
  if (event.data.type === 'runtime-error') {
    diagnostics.value = [{ text: event.data.message ?? '示例运行失败' }]
    status.value = 'runtime-error'
  }
  if (event.data.type === 'console') {
    consoleEntries.value = [
      ...consoleEntries.value,
      { level: event.data.level ?? 'log', message: event.data.message ?? '' }
    ].slice(-100)
  }
  if (event.data.type === 'resize' && props.module.meta.viewport?.mode !== 'fixed') {
    const min = props.module.meta.viewport?.minHeight ?? 120
    const max = props.module.meta.viewport?.maxHeight ?? 720
    iframeHeight.value = Math.min(max, Math.max(min, event.data.height ?? min))
  }
}

onMounted(() => {
  if (sectionRef.value) {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          visible.value = true
          intersectionObserver?.disconnect()
          void loadAndRun()
        }
      },
      { rootMargin: '500px 0px' }
    )
    intersectionObserver.observe(sectionRef.value)
  }
  themeObserver = new MutationObserver(() => themeVersion.value++)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-tiger-style']
  })
  window.addEventListener('message', onMessage)
})

watch([compiled, demoLang, themeVersion], ([result]) => {
  if (result) rebuildSandbox(result)
})

onBeforeUnmount(() => {
  intersectionObserver?.disconnect()
  themeObserver?.disconnect()
  window.removeEventListener('message', onMessage)
})
</script>

<template>
  <section ref="sectionRef" :class="sectionClasses" :data-demo-id="module.meta.id">
    <div class="mb-4">
      <h2 class="text-2xl font-bold mb-2 dark:text-gray-100">{{ module.meta.title }}</h2>
      <p v-if="module.meta.description" class="text-gray-600 dark:text-gray-400">
        {{ module.meta.description }}
      </p>
    </div>

    <div
      class="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/40">
      <div class="relative bg-white dark:bg-gray-950">
        <div
          v-if="!sandbox"
          class="flex min-h-32 items-center justify-center text-sm text-gray-500"
          role="status">
          {{ status === 'compile-error' ? '示例编译失败' : '正在准备独立示例…' }}
        </div>
        <iframe
          v-else
          ref="iframeRef"
          :title="`${module.meta.title} 示例预览`"
          :srcdoc="sandbox.document"
          :sandbox="getSandboxAttribute(module.meta)"
          :allow="(module.meta.permissions ?? []).includes('fullscreen') ? 'fullscreen' : undefined"
          class="block w-full border-0 bg-transparent"
          :style="{ height: `${module.meta.viewport?.height ?? iframeHeight}px` }" />
      </div>

      <div
        class="flex flex-wrap items-center gap-2 border-t border-gray-200 px-3 py-2 dark:border-gray-800">
        <Button size="sm" variant="secondary" @click="editorOpen = !editorOpen">
          {{ editorOpen ? '收起源码' : '编辑源码' }}
        </Button>
        <template v-if="editorOpen">
          <Button
            size="sm"
            :disabled="!originalBundle || status === 'compiling'"
            @click="handleRun">
            {{ status === 'compiling' ? '编译中…' : '运行' }}
          </Button>
          <Button size="sm" variant="secondary" :disabled="!isDirty" @click="handleReset">
            重置
          </Button>
          <Button size="sm" variant="secondary" @click="copyTextToClipboard(selectedSource)">
            复制当前文件
          </Button>
        </template>
        <span class="ml-auto text-xs text-gray-500" aria-live="polite">
          {{ isDirty && status !== 'compiling' ? '已修改 · 尚未运行' : status }}
        </span>
      </div>

      <div v-if="editorOpen" class="border-t border-gray-200 p-3 dark:border-gray-800">
        <div class="mb-2 flex flex-wrap gap-1" role="tablist" aria-label="示例文件">
          <button
            v-for="file in Object.keys(files).sort()"
            :key="file"
            type="button"
            role="tab"
            :aria-selected="selectedFile === file"
            :class="[
              'rounded px-2 py-1 text-xs',
              selectedFile === file
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
            ]"
            @click="selectedFile = file">
            {{ file.slice(1) }}
          </button>
        </div>
        <div @keydown="handleEditorKeydown">
          <CodeEditor
            :value="selectedSource"
            :language="languageForFile(selectedFile)"
            :theme="editorTheme"
            :min-lines="8"
            :max-lines="24"
            @update:value="updateSelectedSource" />
        </div>
      </div>

      <div
        v-if="diagnostics.length > 0"
        class="border-t border-red-200 bg-red-50 p-3 text-sm text-red-700"
        role="alert">
        <div v-for="(diagnostic, index) in diagnostics" :key="`${diagnostic.text}-${index}`">
          <template v-if="diagnostic.file">
            {{ diagnostic.file }}:{{ diagnostic.line ?? 0 }}:{{ diagnostic.column ?? 0 }}
          </template>
          {{ diagnostic.text }}
        </div>
      </div>

      <details
        v-if="editorOpen && consoleEntries.length > 0"
        class="border-t border-gray-200 p-3 text-xs dark:border-gray-800">
        <summary class="cursor-pointer">控制台（{{ consoleEntries.length }}）</summary>
        <pre class="mt-2 max-h-40 overflow-auto whitespace-pre-wrap">{{
          consoleEntries.map((entry) => `[${entry.level}] ${entry.message}`).join('\n')
        }}</pre>
      </details>
    </div>
  </section>
</template>
