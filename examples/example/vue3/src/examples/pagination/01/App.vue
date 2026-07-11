<script setup lang="ts">
import { ref, inject, computed, type Ref } from 'vue'
import { Pagination } from '@expcat/tigercat-vue/Pagination'
import { type TigerLocalePagination } from '@expcat/tigercat-vue'
import type { DemoLang } from '@demo-shared/app-config'

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
</script>

<template>
  <div class="min-w-0">
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
  </div>
</template>
