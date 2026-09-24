<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@expcat/tigercat-vue/Slider'

const value = ref(30)
</script>

<template>
  <Slider
    v-model="value"
    :marks="{ 0: '0', 50: '50', 100: '100' }"
    :format-tooltip="(next: number) => `${next}%`"
    aria-label="Volume"
    class="w-full max-w-sm" />
</template>
