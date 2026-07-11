<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { Text } from '@expcat/tigercat-vue/Text'
import { ref } from 'vue'
import { Segmented } from '@expcat/tigercat-vue/Segmented'

const selected = ref<string | number>('daily')

const simpleOpts = [
  { label: '选项 A', value: 'a' },
  { label: '选项 B', value: 'b' },
  { label: '选项 C', value: 'c' }
]
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" :size="12" class="w-full">
      <Segmented size="sm" :options="simpleOpts" model-value="a" />
      <Segmented size="md" :options="simpleOpts" model-value="a" />
      <Segmented size="lg" :options="simpleOpts" model-value="a" />
      <Segmented block :options="simpleOpts" model-value="a" />
    </Space>
  </div>
</template>
