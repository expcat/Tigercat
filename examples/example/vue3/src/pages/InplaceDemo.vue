<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('inplace')
</script>

<template>
  <DemoPage
    title="Inplace 原位编辑"
    description="在展示态与编辑态之间切换，支持提交与取消。"
    :modules="modules" />
</template>
