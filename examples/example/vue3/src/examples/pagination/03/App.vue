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
  </div>
</template>
