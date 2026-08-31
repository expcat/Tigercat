<script setup lang="ts">
import { Splitter } from '@expcat/tigercat-vue/Splitter'
</script>

<template>
  <div class="min-w-0">
    <Splitter
      direction="horizontal"
      :sizes="['25%', '75%']"
      dir="rtl"
      style="height: 300px; border: 1px solid var(--tiger-border, #e5e7eb); border-radius: 8px">
      <div class="p-4 h-full bg-[var(--tiger-surface-muted,#f9fafb)]">起始栏</div>
      <Splitter direction="vertical" :sizes="['60%', '40%']">
        <div class="p-4">内容区</div>
        <div class="p-4 bg-[var(--tiger-surface-muted,#f9fafb)]">底部面板</div>
      </Splitter>
    </Splitter>
  </div>
</template>
