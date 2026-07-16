<script setup lang="ts">
import { computed, ref } from 'vue'
import { FormWizard } from '@expcat/tigercat-vue/FormWizard'
import { Input } from '@expcat/tigercat-vue/Input'
import type { WizardStep } from '@expcat/tigercat-core'

const current = ref(0)
const name = ref('')
const team = ref('')
const includeTeam = ref(false)
const validationMessage = ref('输入至少两个字符后继续。')
const finished = ref(false)

const steps = computed<WizardStep[]>(() => [
  { title: '账户', description: '异步校验' },
  {
    title: '团队',
    description: '条件步骤',
    skipCondition: () => !includeTeam.value
  },
  { title: '确认', description: '检查结果' }
])

const handleTeamToggle = (event: Event) => {
  includeTeam.value = (event.currentTarget as HTMLInputElement).checked
  current.value = 0
  finished.value = false
}

const validateBeforeNext = async (index: number) => {
  if (index !== 0) return true
  validationMessage.value = '正在异步检查用户名…'
  await new Promise<void>((resolve) => setTimeout(resolve, 500))
  if (name.value.trim().length < 2) {
    validationMessage.value = '校验未通过：用户名至少需要两个字符。'
    return false
  }
  validationMessage.value = '校验通过，可以继续。'
  return true
}
</script>

<template>
  <div class="space-y-3">
    <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
      <input type="checkbox" :checked="includeTeam" @change="handleTeamToggle" />
      配置团队信息（取消勾选时自动跳过第二步）
    </label>
    <FormWizard
      v-model:current="current"
      :steps="steps"
      :before-next="validateBeforeNext"
      @change="finished = false"
      @finish="finished = true">
      <template #step="{ index }">
        <div v-if="index === 0" class="w-full space-y-2">
          <Input v-model="name" placeholder="请输入用户名" />
          <p class="text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
            {{ validationMessage }}
          </p>
        </div>
        <Input v-else-if="index === 1" v-model="team" placeholder="请输入团队名称" />
        <p v-else class="text-sm text-gray-600 dark:text-gray-300">
          用户名：{{ name }}；团队：{{ includeTeam ? team || '未填写' : '已跳过' }}
        </p>
      </template>
    </FormWizard>
    <p v-if="finished" class="text-sm text-green-600">流程已完成</p>
  </div>
</template>
