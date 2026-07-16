<script setup lang="ts">
import { Alert } from '@expcat/tigercat-vue/Alert'

const types = ['success', 'info', 'warning', 'error'] as const
</script>

<template>
  <div class="space-y-3">
    <Alert
      v-for="type in types"
      :key="type"
      :type="type"
      :title="`类型：${type}`"
      description="类型决定图标与配色。"
      show-icon />
    <Alert type="info" title="无图标" description="showIcon=false 时不显示类型图标。" :show-icon="false" />
  </div>
</template>
