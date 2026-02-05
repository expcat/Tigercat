<script setup lang="ts">
import { ref } from 'vue'
import { NotificationCenter } from '@expcat/tigercat-vue'
import type { NotificationItem } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'

const items = ref<NotificationItem[]>([
    {
        id: 1,
        title: '系统维护提醒',
        description: '今晚 23:00-01:00 系统维护，请提前保存工作。',
        time: '10:30',
        type: '系统',
        read: false
    },
    {
        id: 2,
        title: '评论回复',
        description: '你在「设计文档」的评论有新回复。',
        time: '09:12',
        type: '评论',
        read: true
    },
    {
        id: 3,
        title: '任务到期',
        description: '任务「月度总结」将在 2 天后到期。',
        time: '昨天',
        type: '任务',
        read: false
    },
    {
        id: 4,
        title: '系统升级完成',
        description: '新版本已发布，查看更新日志。',
        time: '昨天',
        type: '系统',
        read: true
    }
])

const groupOrder = ['系统', '评论', '任务']

const handleReadChange = (item: NotificationItem, read: boolean) => {
    items.value = items.value.map((entry) =>
        entry.id === item.id ? { ...entry, read } : entry
    )
}

const handleMarkAllRead = (
    _groupKey: string | number | undefined,
    groupItems: NotificationItem[]
) => {
    const ids = new Set(groupItems.map((entry) => entry.id))
    items.value = items.value.map((entry) => (ids.has(entry.id) ? { ...entry, read: true } : entry))
}

const basicSnippet = `<NotificationCenter
    :items="items"
    :group-order="['系统', '评论', '任务']"
    @item-read-change="handleReadChange"
    @mark-all-read="handleMarkAllRead" />`

const loadingSnippet = `<NotificationCenter loading loading-text="正在加载通知..." />`
</script>

<template>
    <div class="max-w-6xl mx-auto p-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-2">NotificationCenter 通知中心</h1>
            <p class="text-gray-600">组合组件，提供通知分组、已读筛选与批量标记。</p>
        </div>

        <DemoBlock title="基础用法" description="按类型分组与已读管理。" :code="basicSnippet">
            <NotificationCenter
                :items="items"
                :group-order="groupOrder"
                @item-read-change="handleReadChange"
                @mark-all-read="handleMarkAllRead" />
        </DemoBlock>

        <DemoBlock title="加载态" description="数据加载中的展示。" :code="loadingSnippet">
            <NotificationCenter loading loading-text="正在加载通知..." />
        </DemoBlock>
    </div>
</template>
