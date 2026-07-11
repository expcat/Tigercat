<script setup lang="ts">
import { Collapse } from '@expcat/tigercat-vue/Collapse'
import { CollapsePanel } from '@expcat/tigercat-vue/CollapsePanel'
</script>

<template>
  <Collapse :default-active-key="['profile']">
    <CollapsePanel panel-key="profile">
      <template #header>
        <strong class="text-blue-600">用户资料</strong>
      </template>
      <template #extra>
        <span class="text-xs text-gray-500">已更新</span>
      </template>
      自定义标题和额外区域可承载状态信息。
    </CollapsePanel>
  </Collapse>
</template>
