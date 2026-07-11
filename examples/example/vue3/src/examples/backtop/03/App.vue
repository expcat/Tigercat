<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { ref, onMounted } from 'vue'
import { BackTop } from '@expcat/tigercat-vue/BackTop'

const pageScrollContainer = ref<HTMLElement | null>(null)
const innerContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  pageScrollContainer.value = document.querySelector('main > div.overflow-y-auto') as HTMLElement
})

const handleClick = () => {
  console.log('BackTop clicked!')
}
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <p class="text-gray-600 mb-4">
        通过 <code class="bg-gray-200 px-1 rounded">@click</code> 监听点击事件。
      </p>
      <Button variant="outline" @click="handleClick">模拟点击（查看控制台）</Button>
    </div>
  </div>
</template>
