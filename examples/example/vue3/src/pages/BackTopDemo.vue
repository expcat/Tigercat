<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BackTop, Button } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicSnippet = `<BackTop />
<!-- 滚动页面超过 400px 后显示 -->`

const customHeightSnippet = `<BackTop :visibility-height="200" />
<!-- 滚动 200px 后即显示 -->`

const customContentSnippet = `<BackTop>
  <div class="custom-back-top">UP</div>
</BackTop>`

const customDurationSnippet = `<BackTop :duration="800" />
<!-- 滚动动画持续 800ms -->`

const customTargetSnippet = `<div ref="scrollContainer" class="h-64 overflow-auto">
  <div class="h-[1000px] p-4">长内容...</div>
  <BackTop :target="() => scrollContainer" />
</div>`

const clickSnippet = `<BackTop @click="handleClick" />`

const pageScrollContainer = ref<HTMLElement | null>(null)
const innerContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  pageScrollContainer.value = document.querySelector('main > div.overflow-y-auto') as HTMLElement
})

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

    <DemoBlock title="基本用法"
               description="滚动页面，右下角会出现回到顶部按钮。"
               :code="basicSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <p class="text-gray-600 mb-4">向下滚动页面超过 400px 后，右下角会出现回到顶部按钮。</p>
        <p class="text-sm text-gray-500">
          提示：本页面已添加 BackTop 组件，请向下滚动查看效果。
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="自定义显示高度"
               description="可以设置滚动多少距离后显示按钮。"
               :code="customHeightSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <p class="text-gray-600">
          通过 <code class="bg-gray-200 px-1 rounded">visibilityHeight</code> 属性设置滚动高度阈值。
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="自定义内容"
               description="可以自定义按钮的显示内容。"
               :code="customContentSnippet">
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

    <DemoBlock title="自定义动画时长"
               description="通过 duration 属性控制滚动到顶部的动画时长。"
               :code="customDurationSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <p class="text-gray-600">
          通过 <code class="bg-gray-200 px-1 rounded">duration</code> 属性设置动画时长（毫秒），默认 450ms。
        </p>
      </div>
    </DemoBlock>

    <DemoBlock title="自定义滚动容器"
               description="指定 target 监听自定义容器的滚动。"
               :code="customTargetSnippet">
      <div ref="innerContainer"
           class="h-64 overflow-auto rounded-lg border border-gray-200 relative">
        <div class="h-[1000px] p-4">
          <p class="text-gray-600 mb-4">在此容器内向下滚动查看回到顶部按钮。</p>
          <p v-for="i in 20"
             :key="i"
             class="text-gray-400 py-2">滚动内容行 {{ i }}</p>
        </div>
        <BackTop v-if="innerContainer"
                 :target="() => innerContainer!"
                 :visibility-height="100" />
      </div>
    </DemoBlock>

    <DemoBlock title="点击回调"
               description="点击按钮时触发回调函数。"
               :code="clickSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <p class="text-gray-600 mb-4">
          通过 <code class="bg-gray-200 px-1 rounded">@click</code> 监听点击事件。
        </p>
        <Button variant="outline"
                @click="handleClick">模拟点击（查看控制台）</Button>
      </div>
    </DemoBlock>

    <!-- 添加一些内容使页面可以滚动 -->
    <div class="mt-8 space-y-8">
      <div v-for="i in 10"
           :key="i"
           class="p-6 bg-white rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold mb-2">占位内容 {{ i }}</h3>
        <p class="text-gray-600">
          这是用于演示滚动效果的占位内容。当页面滚动超过 400px 时，右下角会显示回到顶部按钮。
        </p>
      </div>
    </div>

    <!-- 页面级 BackTop - 监听布局的滚动容器 -->
    <BackTop v-if="pageScrollContainer"
             :target="() => pageScrollContainer!"
             @click="handleClick" />
  </div>
</template>
