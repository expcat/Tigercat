<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { Text } from '@expcat/tigercat-vue/Text'
import { ref } from 'vue'
import { Stepper } from '@expcat/tigercat-vue/Stepper'

const val = ref(3)
</script>

<template>
  <div class="min-w-0">
    <Stepper
      :model-value="1.5"
      :step="0.1"
      :precision="2"
      :min="0"
      :max="5"
      increment-aria-label="增加数值"
      decrement-aria-label="减少数值" />
  </div>
</template>
