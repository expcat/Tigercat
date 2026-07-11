<script setup lang="ts">
import { ref } from 'vue'
import { TimePicker } from '@expcat/tigercat-vue/TimePicker'

const value = ref<string | null>('09:30:00')
</script>

<template>
  <TimePicker
    v-model="value"
    show-seconds
    :minute-step="5"
    size="lg"
    clearable
    class="w-full max-w-[280px]" />
</template>
