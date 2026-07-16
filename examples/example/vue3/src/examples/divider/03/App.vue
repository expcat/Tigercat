<script setup lang="ts">
import { Divider } from '@expcat/tigercat-vue/Divider'

const styles = ['solid', 'dashed', 'dotted', 'gradient'] as const
</script>

<template>
  <div>
    <div v-for="lineStyle in styles" :key="lineStyle">
      <p class="text-sm text-gray-500">lineStyle="{{ lineStyle }}"</p>
      <Divider :line-style="lineStyle" spacing="sm" />
    </div>
  </div>
</template>
