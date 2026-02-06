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
        description: '任务「月度总结」将在 2 天后到期，请尽快完成提交。',
        time: '昨天',
        type: '任务',
        read: false
    },
    {
        id: 4,
        title: '系统升级完成',
        description: '新版本已发布，查看更新日志了解变更详情。',
        time: '昨天',
        type: '系统',
        read: true
    },
    {
        id: 5,
        title: '代码审查请求',
        description: '张三 请求你审查 PR #42「重构用户认证模块」。',
        time: '08:45',
        type: '评论',
        read: false
    },
    {
        id: 6,
        title: '部署成功',
        description: '生产环境 v2.3.1 部署成功，所有健康检查通过。',
        time: '07:30',
        type: '系统',
        read: true
    },
    {
        id: 7,
        title: '任务分配',
        description: '新任务「API 接口文档更新」已分配给你，截止日期 2 月 15 日。',
        time: '昨天',
        type: '任务',
        read: false
    },
    {
        id: 8,
        title: '安全警告',
        description: '检测到异常登录尝试（IP: 192.168.1.***），请确认是否本人操作。',
        time: '前天',
        type: '系统',
        read: false
    }
])

const groupOrder = ['系统', '评论', '任务']

const basicSnippet = `<NotificationCenter
    :items="items"
    :group-order="['系统', '评论', '任务']"
    manage-read-state />`

const loadingSnippet = `<NotificationCenter loading loading-text="正在加载通知..." />`

const emptySnippet = `<NotificationCenter :items="[]" empty-text="暂无新通知" title="消息" />`
</script>

<template>
    <div class="max-w-6xl mx-auto p-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-2">NotificationCenter 通知中心</h1>
            <p class="text-gray-600">组合组件，提供通知分组、已读筛选与批量标记。</p>
        </div>

        <DemoBlock title="基础用法" description="按类型分组、已读状态筛选、批量标记已读。使用 manage-read-state 自动管理已读状态。" :code="basicSnippet">
            <div class="max-w-lg">
                <NotificationCenter
                    :items="items"
                    :group-order="groupOrder"
                    manage-read-state />
            </div>
        </DemoBlock>

        <DemoBlock title="加载态" description="数据加载中的展示。" :code="loadingSnippet">
            <div class="max-w-lg">
                <NotificationCenter loading loading-text="正在加载通知..." />
            </div>
        </DemoBlock>

        <DemoBlock title="空态" description="无通知时显示空状态提示。" :code="emptySnippet">
            <div class="max-w-lg">
                <NotificationCenter :items="[]" empty-text="暂无新通知" title="消息" />
            </div>
        </DemoBlock>
    </div>
</template>
