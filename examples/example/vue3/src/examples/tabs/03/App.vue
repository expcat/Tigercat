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
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">不同位置</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="mb-4">
            <label class="mr-4">位置：</label>
            <select v-model="position" class="border border-gray-300 rounded px-3 py-2">
              <option value="top">上</option>
              <option value="bottom">下</option>
              <option value="left">左</option>
              <option value="right">右</option>
            </select>
          </div>
          <Tabs v-model:activeKey="activeKey3" :tabPosition="position">
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
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">居中标签</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Tabs v-model:activeKey="activeKey4" centered>
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
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">不同尺寸</h3>
        <div class="p-6 bg-gray-50 rounded-lg space-y-6">
          <div>
            <h3 class="text-lg font-semibold mb-2">小尺寸</h3>
            <Tabs v-model:activeKey="activeKey5" size="small">
              <TabPane tabKey="1" label="小尺寸 1">
                <div class="p-4">内容</div>
              </TabPane>
              <TabPane tabKey="2" label="小尺寸 2">
                <div class="p-4">内容</div>
              </TabPane>
              <TabPane tabKey="3" label="小尺寸 3">
                <div class="p-4">内容</div>
              </TabPane>
            </Tabs>
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-2">中等尺寸（默认）</h3>
            <Tabs v-model:activeKey="activeKey5" size="medium">
              <TabPane tabKey="1" label="中等尺寸 1">
                <div class="p-4">内容</div>
              </TabPane>
              <TabPane tabKey="2" label="中等尺寸 2">
                <div class="p-4">内容</div>
              </TabPane>
              <TabPane tabKey="3" label="中等尺寸 3">
                <div class="p-4">内容</div>
              </TabPane>
            </Tabs>
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-2">大尺寸</h3>
            <Tabs v-model:activeKey="activeKey5" size="large">
              <TabPane tabKey="1" label="大尺寸 1">
                <div class="p-4">内容</div>
              </TabPane>
              <TabPane tabKey="2" label="大尺寸 2">
                <div class="p-4">内容</div>
              </TabPane>
              <TabPane tabKey="3" label="大尺寸 3">
                <div class="p-4">内容</div>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用标签</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Tabs v-model:activeKey="activeKey6">
            <TabPane tabKey="1" label="标签页 1">
              <div class="p-4">标签页 1 的内容</div>
            </TabPane>
            <TabPane tabKey="2" label="禁用标签" disabled>
              <div class="p-4">标签页 2 的内容（不可访问）</div>
            </TabPane>
            <TabPane tabKey="3" label="标签页 3">
              <div class="p-4">标签页 3 的内容</div>
            </TabPane>
          </Tabs>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">带图标的标签</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Tabs v-model:activeKey="activeKey7">
            <TabPane tabKey="1" label="首页" icon="🏠">
              <div class="p-4">首页内容</div>
            </TabPane>
            <TabPane tabKey="2" label="用户" icon="👤">
              <div class="p-4">用户内容</div>
            </TabPane>
            <TabPane tabKey="3" label="设置" icon="⚙️">
              <div class="p-4">设置内容</div>
            </TabPane>
          </Tabs>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">销毁非激活面板</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Tabs v-model:activeKey="activeKey8" destroyInactiveTabPane>
            <TabPane tabKey="1" label="标签页 1">
              <div class="p-4">标签页 1 — 切换后此内容被销毁</div>
            </TabPane>
            <TabPane tabKey="2" label="标签页 2">
              <div class="p-4">标签页 2 — 切换后此内容被销毁</div>
            </TabPane>
            <TabPane tabKey="3" label="标签页 3">
              <div class="p-4">标签页 3 — 切换后此内容被销毁</div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  </div>
</template>
