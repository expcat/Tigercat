<script setup lang="ts">
import { Progress } from '@expcat/tigercat-vue/Progress'
</script>

<template>
  <div class="space-y-3">
    <Progress :percentage="40" status="success" />
    <Progress :percentage="40" indeterminate />
    <Progress :percentage="50" :steps="4" />
  </div>
</template>
