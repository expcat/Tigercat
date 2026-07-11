<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { Text } from '@expcat/tigercat-vue/Text'
import { ref } from 'vue'
import { ColorPicker } from '@expcat/tigercat-vue/ColorPicker'

const color = ref('#2563eb')
const color2 = ref('#2563eb')
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" :size="12">
      <ColorPicker v-model="color2" show-alpha format="rgb" />
      <ColorPicker
        v-model="color2"
        :presets="['#f5222d', '#fa8c16', '#52c41a', '#1677ff', '#722ed1']" />
      <Space :size="12">
        <ColorPicker :model-value="'#ccc'" size="sm" />
        <ColorPicker :model-value="'#ccc'" size="lg" />
        <ColorPicker :model-value="'#ccc'" disabled />
      </Space>
    </Space>
  </div>
</template>
