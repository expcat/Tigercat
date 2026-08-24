<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('highlight')
</script>

<template>
  <DemoPage
    title="Highlight 文本高亮"
    description="把关键词或正则匹配包在语义化 mark 里，保留其余文本，不是可交互控件。"
    :modules="modules" />
</template>
