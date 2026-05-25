<script setup lang="ts">
import { computed, ref } from 'vue'
import { ScrollSpy, type ScrollSpyItem } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

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

const basicSnippet = `const items = [
  { key: 'overview', href: '#overview', label: '概览' },
  { key: 'workflow', href: '#workflow', label: '工作流' }
]

<ScrollSpy :items="items" :get-container="getMainContainer" :target-offset="80" />`

const horizontalSnippet = `<ScrollSpy
  direction="horizontal"
  :items="items"
  v-model:active-key="activeKey"
/>
`

const containerSnippet = `<div ref="containerRef" class="h-72 overflow-auto">
  <section id="audit">...</section>
  <section id="release">...</section>
</div>

<ScrollSpy
  :items="items"
  :get-container="() => containerRef || window"
/>
`

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
  <div class="max-w-6xl mx-auto p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">ScrollSpy 滚动监听</h1>
      <p class="text-gray-600 dark:text-gray-400">
        监听内容滚动并自动高亮当前导航项，适合文档目录、长表单和设置页。
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8">
      <div class="space-y-8">
        <DemoBlock
          title="基本用法"
          description="根据页面滚动位置同步当前导航项。"
          :code="basicSnippet">
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
        </DemoBlock>

        <DemoBlock
          title="水平导航"
          description="适合页内顶部导航或紧凑筛选区域。"
          :code="horizontalSnippet">
          <div class="space-y-4">
            <ScrollSpy
              v-model:active-key="activeKey"
              direction="horizontal"
              :items="pageItems"
              :get-container="getMainContainer" />
            <p class="text-sm text-gray-500">当前 activeKey：{{ activeKey }}</p>
          </div>
        </DemoBlock>

        <DemoBlock
          title="自定义滚动容器"
          description="指定内部容器作为滚动监听目标。"
          :code="containerSnippet">
          <div class="grid gap-4 md:grid-cols-[1fr_180px]">
            <div
              ref="containerRef"
              class="h-72 overflow-auto rounded border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
              <section id="spy-audit" class="h-56 p-5 bg-blue-50 dark:bg-blue-950/30">
                <h3 class="font-semibold text-blue-800 dark:text-blue-200">审计</h3>
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  查看配置、权限和变更记录。
                </p>
              </section>
              <section id="spy-release" class="h-56 p-5 bg-green-50 dark:bg-green-950/30">
                <h3 class="font-semibold text-green-800 dark:text-green-200">发布</h3>
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  确认版本、构建产物和发布门禁。
                </p>
              </section>
              <section id="spy-monitor" class="h-56 p-5 bg-amber-50 dark:bg-amber-950/30">
                <h3 class="font-semibold text-amber-800 dark:text-amber-200">监控</h3>
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  跟踪运行状态和异常通知。
                </p>
              </section>
            </div>
            <ScrollSpy
              :items="containerItems"
              :get-container="getDemoContainer"
              @change="handleContainerChange" />
          </div>
          <p class="mt-3 text-sm text-gray-500">最近事件：{{ lastEvent }}</p>
        </DemoBlock>
      </div>

      <aside class="hidden lg:block">
        <ScrollSpy
          sticky
          :items="pageItems"
          :get-container="getMainContainer"
          :target-offset="80"
          aria-label="页面目录" />
      </aside>
    </div>
  </div>
</template>
