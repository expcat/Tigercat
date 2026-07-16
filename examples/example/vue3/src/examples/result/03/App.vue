<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Result } from '@expcat/tigercat-vue/Result'
</script>

<template>
  <Result status="success" title="部署完成" sub-title="服务已上线，可在控制台查看运行状态">
    <template #icon>
      <span class="text-5xl">🚀</span>
    </template>
    <template #extra>
      <div class="flex justify-center gap-2">
        <Button variant="primary">前往控制台</Button>
        <Button variant="outline">查看日志</Button>
      </div>
    </template>
    <p class="text-center text-sm text-gray-500">默认插槽可放置补充说明或详情列表。</p>
  </Result>
</template>
