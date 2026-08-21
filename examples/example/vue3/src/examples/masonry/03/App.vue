<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Masonry } from '@expcat/tigercat-vue/Masonry'

let seed = 0
const heights = ['h-24', 'h-40', 'h-32', 'h-28', 'h-36', 'h-44']
const cards = ref(
  Array.from({ length: 6 }, () => ({
    id: ++seed,
    height: heights[seed % heights.length]
  }))
)

function addCard(): void {
  seed += 1
  cards.value = [...cards.value, { id: seed, height: heights[seed % heights.length] }]
}

function removeCard(): void {
  cards.value = cards.value.slice(0, -1)
}
</script>

<template>
  <div class="w-full max-w-md space-y-3">
    <div class="flex items-center gap-2">
      <Button size="sm" @click="addCard">添加卡片</Button>
      <Button size="sm" variant="secondary" :disabled="cards.length === 0" @click="removeCard">
        移除卡片
      </Button>
    </div>
    <Masonry :columns="2" :gap="12" aria-label="动态卡片瀑布流">
      <div
        v-for="card in cards"
        :key="card.id"
        class="flex items-center justify-center rounded-lg bg-violet-50 text-sm font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-200"
        :class="card.height">
        #{{ card.id }}
      </div>
    </Masonry>
    <p class="text-sm text-gray-600 dark:text-gray-300">
      当前 {{ cards.length }} 张卡片,插入后自动重排。
    </p>
  </div>
</template>
