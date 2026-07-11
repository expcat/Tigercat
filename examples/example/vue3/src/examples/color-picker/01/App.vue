<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker } from '@expcat/tigercat-vue/ColorPicker'

const color = ref('rgba(37, 99, 235, 0.8)')
</script>

<template>
  <ColorPicker
    v-model="color"
    show-alpha
    format="rgb"
    :presets="['#2563eb', '#0891b2', '#059669', '#dc2626']"
    size="lg" />
</template>
