<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@expcat/tigercat-vue/Slider'

const marks = { 0: '0°', 25: '25°', 50: '50°', 75: '75°', 100: '100°' }
const a = ref<number | [number, number]>(50)
const b = ref<number | [number, number]>(30)
</script>

<template>
  <div class="w-full max-w-lg space-y-8">
    <div>
      <p class="mb-2 text-sm text-gray-500">marks（对象：自定义刻度文案）</p>
      <Slider v-model="a" :marks="marks" :step="25" />
    </div>
    <div>
      <p class="mb-2 text-sm text-gray-500">marks（true：按 step 自动刻度）</p>
      <Slider v-model="b" marks :step="10" />
    </div>
  </div>
</template>
