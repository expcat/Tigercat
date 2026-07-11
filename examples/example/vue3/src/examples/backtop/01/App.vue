<script setup lang="ts">
import { ref } from 'vue'
import { BackTop } from '@expcat/tigercat-vue/BackTop'

const clicks = ref(0)
</script>

<template>
  <div class="min-h-[720px] rounded border p-4">
    <p>向下滚动后使用回到顶部按钮。</p>
    <p class="mt-2 text-sm text-gray-500">点击次数：{{ clicks }}</p>
    <BackTop :visibility-height="120" @click="clicks += 1" />
  </div>
</template>
