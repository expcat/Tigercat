<script setup lang="ts">
import { Kbd } from '@expcat/tigercat-vue/Kbd'
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Kbd :keys="['Ctrl', 'K']" />
    <Kbd :keys="['⌘', 'Shift', 'P']" />
    <Kbd keys="Enter" />
    <Kbd :keys="['Ctrl']">S</Kbd>
  </div>
</template>
