<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Loading } from '@expcat/tigercat-vue/Loading'

const loading = ref(true)
</script>

<template>
  <div class="space-y-3">
    <Loading :spinning="loading" variant="ring">
      <div class="min-h-40 rounded-lg border border-gray-200 p-5">
        <p>本月活跃用户：1,234</p>
      </div>
    </Loading>
    <Button size="sm" @click="loading = !loading">
      {{ loading ? '显示内容' : '重新加载' }}
    </Button>
  </div>
</template>
