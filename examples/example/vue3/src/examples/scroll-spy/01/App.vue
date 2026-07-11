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
    <div class="space-y-6">
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
        <div class="space-y-6">
          <section
            id="scrollspy-overview"
            class="scroll-mt-24 rounded border border-gray-200 p-5 dark:border-gray-700">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">概览</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              ScrollSpy 使用 href 与页面 section 关联，滚动到对应区域时自动切换 activeKey。
            </p>
          </section>
          <section
            id="scrollspy-workflow"
            class="scroll-mt-24 rounded border border-gray-200 p-5 dark:border-gray-700">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">工作流</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              点击导航项会阻止默认跳转，改用平滑滚动定位，避免页面状态突然跳变。
            </p>
          </section>
          <section
            id="scrollspy-api"
            class="scroll-mt-24 rounded border border-gray-200 p-5 dark:border-gray-700">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">API</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              items 支持 children，可渲染一层或多层目录结构，disabled 项不会参与滚动监听。
            </p>
          </section>
          <section
            id="scrollspy-events"
            class="scroll-mt-24 rounded border border-gray-200 p-5 dark:border-gray-700">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">事件</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              change 会返回 activeKey、item 和 source，业务侧可以记录用户点击或滚动来源。
            </p>
          </section>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">水平导航</h3>
        <div class="space-y-4">
          <ScrollSpy
            v-model:active-key="activeKey"
            direction="horizontal"
            :items="pageItems"
            :get-container="getMainContainer" />
          <p class="text-sm text-gray-500">当前 activeKey：{{ activeKey }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
