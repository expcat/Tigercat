<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@expcat/tigercat-vue/Calendar'

const weekday = new Date(2024, 5, 14)
const date = ref<Date | undefined>(weekday)
const isWeekend = (value: Date) => value.getDay() === 0 || value.getDay() === 6
</script>

<template>
  <Calendar v-model="date" :now="weekday" fullscreen :disabled-date="isWeekend" />
</template>
