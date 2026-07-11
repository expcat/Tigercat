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
    <Space direction="vertical" :size="12">
      <Segmented
        v-model="selected"
        :options="[
          { label: '日', value: 'daily' },
          { label: '周', value: 'weekly' },
          { label: '月', value: 'monthly' },
          { label: '年', value: 'yearly' }
        ]" />
      <Text>当前选中: {{ selected }}</Text>
    </Space>
  </div>
</template>
