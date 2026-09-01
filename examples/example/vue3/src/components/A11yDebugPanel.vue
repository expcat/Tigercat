<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Modal } from '@expcat/tigercat-vue/Modal'
import type { DemoLang } from '@demo-shared/app-config'

interface AxeViolation {
  id: string
  impact?: 'minor' | 'moderate' | 'serious' | 'critical' | null
  help: string
}
interface AxeResults {
  violations: AxeViolation[]
}

const props = defineProps<{ lang?: DemoLang }>()
const open = ref(false)
const loading = ref(false)
const ranAt = ref('')
const results = shallowRef<AxeResults | null>(null)
const scopedToPreview = ref(true)
const error = ref('')
const t = (zh: string, en: string) => ((props.lang ?? 'zh-CN') === 'zh-CN' ? zh : en)

const impactClass = (impact?: string | null) => {
  if (impact === 'critical') return 'bg-red-100 text-red-700'
  if (impact === 'serious') return 'bg-orange-100 text-orange-700'
  return 'bg-gray-100 text-gray-700'
}

function collectPreviewRoots(): HTMLElement[] {
  const roots: HTMLElement[] = []
  for (const iframe of document.querySelectorAll<HTMLIFrameElement>('[data-demo-id] iframe')) {
    try {
      const body = iframe.contentDocument?.body
      if (body) roots.push(body)
    } catch {
      // opaque origin
    }
  }
  return roots
}

const runScan = async () => {
  loading.value = true
  error.value = ''
  try {
    const axe = (await import('axe-core')).default
    const roots = collectPreviewRoots()
    const targets = roots.length > 0 ? roots : [document.body]
    scopedToPreview.value = roots.length > 0
    const merged: AxeViolation[] = []
    for (const target of targets) {
      const r = (await axe.run(target, { resultTypes: ['violations'] })) as AxeResults
      merged.push(...r.violations)
    }
    results.value = { violations: merged }
    ranAt.value = new Date().toLocaleTimeString()
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

const scanHint = computed(() =>
  scopedToPreview.value
    ? t('扫描当前页可见的示例预览。', 'Scans visible example previews.')
    : t('只扫壳，不含预览。', 'Shell only; previews were not readable.')
)
</script>

<template>
  <div class="fixed bottom-4 right-4 z-[60]">
    <button
      type="button"
      :aria-label="t('A11y 调试面板', 'A11y debug panel')"
      :aria-expanded="open"
      class="size-11 rounded-full shadow-lg bg-[var(--tiger-primary,#2563eb)] text-white font-bold text-base"
      @click="open = true">
      ♿
    </button>
    <Modal
      v-model:open="open"
      :title="t('无障碍扫描 (axe-core)', 'A11y scan (axe-core)')"
      :footer="null">
      <div class="flex items-center gap-2 mb-3">
        <Button size="sm" :loading="loading" @click="runScan">
          {{ t('运行扫描', 'Run scan') }}
        </Button>
        <span v-if="ranAt" class="text-xs text-gray-500">
          {{ t('最近扫描', 'Last scan') }}: {{ ranAt }}
        </span>
      </div>
      <p class="text-xs text-gray-500 mb-3">{{ scanHint }}</p>
      <p v-if="error" class="text-red-600">{{ error }}</p>
      <p v-else-if="results && results.violations.length === 0" class="text-emerald-700">
        {{ t('未发现问题 ✓', 'No violations found ✓') }}
      </p>
      <ul v-else-if="results" class="space-y-3 max-h-[50vh] overflow-y-auto">
        <li
          v-for="(v, index) in results.violations"
          :key="`${v.id}-${index}`"
          class="rounded-md border border-gray-200 p-2">
          <span
            :class="[
              'text-[10px] font-semibold uppercase rounded px-1.5 py-0.5',
              impactClass(v.impact)
            ]">
            {{ v.impact ?? 'n/a' }}
          </span>
          <div>{{ v.help }}</div>
        </li>
      </ul>
    </Modal>
  </div>
</template>
