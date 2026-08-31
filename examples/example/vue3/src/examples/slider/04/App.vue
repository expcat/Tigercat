<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@expcat/tigercat-vue/Slider'
import { FormItem } from '@expcat/tigercat-vue/FormItem'

const sizes = ['sm', 'md', 'lg'] as const
const value = ref<number | [number, number]>(60)
</script>

<template>
  <div class="w-full max-w-lg space-y-6">
    <FormItem v-for="size in sizes" :key="size" :label="`size=${size}`">
      <Slider v-model="value" :size="size" />
    </FormItem>
    <FormItem label="disabled">
      <Slider :model-value="40" disabled :tooltip="false" />
    </FormItem>
  </div>
</template>
