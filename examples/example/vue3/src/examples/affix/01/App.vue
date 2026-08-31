<script setup lang="ts">
import { ref } from 'vue'
import { Affix } from '@expcat/tigercat-vue/Affix'

const affixed = ref(false)
</script>

<template>
  <div class="min-h-[720px]">
    <Affix :offset-top="0" @change="affixed = $event">
      <div class="w-full rounded bg-blue-600 px-4 py-2 text-white">
        {{ affixed ? '顶栏已固定（宽度跟占位走）' : '视口顶栏' }}
      </div>
    </Affix>
    <p class="mt-8 text-sm text-gray-500">向下滚动，顶栏钉在视口顶部；父级变宽时占位仍铺满。</p>
  </div>
</template>
