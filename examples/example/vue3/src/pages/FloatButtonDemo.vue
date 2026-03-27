<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">FloatButton 悬浮按钮</h1>
    <p class="text-gray-500 mb-8">悬浮在页面角落的操作按钮，支持分组展开。</p>

    <DemoBlock title="基础用法" description="shape、size、type 和 tooltip" :code="basicSnippet">
      <div class="relative h-64 border rounded-lg overflow-hidden">
        <FloatButton tooltip="默认" style="position: absolute; right: 24px; bottom: 24px" @click="onClick" />
        <FloatButton shape="square" type="default" tooltip="方形" style="position: absolute; right: 24px; bottom: 80px" />
        <FloatButton size="lg" tooltip="大号" style="position: absolute; right: 24px; bottom: 136px" />
      </div>
    </DemoBlock>

    <DemoBlock title="按钮组" description="FloatButtonGroup 分组展开，支持 click / hover 触发" :code="groupSnippet">
      <div class="relative h-64 border rounded-lg overflow-hidden">
        <FloatButtonGroup trigger="hover" style="position: absolute; right: 24px; bottom: 24px">
          <template #trigger>
            <FloatButton tooltip="菜单" />
          </template>
          <FloatButton tooltip="操作 A" type="default" />
          <FloatButton tooltip="操作 B" type="default" />
        </FloatButtonGroup>
      </div>
    </DemoBlock>

    <DemoBlock title="禁用" :code="disabledSnippet">
      <div class="relative h-40 border rounded-lg overflow-hidden">
        <FloatButton disabled tooltip="不可用" style="position: absolute; right: 24px; bottom: 24px" />
      </div>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { FloatButton, FloatButtonGroup } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const onClick = () => {
  console.log('FloatButton clicked')
}

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
</script>
