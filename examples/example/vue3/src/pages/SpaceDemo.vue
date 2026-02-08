<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const horizontalSnippet = `<Space>
  <div class="bg-blue-500 text-white p-4 rounded">Item 1</div>
  <div class="bg-blue-500 text-white p-4 rounded">Item 2</div>
  <div class="bg-blue-500 text-white p-4 rounded">Item 3</div>
</Space>`

const verticalSnippet = `<Space direction="vertical">
  <div class="bg-green-500 text-white p-4 rounded">Item 1</div>
  <div class="bg-green-500 text-white p-4 rounded">Item 2</div>
  <div class="bg-green-500 text-white p-4 rounded">Item 3</div>
</Space>`

const sizeSnippet = `<Space direction="vertical" class="w-full">
  <Space size="sm">...</Space>
  <Space size="md">...</Space>
  <Space size="lg">...</Space>
  <Space :size="24">...</Space>
</Space>`

const alignSnippet = `<Space direction="vertical" class="w-full">
  <Space align="center" class="w-full ...">...</Space>
  <Space align="end" class="w-full ...">...</Space>
  <Space align="baseline" class="w-full ...">...</Space>
  <Space align="stretch" class="w-full ...">...</Space>
</Space>`

const wrapSnippet = `<Space wrap size="sm" class="w-full">
  <div v-for="i in 14" :key="i">Tag {{ i }}</div>
</Space>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Space 间距</h1>
      <p class="text-gray-600">设置组件之间的间距。</p>
    </div>

    <DemoBlock title="水平间距"
               description="水平方向的间距。"
               :code="horizontalSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <div class="bg-blue-500 text-white p-4 rounded">Item 1</div>
          <div class="bg-blue-500 text-white p-4 rounded">Item 2</div>
          <div class="bg-blue-500 text-white p-4 rounded">Item 3</div>
        </Space>
      </div>
    </DemoBlock>

    <DemoBlock title="垂直间距"
               description="垂直方向的间距。"
               :code="verticalSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical">
          <div class="bg-green-500 text-white p-4 rounded">Item 1</div>
          <div class="bg-green-500 text-white p-4 rounded">Item 2</div>
          <div class="bg-green-500 text-white p-4 rounded">Item 3</div>
        </Space>
      </div>
    </DemoBlock>

    <DemoBlock title="不同尺寸"
               description="size 支持内置尺寸（sm/md/lg）与自定义数值（px）。"
               :code="sizeSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full">
          <div>
            <p class="text-sm text-gray-600 mb-2">Small</p>
            <Space size="sm">
              <div class="bg-purple-500 text-white p-4 rounded">Item</div>
              <div class="bg-purple-500 text-white p-4 rounded">Item</div>
              <div class="bg-purple-500 text-white p-4 rounded">Item</div>
            </Space>
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-2">Medium</p>
            <Space size="md">
              <div class="bg-purple-500 text-white p-4 rounded">Item</div>
              <div class="bg-purple-500 text-white p-4 rounded">Item</div>
              <div class="bg-purple-500 text-white p-4 rounded">Item</div>
            </Space>
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-2">Large</p>
            <Space size="lg">
              <div class="bg-purple-500 text-white p-4 rounded">Item</div>
              <div class="bg-purple-500 text-white p-4 rounded">Item</div>
              <div class="bg-purple-500 text-white p-4 rounded">Item</div>
            </Space>
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-2">Custom (24px)</p>
            <Space :size="24">
              <div class="bg-purple-600 text-white p-4 rounded">24px</div>
              <div class="bg-purple-600 text-white p-4 rounded">24px</div>
              <div class="bg-purple-600 text-white p-4 rounded">24px</div>
            </Space>
          </div>
        </Space>
      </div>
    </DemoBlock>

    <DemoBlock title="对齐方式"
               description="align 控制交叉轴对齐（start/center/end/baseline/stretch）。"
               :code="alignSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full">
          <div>
            <p class="text-sm text-gray-600 mb-2">align="center"</p>
            <Space align="center"
                   class="w-full border border-dashed border-gray-300 p-3 rounded">
              <div class="bg-amber-500 text-white p-4 rounded h-10 flex items-center">h-10</div>
              <div class="bg-amber-500 text-white p-4 rounded h-16 flex items-center">h-16</div>
              <div class="bg-amber-500 text-white p-4 rounded h-12 flex items-center">h-12</div>
            </Space>
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-2">align="end"</p>
            <Space align="end"
                   class="w-full border border-dashed border-gray-300 p-3 rounded">
              <div class="bg-teal-500 text-white p-4 rounded h-10 flex items-center">h-10</div>
              <div class="bg-teal-500 text-white p-4 rounded h-16 flex items-center">h-16</div>
              <div class="bg-teal-500 text-white p-4 rounded h-12 flex items-center">h-12</div>
            </Space>
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-2">align="baseline"</p>
            <Space align="baseline"
                   class="w-full border border-dashed border-gray-300 p-3 rounded">
              <div class="bg-rose-500 text-white p-4 rounded text-sm">Text-sm</div>
              <div class="bg-rose-500 text-white p-4 rounded text-lg">Text-lg</div>
              <div class="bg-rose-500 text-white p-4 rounded text-2xl">Text-2xl</div>
            </Space>
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-2">align="stretch"</p>
            <Space align="stretch"
                   class="w-full border border-dashed border-gray-300 p-3 rounded h-20">
              <div class="bg-indigo-500 text-white p-4 rounded">Stretch A</div>
              <div class="bg-indigo-500 text-white p-4 rounded">Stretch B</div>
            </Space>
          </div>
        </Space>
      </div>
    </DemoBlock>

    <DemoBlock title="自动换行"
               description="wrap=true 时，子项在空间不足时自动换行。"
               :code="wrapSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-md">
          <Space wrap
                 size="sm"
                 class="w-full">
            <div v-for="i in 14"
                 :key="i"
                 class="bg-slate-700 text-white px-3 py-2 rounded">
              Tag {{ i }}
            </div>
          </Space>
        </div>
      </div>
    </DemoBlock>
  </div>
</template>
