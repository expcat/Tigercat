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
      <Layout class-name="border border-gray-300 overflow-hidden min-h-[320px]">
        <Sidebar
          width="240px"
          collapsed-width="64px"
          :collapsed="shellCollapsed"
          class-name="!bg-white !p-0">
          <div class="flex h-full flex-col">
            <div
              class="flex items-center gap-3 border-b border-[var(--tiger-border,#e5e7eb)] px-4 py-4">
              <span
                class="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--tiger-primary,#2563eb)] text-sm font-semibold text-white">
                T
              </span>
              <span
                :class="[
                  'overflow-hidden whitespace-nowrap text-sm font-semibold text-[var(--tiger-text,#111827)] transition-[max-width,opacity,transform] duration-300',
                  shellCollapsed
                    ? 'max-w-0 -translate-x-2 opacity-0'
                    : 'max-w-32 translate-x-0 opacity-100'
                ]">
                Tigercat Admin
              </span>
            </div>
            <div class="flex-1 px-2 py-3">
              <Menu
                mode="inline"
                :collapsed="shellCollapsed"
                popup-portal
                v-model:selectedKeys="shellSelectedKeys"
                :openKeys="shellCollapsed ? [] : shellOpenKeys"
                @open-change="(_key, info) => (shellOpenKeys = info.openKeys)">
                <MenuItem itemKey="dashboard" :icon="dashboardIcon"> Dashboard </MenuItem>
                <SubMenu itemKey="system" title="System" :icon="systemIcon">
                  <MenuItem itemKey="users">Users</MenuItem>
                  <MenuItem itemKey="roles">Roles</MenuItem>
                </SubMenu>
              </Menu>
            </div>
            <button
              type="button"
              class="m-3 flex items-center justify-center gap-2 rounded-lg border border-[var(--tiger-border,#e5e7eb)] px-2 py-2 text-sm text-[var(--tiger-text,#111827)] transition-colors hover:bg-[var(--tiger-surface-muted,#f9fafb)]"
              @click="shellCollapsed = !shellCollapsed">
              <span class="shrink-0">{{ shellCollapsed ? '>' : '<' }}</span>
              <span
                :class="[
                  'overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300',
                  shellCollapsed
                    ? 'max-w-0 translate-x-2 opacity-0'
                    : 'max-w-32 translate-x-0 opacity-100'
                ]">
                {{ shellCollapsed ? '展开侧栏' : '收起侧栏' }}
              </span>
            </button>
          </div>
        </Sidebar>
        <Content class-name="!bg-white !p-6">
          <div
            class="rounded-xl border border-dashed border-[var(--tiger-border,#e5e7eb)] p-6 text-sm text-[var(--tiger-text-muted,#6b7280)]">
            Shell 内容区域
          </div>
        </Content>
      </Layout>
    </div>
  </div>
</template>
