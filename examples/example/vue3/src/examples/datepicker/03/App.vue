<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@expcat/tigercat-vue/DatePicker'

const weekday = new Date(2026, 5, 15)
const value = ref<Date | null>(weekday)
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6
</script>

<template>
  <DatePicker
    v-model="value"
    min-date="2026-01-01"
    max-date="2026-12-31"
    :disabled-date="isWeekend"
    class="w-full max-w-[280px]" />
</template>
