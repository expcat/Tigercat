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
    <div ref="innerContainer" class="h-64 overflow-auto rounded-lg border border-gray-200 relative">
      <div class="h-[1000px] p-4">
        <p class="text-gray-600 mb-4">在此容器内向下滚动查看回到顶部按钮。</p>
        <p v-for="i in 20" :key="i" class="text-gray-400 py-2">滚动内容行 {{ i }}</p>
      </div>
      <BackTop
        v-if="innerContainer"
        :target="() => innerContainer!"
        :visibility-height="100"
        position="fixed"
        placement="bottom-left"
        :offset="24" />
    </div>
  </div>
</template>
