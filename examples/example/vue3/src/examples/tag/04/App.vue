<script setup lang="ts">
import { Tag } from '@expcat/tigercat-vue/Tag'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
</script>

<template>
  <ConfigProvider :locale="zhCN">
    <Tag closable>关闭名来自 locale</Tag>
  </ConfigProvider>
</template>
