<script setup lang="ts">
import { ref } from 'vue'
import { InputNumber } from '@expcat/tigercat-vue/InputNumber'

const value = ref<number | string>('9007199254740993')
</script>

<template>
  <InputNumber v-model="value" aria-label="Big integer" class="w-full max-w-sm" />
  <p class="mt-2 text-sm">{{ typeof value }} {{ value }}</p>
</template>
