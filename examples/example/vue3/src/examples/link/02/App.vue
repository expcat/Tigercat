<script setup lang="ts">
import { Link } from '@expcat/tigercat-vue/Link'

function track() {
  window.console.info('tracked navigation')
}
</script>

<template>
  <Link href="https://github.com/expcat/Tigercat" target="_blank" variant="default" @click="track">
    打开仓库（不拦截跳转）
  </Link>
</template>
