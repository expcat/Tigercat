<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">Affix 固钉</h1>
    <p class="text-gray-500 mb-8">将元素固定在可视区域的指定位置。</p>

    <DemoBlock title="固定在顶部" description="offsetTop 设置触发固定的滚动距离" :code="topSnippet">
      <div style="height: 100px; overflow: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px">
        <div style="height: 300px">
          <p class="mb-4">向下滚动触发固定 ↓</p>
          <Affix :offset-top="0" @change="onAffixChange">
            <div class="px-4 py-2 bg-blue-500 text-white rounded inline-block">我会固定在顶部</div>
          </Affix>
          <p class="mt-4">更多内容...</p>
        </div>
      </div>
    </DemoBlock>

    <DemoBlock title="底部固定" description="offsetBottom 从底部触发" :code="bottomSnippet">
      <Affix :offset-bottom="20">
        <div class="px-4 py-2 bg-green-500 text-white rounded inline-block">距底部 20px 固定</div>
      </Affix>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { Affix } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const onAffixChange = (affixed: boolean) => {
  console.log('Affix state:', affixed)
}

const topSnippet = `<Affix :offset-top="0" @change="onAffixChange">
  <div class="px-4 py-2 bg-blue-500 text-white rounded">我会固定在顶部</div>
</Affix>`

const bottomSnippet = `<Affix :offset-bottom="20">
  <div class="px-4 py-2 bg-green-500 text-white rounded">距底部 20px 固定</div>
</Affix>`
</script>
