<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Loading } from '@expcat/tigercat-vue/Loading'

const loading = ref(true)
</script>

<template>
  <div class="relative min-h-40 rounded-lg border border-gray-200 p-5">
    <p>本月活跃用户：1,234</p>
    <Button class="mt-4" size="sm" @click="loading = !loading">
      {{ loading ? '显示内容' : '重新加载' }}
    </Button>
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center rounded-lg bg-white/85 dark:bg-gray-950/85">
      <Loading variant="ring" text="刷新中…" />
    </div>
  </div>
</template>
