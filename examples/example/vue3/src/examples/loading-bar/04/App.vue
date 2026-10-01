<script setup lang="ts">
import { LoadingBarContainer } from '@expcat/tigercat-vue/LoadingBarContainer'
</script>

<template>
  <div>
    <LoadingBarContainer :percentage="60" status="loading" />
    <p>受控加载进度：60%</p>
  </div>
</template>
