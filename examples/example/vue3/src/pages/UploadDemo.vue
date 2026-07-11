<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// UploadDemo
const modules = getDemoModules('upload')
</script>

<template>
  <DemoPage title="Upload 文件上传" description="通过点击或者拖拽上传文件。" :modules="modules" />
</template>
