<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@expcat/tigercat-vue/DatePicker'

const value = ref<Date | null>(null)
</script>

<template>
  <DatePicker
    v-model="value"
    size="lg"
    clearable
    placeholder="请选择日期"
    class="w-full max-w-[280px]" />
</template>
