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
    <Space :size="16" align="center">
      <ColorPicker v-model="color" />
      <Text>选中颜色: {{ color }}</Text>
    </Space>
  </div>
</template>
