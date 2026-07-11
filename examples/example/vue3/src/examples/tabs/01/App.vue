<script setup lang="ts">
import { TabPane } from '@expcat/tigercat-vue/TabPane'
import { ref } from 'vue'
import { Tabs } from '@expcat/tigercat-vue/Tabs'

const activeKey1 = ref('1')
const activeKey2 = ref('1')
const activeKey3 = ref('1')
const activeKey4 = ref('1')
const activeKey5 = ref('1')
const activeKey6 = ref('1')
const activeKey7 = ref('1')
const activeKey8 = ref('1')
const position = ref<'top' | 'bottom' | 'left' | 'right'>('top')

// Editable tabs
const editableTabs = ref([
  { key: '1', label: '标签 1', content: '标签 1 的内容' },
  { key: '2', label: '标签 2', content: '标签 2 的内容' },
  { key: '3', label: '标签 3', content: '标签 3 的内容' }
])
const activeEditableKey = ref('1')
let newTabIndex = 4

const handleEdit = ({
  targetKey,
  action
}: {
  targetKey?: string | number
  action: 'add' | 'remove'
}) => {
  if (action === 'add') {
    const newKey = `${newTabIndex++}`
    editableTabs.value.push({
      key: newKey,
      label: `新标签 ${newKey}`,
      content: `新标签 ${newKey} 的内容`
    })
    activeEditableKey.value = newKey
  } else if (action === 'remove') {
    if (targetKey == null) {
      return
    }

    const targetKeyString = String(targetKey)
    const currentIndex = editableTabs.value.findIndex((tab) => tab.key === targetKeyString)
    const newTabs = editableTabs.value.filter((tab) => tab.key !== targetKeyString)
    editableTabs.value = newTabs

    // 如果删除的是当前激活的标签，激活下一个标签
    if (activeEditableKey.value === targetKeyString && newTabs.length > 0) {
      const next = newTabs[currentIndex] ?? newTabs[currentIndex - 1] ?? newTabs[0]
      activeEditableKey.value = next.key
    }
  }
}
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Tabs v-model:activeKey="activeKey1">
            <TabPane tabKey="1" label="标签页 1">
              <div class="p-4">标签页 1 的内容</div>
            </TabPane>
            <TabPane tabKey="2" label="标签页 2">
              <div class="p-4">标签页 2 的内容</div>
            </TabPane>
            <TabPane tabKey="3" label="标签页 3">
              <div class="p-4">标签页 3 的内容</div>
            </TabPane>
          </Tabs>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">卡片式标签页</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Tabs v-model:activeKey="activeKey2" type="card">
            <TabPane tabKey="1" label="选项卡 1">
              <div class="p-4">选项卡 1 的内容</div>
            </TabPane>
            <TabPane tabKey="2" label="选项卡 2">
              <div class="p-4">选项卡 2 的内容</div>
            </TabPane>
            <TabPane tabKey="3" label="选项卡 3">
              <div class="p-4">选项卡 3 的内容</div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  </div>
</template>
