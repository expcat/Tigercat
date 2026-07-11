<script setup lang="ts">
import { ref } from 'vue'
import { Tabs } from '@expcat/tigercat-vue/Tabs'
import { TabPane } from '@expcat/tigercat-vue/TabPane'

const activeKey = ref('overview')
</script>

<template>
  <Tabs v-model:activeKey="activeKey" type="card" size="large">
    <TabPane tabKey="overview" label="概览">
      <div class="p-4">项目概览内容</div>
    </TabPane>
    <TabPane tabKey="activity" label="动态">
      <div class="p-4">最近动态内容</div>
    </TabPane>
  </Tabs>
</template>
