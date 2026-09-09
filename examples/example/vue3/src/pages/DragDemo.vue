<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('drag')
</script>

<template>
  <DemoPage
    title="Drag 拖拽"
    description="独立 Drag 组件与 useDrag 共用同一套 item props，落下后回写 items。"
    :modules="modules" />
</template>
