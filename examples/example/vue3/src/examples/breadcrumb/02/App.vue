<script setup lang="ts">
import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-vue/Breadcrumb'
</script>

<template>
  <Breadcrumb :max-items="3">
    <BreadcrumbItem href="/">首页</BreadcrumbItem>
    <BreadcrumbItem href="/docs">文档</BreadcrumbItem>
    <BreadcrumbItem href="/api">接口</BreadcrumbItem>
    <BreadcrumbItem current>当前</BreadcrumbItem>
  </Breadcrumb>
</template>
