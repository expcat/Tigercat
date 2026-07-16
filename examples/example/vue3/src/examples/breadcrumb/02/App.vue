<script setup lang="ts">
import { Breadcrumb } from '@expcat/tigercat-vue/Breadcrumb'
import { BreadcrumbItem } from '@expcat/tigercat-vue/BreadcrumbItem'
</script>

<template>
  <div class="space-y-3">
    <Breadcrumb separator="slash">
      <BreadcrumbItem href="/">首页</BreadcrumbItem>
      <BreadcrumbItem href="/settings">设置</BreadcrumbItem>
      <BreadcrumbItem current>账户</BreadcrumbItem>
    </Breadcrumb>
    <Breadcrumb separator="arrow">
      <BreadcrumbItem href="/">首页</BreadcrumbItem>
      <BreadcrumbItem href="/settings">设置</BreadcrumbItem>
      <BreadcrumbItem current>账户</BreadcrumbItem>
    </Breadcrumb>
    <Breadcrumb separator="›">
      <BreadcrumbItem href="/" icon="🏠">首页</BreadcrumbItem>
      <BreadcrumbItem href="/files" icon="📁">文件</BreadcrumbItem>
      <BreadcrumbItem current icon="📄">文档</BreadcrumbItem>
    </Breadcrumb>
  </div>
</template>
