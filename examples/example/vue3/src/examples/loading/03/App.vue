<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Loading } from '@expcat/tigercat-vue/Loading'

const loading = ref(false)

function start() {
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
  }, 1200)
}
</script>

<template>
  <Button @click="start">模拟页面加载</Button>
  <Loading v-if="loading" fullscreen text="页面加载中…" />
</template>
