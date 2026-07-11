<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@expcat/tigercat-vue/Calendar'

const date = ref<Date | undefined>(new Date())
</script>

<template>
  <div>
    <Calendar v-model="date" />
    <p class="mt-2 text-sm text-gray-500">选中日期：{{ date?.toLocaleDateString() ?? '无' }}</p>
  </div>
</template>
