<script setup lang="ts">
import { PageHeader } from '@expcat/tigercat-vue/PageHeader'
import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-vue/Breadcrumb'
import { Tabs, TabPane } from '@expcat/tigercat-vue/Tabs'
</script>

<template>
  <PageHeader title="发布记录" back-href="/releases">
    <template #breadcrumb>
      <Breadcrumb>
        <BreadcrumbItem href="/">首页</BreadcrumbItem>
        <BreadcrumbItem current>发布</BreadcrumbItem>
      </Breadcrumb>
    </template>
    <template #tabs>
      <Tabs default-active-key="notes">
        <TabPane tab-key="notes" label="说明" />
        <TabPane tab-key="files" label="文件" />
      </Tabs>
    </template>
    <template #footer>页脚由调用方提供</template>
  </PageHeader>
</template>
