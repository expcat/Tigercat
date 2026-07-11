<script setup lang="ts">
import { DropdownMenu } from '@expcat/tigercat-vue/DropdownMenu'
import { DropdownItem } from '@expcat/tigercat-vue/DropdownItem'
import { Button } from '@expcat/tigercat-vue/Button'
import { ref } from 'vue'
import { Dropdown } from '@expcat/tigercat-vue/Dropdown'

const visible1 = ref(false)
const lastCommand = ref('尚未选择操作')

const handleCommand = (command: string) => {
  const labels: Record<string, string> = { edit: '编辑', copy: '复制', delete: '删除' }
  lastCommand.value = labels[command] ?? command
}
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">多种按钮样式</h3>
        <div class="flex gap-4">
          <Dropdown>
            <Button variant="primary">主要按钮</Button>
            <DropdownMenu>
              <DropdownItem>菜单项 1</DropdownItem>
              <DropdownItem>菜单项 2</DropdownItem>
              <DropdownItem>菜单项 3</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Dropdown>
            <Button variant="secondary">次要按钮</Button>
            <DropdownMenu>
              <DropdownItem>菜单项 1</DropdownItem>
              <DropdownItem>菜单项 2</DropdownItem>
              <DropdownItem>菜单项 3</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Dropdown>
            <Button variant="outline">轮廓按钮</Button>
            <DropdownMenu>
              <DropdownItem>菜单项 1</DropdownItem>
              <DropdownItem>菜单项 2</DropdownItem>
              <DropdownItem>菜单项 3</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">无箭头指示器</h3>
        <Dropdown :show-arrow="false">
          <Button>无箭头指示器</Button>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
            <DropdownItem>菜单项 3</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">点击不关闭</h3>
        <Dropdown :close-on-click="false" trigger="click">
          <Button>点击不关闭</Button>
          <DropdownMenu>
            <DropdownItem>多选项 1</DropdownItem>
            <DropdownItem>多选项 2</DropdownItem>
            <DropdownItem>多选项 3</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">默认展开</h3>
        <Dropdown :default-open="true" trigger="click">
          <Button>默认展开</Button>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  </div>
</template>
