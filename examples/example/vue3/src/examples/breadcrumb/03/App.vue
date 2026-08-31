<script setup lang="ts">
import { Breadcrumb } from '@expcat/tigercat-vue/Breadcrumb'
import { BreadcrumbItem } from '@expcat/tigercat-vue/BreadcrumbItem'
</script>

<template>
  <div class="space-y-2">
    <Breadcrumb :max-items="3">
      <BreadcrumbItem href="/" @click.prevent>首页</BreadcrumbItem>
      <BreadcrumbItem href="/a" @click.prevent>一级目录</BreadcrumbItem>
      <BreadcrumbItem href="/a/b" @click.prevent>二级目录</BreadcrumbItem>
      <BreadcrumbItem href="/a/b/c" @click.prevent>三级目录</BreadcrumbItem>
      <BreadcrumbItem href="/a/b/c/d" @click.prevent>四级目录</BreadcrumbItem>
      <BreadcrumbItem>当前页面</BreadcrumbItem>
    </Breadcrumb>
    <p class="text-sm text-gray-500">
      maxItems=3 时保留首页和当前页，中间折叠为 …。展开后再换路径会重新折叠。
    </p>
  </div>
</template>
