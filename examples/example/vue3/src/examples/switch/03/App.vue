<script setup lang="ts">
import { Switch } from '@expcat/tigercat-vue/Switch'
</script>

<template>
  <div class="flex items-center gap-6">
    <Switch :model-value="true" disabled>开 · disabled</Switch>
    <Switch :model-value="false" disabled>关 · disabled</Switch>
  </div>
</template>
