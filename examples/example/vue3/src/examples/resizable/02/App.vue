<script setup lang="ts">
import { Resizable } from '@expcat/tigercat-vue/Resizable'
</script>

<template>
  <div class="min-w-0">
    <Resizable :default-width="200" :default-height="200" :min-width="120" lock-aspect-ratio>
      <div
        class="flex h-full w-full items-center justify-center rounded border border-green-200 bg-green-50 text-sm">
        固定宽高比
      </div>
    </Resizable>
  </div>
</template>
