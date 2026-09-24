<script setup lang="ts">
import { Link } from '@expcat/tigercat-vue/Link'
</script>

<template>
  <div class="flex flex-col gap-3">
    <Link href="https://github.com" target="_blank" rel="nofollow" variant="primary" size="lg">
      在新窗口打开 GitHub
    </Link>
    <Link href="https://github.com/expcat/Tigercat" disabled> 禁用不带地址 </Link>
  </div>
</template>
