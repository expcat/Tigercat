<script setup lang="ts">
import { ref, inject, computed, type Ref } from 'vue'
import { Pagination } from '@expcat/tigercat-vue/Pagination'
import { type TigerLocalePagination } from '@expcat/tigercat-vue'
import type { DemoLang } from '@demo-shared/app-config'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './PaginationDemo.vue?raw'

const current1 = ref(1)
const current2 = ref(1)
const current3 = ref(1)
const current4 = ref(1)
const current5 = ref(1)
const current6 = ref(1)
const current7 = ref(1)
const current8 = ref(1)
const current9 = ref(1)
const current10 = ref(1)
const current11 = ref(1)
const currentLabels = ref(1)
const pageSize = ref(10)

const demoLang = inject<Ref<DemoLang>>('demo-lang', ref<DemoLang>('zh-CN'))

const handleChange = (page: number, size: number) => {
  console.log('页码改变:', page, '每页条数:', size)
}

const handlePageSizeChange = (page: number, size: number) => {
  console.log('页码大小改变 - 当前页:', page, '每页条数:', size)
}

const customTotalText = (total: number, range: [number, number]) => {
  return `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
}

// 自定义国际化标签
const customLabels = computed<Partial<TigerLocalePagination>>(() => {
  const isZh = demoLang.value === 'zh-CN'
  return {
    prevPageAriaLabel: isZh ? '上一页' : 'Previous',
    nextPageAriaLabel: isZh ? '下一页' : 'Next',
    pageText: isZh ? '页' : 'Page',
    itemsPerPageText: isZh ? '条/页' : 'items/page',
    jumpToText: isZh ? '跳至' : 'Go to',
    totalText: isZh ? '共 {total} 条' : 'Total {total} items'
  }
})

const basicSnippet = `<Pagination v-model:current="current1" :total="100" :pageSize="10" />`

const basicScriptSnippet = `import { ref } from 'vue'

const current1 = ref(1)`

const quickSnippet = `<Pagination v-model:current="current2" :total="500" :pageSize="10" showQuickJumper />`

const sizeChangeSnippet = `<Pagination
  v-model:current="current3"
  v-model:pageSize="pageSize"
  :total="500"
  :pageSizeOptions="[10, 20, 50, 100]"
  showSizeChanger
  @page-size-change="handlePageSizeChange" />`

const simpleSnippet = `<Pagination v-model:current="current4" :total="500" simple />`

const sizeSnippet = `<div class="space-y-4">
  <div>
    <p class="text-sm text-gray-500 mb-2">小尺寸</p>
    <Pagination v-model:current="current5" :total="100" size="small" />
  </div>
  <div>
    <p class="text-sm text-gray-500 mb-2">中等尺寸（默认）</p>
    <Pagination v-model:current="current5" :total="100" size="medium" />
  </div>
  <div>
    <p class="text-sm text-gray-500 mb-2">大尺寸</p>
    <Pagination v-model:current="current5" :total="100" size="large" />
  </div>
</div>`

const alignSnippet = `<div class="space-y-4">
  <div>
    <p class="text-sm text-gray-500 mb-2">左对齐</p>
    <Pagination v-model:current="current6" :total="100" align="left" />
  </div>
  <div>
    <p class="text-sm text-gray-500 mb-2">居中对齐（默认）</p>
    <Pagination v-model:current="current6" :total="100" align="center" />
  </div>
  <div>
    <p class="text-sm text-gray-500 mb-2">右对齐</p>
    <Pagination v-model:current="current6" :total="100" align="right" />
  </div>
</div>`

const totalTextSnippet = `<Pagination v-model:current="current7" :total="100" :totalText="customTotalText" />`

const disabledSnippet = `<Pagination v-model:current="current8" :total="100" disabled />`

const hideOnSinglePageSnippet = `<Pagination v-model:current="current10" :total="5" :pageSize="10" hideOnSinglePage />`

const showLessItemsSnippet = `<Pagination v-model:current="current11" :total="500" showLessItems />`

const i18nSnippet = `<Pagination
  v-model:current="current9"
  :total="500"
  :locale="{ pagination: customLabels }"
  showQuickJumper
  showSizeChanger />`

const labelsSnippet = `<!-- 单语言项目：无需 locale，直接用扁平 labels 覆盖文案 -->
<Pagination
  v-model:current="currentLabels"
  :total="500"
  :labels="{ totalText: '共 {total} 条记录', prevPageAriaLabel: '上一页', nextPageAriaLabel: '下一页' }"
  showQuickJumper />`

const fullSnippet = `<Pagination
  v-model:current="current3"
  v-model:pageSize="pageSize"
  :total="500"
  :pageSizeOptions="[10, 20, 50, 100]"
  showQuickJumper
  showSizeChanger
  :totalText="customTotalText"
  size="medium"
  align="center"
  @change="handleChange"
  @page-size-change="handlePageSizeChange" />`
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Pagination 分页</h1>
      <p class="text-gray-600 dark:text-gray-400">
        用于在数据量较大时进行分页展示，支持多种模式、快速跳页、页码选择等特性。
      </p>
    </div>

    <!-- 基本用法 -->
    <DemoBlock
      title="基本用法等组合展示"
      description="合并展示基本用法、快速跳页、改变每页条数等互不冲突的使用方式。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
          <Pagination v-model:current="current1" :total="100" :pageSize="10" />
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">快速跳页</h3>
          <Pagination v-model:current="current2" :total="500" :pageSize="10" showQuickJumper />
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">改变每页条数</h3>
          <Pagination
            v-model:current="current3"
            v-model:pageSize="pageSize"
            :total="500"
            :pageSizeOptions="[10, 20, 50, 100]"
            showSizeChanger
            @page-size-change="handlePageSizeChange" />
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">简单模式</h3>
          <Pagination v-model:current="current4" :total="500" simple />
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">不同尺寸</h3>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-500 mb-2">小尺寸</p>
              <Pagination v-model:current="current5" :total="100" size="small" />
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-2">中等尺寸（默认）</p>
              <Pagination v-model:current="current5" :total="100" size="medium" />
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-2">大尺寸</p>
              <Pagination v-model:current="current5" :total="100" size="large" />
            </div>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义对齐方式</h3>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-500 mb-2">左对齐</p>
              <Pagination v-model:current="current6" :total="100" align="left" />
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-2">居中对齐（默认）</p>
              <Pagination v-model:current="current6" :total="100" align="center" />
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-2">右对齐</p>
              <Pagination v-model:current="current6" :total="100" align="right" />
            </div>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义总数文本</h3>
          <Pagination v-model:current="current7" :total="100" :totalText="customTotalText" />
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用状态</h3>
          <Pagination v-model:current="current8" :total="100" disabled />
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">单页隐藏</h3>
          <div class="space-y-2">
            <p class="text-sm text-gray-500">下方分页组件因为只有 1 页而被隐藏：</p>
            <Pagination v-model:current="current10" :total="5" :pageSize="10" hideOnSinglePage />
            <p class="text-sm text-gray-400 italic">
              （如果看不到分页组件，说明 hideOnSinglePage 生效了）
            </p>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
            紧凑页码 (showLessItems)
          </h3>
          <Pagination v-model:current="current11" :total="500" showLessItems />
        </div>
      </div>
    </DemoBlock>

    <!-- 国际化 -->
    <DemoBlock
      title="国际化 (i18n)与自定义文案 (labels)"
      description="合并展示国际化 (i18n)、自定义文案 (labels)，减少重复示例块。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">国际化 (i18n)</h3>
          <div class="space-y-2">
            <p class="text-sm text-gray-500">
              当前语言：{{ demoLang === 'zh-CN' ? '中文' : 'English' }}
            </p>
            <Pagination
              v-model:current="current9"
              :total="500"
              :locale="{ pagination: customLabels }"
              showQuickJumper
              showSizeChanger />
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
            自定义文案 (labels)
          </h3>
          <Pagination
            v-model:current="currentLabels"
            :total="500"
            :labels="{
              totalText: '共 {total} 条记录',
              prevPageAriaLabel: '上一页',
              nextPageAriaLabel: '下一页'
            }"
            showQuickJumper />
        </div>
      </div>
    </DemoBlock>

    <!-- 完整示例 -->
    <DemoBlock
      title="完整示例"
      description="包含所有功能的完整示例（查看控制台）。"
      :code="fullPageSnippet">
      <Pagination
        v-model:current="current3"
        v-model:pageSize="pageSize"
        :total="500"
        :pageSizeOptions="[10, 20, 50, 100]"
        showQuickJumper
        showSizeChanger
        :totalText="customTotalText"
        size="medium"
        align="center"
        @change="handleChange"
        @page-size-change="handlePageSizeChange" />
    </DemoBlock>
  </div>
</template>
