<script setup lang="ts">
import { ref } from 'vue'
import { Stepper } from '@expcat/tigercat-vue/Stepper'

const value = ref(2.5)
</script>

<template>
  <Stepper
    v-model="value"
    :min="0"
    :max="10"
    :step="0.5"
    :precision="1"
    size="lg"
    increment-aria-label="增加数值"
    decrement-aria-label="减少数值" />
</template>
