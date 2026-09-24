<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// AvatarDemo
const modules = getDemoModules('avatar')
</script>

<template>
  <DemoPage
    title="Avatar 头像"
    description="头像支持图片、文字和图标。溢出按钮打开浮层，列出被折叠头像的名字。"
    :modules="modules" />
</template>
