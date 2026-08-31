<script setup lang="ts">
import { Breadcrumb } from '@expcat/tigercat-vue/Breadcrumb'
import { BreadcrumbItem } from '@expcat/tigercat-vue/BreadcrumbItem'
</script>

<template>
  <div class="space-y-3">
    <Breadcrumb separator="slash">
      <BreadcrumbItem href="/" @click.prevent>首页</BreadcrumbItem>
      <BreadcrumbItem href="/settings" @click.prevent>设置</BreadcrumbItem>
      <BreadcrumbItem>账户</BreadcrumbItem>
    </Breadcrumb>
    <Breadcrumb separator="arrow">
      <BreadcrumbItem href="/" @click.prevent>首页</BreadcrumbItem>
      <BreadcrumbItem href="/settings" @click.prevent>设置</BreadcrumbItem>
      <BreadcrumbItem>账户</BreadcrumbItem>
    </Breadcrumb>
    <Breadcrumb separator="›">
      <BreadcrumbItem href="/" icon="🏠" @click.prevent>首页</BreadcrumbItem>
      <BreadcrumbItem icon="📁" @click="() => undefined">文件</BreadcrumbItem>
      <BreadcrumbItem icon="📄">文档</BreadcrumbItem>
    </Breadcrumb>
  </div>
</template>
