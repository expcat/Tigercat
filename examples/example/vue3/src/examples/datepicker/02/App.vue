<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from '@expcat/tigercat-vue/DatePicker'

const range = ref<[Date | null, Date | null]>([null, null])
</script>

<template>
  <DatePicker v-model="range" range default-open class="w-full max-w-[360px]" />
</template>
