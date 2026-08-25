<script setup lang="ts">
import { ref } from 'vue'
import { Affix } from '@expcat/tigercat-vue/Affix'

const affixed = ref(false)
</script>

<template>
  <div id="affix-bottom-container" class="h-40 overflow-auto rounded border p-4">
    <div class="h-96">
      <p class="mb-8 text-sm text-gray-500">在容器内滚动，元素会固定到容器底部。</p>
      <Affix :offset-bottom="8" target="#affix-bottom-container" @change="affixed = $event">
        <div class="inline-block rounded bg-emerald-600 px-4 py-2 text-white">
          {{ affixed ? '已固定到底部' : '待固定' }}
        </div>
      </Affix>
    </div>
  </div>
</template>
