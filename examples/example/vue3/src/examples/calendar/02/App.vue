<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@expcat/tigercat-vue/Calendar'

const date = ref<Date | undefined>(new Date())
const isWeekend = (value: Date) => value.getDay() === 0 || value.getDay() === 6
</script>

<template>
  <Calendar v-model="date" mode="year" fullscreen :disabled-date="isWeekend" />
</template>
