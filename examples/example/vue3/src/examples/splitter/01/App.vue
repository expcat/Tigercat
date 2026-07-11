<script setup lang="ts">
import { Splitter } from '@expcat/tigercat-vue/Splitter'
</script>

<template>
  <div class="min-w-0">
    <Splitter
      direction="horizontal"
      :sizes="[30, 70]"
      style="height: 200px; border: 1px solid #e5e7eb; border-radius: 8px">
      <div class="p-4">左侧面板 (30px)</div>
      <div class="p-4">右侧面板 (70px)</div>
    </Splitter>
  </div>
</template>
