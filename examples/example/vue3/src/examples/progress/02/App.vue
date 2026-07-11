<script setup lang="ts">
import { Progress } from '@expcat/tigercat-vue/Progress'
</script>

<template>
  <Progress
    type="circle"
    :percentage="72"
    status="success"
    show-text
    text="健康"
    aria-label="服务健康度" />
</template>
