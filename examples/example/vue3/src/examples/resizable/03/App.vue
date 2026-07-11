<script setup lang="ts">
import { reactive } from 'vue'
import { Resizable } from '@expcat/tigercat-vue/Resizable'

const size = reactive({ width: 300, height: 150 })

const onResize = (e: { width: number; height: number }) => {
  size.width = Math.round(e.width)
  size.height = Math.round(e.height)
}
</script>

<template>
  <div class="min-w-0">
    <Resizable :default-width="200" :default-height="100" disabled>
      <div
        class="w-full h-full bg-gray-100 border rounded flex items-center justify-center text-sm text-gray-400">
        禁用状态
      </div>
    </Resizable>
  </div>
</template>
