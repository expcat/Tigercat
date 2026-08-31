<script setup lang="ts">
import { Splitter } from '@expcat/tigercat-vue/Splitter'
</script>

<template>
  <div class="min-w-0 flex flex-col gap-3">
    <Splitter
      direction="vertical"
      :sizes="['40%', '60%']"
      style="height: 220px; border: 1px solid var(--tiger-border, #e5e7eb); border-radius: 8px">
      <div class="p-4">上方面板</div>
      <div class="p-4">下方面板</div>
    </Splitter>
    <Splitter
      disabled
      :sizes="['50%', '50%']"
      style="height: 80px; border: 1px solid var(--tiger-border, #e5e7eb); border-radius: 8px">
      <div class="p-3 text-sm">禁用</div>
      <div class="p-3 text-sm">不能拖</div>
    </Splitter>
  </div>
</template>
