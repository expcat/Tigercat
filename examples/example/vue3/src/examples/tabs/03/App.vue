<script setup lang="ts">
import { Tabs } from '@expcat/tigercat-vue/Tabs'
import { TabPane } from '@expcat/tigercat-vue/TabPane'

const types = ['line', 'pills', 'card'] as const
</script>

<template>
  <div class="space-y-6">
    <Tabs v-for="type in types" :key="type" default-active-key="a" :type="type">
      <TabPane tabKey="a" label="首页">
        <div class="p-3 text-sm text-gray-600">type="{{ type }}" 的首页面板</div>
      </TabPane>
      <TabPane tabKey="b" label="消息">
        <div class="p-3 text-sm text-gray-600">消息面板</div>
      </TabPane>
      <TabPane tabKey="c" label="设置">
        <div class="p-3 text-sm text-gray-600">设置面板</div>
      </TabPane>
    </Tabs>
  </div>
</template>
