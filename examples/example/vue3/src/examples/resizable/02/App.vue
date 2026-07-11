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
    <div class="flex gap-8">
      <Resizable :default-width="200" :default-height="200" lock-aspect-ratio>
        <div
          class="w-full h-full bg-green-50 border border-green-200 rounded flex items-center justify-center text-sm">
          lockAspectRatio
        </div>
      </Resizable>
      <Resizable :default-width="200" :default-height="100" axis="horizontal">
        <div
          class="w-full h-full bg-amber-50 border border-amber-200 rounded flex items-center justify-center text-sm">
          axis="x"
        </div>
      </Resizable>
    </div>
  </div>
</template>
