<script setup lang="ts">
import { ref } from 'vue'
import { Affix } from '@expcat/tigercat-vue/Affix'

const affixed = ref(false)
</script>

<template>
  <div id="affix-demo-container" class="h-40 overflow-auto rounded border p-4">
    <div class="h-96">
      <p class="mb-8 text-sm text-gray-500">向下滚动触发固定。</p>
      <Affix :offset-top="8" target="#affix-demo-container" @change="affixed = $event">
        <div class="inline-block rounded bg-blue-600 px-4 py-2 text-white">
          {{ affixed ? '已固定' : '待固定' }}
        </div>
      </Affix>
    </div>
  </div>
</template>
