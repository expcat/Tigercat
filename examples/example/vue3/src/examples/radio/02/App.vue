<script setup lang="ts">
import { ref } from 'vue'
import { Radio } from '@expcat/tigercat-vue/Radio'
import { RadioGroup } from '@expcat/tigercat-vue/RadioGroup'

const value = ref<string | number>('monthly')
</script>

<template>
  <RadioGroup v-model="value" class="flex flex-wrap gap-4">
    <Radio value="monthly">按月</Radio>
    <Radio value="yearly">按年</Radio>
    <Radio value="once">一次性</Radio>
  </RadioGroup>
</template>
