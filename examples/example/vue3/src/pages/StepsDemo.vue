<script setup lang="ts">
import { StepsItem } from '@expcat/tigercat-vue/StepsItem'
import { Button } from '@expcat/tigercat-vue/Button'
import { ref } from 'vue'
import { Steps } from '@expcat/tigercat-vue/Steps'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './StepsDemo.vue?raw'

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

const basicSnippet = `<Steps :current="current1">
  <StepsItem title="已完成" description="这是步骤的描述信息" />
  <StepsItem title="进行中" description="这是步骤的描述信息" />
  <StepsItem title="待完成" description="这是步骤的描述信息" />
</Steps>
<div class="mt-6">
  <Button @click="prev(0)" :disabled="current1 === 0" class="mr-2">上一步</Button>
  <Button @click="next(0)" :disabled="current1 === 2" variant="primary">下一步</Button>
</div>`

const basicScriptSnippet = `import { ref } from 'vue'

const current1 = ref(1)`

const miniSnippet = `<Steps :current="current2" simple>
  <StepsItem title="已完成" />
  <StepsItem title="进行中" />
  <StepsItem title="待完成" />
</Steps>
<div class="mt-6">
  <Button @click="prev(1)" :disabled="current2 === 0" class="mr-2">上一步</Button>
  <Button @click="next(1)" :disabled="current2 === 2" variant="primary">下一步</Button>
</div>`

const smallSnippet = `<Steps :current="current3" size="small">
  <StepsItem title="步骤 1" description="这是步骤的描述信息" />
  <StepsItem title="步骤 2" description="这是步骤的描述信息" />
  <StepsItem title="步骤 3" description="这是步骤的描述信息" />
</Steps>
<div class="mt-6">
  <Button @click="prev(2)" :disabled="current3 === 0" class="mr-2">上一步</Button>
  <Button @click="next(2)" :disabled="current3 === 2" variant="primary">下一步</Button>
</div>`

const errorSnippet = `<Steps :current="current4" status="error">
  <StepsItem title="已完成" description="这是步骤的描述信息" />
  <StepsItem title="出错了" description="发生了一些错误" />
  <StepsItem title="待完成" description="这是步骤的描述信息" />
</Steps>`

const verticalSnippet = `<Steps :current="current5" direction="vertical">
  <StepsItem title="步骤 1" description="这是步骤 1 的详细描述信息，可以比较长" />
  <StepsItem title="步骤 2" description="这是步骤 2 的详细描述信息" />
  <StepsItem title="步骤 3" description="这是步骤 3 的详细描述信息" />
</Steps>
<div class="mt-6">
  <Button @click="prev(4)" :disabled="current5 === 0" class="mr-2">上一步</Button>
  <Button @click="next(4)" :disabled="current5 === 2" variant="primary">下一步</Button>
</div>`

const clickableSnippet = `<Steps v-model:current="current6" clickable>
  <StepsItem title="步骤 1" description="点击标题切换步骤" />
  <StepsItem title="步骤 2" description="点击标题切换步骤" />
  <StepsItem title="步骤 3" description="点击标题切换步骤" />
</Steps>
<div class="mt-4 text-gray-600">当前步骤: {{ current6 + 1 }}</div>`

const iconSnippet = `<Steps :current="1">
  <StepsItem title="登录">
    <template #icon>
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </template>
  </StepsItem>
  <StepsItem title="验证">
    <template #icon>
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    </template>
  </StepsItem>
  <StepsItem title="完成">
    <template #icon>
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7" />
      </svg>
    </template>
  </StepsItem>
</Steps>`

const disabledSnippet = `<Steps v-model:current="current7" clickable>
  <StepsItem title="步骤 1" description="可点击的步骤" />
  <StepsItem title="步骤 2" description="该步骤已禁用" disabled />
  <StepsItem title="步骤 3" description="可点击的步骤" />
</Steps>
<div class="mt-4 text-gray-600">当前步骤: {{ current7 + 1 }}</div>`

const customStatusSnippet = `<Steps :current="2">
  <StepsItem title="已完成" description="自动推导为 finish" />
  <StepsItem title="自定义错误" description="status 覆盖自动状态" status="error" />
  <StepsItem title="处理中" description="当前步骤" />
</Steps>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Steps 步骤条</h1>
      <p class="text-gray-600 dark:text-gray-400">引导用户按照流程完成任务的导航条。</p>
    </div>

    <!-- 基本用法 -->
    <DemoBlock
      title="基本用法等组合展示"
      description="合并展示基本用法、迷你版、小尺寸等互不冲突的使用方式。"
      :code="fullPageSnippet">
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
    </DemoBlock>

    <!-- 纵向步骤条 -->
    <DemoBlock
      title="纵向步骤条等组合展示"
      description="合并展示纵向步骤条、可点击步骤、自定义图标等互不冲突的使用方式。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">纵向步骤条</h3>
          <Steps :current="current5" direction="vertical">
            <StepsItem title="步骤 1" description="这是步骤 1 的详细描述信息，可以比较长" />
            <StepsItem title="步骤 2" description="这是步骤 2 的详细描述信息" />
            <StepsItem title="步骤 3" description="这是步骤 3 的详细描述信息" />
          </Steps>
          <div class="mt-6">
            <Button @click="prev(4)" :disabled="current5 === 0" class="mr-2">上一步</Button>
            <Button @click="next(4)" :disabled="current5 === 2" variant="primary">下一步</Button>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">可点击步骤</h3>
          <Steps v-model:current="current6" clickable>
            <StepsItem title="步骤 1" description="点击标题切换步骤" />
            <StepsItem title="步骤 2" description="点击标题切换步骤" />
            <StepsItem title="步骤 3" description="点击标题切换步骤" />
          </Steps>
          <div class="mt-4 text-gray-600">当前步骤: {{ current6 + 1 }}</div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义图标</h3>
          <Steps :current="1">
            <StepsItem title="登录">
              <template #icon>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </template>
            </StepsItem>
            <StepsItem title="验证">
              <template #icon>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </template>
            </StepsItem>
            <StepsItem title="完成">
              <template #icon>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7" />
                </svg>
              </template>
            </StepsItem>
          </Steps>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用步骤</h3>
          <Steps v-model:current="current7" clickable>
            <StepsItem title="步骤 1" description="可点击的步骤" />
            <StepsItem title="步骤 2" description="该步骤已禁用" disabled />
            <StepsItem title="步骤 3" description="可点击的步骤" />
          </Steps>
          <div class="mt-4 text-gray-600">当前步骤: {{ current7 + 1 }}</div>
        </div>
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义步骤状态</h3>
          <Steps :current="2">
            <StepsItem title="已完成" description="自动推导为 finish" />
            <StepsItem title="自定义错误" description="status 覆盖自动状态" status="error" />
            <StepsItem title="处理中" description="当前步骤" />
          </Steps>
        </div>
      </div>
    </DemoBlock>
  </div>
</template>
