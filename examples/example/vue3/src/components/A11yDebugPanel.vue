<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { Button } from '@expcat/tigercat-vue'
import type { DemoLang } from '@demo-shared/app-config'

interface AxeNode {
  target: string[]
  html: string
  failureSummary?: string
}
interface AxeViolation {
  id: string
  impact?: 'minor' | 'moderate' | 'serious' | 'critical' | null
  description: string
  help: string
  helpUrl: string
  nodes: AxeNode[]
}
interface AxeResults {
  violations: AxeViolation[]
}

const props = defineProps<{ lang?: DemoLang; targetSelector?: string }>()

const open = ref(false)
const loading = ref(false)
const ranAt = ref<string>('')
const results = shallowRef<AxeResults | null>(null)
const error = ref<string>('')

const t = (zh: string, en: string) => ((props.lang ?? 'zh-CN') === 'zh-CN' ? zh : en)

const togglePanel = () => {
  open.value = !open.value
}

const runScan = async () => {
  loading.value = true
  error.value = ''
  try {
    const axe = (await import('axe-core')).default
    const target = props.targetSelector
      ? document.querySelector(props.targetSelector)
      : document.body
    const r = (await axe.run(target ?? document.body, {
      resultTypes: ['violations']
    })) as AxeResults
    results.value = r
    ranAt.value = new Date().toLocaleTimeString()
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

const impactColor = (impact?: string | null) => {
  switch (impact) {
    case 'critical':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
    case 'serious':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200'
    case 'moderate':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
    case 'minor':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
  }
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-[60]">
    <button
      type="button"
      :aria-label="t('A11y 调试面板', 'A11y debug panel')"
      :aria-expanded="open"
      class="size-11 rounded-full shadow-lg bg-[var(--tiger-primary,#2563eb)] text-white font-bold text-base hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tiger-primary,#2563eb)]"
      @click="togglePanel">
      ♿
    </button>

    <div
      v-if="open"
      role="dialog"
      :aria-label="t('A11y 调试面板', 'A11y debug panel')"
      class="absolute bottom-14 right-0 w-[min(420px,calc(100vw-2rem))] max-h-[70vh] flex flex-col rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
      <header class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {{ t('无障碍扫描 (axe-core)', 'A11y scan (axe-core)') }}
        </div>
        <button
          type="button"
          class="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          :aria-label="t('关闭', 'Close')"
          @click="open = false">
          ✕
        </button>
      </header>

      <div class="px-3 py-2 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800">
        <Button size="sm" :loading="loading" @click="runScan">
          {{ t('运行扫描', 'Run scan') }}
        </Button>
        <span v-if="ranAt" class="text-xs text-gray-500 dark:text-gray-400">
          {{ t('最近扫描', 'Last scan') }}: {{ ranAt }}
        </span>
        <span v-if="results" class="ml-auto text-xs text-gray-700 dark:text-gray-300">
          {{ results.violations.length }} {{ t('个问题', 'issues') }}
        </span>
      </div>

      <div class="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
        <p v-if="error" class="text-red-600 dark:text-red-400">{{ error }}</p>
        <p v-else-if="!results" class="text-gray-500 dark:text-gray-400">
          {{ t('点击「运行扫描」查看当前页面的无障碍问题。', 'Click "Run scan" to inspect the current page.') }}
        </p>
        <p v-else-if="results.violations.length === 0" class="text-emerald-700 dark:text-emerald-300">
          {{ t('未发现问题 ✓', 'No violations found ✓') }}
        </p>
        <ul v-else class="space-y-3">
          <li
            v-for="v in results.violations"
            :key="v.id"
            class="rounded-md border border-gray-200 p-2 dark:border-gray-800">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[10px] font-semibold uppercase rounded px-1.5 py-0.5" :class="impactColor(v.impact)">
                {{ v.impact ?? 'n/a' }}
              </span>
              <span class="text-xs font-mono text-gray-500 dark:text-gray-400">{{ v.id }}</span>
            </div>
            <div class="text-gray-900 dark:text-gray-100">{{ v.help }}</div>
            <a
              :href="v.helpUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-[var(--tiger-primary,#2563eb)] hover:underline">
              {{ t('查看详情 →', 'Learn more →') }}
            </a>
            <details class="mt-1">
              <summary class="text-xs text-gray-500 cursor-pointer dark:text-gray-400">
                {{ v.nodes.length }} {{ t('个节点', 'node(s)') }}
              </summary>
              <ul class="mt-1 space-y-1">
                <li
                  v-for="(n, i) in v.nodes"
                  :key="i"
                  class="text-xs font-mono text-gray-600 dark:text-gray-300 break-all">
                  {{ n.target.join(' ') }}
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
