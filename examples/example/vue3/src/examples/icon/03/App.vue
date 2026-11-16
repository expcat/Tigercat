<script setup lang="ts">
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { Icon } from '@expcat/tigercat-vue/Icon'
import { createIconRegistry, rocketIcon } from '@expcat/tigercat-core/icons/registry'

const iconRegistry = createIconRegistry()
iconRegistry.register('app-rocket', rocketIcon)
</script>

<template>
  <ConfigProvider :icon-registry="iconRegistry">
    <div class="flex flex-wrap items-center gap-4">
      <Icon name="fullscreen" aria-label="全屏" />
      <Icon name="ticket" aria-label="工单" />
      <Icon name="bolt" aria-label="闪电" />
      <Icon name="chart-bar" aria-label="图表" />
      <Icon name="database" aria-label="数据库" />
      <Icon name="app-rocket" aria-label="rocket" />
    </div>
  </ConfigProvider>
</template>
