<script setup lang="ts">
import { Alert } from '@expcat/tigercat-vue/Alert'
import { Button } from '@expcat/tigercat-vue/Button'

const types = ['success', 'info', 'warning', 'error'] as const
</script>

<template>
  <div class="space-y-3">
    <Alert
      v-for="type in types"
      :key="type"
      :type="type"
      :title="`类型：${type}`"
      description="类型决定图标与配色。只有 error 默认是 live region。"
      show-icon />
    <Alert
      type="info"
      title="无图标"
      description="showIcon=false 时不留图标间距。"
      :show-icon="false" />
    <Alert type="success" title="标题加操作">
      <Button size="sm">撤销</Button>
    </Alert>
  </div>
</template>
