<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { ScrollArea } from '@expcat/tigercat-vue/ScrollArea'
import type { ScrollAreaInstance, ScrollAreaScrollDetail } from '@expcat/tigercat-core'

const areaRef = ref<ScrollAreaInstance>()
const progress = ref(0)
const messages = Array.from({ length: 30 }, (_, index) => `消息 ${index + 1}`)

const onScroll = (detail: ScrollAreaScrollDetail) => {
  progress.value = Math.round(detail.state.y.progress * 100)
}
</script>

<template>
  <div class="w-full max-w-md space-y-3">
    <ScrollArea
      ref="areaRef"
      :max-height="200"
      aria-label="消息列表"
      class="rounded-lg border border-gray-200 dark:border-gray-700"
      @scroll="onScroll">
      <ul class="px-4">
        <li
          v-for="message in messages"
          :key="message"
          class="py-2 text-sm text-gray-700 dark:text-gray-200">
          {{ message }}
        </li>
      </ul>
    </ScrollArea>
    <div class="flex items-center gap-2">
      <Button size="sm" @click="areaRef?.scrollToTop('smooth')">回到顶部</Button>
      <Button size="sm" @click="areaRef?.scrollToBottom('smooth')">滚动到底部</Button>
      <Button size="sm" variant="secondary" @click="areaRef?.scrollTo({ top: 200 })">
        跳到 200px
      </Button>
    </div>
    <p class="text-sm text-gray-600 dark:text-gray-300">滚动进度：{{ progress }}%</p>
  </div>
</template>
