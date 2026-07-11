<script setup lang="ts">
import { ref } from 'vue'
import { BackTop } from '@expcat/tigercat-vue/BackTop'

const containerRef = ref<HTMLElement | null>(null)
const getContainer = () => containerRef.value ?? window
</script>

<template>
  <div ref="containerRef" class="relative h-64 overflow-auto rounded border">
    <div class="h-[900px] p-4">
      <p>在此容器内向下滚动。</p>
    </div>
    <BackTop :target="getContainer" :visibility-height="100" position="sticky" :duration="0" />
  </div>
</template>
