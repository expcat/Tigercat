<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">Resizable 可调整大小容器</h1>
    <p class="text-gray-500 mb-8">拖拽手柄改变元素尺寸，支持锁定宽高比和约束范围。</p>

    <DemoBlock title="基础用法" description="拖拽右下角手柄" :code="basicSnippet">
      <Resizable
        :default-width="300"
        :default-height="150"
        :min-width="100"
        :min-height="60"
        @resize="onResize">
        <div class="w-full h-full bg-blue-50 border border-blue-200 rounded flex items-center justify-center text-sm text-blue-600">
          {{ size.width }} × {{ size.height }}
        </div>
      </Resizable>
    </DemoBlock>

    <DemoBlock title="锁定宽高比 & 单轴" description="lockAspectRatio / axis='x'" :code="constrainedSnippet">
      <div class="flex gap-8">
        <Resizable :default-width="200" :default-height="200" lock-aspect-ratio>
          <div class="w-full h-full bg-green-50 border border-green-200 rounded flex items-center justify-center text-sm">lockAspectRatio</div>
        </Resizable>
        <Resizable :default-width="200" :default-height="100" axis="horizontal">
          <div class="w-full h-full bg-amber-50 border border-amber-200 rounded flex items-center justify-center text-sm">axis="x"</div>
        </Resizable>
      </div>
    </DemoBlock>

    <DemoBlock title="禁用" :code="disabledSnippet">
      <Resizable :default-width="200" :default-height="100" disabled>
        <div class="w-full h-full bg-gray-100 border rounded flex items-center justify-center text-sm text-gray-400">禁用状态</div>
      </Resizable>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Resizable } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const size = reactive({ width: 300, height: 150 })

const onResize = (e: { width: number; height: number }) => {
  size.width = Math.round(e.width)
  size.height = Math.round(e.height)
}

const basicSnippet = `<Resizable :default-width="300" :default-height="150" :min-width="100" :min-height="60" @resize="onResize">
  <div>{{ width }} × {{ height }}</div>
</Resizable>`

const constrainedSnippet = `<Resizable :default-width="200" :default-height="200" lock-aspect-ratio>...</Resizable>
<Resizable :default-width="200" :default-height="100" axis="horizontal">...</Resizable>`

const disabledSnippet = `<Resizable :default-width="200" :default-height="100" disabled>...</Resizable>`
</script>
