<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ModalDemo
const modules = getDemoModules('modal')
</script>

<template>
  <DemoPage
    title="Modal 对话框"
    description="用于显示重要信息或需要用户交互的浮层对话框。"
    :modules="modules" />
</template>
