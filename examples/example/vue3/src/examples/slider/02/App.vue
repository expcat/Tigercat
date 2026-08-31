<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@expcat/tigercat-vue/Slider'
import { FormItem } from '@expcat/tigercat-vue/FormItem'

const range = ref<number | [number, number]>([20, 70])
</script>

<template>
  <div class="w-full max-w-lg space-y-2">
    <FormItem label="价格区间">
      <Slider v-model="range" range :min="0" :max="100" :step="10" />
    </FormItem>
    <p class="text-sm text-gray-600 dark:text-gray-300">选择范围：{{ String(range) }}</p>
  </div>
</template>
