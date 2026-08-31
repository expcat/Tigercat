<script setup lang="ts">
import { Resizable } from '@expcat/tigercat-vue/Resizable'
</script>

<template>
  <div class="min-w-0 flex flex-wrap gap-4">
    <Resizable :default-width="160" :default-height="160" :min-width="120" lock-aspect-ratio>
      <div
        class="flex h-full w-full items-center justify-center rounded border border-green-200 bg-green-50 text-sm">
        锁定比例
      </div>
    </Resizable>
    <Resizable :default-width="200" :default-height="120" axis="horizontal" :min-width="80">
      <div
        class="flex h-full w-full items-center justify-center rounded border border-blue-200 bg-blue-50 text-sm">
        仅水平 axis
      </div>
    </Resizable>
    <Resizable :default-width="160" :default-height="80" disabled>
      <div
        class="flex h-full w-full items-center justify-center rounded border bg-[var(--tiger-surface-muted,#f9fafb)] text-sm">
        disabled
      </div>
    </Resizable>
  </div>
</template>
