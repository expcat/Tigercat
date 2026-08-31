<script setup lang="ts">
import { Breadcrumb } from '@expcat/tigercat-vue/Breadcrumb'
import { BreadcrumbItem } from '@expcat/tigercat-vue/BreadcrumbItem'
</script>

<template>
  <Breadcrumb separator="chevron">
    <template #extra>
      <span class="text-xs text-gray-500">项目导航</span>
    </template>
    <BreadcrumbItem href="/" @click.prevent>首页</BreadcrumbItem>
    <BreadcrumbItem href="/components" @click.prevent>组件</BreadcrumbItem>
    <BreadcrumbItem>Breadcrumb</BreadcrumbItem>
  </Breadcrumb>
</template>
