<script setup lang="ts">
import { Divider } from '@expcat/tigercat-vue/Divider'
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <div class="text-gray-700 dark:text-gray-300">none</div>
      <Divider spacing="none" />
      <div class="text-gray-700 dark:text-gray-300">xs</div>
      <Divider spacing="xs" />
      <div class="text-gray-700 dark:text-gray-300">sm</div>
      <Divider spacing="sm" />
      <div class="text-gray-700 dark:text-gray-300">md (default)</div>
      <Divider spacing="md" />
      <div class="text-gray-700 dark:text-gray-300">lg</div>
      <Divider spacing="lg" />
      <div class="text-gray-700 dark:text-gray-300">xl</div>
      <Divider spacing="xl" />
    </div>
  </div>
</template>
