<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { Text } from '@expcat/tigercat-vue/Text'
import { ref } from 'vue'
import { ColorSwatch } from '@expcat/tigercat-vue/ColorSwatch'

const color = ref('#3b82f6')
const brandColor = ref('#2563eb')
const statusColor = ref('#16a34a')

const brandGroups = [
  {
    label: 'Brand',
    colors: [
      { value: '#0f172a', label: 'Ink' },
      { value: '#2563eb', label: 'Blue' },
      { value: '#0891b2', label: 'Cyan' },
      { value: '#059669', label: 'Green' }
    ]
  },
  {
    label: 'Neutral',
    colors: ['#f8fafc', '#cbd5e1', '#64748b', '#1e293b']
  }
]
</script>

<template>
  <div class="min-w-0">
    <Space :size="16" align="center">
      <ColorSwatch v-model="color" />
      <Text>选中颜色: {{ color }}</Text>
    </Space>
  </div>
</template>
