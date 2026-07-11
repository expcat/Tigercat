<script setup lang="ts">
import { MenuItem } from '@expcat/tigercat-vue/MenuItem'
import { SubMenu } from '@expcat/tigercat-vue/SubMenu'
import { MenuItemGroup } from '@expcat/tigercat-vue/MenuItemGroup'
import { Button } from '@expcat/tigercat-vue/Button'
import { ref } from 'vue'
import { Menu } from '@expcat/tigercat-vue/Menu'

const selectedKeys1 = ref(['1'])
const selectedKeys2 = ref(['home'])
const selectedKeys3 = ref(['1'])
const openKeys3 = ref(['sub1'])
const selectedKeys4 = ref(['1'])
const openKeys4 = ref(['sub1'])
const collapsed = ref(false)
const selectedKeys5 = ref(['1'])
const selectedKeys6 = ref(['1'])
const selectedKeys7 = ref(['1'])
const selectedKeys8 = ref(['1'])
const openKeys8 = ref<(string | number)[]>([])

const homeIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
const settingsIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.196-15.196l-4.243 4.243m-5.906 5.906l-4.243 4.243M23 12h-6m-6 0H1m15.196 5.196l-4.243-4.243m-5.906-5.906l-4.243-4.243"></path></svg>'
const userIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
        <div class="bg-gray-50 p-6 rounded-lg">
          <div class="bg-white inline-block">
            <Menu v-model:selectedKeys="selectedKeys1">
              <MenuItem itemKey="1">菜单项 1</MenuItem>
              <MenuItem itemKey="2">菜单项 2</MenuItem>
              <MenuItem itemKey="3">菜单项 3</MenuItem>
              <MenuItem itemKey="4" disabled>禁用菜单项</MenuItem>
            </Menu>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">横向菜单</h3>
        <div class="bg-gray-50 p-6 rounded-lg">
          <div class="bg-white">
            <Menu mode="horizontal" v-model:selectedKeys="selectedKeys2">
              <MenuItem itemKey="home">首页</MenuItem>
              <SubMenu itemKey="products" title="产品">
                <MenuItem itemKey="product-a">产品 A</MenuItem>
                <SubMenu itemKey="product-b" title="产品 B">
                  <MenuItem itemKey="product-b1">产品 B-1</MenuItem>
                  <MenuItem itemKey="product-b2">产品 B-2</MenuItem>
                </SubMenu>
              </SubMenu>
              <MenuItem itemKey="about">关于</MenuItem>
              <MenuItem itemKey="contact">联系我们</MenuItem>
            </Menu>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">子菜单</h3>
        <div class="bg-gray-50 p-6 rounded-lg">
          <div class="bg-white inline-block">
            <Menu v-model:selectedKeys="selectedKeys3" v-model:openKeys="openKeys3">
              <SubMenu itemKey="sub1" title="导航 1">
                <MenuItem itemKey="1">选项 1</MenuItem>
                <MenuItem itemKey="2">选项 2</MenuItem>
                <MenuItem itemKey="3">选项 3</MenuItem>
              </SubMenu>
              <SubMenu itemKey="sub2" title="导航 2">
                <MenuItem itemKey="4">选项 4</MenuItem>
                <MenuItem itemKey="5">选项 5</MenuItem>
              </SubMenu>
              <MenuItem itemKey="6">导航 3</MenuItem>
            </Menu>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">内联模式</h3>
        <div class="bg-gray-50 p-6 rounded-lg">
          <div class="bg-white inline-block">
            <Menu mode="inline" v-model:selectedKeys="selectedKeys4" v-model:openKeys="openKeys4">
              <SubMenu itemKey="sub1" title="导航 1">
                <MenuItem itemKey="1">选项 1</MenuItem>
                <MenuItem itemKey="2">选项 2</MenuItem>
              </SubMenu>
              <SubMenu itemKey="sub2" title="导航 2">
                <MenuItem itemKey="3">选项 3</MenuItem>
                <MenuItem itemKey="4">选项 4</MenuItem>
              </SubMenu>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
