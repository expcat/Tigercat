<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@expcat/tigercat-vue/Calendar'

const selectedDate = ref<Date | undefined>(new Date())
const selectedDate2 = ref<Date | undefined>(new Date())

const isWeekend = (date: Date) => {
  const day = date.getDay()
  return day === 0 || day === 6
}
</script>

<template>
  <div class="min-w-0">
    <Calendar v-model="selectedDate2" :disabled-date="isWeekend" />
  </div>
</template>
