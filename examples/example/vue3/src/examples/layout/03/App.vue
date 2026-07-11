<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Layout } from '@expcat/tigercat-vue/Layout'
import { Header } from '@expcat/tigercat-vue/Header'
import { Sidebar } from '@expcat/tigercat-vue/Sidebar'
import { Content } from '@expcat/tigercat-vue/Content'

const collapsed = ref(false)
</script>

<template>
  <div class="space-y-3">
    <Button size="sm" @click="collapsed = !collapsed">
      {{ collapsed ? '展开侧栏' : '折叠侧栏' }}
    </Button>
    <Layout class="min-h-64 overflow-hidden rounded border border-gray-300">
      <Header class="!bg-blue-600 !p-4 !text-white">后台管理</Header>
      <div class="flex flex-1">
        <Sidebar width="192px" collapsed-width="64px" :collapsed="collapsed">导航</Sidebar>
        <Content class="!p-4">工作区</Content>
      </div>
    </Layout>
  </div>
</template>
