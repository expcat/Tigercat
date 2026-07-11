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
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">区域加载</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Card title="数据统计">
            <div class="relative min-h-[200px]">
              <div
                v-if="cardLoading"
                class="absolute inset-0 flex items-center justify-center bg-white/80">
                <Loading text="刷新中..." />
              </div>
              <div v-else>
                <p class="mb-2">总用户数: 1,234</p>
                <p class="mb-2">活跃用户: 567</p>
                <p class="mb-4">新增用户: 89</p>
                <Button @click="refreshCard">刷新数据</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">按钮加载</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="flex gap-4">
            <Button :loading="buttonLoading" @click="handleSubmit"> 提交 </Button>
            <Button variant="secondary" :loading="buttonLoading" @click="handleSubmit">
              保存
            </Button>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">延迟显示</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="flex gap-8 items-center justify-center">
            <div class="flex flex-col items-center gap-2">
              <Loading :delay="0" text="无延迟" />
            </div>
            <div class="flex flex-col items-center gap-2">
              <Loading :delay="300" text="延迟 300ms" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
