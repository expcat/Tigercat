<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <Space direction="vertical" class="w-full">
        <div>
          <p class="text-sm text-gray-600 mb-2">align="center"</p>
          <Space align="center" class="w-full border border-dashed border-gray-300 p-3 rounded">
            <div class="bg-amber-500 text-white p-4 rounded h-10 flex items-center">h-10</div>
            <div class="bg-amber-500 text-white p-4 rounded h-16 flex items-center">h-16</div>
            <div class="bg-amber-500 text-white p-4 rounded h-12 flex items-center">h-12</div>
          </Space>
        </div>
        <div>
          <p class="text-sm text-gray-600 mb-2">align="end"</p>
          <Space align="end" class="w-full border border-dashed border-gray-300 p-3 rounded">
            <div class="bg-teal-500 text-white p-4 rounded h-10 flex items-center">h-10</div>
            <div class="bg-teal-500 text-white p-4 rounded h-16 flex items-center">h-16</div>
            <div class="bg-teal-500 text-white p-4 rounded h-12 flex items-center">h-12</div>
          </Space>
        </div>
        <div>
          <p class="text-sm text-gray-600 mb-2">align="baseline"</p>
          <Space align="baseline" class="w-full border border-dashed border-gray-300 p-3 rounded">
            <div class="bg-rose-500 text-white p-4 rounded text-sm">Text-sm</div>
            <div class="bg-rose-500 text-white p-4 rounded text-lg">Text-lg</div>
            <div class="bg-rose-500 text-white p-4 rounded text-2xl">Text-2xl</div>
          </Space>
        </div>
        <div>
          <p class="text-sm text-gray-600 mb-2">align="stretch"</p>
          <Space
            align="stretch"
            class="w-full border border-dashed border-gray-300 p-3 rounded h-20">
            <div class="bg-indigo-500 text-white p-4 rounded">Stretch A</div>
            <div class="bg-indigo-500 text-white p-4 rounded">Stretch B</div>
          </Space>
        </div>
      </Space>
    </div>
  </div>
</template>
