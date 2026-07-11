<script setup lang="ts">
import { ActivityFeed } from '@expcat/tigercat-vue/ActivityFeed'
import type { ActivityGroup } from '@expcat/tigercat-core'

const groups: ActivityGroup[] = [
  {
    key: 'today',
    title: '今天',
    items: [
      {
        id: 1,
        title: '发布新版本',
        description: '示例精简已完成。',
        time: '09:30',
        user: { name: '维护者' },
        status: { label: '成功', variant: 'success' },
        actions: [{ label: '查看详情', href: '#' }]
      }
    ]
  }
]
</script>

<template>
  <ActivityFeed :groups="groups" />
</template>
