<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">VirtualList 虚拟列表</h1>
    <p class="text-gray-500 mb-8">虚拟滚动渲染大量列表项，只渲染可视区域内的元素。</p>

    <DemoBlock
      title="组合展示"
      description="合并展示基础用法、自定义高度 & overscan，减少重复示例块。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">10000 条数据，itemHeight=40</p>
          <VirtualList
            :item-count="10000"
            :item-height="40"
            :height="300"
            style="border: 1px solid #e5e7eb; border-radius: 8px">
            <template #default="{ index }">
              <div
                class="px-4 flex items-center h-full"
                :class="index % 2 === 0 ? 'bg-gray-50' : ''">
                第 {{ index + 1 }} 行
              </div>
            </template>
          </VirtualList>
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
            自定义高度 & overscan
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">itemHeight=60，overscan=10</p>
          <VirtualList :item-count="5000" :item-height="60" :height="360" :overscan="10">
            <template #default="{ index }">
              <div class="px-4 py-2 border-b">
                <p class="font-medium">项目 {{ index + 1 }}</p>
                <p class="text-sm text-gray-500">描述信息</p>
              </div>
            </template>
          </VirtualList>
        </section>
      </div>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { VirtualList } from '@expcat/tigercat-vue/VirtualList'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './VirtualListDemo.vue?raw'
</script>
