<script setup lang="ts">
import { ref } from 'vue'
import { Pagination, Divider } from '@tigercat/vue'

const current1 = ref(1)
const current2 = ref(1)
const current3 = ref(1)
const current4 = ref(1)
const current5 = ref(1)
const current6 = ref(1)
const current7 = ref(1)
const current8 = ref(1)
const pageSize = ref(10)

const handleChange = (page: number, size: number) => {
  console.log('页码改变:', page, '每页条数:', size)
}

const handlePageSizeChange = (page: number, size: number) => {
  console.log('页码大小改变 - 当前页:', page, '每页条数:', size)
}

const customTotalText = (total: number, range: [number, number]) => {
  return `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Pagination 分页</h1>
      <p class="text-gray-600">用于在数据量较大时进行分页展示，支持多种模式、快速跳页、页码选择等特性。</p>
    </div>

    <!-- 基本用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本用法</h2>
      <p class="text-gray-600 mb-6">最简单的分页组件。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Pagination 
          v-model:current="current1" 
          :total="100"
          :pageSize="10"
        />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 快速跳页 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">快速跳页</h2>
      <p class="text-gray-600 mb-6">显示快速跳页输入框，方便快速跳转到指定页。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Pagination 
          v-model:current="current2" 
          :total="500"
          :pageSize="10"
          showQuickJumper
        />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 改变每页条数 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">改变每页条数</h2>
      <p class="text-gray-600 mb-6">可以改变每页显示的条数。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Pagination 
          v-model:current="current3"
          v-model:pageSize="pageSize"
          :total="500"
          :pageSizeOptions="[10, 20, 50, 100]"
          showSizeChanger
          @page-size-change="handlePageSizeChange"
        />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 简单模式 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">简单模式</h2>
      <p class="text-gray-600 mb-6">只显示上一页、下一页和当前页/总页数。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Pagination 
          v-model:current="current4" 
          :total="500"
          simple
        />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同尺寸</h2>
      <p class="text-gray-600 mb-6">提供三种尺寸：小、中、大。</p>
      <div class="p-6 bg-gray-50 rounded-lg space-y-4">
        <div>
          <p class="text-sm text-gray-500 mb-2">小尺寸</p>
          <Pagination 
            v-model:current="current5" 
            :total="100"
            size="small"
          />
        </div>
        <div>
          <p class="text-sm text-gray-500 mb-2">中等尺寸（默认）</p>
          <Pagination 
            v-model:current="current5" 
            :total="100"
            size="medium"
          />
        </div>
        <div>
          <p class="text-sm text-gray-500 mb-2">大尺寸</p>
          <Pagination 
            v-model:current="current5" 
            :total="100"
            size="large"
          />
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义对齐方式 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义对齐方式</h2>
      <p class="text-gray-600 mb-6">可以设置分页组件的对齐方式。</p>
      <div class="p-6 bg-gray-50 rounded-lg space-y-4">
        <div>
          <p class="text-sm text-gray-500 mb-2">左对齐</p>
          <Pagination 
            v-model:current="current6" 
            :total="100"
            align="left"
          />
        </div>
        <div>
          <p class="text-sm text-gray-500 mb-2">居中对齐（默认）</p>
          <Pagination 
            v-model:current="current6" 
            :total="100"
            align="center"
          />
        </div>
        <div>
          <p class="text-sm text-gray-500 mb-2">右对齐</p>
          <Pagination 
            v-model:current="current6" 
            :total="100"
            align="right"
          />
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义总数文本 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义总数文本</h2>
      <p class="text-gray-600 mb-6">可以自定义显示总条数的文本。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Pagination 
          v-model:current="current7" 
          :total="100"
          :totalText="customTotalText"
        />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用状态</h2>
      <p class="text-gray-600 mb-6">禁用分页组件的所有交互。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Pagination 
          v-model:current="current8" 
          :total="100"
          disabled
        />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 完整示例 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">完整示例</h2>
      <p class="text-gray-600 mb-6">包含所有功能的完整示例（查看控制台）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Pagination 
          v-model:current="current3"
          v-model:pageSize="pageSize"
          :total="500"
          :pageSizeOptions="[10, 20, 50, 100]"
          showQuickJumper
          showSizeChanger
          :totalText="customTotalText"
          size="medium"
          align="center"
          @change="handleChange"
          @page-size-change="handlePageSizeChange"
        />
      </div>
    </section>
  </div>
</template>
