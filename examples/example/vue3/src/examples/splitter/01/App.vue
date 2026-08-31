<script setup lang="ts">
import { ref } from 'vue'
import { Splitter } from '@expcat/tigercat-vue/Splitter'

const sizes = ref<(number | string)[]>(['30%', '70%'])
</script>

<template>
  <div class="min-w-0">
    <Splitter
      v-model:sizes="sizes"
      direction="horizontal"
      :gutter-size="6"
      style="height: 200px; border: 1px solid var(--tiger-border, #e5e7eb); border-radius: 8px">
      <div class="p-4">左侧 30%</div>
      <div class="p-4">右侧 70%</div>
    </Splitter>
  </div>
</template>
