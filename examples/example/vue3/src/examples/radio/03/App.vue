<script setup lang="ts">
import { ref } from 'vue'
import { Radio } from '@expcat/tigercat-vue/Radio'
import { RadioGroup } from '@expcat/tigercat-vue/RadioGroup'

const lastValue = ref<string | number>('standard')
</script>

<template>
  <div class="space-y-2">
    <RadioGroup default-value="standard" class="flex flex-wrap gap-4" @change="lastValue = $event">
      <Radio value="standard">标准</Radio>
      <Radio value="express">加急</Radio>
    </RadioGroup>
    <p class="text-sm text-gray-600 dark:text-gray-300">最近选择：{{ lastValue }}</p>
  </div>
</template>
