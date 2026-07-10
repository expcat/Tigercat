<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">FloatButton 悬浮按钮</h1>
    <p class="text-gray-500 mb-8">悬浮在页面角落的操作按钮，支持分组展开。</p>

    <DemoBlock
      title="基础用法等组合展示"
      description="合并展示基础用法、按钮组、禁用，减少重复示例块。"
      :code="fullPageSnippet">
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
    </DemoBlock>

    <DemoBlock
      title="独立悬浮"
      description="单个 FloatButton 可直接固定到视口角落。"
      :code="fullPageSnippet">
      <FloatButton
        floating
        placement="bottom-right"
        :offset="24"
        tooltip="客服"
        aria-label="客服入口"
        @click="lastAction = '已打开客服入口'" />
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FloatButton } from '@expcat/tigercat-vue/FloatButton'
import { FloatButtonGroup } from '@expcat/tigercat-vue/FloatButtonGroup'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './FloatButtonDemo.vue?raw'

const lastAction = ref('尚未点击悬浮按钮')

const basicSnippet = `<FloatButton tooltip="默认" @click="onClick" />
<FloatButton shape="square" type="default" tooltip="方形" />
<FloatButton size="lg" tooltip="大号" />`

const groupSnippet = `<FloatButtonGroup trigger="hover">
  <template #trigger>
    <FloatButton tooltip="菜单" />
  </template>
  <FloatButton tooltip="操作 A" type="default" />
  <FloatButton tooltip="操作 B" type="default" />
</FloatButtonGroup>`

const disabledSnippet = `<FloatButton disabled tooltip="不可用" />`

const floatingSnippet = `<FloatButton
  floating
  placement="bottom-right"
  :offset="24"
  tooltip="客服"
  aria-label="客服入口"
/>`
</script>
