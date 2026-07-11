<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <Space direction="vertical" class="w-full">
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
  </div>
</template>
