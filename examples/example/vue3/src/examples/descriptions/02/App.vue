<script setup lang="ts">
import { Descriptions } from '@expcat/tigercat-vue/Descriptions'

const items = [
  { label: 'CPU', content: '8 核' },
  { label: '内存', content: '16 GB' },
  { label: '系统', content: 'Ubuntu 24.04', span: 2 }
]
</script>

<template>
  <Descriptions
    title="服务器配置"
    :items="items"
    layout="vertical"
    bordered
    size="sm"
    :column="2"
    :colon="false" />
</template>
