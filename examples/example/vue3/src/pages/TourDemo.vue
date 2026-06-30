<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">Tour 漫游式引导</h1>
    <p class="text-gray-500 mb-8">分步引导用户了解页面功能。</p>

    <DemoBlock
      title="基础用法与自定义按钮文字 & 指示器"
      description="合并展示基础用法、自定义按钮文字 & 指示器，减少重复示例块。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <div class="flex gap-4 items-center">
            <button
              id="tour-btn-1"
              class="px-4 py-2 bg-blue-500 text-white rounded"
              @click="open = true">
              开始引导
            </button>
            <span id="tour-btn-2" class="px-3 py-1 bg-gray-100 rounded text-sm">目标2</span>
            <span id="tour-btn-3" class="px-3 py-1 bg-gray-100 rounded text-sm">目标3</span>
          </div>
          <Tour v-model:open="open" :steps="steps" />
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
            自定义按钮文字 & 指示器
          </h3>
          <button
            id="tour-custom"
            class="px-4 py-2 bg-green-500 text-white rounded"
            @click="open2 = true">
            自定义引导
          </button>
          <Tour
            v-model:open="open2"
            :steps="customSteps"
            next-text="下一步"
            prev-text="上一步"
            finish-text="完成"
            :show-indicators="true" />
        </div>
      </div>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Tour } from '@expcat/tigercat-vue/Tour'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './TourDemo.vue?raw'

const open = ref(false)
const open2 = ref(false)

const steps = [
  { target: '#tour-btn-1', title: '步骤一', description: '点击此按钮开始引导' },
  { target: '#tour-btn-2', title: '步骤二', description: '这是第二个引导目标' },
  { target: '#tour-btn-3', title: '步骤三', description: '引导完成！' }
]

const customSteps = [
  { target: '#tour-custom', title: '欢迎', description: '自定义按钮文字和指示器' },
  { target: '#tour-custom', title: '提示', description: '可以反复定位到同一元素' }
]

const basicSnippet = `<Tour v-model:open="open" :steps="steps" />

const steps = [
  { target: '#btn-1', title: '步骤一', description: '说明文字' },
  { target: '#btn-2', title: '步骤二', description: '说明文字' }
]`

const basicScriptSnippet = `import { ref } from 'vue'

const open = ref(false)`

const customSnippet = `<Tour
  v-model:open="open"
  :steps="steps"
  next-text="下一步"
  prev-text="上一步"
  finish-text="完成"
  :show-indicators="true" />`
</script>
