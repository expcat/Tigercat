<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// UseDragDemo
const modules = getDemoModules('use-drag')
</script>

<template>
  <DemoPage
    title="useDrag 拖拽"
    description="框架无关的拖拽逻辑封装，提供 getDragItemAttrs / getDropZoneAttrs 来快速绑定 HTML 拖拽事件。"
    :modules="modules" />
</template>
