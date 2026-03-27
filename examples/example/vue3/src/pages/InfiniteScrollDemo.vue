<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">InfiniteScroll 无限滚动</h1>
    <p class="text-gray-500 mb-8">滚动到底部自动加载更多内容。</p>

    <DemoBlock title="基础用法" description="滚动到底部触发 load-more" :code="basicSnippet">
      <div style="height: 300px; overflow: auto; border: 1px solid #e5e7eb; border-radius: 8px">
        <InfiniteScroll :has-more="hasMore" :loading="loading" @load-more="loadMore">
          <div v-for="item in items" :key="item" class="px-4 py-3 border-b">
            项目 {{ item }}
          </div>
        </InfiniteScroll>
      </div>
    </DemoBlock>

    <DemoBlock title="自定义文案" description="loadingText / endText" :code="customSnippet">
      <div style="height: 200px; overflow: auto; border: 1px solid #e5e7eb; border-radius: 8px">
        <InfiniteScroll :has-more="false" loading-text="拼命加载中..." end-text="— 到底了 —">
          <div v-for="i in 5" :key="i" class="px-4 py-3 border-b">
            项目 {{ i }}
          </div>
        </InfiniteScroll>
      </div>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { InfiniteScroll } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

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

const basicSnippet = `<InfiniteScroll :has-more="hasMore" :loading="loading" @load-more="loadMore">
  <div v-for="item in items" :key="item" class="px-4 py-3 border-b">
    项目 {{ item }}
  </div>
</InfiniteScroll>`

const customSnippet = `<InfiniteScroll :has-more="false" loading-text="拼命加载中..." end-text="— 到底了 —">
  <div v-for="i in 5" :key="i">项目 {{ i }}</div>
</InfiniteScroll>`
</script>
