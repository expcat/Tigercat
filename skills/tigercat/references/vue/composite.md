---
name: tigercat-vue-composite
description: Vue 3 composite components usage
---

# Composite Components (Vue 3)

组合组件：ChatWindow

> **Props Reference**: [shared/props/composite.md](../shared/props/composite.md) | **Patterns**: [shared/patterns/common.md](../shared/patterns/common.md)

---

## ChatWindow 聊天窗口

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ChatWindow } from '@expcat/tigercat-vue'
import type { ChatMessage } from '@expcat/tigercat-core'

const messages = ref<ChatMessage[]>([
  {
    id: 1,
    content: '你好，我是 Tigercat。',
    direction: 'other',
    user: { name: 'Tigercat', avatar: 'https://i.pravatar.cc/40?img=3' },
    time: new Date(),
    status: 'sent'
  },
  {
    id: 2,
    content: '请问有什么可以帮助？',
    direction: 'self',
    user: { name: '我', avatar: 'https://i.pravatar.cc/40?img=5' },
    time: new Date(),
    status: 'sending'
  }
])

const input = ref('')

const handleSend = (value: string) => {
  messages.value = [
    ...messages.value,
    {
      id: Date.now(),
      content: value,
      direction: 'self',
      user: { name: '我' },
      time: new Date(),
      status: 'sending'
    }
  ]
}
</script>

<template>
  <ChatWindow
    v-model="input"
    :messages="messages"
    status-text="对方正在输入..."
    allow-shift-enter
    message-list-aria-label="会话消息"
    input-aria-label="输入消息"
    send-aria-label="发送消息"
    @send="handleSend">
    <template #message="{ message }">
      <span>{{ message.content }}</span>
    </template>
  </ChatWindow>
</template>
```


---

## ActivityFeed 活动动态流

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ActivityFeed } from '@expcat/tigercat-vue'
import type { ActivityGroup } from '@expcat/tigercat-core'

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
</script>

<template>
  <ActivityFeed :groups="activityGroups" />
</template>
```
