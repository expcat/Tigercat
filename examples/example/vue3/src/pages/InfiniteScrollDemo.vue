<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">InfiniteScroll 无限滚动</h1>
    <p class="text-gray-500 mb-8">滚动到底部自动加载更多内容。</p>

    <DemoBlock
      title="组合展示"
      description="合并展示基础用法、自定义文案，减少重复示例块。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">滚动到底部触发 load-more</p>
          <InfiniteScroll
            :has-more="hasMore"
            :loading="loading"
            @load-more="loadMore"
            class-name="h-[300px] border border-gray-200 rounded-lg">
            <div v-for="item in items" :key="item" class="px-4 py-3 border-b">项目 {{ item }}</div>
          </InfiniteScroll>
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义文案</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">loadingText / endText</p>
          <InfiniteScroll
            :has-more="false"
            loading-text="拼命加载中..."
            end-text="— 到底了 —"
            class-name="h-[200px] border border-gray-200 rounded-lg">
            <div v-for="i in 5" :key="i" class="px-4 py-3 border-b">项目 {{ i }}</div>
          </InfiniteScroll>
        </section>
      </div>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { InfiniteScroll } from '@expcat/tigercat-vue/InfiniteScroll'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './InfiniteScrollDemo.vue?raw'

const items = ref(Array.from({ length: 20 }, (_, i) => i + 1))
const loading = ref(false)
const hasMore = ref(true)

const loadMore = () => {
  if (loading.value) return
  loading.value = true
  setTimeout(() => {
    const len = items.value.length
    items.value.push(...Array.from({ length: 10 }, (_, i) => len + i + 1))
    loading.value = false
    if (items.value.length >= 50) hasMore.value = false
  }, 800)
}
</script>
