<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { Text } from '@expcat/tigercat-vue/Text'
import { ref } from 'vue'
import { Stepper } from '@expcat/tigercat-vue/Stepper'

const val = ref(3)
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" :size="12">
      <Stepper
        :model-value="1"
        size="sm"
        increment-aria-label="增加数值"
        decrement-aria-label="减少数值" />
      <Stepper
        :model-value="1"
        size="md"
        increment-aria-label="增加数值"
        decrement-aria-label="减少数值" />
      <Stepper
        :model-value="1"
        size="lg"
        increment-aria-label="增加数值"
        decrement-aria-label="减少数值" />
      <Stepper
        :model-value="1"
        disabled
        increment-aria-label="增加数值"
        decrement-aria-label="减少数值" />
    </Space>
  </div>
</template>
