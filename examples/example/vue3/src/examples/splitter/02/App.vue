<script setup lang="ts">
import { Splitter } from '@expcat/tigercat-vue/Splitter'
</script>

<template>
  <div class="min-w-0">
    <Splitter
      direction="vertical"
      :sizes="[40, 60]"
      style="height: 300px; border: 1px solid #e5e7eb; border-radius: 8px">
      <div class="p-4">上方面板</div>
      <div class="p-4">下方面板</div>
    </Splitter>
  </div>
</template>
