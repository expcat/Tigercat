<script setup lang="ts">
import { Affix } from '@expcat/tigercat-vue/Affix'

const onAffixChange = (affixed: boolean) => {
  console.log('Affix state:', affixed)
}
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">固定在顶部</h3>
        <div
          id="affix-scroll-container"
          style="
            height: 100px;
            overflow: auto;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
          ">
          <div style="height: 300px">
            <p class="mb-4">向下滚动触发固定 ↓</p>
            <Affix :offset-top="0" target="#affix-scroll-container" @change="onAffixChange">
              <div class="px-4 py-2 bg-blue-500 text-white rounded inline-block">
                我会固定在顶部
              </div>
            </Affix>
            <p class="mt-4">更多内容...</p>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">底部固定</h3>
        <Affix :offset-bottom="20">
          <div class="px-4 py-2 bg-green-500 text-white rounded inline-block">距底部 20px 固定</div>
        </Affix>
      </div>
    </div>
  </div>
</template>
