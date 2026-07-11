<script setup lang="ts">
import { Progress } from '@expcat/tigercat-vue/Progress'
</script>

<template>
  <Progress
    :percentage="64"
    variant="success"
    size="lg"
    striped
    striped-animation
    aria-label="任务完成进度" />
</template>
