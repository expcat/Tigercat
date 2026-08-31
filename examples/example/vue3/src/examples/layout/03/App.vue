<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Layout } from '@expcat/tigercat-vue/Layout'
import { Header } from '@expcat/tigercat-vue/Header'
import { Sidebar } from '@expcat/tigercat-vue/Sidebar'
import { Content } from '@expcat/tigercat-vue/Content'
import { Menu } from '@expcat/tigercat-vue/Menu'

const collapsed = ref(false)
const hidden = ref(false)
const items = [
  { key: 'home', label: '首页' },
  { key: 'settings', label: '设置' }
]
</script>

<template>
  <div class="space-y-3">
    <div class="flex gap-2">
      <Button size="sm" @click="collapsed = !collapsed">
        {{ collapsed ? '展开迷你侧栏' : '折叠为迷你侧栏' }}
      </Button>
      <Button size="sm" @click="hidden = !hidden">
        {{ hidden ? '显示侧栏' : '折叠到 0' }}
      </Button>
    </div>
    <Layout class="h-64 overflow-hidden rounded border border-[var(--tiger-border)]">
      <Header>后台管理</Header>
      <Layout>
        <Sidebar
          width="192px"
          :collapsed-width="hidden ? '0px' : '64px'"
          :collapsed="collapsed || hidden">
          <Menu :items="items" />
        </Sidebar>
        <Content as="div">工作区。侧栏是 Layout 直子，不必再包一层 flex。</Content>
      </Layout>
    </Layout>
  </div>
</template>
