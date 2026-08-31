<script setup lang="ts">
import { Tabs } from '@expcat/tigercat-vue/Tabs'
import { TabPane } from '@expcat/tigercat-vue/TabPane'
</script>

<template>
  <Tabs default-active-key="1">
    <TabPane :tab-key="1" label="概览">
      <div class="p-4">默认线型。tabKey 是数字 1，activeKey 字符串也能对上。</div>
    </TabPane>
    <TabPane tab-key="2" label="动态">
      <div class="p-4">最近动态内容</div>
    </TabPane>
  </Tabs>
</template>
