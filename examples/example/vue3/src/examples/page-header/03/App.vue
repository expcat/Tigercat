<script setup lang="ts">
import { Link } from '@expcat/tigercat-vue/Link'
import { PageHeader } from '@expcat/tigercat-vue/PageHeader'
import { Tag } from '@expcat/tigercat-vue/Tag'
</script>

<template>
  <PageHeader title="项目概览" sub-title="只读页头，返回使用 Link 覆盖">
    <template #back>
      <Link href="#projects" :underline="false" class="text-sm">返回项目</Link>
    </template>
    <template #actions>
      <Tag>进行中</Tag>
    </template>
    <p class="text-sm text-gray-600 dark:text-gray-300">
      默认插槽渲染在标题行下方，适合放简短说明或筛选条。自定义 back 插槽可换成 Link 或其他控件。
    </p>
  </PageHeader>
</template>
