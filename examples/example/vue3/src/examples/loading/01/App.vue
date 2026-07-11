<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Card } from '@expcat/tigercat-vue/Card'
import { ref } from 'vue'
import { Loading } from '@expcat/tigercat-vue/Loading'

const pageLoading = ref(false)
const cardLoading = ref(false)
const buttonLoading = ref(false)

const showPageLoading = () => {
  pageLoading.value = true
  setTimeout(() => {
    pageLoading.value = false
  }, 2000)
}

const refreshCard = () => {
  cardLoading.value = true
  setTimeout(() => {
    cardLoading.value = false
  }, 1500)
}

const handleSubmit = () => {
  buttonLoading.value = true
  setTimeout(() => {
    buttonLoading.value = false
  }, 2000)
}
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="flex gap-8 items-center justify-center">
            <Loading />
            <Loading text="加载中..." />
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">加载动画变体</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-5 gap-8">
            <div class="flex flex-col items-center gap-2">
              <Loading variant="spinner" />
              <span class="text-sm text-gray-600">旋转</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Loading variant="ring" />
              <span class="text-sm text-gray-600">环形</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Loading variant="dots" />
              <span class="text-sm text-gray-600">圆点</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Loading variant="bars" />
              <span class="text-sm text-gray-600">条形</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Loading variant="pulse" />
              <span class="text-sm text-gray-600">脉冲</span>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">尺寸大小</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="flex gap-8 items-center justify-center">
            <div class="flex flex-col items-center gap-2">
              <Loading size="sm" />
              <span class="text-sm text-gray-600">小</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Loading size="md" />
              <span class="text-sm text-gray-600">中</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Loading size="lg" />
              <span class="text-sm text-gray-600">大</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Loading size="xl" />
              <span class="text-sm text-gray-600">超大</span>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">颜色变体</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-4 gap-6">
            <div class="flex flex-col items-center gap-2">
              <Loading color="primary" />
              <span class="text-sm text-gray-600">主要色</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Loading color="secondary" />
              <span class="text-sm text-gray-600">次要色</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Loading color="success" />
              <span class="text-sm text-gray-600">成功色</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Loading color="warning" />
              <span class="text-sm text-gray-600">警告色</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Loading color="danger" />
              <span class="text-sm text-gray-600">危险色</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Loading color="info" />
              <span class="text-sm text-gray-600">信息色</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Loading color="default" />
              <span class="text-sm text-gray-600">默认色</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Loading custom-color="#ff6b6b" />
              <span class="text-sm text-gray-600">自定义色</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
