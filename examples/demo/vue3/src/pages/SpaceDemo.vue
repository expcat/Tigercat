<script setup lang="ts">
import { Space, Divider } from '@tigercat/vue'
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Space 间距</h1>
      <p class="text-gray-600">设置组件之间的间距。</p>
    </div>

    <!-- 水平间距 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">水平间距</h2>
      <p class="text-gray-600 mb-6">水平方向的间距。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <div class="bg-blue-500 text-white p-4 rounded">Item 1</div>
          <div class="bg-blue-500 text-white p-4 rounded">Item 2</div>
          <div class="bg-blue-500 text-white p-4 rounded">Item 3</div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 垂直间距 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">垂直间距</h2>
      <p class="text-gray-600 mb-6">垂直方向的间距。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical">
          <div class="bg-green-500 text-white p-4 rounded">Item 1</div>
          <div class="bg-green-500 text-white p-4 rounded">Item 2</div>
          <div class="bg-green-500 text-white p-4 rounded">Item 3</div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同尺寸</h2>
      <p class="text-gray-600 mb-6">size 支持内置尺寸（sm/md/lg）与自定义数值（px）。</p>
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
    </section>

    <!-- 对齐方式 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">对齐方式</h2>
      <p class="text-gray-600 mb-6">align 控制交叉轴对齐（start/center/end/baseline/stretch）。</p>
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
            <p class="text-sm text-gray-600 mb-2">align="baseline"</p>
            <Space align="baseline"
                   class="w-full border border-dashed border-gray-300 p-3 rounded">
              <div class="bg-rose-500 text-white p-4 rounded text-sm">Text-sm</div>
              <div class="bg-rose-500 text-white p-4 rounded text-lg">Text-lg</div>
              <div class="bg-rose-500 text-white p-4 rounded text-2xl">Text-2xl</div>
            </Space>
          </div>
        </Space>
      </div>
    </section>

    <!-- 自动换行 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自动换行</h2>
      <p class="text-gray-600 mb-6">wrap=true 时，子项在空间不足时自动换行。</p>
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
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/"
                   class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>
