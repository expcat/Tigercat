<script setup lang="ts">
import { computed, ref } from 'vue'
import { InfiniteScroll } from '@expcat/tigercat-vue/InfiniteScroll'

const items = ref(Array.from({ length: 10 }, (_, index) => index + 1))
const loading = ref(false)
const hasMore = computed(() => items.value.length < 30)

const loadMore = () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  setTimeout(() => {
    const start = items.value.length
    items.value.push(...Array.from({ length: 5 }, (_, index) => start + index + 1))
    loading.value = false
  }, 400)
}
</script>

<template>
  <InfiniteScroll
    :has-more="hasMore"
    :loading="loading"
    loading-text="正在加载更多..."
    end-text="没有更多数据了"
    class-name="h-72 rounded border border-gray-200"
    @load-more="loadMore">
    <div v-for="item in items" :key="item" class="border-b px-4 py-3">项目 {{ item }}</div>
  </InfiniteScroll>
</template>
