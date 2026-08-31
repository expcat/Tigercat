<script setup lang="ts">
import { ref } from 'vue'
import { Breadcrumb } from '@expcat/tigercat-vue/Breadcrumb'
import { BreadcrumbItem } from '@expcat/tigercat-vue/BreadcrumbItem'
import { Button } from '@expcat/tigercat-vue/Button'
import { PageHeader } from '@expcat/tigercat-vue/PageHeader'

const lastAction = ref('尚未操作')

function onBack(event: Event) {
  event.preventDefault()
  lastAction.value = '返回目录'
}
</script>

<template>
  <div class="space-y-3">
    <PageHeader title="商品编辑" sub-title="SKU-8848" back-href="#catalog" @back="onBack">
      <template #breadcrumb>
        <Breadcrumb separator="chevron">
          <BreadcrumbItem href="/" @click.prevent>首页</BreadcrumbItem>
          <BreadcrumbItem href="/products" @click.prevent>商品</BreadcrumbItem>
          <BreadcrumbItem>编辑</BreadcrumbItem>
        </Breadcrumb>
      </template>
      <template #actions>
        <Button variant="outline" size="sm" @click="lastAction = '预览'">预览</Button>
        <Button size="sm" @click="lastAction = '发布'">发布</Button>
      </template>
    </PageHeader>
    <p class="text-sm text-gray-500">最近操作：{{ lastAction }}</p>
  </div>
</template>
