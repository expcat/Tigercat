<script setup lang="ts">
import { computed, ref } from 'vue'
import { ScrollSpy } from '@expcat/tigercat-vue/ScrollSpy'
import { type ScrollSpyItem } from '@expcat/tigercat-vue'

const getMainContainer = () => {
  const scrollContainer = document.querySelector('main > div.overflow-y-auto')
  return (scrollContainer as HTMLElement) || window
}

const pageItems: ScrollSpyItem[] = [
  { key: 'overview', href: '#scrollspy-overview', label: '概览' },
  { key: 'workflow', href: '#scrollspy-workflow', label: '工作流' },
  {
    key: 'api',
    href: '#scrollspy-api',
    label: 'API',
    children: [{ key: 'events', href: '#scrollspy-events', label: '事件' }]
  }
]

const activeKey = ref<string | number>('overview')
const lastEvent = ref('等待滚动或点击')
const containerRef = ref<HTMLElement | null>(null)

const containerItems = computed<ScrollSpyItem[]>(() => [
  { key: 'audit', href: '#spy-audit', label: '审计' },
  { key: 'release', href: '#spy-release', label: '发布' },
  { key: 'monitor', href: '#spy-monitor', label: '监控' }
])

const getDemoContainer = () => containerRef.value || window
const handleContainerChange = (
  _key: string | number,
  item: ScrollSpyItem,
  payload: { source: string }
) => {
  lastEvent.value = `${item.label} / ${payload.source}`
}
</script>

<template>
  <div class="min-w-0">
    <div class="grid gap-4 md:grid-cols-[1fr_180px]">
      <div
        ref="containerRef"
        class="h-72 overflow-auto rounded border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <section id="spy-audit" class="h-56 p-5 bg-blue-50 dark:bg-blue-950/30">
          <h3 class="font-semibold text-blue-800 dark:text-blue-200">审计</h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">查看配置、权限和变更记录。</p>
        </section>
        <section id="spy-release" class="h-56 p-5 bg-green-50 dark:bg-green-950/30">
          <h3 class="font-semibold text-green-800 dark:text-green-200">发布</h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
            确认版本、构建产物和发布门禁。
          </p>
        </section>
        <section id="spy-monitor" class="h-56 p-5 bg-amber-50 dark:bg-amber-950/30">
          <h3 class="font-semibold text-amber-800 dark:text-amber-200">监控</h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">跟踪运行状态和异常通知。</p>
        </section>
      </div>
      <ScrollSpy
        :items="containerItems"
        :get-container="getDemoContainer"
        @change="handleContainerChange" />
    </div>
    <p class="mt-3 text-sm text-gray-500">最近事件：{{ lastEvent }}</p>
  </div>
</template>
