<script setup lang="ts">
import { Tabs } from '@expcat/tigercat-vue/Tabs'
import { TabPane } from '@expcat/tigercat-vue/TabPane'
</script>

<template>
  <div class="space-y-6">
    <Tabs default-active-key="a" tab-position="left" type="line">
      <TabPane tabKey="a" label="基础信息">
        <div class="p-3 text-sm text-gray-600">tabPosition="left" 时标签栏在左侧。</div>
      </TabPane>
      <TabPane tabKey="b" label="安全设置">
        <div class="p-3 text-sm text-gray-600">安全设置面板。</div>
      </TabPane>
      <TabPane tabKey="c" label="已停用" disabled>
        <div class="p-3 text-sm text-gray-600">该面板已禁用。</div>
      </TabPane>
    </Tabs>
    <Tabs default-active-key="a" size="small" centered type="pills">
      <TabPane tabKey="a" label="全部">
        <div class="p-2 text-sm text-gray-600">size=small · centered</div>
      </TabPane>
      <TabPane tabKey="b" label="进行中">
        <div class="p-2 text-sm text-gray-600">进行中</div>
      </TabPane>
      <TabPane tabKey="c" label="已完成">
        <div class="p-2 text-sm text-gray-600">已完成</div>
      </TabPane>
    </Tabs>
  </div>
</template>
