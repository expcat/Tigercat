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
    <Resizable
      :default-width="300"
      :default-height="150"
      :min-width="100"
      :min-height="60"
      @resize="onResize">
      <div
        class="w-full h-full bg-blue-50 border border-blue-200 rounded flex items-center justify-center text-sm text-blue-600">
        {{ size.width }} × {{ size.height }}
      </div>
    </Resizable>
  </div>
</template>
