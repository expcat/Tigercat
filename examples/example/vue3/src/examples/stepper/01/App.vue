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
      <Stepper v-model="val" increment-aria-label="增加数值" decrement-aria-label="减少数值" />
      <Stepper
        v-model="val"
        :min="0"
        :max="10"
        :step="2"
        increment-aria-label="增加数值"
        decrement-aria-label="减少数值" />
      <Text>当前值: {{ val }}</Text>
    </Space>
  </div>
</template>
