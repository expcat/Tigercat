<script setup lang="ts">
import { ref } from 'vue'
import { Tabs } from '@expcat/tigercat-vue/Tabs'
import { TabPane } from '@expcat/tigercat-vue/TabPane'

interface TabData {
  key: string
  label: string
}

const tabs = ref<TabData[]>([
  { key: '1', label: '标签 1' },
  { key: '2', label: '标签 2' }
])
const activeKey = ref('1')
let nextKey = 3

const handleEdit = (info: { targetKey?: string | number; action: 'add' | 'remove' }) => {
  if (info.action === 'add') {
    const key = String(nextKey++)
    tabs.value.push({ key, label: `标签 ${key}` })
    activeKey.value = key
    return
  }

  const key = String(info.targetKey)
  const remainingTabs = tabs.value.filter((tab) => tab.key !== key)
  tabs.value = remainingTabs
  if (activeKey.value === key) activeKey.value = remainingTabs[0]?.key ?? ''
}
</script>

<template>
  <Tabs v-model:activeKey="activeKey" type="editable-card" closable @edit="handleEdit">
    <TabPane v-for="tab in tabs" :key="tab.key" :tabKey="tab.key" :label="tab.label">
      <div class="p-4">{{ tab.label }} 的内容</div>
    </TabPane>
  </Tabs>
</template>
