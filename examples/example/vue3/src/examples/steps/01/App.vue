<script setup lang="ts">
import { StepsItem } from '@expcat/tigercat-vue/StepsItem'
import { Button } from '@expcat/tigercat-vue/Button'
import { ref } from 'vue'
import { Steps } from '@expcat/tigercat-vue/Steps'

const current1 = ref(1)
const current2 = ref(1)
const current3 = ref(0)
const current4 = ref(1)
const current5 = ref(0)
const current6 = ref(1)
const current7 = ref(0)

const currents = [current1, current2, current3, current4, current5, current6, current7] as const

const next = (index: number) => {
  const currentRef = currents[index]
  if (!currentRef) return
  if (currentRef.value < 2) {
    currentRef.value++
  }
}

const prev = (index: number) => {
  const currentRef = currents[index]
  if (!currentRef) return
  if (currentRef.value > 0) {
    currentRef.value--
  }
}
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
        <Steps :current="current1">
          <StepsItem title="已完成" description="这是步骤的描述信息" />
          <StepsItem title="进行中" description="这是步骤的描述信息" />
          <StepsItem title="待完成" description="这是步骤的描述信息" />
        </Steps>
        <div class="mt-6">
          <Button @click="prev(0)" :disabled="current1 === 0" class="mr-2">上一步</Button>
          <Button @click="next(0)" :disabled="current1 === 2" variant="primary">下一步</Button>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">迷你版</h3>
        <Steps :current="current2" simple>
          <StepsItem title="已完成" />
          <StepsItem title="进行中" />
          <StepsItem title="待完成" />
        </Steps>
        <div class="mt-6">
          <Button @click="prev(1)" :disabled="current2 === 0" class="mr-2">上一步</Button>
          <Button @click="next(1)" :disabled="current2 === 2" variant="primary">下一步</Button>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">小尺寸</h3>
        <Steps :current="current3" size="small">
          <StepsItem title="步骤 1" description="这是步骤的描述信息" />
          <StepsItem title="步骤 2" description="这是步骤的描述信息" />
          <StepsItem title="步骤 3" description="这是步骤的描述信息" />
        </Steps>
        <div class="mt-6">
          <Button @click="prev(2)" :disabled="current3 === 0" class="mr-2">上一步</Button>
          <Button @click="next(2)" :disabled="current3 === 2" variant="primary">下一步</Button>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">错误状态</h3>
        <Steps :current="current4" status="error">
          <StepsItem title="已完成" description="这是步骤的描述信息" />
          <StepsItem title="出错了" description="发生了一些错误" />
          <StepsItem title="待完成" description="这是步骤的描述信息" />
        </Steps>
      </div>
    </div>
  </div>
</template>
