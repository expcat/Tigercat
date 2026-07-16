<script setup lang="ts">
import { ref } from 'vue'
import { Stepper } from '@expcat/tigercat-vue/Stepper'

const qty = ref(10)
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-3">
      <span class="w-16 text-sm text-gray-500">步长 5</span>
      <Stepper v-model="qty" :min="0" :max="100" :step="5" />
    </div>
    <div class="flex items-center gap-3">
      <span class="w-16 text-sm text-gray-500">禁用</span>
      <Stepper :model-value="5" disabled />
    </div>
    <p class="text-sm text-gray-500">min/max 限制范围，step 控制增减步长。</p>
  </div>
</template>
