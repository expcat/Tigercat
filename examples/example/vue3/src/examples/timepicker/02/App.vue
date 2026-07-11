<script setup lang="ts">
import { ref } from 'vue'
import { TimePicker } from '@expcat/tigercat-vue/TimePicker'

const range = ref<[string | null, string | null]>(['09:00', '18:00'])
</script>

<template>
  <TimePicker v-model="range" range :minute-step="15" class="w-full max-w-[360px]" />
</template>
