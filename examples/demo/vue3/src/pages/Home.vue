<script setup lang="ts">
import ThemeSwitch from '../components/ThemeSwitch.vue'

const components = [
  { name: 'Button', path: '/button', category: '基础组件' },
  { name: 'Icon', path: '/icon', category: '基础组件' },
  { name: 'Link', path: '/link', category: '基础组件' },
  { name: 'Text', path: '/text', category: '基础组件' },

  { name: 'Input', path: '/input', category: '表单组件' },
  { name: 'Textarea', path: '/textarea', category: '表单组件' },
  { name: 'Checkbox', path: '/checkbox', category: '表单组件' },
  { name: 'Radio', path: '/radio', category: '表单组件' },
  { name: 'Switch', path: '/switch', category: '表单组件' },
  { name: 'Slider', path: '/slider', category: '表单组件' },
  { name: 'Select', path: '/select', category: '表单组件' },
  { name: 'Form', path: '/form', category: '表单组件' },
  { name: 'DatePicker', path: '/datepicker', category: '表单组件' },
  { name: 'TimePicker', path: '/timepicker', category: '表单组件' },
  { name: 'Upload', path: '/upload', category: '表单组件' },

  { name: 'Layout', path: '/layout', category: '布局组件' },
  { name: 'Container', path: '/container', category: '布局组件' },
  { name: 'Header', path: '/header', category: '布局组件' },
  { name: 'Sidebar', path: '/sidebar', category: '布局组件' },
  { name: 'Content', path: '/content', category: '布局组件' },
  { name: 'Footer', path: '/footer', category: '布局组件' },
  { name: 'Grid', path: '/grid', category: '布局组件' },
  { name: 'Row', path: '/row', category: '布局组件' },
  { name: 'Col', path: '/col', category: '布局组件' },
  { name: 'Space', path: '/space', category: '布局组件' },
  { name: 'Divider', path: '/divider', category: '布局组件' },

  { name: 'Table', path: '/table', category: '数据展示' },
  { name: 'Tag', path: '/tag', category: '数据展示' },
  { name: 'Badge', path: '/badge', category: '数据展示' },
  { name: 'Card', path: '/card', category: '数据展示' },
  { name: 'Avatar', path: '/avatar', category: '数据展示' },
  { name: 'List', path: '/list', category: '数据展示' },
  { name: 'Descriptions', path: '/descriptions', category: '数据展示' },
  { name: 'Timeline', path: '/timeline', category: '数据展示' },

  { name: 'Alert', path: '/alert', category: '反馈组件' },
  { name: 'Message', path: '/message', category: '反馈组件' },
  { name: 'Modal', path: '/modal', category: '反馈组件' },
  { name: 'Popconfirm', path: '/popconfirm', category: '反馈组件' },
  { name: 'Drawer', path: '/drawer', category: '反馈组件' },
]

const categories = ['基础组件', '表单组件', '布局组件', '数据展示', '反馈组件']
</script>

<template>
  <div class="max-w-7xl mx-auto p-8">
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-4xl font-bold mb-2">Tigercat Vue3 组件演示</h1>
          <p class="text-gray-600">基于 Tailwind CSS 的 Vue 3 UI 组件库</p>
        </div>
        <ThemeSwitch />
      </div>
      <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p class="text-sm text-blue-800">
          <strong>💡 提示：</strong> 使用右上角的主题切换器可以实时预览不同主题效果。所有组件都支持主题自定义。
        </p>
      </div>
    </div>

    <div v-for="category in categories"
         :key="category"
         class="mb-12">
      <h2 class="text-2xl font-bold mb-6">{{ category }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link v-for="component in components.filter(c => c.category === category)"
                     :key="component.name"
                     :to="component.path"
                     class="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors">
          <h3 class="text-lg font-semibold text-gray-900">{{ component.name }}</h3>
          <p class="text-sm text-gray-600 mt-1">{{ component.name }} 组件演示</p>
        </router-link>
      </div>
    </div>
  </div>
</template>
