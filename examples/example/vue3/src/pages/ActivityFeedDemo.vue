<script setup lang="ts">
import { ref } from 'vue'
import { ActivityFeed } from '@expcat/tigercat-vue'
import type { ActivityGroup } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'

const activityGroups = ref<ActivityGroup[]>([
  {
    key: 'today',
    title: '今天',
    items: [
      {
        id: 1,
        title: '更新访问策略',
        description: '安全组策略已更新并生效。',
        time: '09:30',
        user: { name: '管理员', avatar: 'https://i.pravatar.cc/40?img=12' },
        status: { label: '已完成', variant: 'success' },
        actions: [{ label: '查看详情', href: '#' }]
      },
      {
        id: 2,
        title: '导入审计日志',
        description: '共导入 24 条记录。',
        time: '10:05',
        user: { name: '系统' },
        status: { label: '处理中', variant: 'warning' },
        actions: [{ label: '重试', href: '#' }]
      }
    ]
  },
  {
    key: 'yesterday',
    title: '昨天',
    items: [
      {
        id: 3,
        title: '发布版本 2.1',
        description: '包含安全修复与性能优化。',
        time: '16:45',
        user: { name: 'DevOps', avatar: 'https://i.pravatar.cc/40?img=6' },
        status: { label: '成功', variant: 'primary' },
        actions: [{ label: '变更记录', href: '#' }]
      }
    ]
  }
])

const basicSnippet = `<ActivityFeed :groups="activityGroups" />`

const loadingSnippet = `<ActivityFeed loading loading-text="正在加载动态..." />`

const emptySnippet = `<ActivityFeed :items="[]" empty-text="暂无活动" />`
</script>

<template>
  <div class="max-w-6xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">ActivityFeed 活动动态流</h1>
      <p class="text-gray-600">组合组件，适配审计日志与动态信息流。</p>
    </div>

    <DemoBlock title="分组展示" description="按日期分组展示动态。" :code="basicSnippet">
      <ActivityFeed :groups="activityGroups" />
    </DemoBlock>

    <DemoBlock title="加载态" description="数据加载中时的展示。" :code="loadingSnippet">
      <ActivityFeed loading loading-text="正在加载动态..." />
    </DemoBlock>

    <DemoBlock title="空态" description="无数据时的展示。" :code="emptySnippet">
      <ActivityFeed :items="[]" empty-text="暂无活动" />
    </DemoBlock>
  </div>
</template>
