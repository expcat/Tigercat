<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@expcat/tigercat-vue/Calendar'
import type { CalendarMode } from '@expcat/tigercat-core'

const june = new Date(2024, 5, 15)
const date = ref<Date | undefined>(june)
const mode = ref<CalendarMode>('year')

function onPanelChange(_next: Date, nextMode: CalendarMode) {
  mode.value = nextMode
}
</script>

<template>
  <Calendar v-model="date" :now="june" :mode="mode" @panel-change="onPanelChange" />
</template>
