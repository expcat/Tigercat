<script setup lang="ts">
import { Layout } from '@expcat/tigercat-vue/Layout'
import { Header } from '@expcat/tigercat-vue/Header'
import { Sidebar } from '@expcat/tigercat-vue/Sidebar'
import { Content } from '@expcat/tigercat-vue/Content'
import { Footer } from '@expcat/tigercat-vue/Footer'
import { Menu } from '@expcat/tigercat-vue/Menu'
import { MenuItem } from '@expcat/tigercat-vue/MenuItem'
import { SubMenu } from '@expcat/tigercat-vue/SubMenu'
import { ref } from 'vue'
import { Container } from '@expcat/tigercat-vue/Container'

const collapsed = ref(false)
const miniCollapsed = ref(true)
const shellCollapsed = ref(false)
const shellSelectedKeys = ref<(string | number)[]>(['dashboard'])
const shellOpenKeys = ref<(string | number)[]>(['system'])
const dashboardIcon =
  '<span class="inline-flex size-4 items-center justify-center text-[11px]">⌂</span>'
const systemIcon =
  '<span class="inline-flex size-4 items-center justify-center text-[11px]">⚙</span>'
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <button
        class="mb-4 px-3 py-1 rounded bg-blue-500 text-white text-sm"
        @click="miniCollapsed = !miniCollapsed">
        {{ miniCollapsed ? '展开' : '折叠为 Mini' }}
      </button>
      <Layout class-name="border border-gray-300 overflow-hidden min-h-[260px]">
        <Header class-name="!bg-blue-600 !text-white !p-4">Header</Header>
        <div class="flex flex-1">
          <Sidebar
            width="192px"
            collapsed-width="48px"
            :collapsed="miniCollapsed"
            class-name="!bg-gray-200 !p-4">
            <div v-if="miniCollapsed" class="text-center text-xl">☰</div>
            <div v-else>
              <div class="font-medium mb-2">导航菜单</div>
              <div class="text-sm text-gray-600">菜单项 1</div>
              <div class="text-sm text-gray-600">菜单项 2</div>
              <div class="text-sm text-gray-600">菜单项 3</div>
            </div>
          </Sidebar>
          <Content class-name="!bg-white !p-4 min-h-[200px]">Content</Content>
        </div>
      </Layout>
    </div>
  </div>
</template>
