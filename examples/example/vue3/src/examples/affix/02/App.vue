<script setup lang="ts">
import { ref } from 'vue'
import { Affix } from '@expcat/tigercat-vue/Affix'

const affixed = ref(false)
</script>

<template>
  <div
    id="affix-bottom-container"
    class="h-40 overflow-auto rounded border p-4 text-sm text-gray-500">
    <p>上方内容。标签的文档位置在容器底边之下，所以会钉在底部。</p>
    <div class="h-40"></div>
    <Affix :offset-bottom="8" target="#affix-bottom-container" @change="affixed = $event">
      <div class="inline-block rounded bg-emerald-600 px-4 py-2 text-white">
        {{ affixed ? '已固定到底部' : '已回到文档流' }}
      </div>
    </Affix>
    <p class="mt-6">滚到标签的文档位置后，它离开底边，回到这段文字旁边。</p>
    <div class="h-40"></div>
  </div>
</template>
