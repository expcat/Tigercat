<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// AvatarDemo
const modules = getDemoModules('avatar')
</script>

<template>
  <DemoPage
    title="Avatar 头像"
    description="用于展示用户或实体的头像组件，支持图片、文字、图标等多种展示形式。"
    :modules="modules" />
</template>
