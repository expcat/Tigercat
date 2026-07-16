<script setup lang="ts">
import { computed, ref } from 'vue'
import { InfiniteScroll } from '@expcat/tigercat-vue/InfiniteScroll'

const items = ref(Array.from({ length: 8 }, (_, index) => index + 1))
const loading = ref(false)
const hasMore = computed(() => items.value.length < 20)

const loadMore = () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  setTimeout(() => {
    const start = items.value.length
    items.value.push(...Array.from({ length: 4 }, (_, index) => start + index + 1))
    loading.value = false
  }, 400)
}
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm text-gray-600 dark:text-gray-300">
      横向滚动到右侧边界，观察新卡片和结束状态。
    </p>
    <InfiniteScroll
      direction="horizontal"
      :has-more="hasMore"
      :loading="loading"
      loading-text="正在加载卡片..."
      end-text="已加载全部卡片"
      class-name="h-44 gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
      @load-more="loadMore">
      <article
        v-for="item in items"
        :key="item"
        class="flex w-36 shrink-0 flex-col justify-between rounded-lg bg-blue-50 p-4 text-blue-950 dark:bg-blue-950 dark:text-blue-100">
        <span class="text-xs font-medium uppercase tracking-wide">Card</span>
        <strong class="text-2xl">{{ item }}</strong>
        <span class="text-xs opacity-70">横向项目</span>
      </article>
    </InfiniteScroll>
  </div>
</template>
