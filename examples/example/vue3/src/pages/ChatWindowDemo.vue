<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ChatWindowDemo
const modules = getDemoModules('chat-window')
</script>

<template>
  <DemoPage
    title="ChatWindow 聊天窗口"
    description="组合组件，用于构建完整聊天交互区域。"
    :modules="modules" />
</template>
