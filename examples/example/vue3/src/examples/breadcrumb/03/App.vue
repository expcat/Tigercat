<script setup lang="ts">
import { Breadcrumb } from '@expcat/tigercat-vue/Breadcrumb'
import { BreadcrumbItem } from '@expcat/tigercat-vue/BreadcrumbItem'
</script>

<template>
  <div class="space-y-2">
    <Breadcrumb :max-items="3">
      <BreadcrumbItem href="/">首页</BreadcrumbItem>
      <BreadcrumbItem href="/a">一级目录</BreadcrumbItem>
      <BreadcrumbItem href="/a/b">二级目录</BreadcrumbItem>
      <BreadcrumbItem href="/a/b/c">三级目录</BreadcrumbItem>
      <BreadcrumbItem href="/a/b/c/d">四级目录</BreadcrumbItem>
      <BreadcrumbItem current>当前页面</BreadcrumbItem>
    </Breadcrumb>
    <p class="text-sm text-gray-500">maxItems=3 时中间项折叠为 …，点击可展开完整路径。</p>
  </div>
</template>
