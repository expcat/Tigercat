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
      <Layout class-name="border border-gray-300 overflow-hidden min-h-[260px]">
        <Header class-name="!bg-blue-600 !text-white !p-4">Header</Header>
        <div class="flex flex-1">
          <Sidebar width="192px" class-name="!bg-gray-200 !p-4">Sidebar</Sidebar>
          <Content class-name="!bg-white !p-4 min-h-[200px]">Content</Content>
        </div>
        <Footer class-name="!bg-gray-800 !text-white !p-4">Footer</Footer>
      </Layout>
    </div>
  </div>
</template>
