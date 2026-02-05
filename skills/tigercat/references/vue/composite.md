---
name: tigercat-vue-composite
description: Vue 3 composite components usage
---

# Composite Components (Vue 3)

组合组件：ChatWindow / ActivityFeed / DataTableWithToolbar

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
      },
## FormWizard 表单向导

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormWizard, Form, FormItem, Input } from '@expcat/tigercat-vue'
import type { WizardStep } from '@expcat/tigercat-core'

const steps: WizardStep[] = [
  { title: '基本信息', description: '填写姓名与邮箱' },
  { title: '确认信息', description: '确认后提交' }
]

const current = ref(0)
const formRef = ref<InstanceType<typeof Form> | null>(null)
const model = ref({ name: '', email: '' })

const handleBeforeNext = async () => {
  const valid = await formRef.value?.validate()
  return valid ?? true
}

const handleFinish = () => {
  alert('完成提交')
}
</script>

<template>
  <FormWizard
    v-model:current="current"
    :steps="steps"
    :before-next="handleBeforeNext"
    @finish="handleFinish">
    <template #step="{ index }">
      <Form ref="formRef" :model="model" class="max-w-md">
        <template v-if="index === 0">
          <FormItem name="name" label="姓名" :rules="{ required: true, message: '请输入姓名' }">
            <Input v-model="model.name" placeholder="请输入姓名" />
          </FormItem>
          <FormItem name="email" label="邮箱" :rules="{ required: true, message: '请输入邮箱' }">
            <Input v-model="model.email" placeholder="请输入邮箱" />
          </FormItem>
        </template>
        <template v-else>
          <div class="text-sm text-gray-600">请确认信息无误后完成提交。</div>
        </template>
      </Form>
    </template>
  </FormWizard>
</template>
```

---
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

---

## DataTableWithToolbar 表格工具栏

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  DataTableWithToolbar,
  type TableColumn,
  type TableToolbarFilterValue
} from '@expcat/tigercat-vue'

interface UserRow extends Record<string, unknown> {
  id: number
  name: string
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'disabled'
}

const columns: TableColumn<UserRow>[] = [
  { key: 'name', title: '姓名' },
  { key: 'role', title: '角色' },
  { key: 'status', title: '状态' }
]

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'disabled' }
]

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '编辑', value: 'editor' },
  { label: '访客', value: 'viewer' }
]

const keyword = ref('')
const filters = ref<Record<string, TableToolbarFilterValue>>({ status: null, role: null })
const pagination = ref({ current: 1, pageSize: 10 })

const data: UserRow[] = [
  { id: 1, name: 'A', role: 'admin', status: 'active' },
  { id: 2, name: 'B', role: 'editor', status: 'disabled' }
]

const filtered = computed(() => {
  return data.filter((item) => {
    const matchKeyword = !keyword.value || item.name.includes(keyword.value)
    const matchStatus = !filters.value.status || item.status === filters.value.status
    const matchRole = !filters.value.role || item.role === filters.value.role
    return matchKeyword && matchStatus && matchRole
  })
})

const toolbar = computed(() => ({
  searchValue: keyword.value,
  searchPlaceholder: '搜索姓名',
  filters: [
    { key: 'status', label: '状态', options: statusOptions },
    { key: 'role', label: '角色', options: roleOptions }
  ]
}))
</script>

<template>
  <DataTableWithToolbar
    :columns="columns"
    :dataSource="filtered"
    :toolbar="toolbar"
    :pagination="{
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: filtered.length,
      showTotal: true
    }"
    @search-change="(val) => (keyword = val)"
    @filters-change="(val) => (filters = val)"
    @page-change="(current, pageSize) => (pagination = { current, pageSize })"
    @page-size-change="(current, pageSize) => (pagination = { current, pageSize })" />
</template>
```
