<script setup lang="ts">
import { ref } from 'vue'
import { BackTop, Button } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicSnippet = `<BackTop />
<!-- 滚动页面超过 400px 后显示 -->`

const customHeightSnippet = `<BackTop :visibilityHeight="200" />
<!-- 滚动 200px 后即显示 -->`

const customContentSnippet = `<BackTop>
  <div class="custom-back-top">UP</div>
</BackTop>`

const targetSnippet = `<div ref="scrollContainer" class="scroll-container">
  <!-- 长内容 -->
</div>
<BackTop :target="() => scrollContainer" />`

const scrollContainer = ref<HTMLElement>()

const handleClick = () => {
  console.log('BackTop clicked!')
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">BackTop 回到顶部</h1>
      <p class="text-gray-600">返回页面顶部的操作按钮。</p>
    </div>

    <DemoBlock
      title="基本用法"
      description="滚动页面，右下角会出现回到顶部按钮。"
      :code="basicSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <p class="text-gray-600 mb-4">向下滚动页面超过 400px 后，右下角会出现回到顶部按钮。</p>
        <p class="text-sm text-gray-500">
          提示：本页面已添加 BackTop 组件，请向下滚动查看效果。
        </p>
      </div>
    </DemoBlock>

    <DemoBlock
      title="自定义显示高度"
      description="可以设置滚动多少距离后显示按钮。"
      :code="customHeightSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <p class="text-gray-600">
          通过 <code class="bg-gray-200 px-1 rounded">visibilityHeight</code> 属性设置滚动高度阈值。
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="自定义内容" description="可以自定义按钮的显示内容。" :code="customContentSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <p class="text-gray-600 mb-4">通过默认插槽自定义按钮内容。</p>
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-lg">
            UP
          </div>
          <span class="text-sm text-gray-500">← 示例：自定义的回到顶部按钮样式</span>
        </div>
      </div>
    </DemoBlock>

    <DemoBlock
      title="滚动容器"
      description="可以指定滚动容器，在容器内滚动时触发。"
      :code="targetSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <p class="text-gray-600 mb-4">在下方容器内滚动，查看回到顶部效果：</p>
        <div
          ref="scrollContainer"
          class="h-64 overflow-auto border border-gray-200 rounded-lg p-4 bg-white relative">
          <div class="space-y-4">
            <p v-for="i in 20" :key="i" class="text-gray-600">
              这是第 {{ i }} 段内容。向下滚动查看更多...
            </p>
          </div>
          <BackTop :target="() => scrollContainer!" :visibilityHeight="100" />
        </div>
      </div>
    </DemoBlock>

    <DemoBlock title="点击回调" description="点击按钮时触发回调函数。" :code="basicSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <p class="text-gray-600 mb-4">
          通过 <code class="bg-gray-200 px-1 rounded">@click</code> 监听点击事件。
        </p>
        <Button variant="outline" @click="handleClick">模拟点击（查看控制台）</Button>
      </div>
    </DemoBlock>

    <!-- 添加一些内容使页面可以滚动 -->
    <div class="mt-8 space-y-8">
      <div v-for="i in 10" :key="i" class="p-6 bg-white rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold mb-2">占位内容 {{ i }}</h3>
        <p class="text-gray-600">
          这是用于演示滚动效果的占位内容。当页面滚动超过 400px 时，右下角会显示回到顶部按钮。
        </p>
      </div>
    </div>

    <!-- 页面级 BackTop -->
    <BackTop @click="handleClick" />
  </div>
</template>
