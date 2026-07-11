<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// MentionsDemo
const modules = getDemoModules('mentions')
</script>

<template>
  <DemoPage
    title="Mentions 提及"
    description="输入框中 @提及 用户，支持自定义触发字符。"
    :modules="modules" />
</template>
