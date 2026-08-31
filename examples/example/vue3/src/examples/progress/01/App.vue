<script setup lang="ts">
import { Progress } from '@expcat/tigercat-vue/Progress'
</script>

<template>
  <div class="space-y-3">
    <Progress :percentage="32" size="sm" />
    <Progress :percentage="64" />
    <Progress :percentage="88" variant="success" size="lg" striped striped-animation />
  </div>
</template>
