<script setup lang="ts">
import { ref } from 'vue'
import { FloatButton } from '@expcat/tigercat-vue/FloatButton'
import { FloatButtonGroup } from '@expcat/tigercat-vue/FloatButtonGroup'

const lastAction = ref('尚未点击悬浮按钮')
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
        <div class="relative h-64 border rounded-lg overflow-hidden">
          <FloatButton
            tooltip="默认"
            style="position: absolute; right: 24px; bottom: 24px"
            @click="lastAction = '点击了默认悬浮按钮'" />
          <FloatButton
            shape="square"
            type="default"
            tooltip="方形"
            style="position: absolute; right: 24px; bottom: 80px" />
          <FloatButton
            size="lg"
            tooltip="大号"
            style="position: absolute; right: 24px; bottom: 136px" />
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">按钮组</h3>
        <div class="relative h-64 border rounded-lg overflow-hidden">
          <FloatButtonGroup trigger="hover" style="position: absolute; right: 24px; bottom: 24px">
            <template #trigger>
              <FloatButton tooltip="菜单" />
            </template>
            <FloatButton tooltip="操作 A" type="default" @click="lastAction = '选择了操作 A'" />
            <FloatButton tooltip="操作 B" type="default" @click="lastAction = '选择了操作 B'" />
          </FloatButtonGroup>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用</h3>
        <div class="relative h-40 border rounded-lg overflow-hidden">
          <FloatButton
            disabled
            tooltip="不可用"
            style="position: absolute; right: 24px; bottom: 24px" />
        </div>
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-300" role="status">
        操作反馈：{{ lastAction }}
      </p>
    </div>
  </div>
</template>
