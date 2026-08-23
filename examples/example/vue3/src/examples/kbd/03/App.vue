<script setup lang="ts">
import { Kbd } from '@expcat/tigercat-vue/Kbd'
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <Kbd size="sm">S</Kbd>
      <Kbd size="md">M</Kbd>
      <Kbd size="lg">L</Kbd>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Kbd variant="default" :keys="['Ctrl', 'S']" />
      <Kbd variant="subtle" :keys="['Ctrl', 'S']" />
    </div>
  </div>
</template>
