<script setup lang="ts">
import { Calendar } from '@expcat/tigercat-vue/Calendar'

const june = new Date(2024, 5, 15)
const events = [
  { key: 'ship', title: '发版', date: '2024-06-15', color: '#2563eb' },
  { key: 'review', title: '评审', date: '2024-06-18', color: '#16a34a' }
]
</script>

<template>
  <Calendar :default-value="june" :now="june" :events="events" fullscreen>
    <template #dateCell="{ events: cellEvents }">
      <span v-if="cellEvents.length" class="text-[10px] leading-none">
        {{ cellEvents.length }}
      </span>
    </template>
  </Calendar>
</template>
