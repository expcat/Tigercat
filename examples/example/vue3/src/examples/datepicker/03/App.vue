<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@expcat/tigercat-vue/DatePicker'

const value = ref<Date | null>(null)
</script>

<template>
  <DatePicker
    v-model="value"
    :min-date="new Date('2026-01-01')"
    :max-date="new Date('2026-12-31')"
    placeholder="仅可选择 2026 年日期"
    class="w-full max-w-[280px]" />
</template>
