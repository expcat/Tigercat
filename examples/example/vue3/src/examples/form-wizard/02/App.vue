<script setup lang="ts">
import { computed, ref } from 'vue'
import { FormWizard } from '@expcat/tigercat-vue/FormWizard'
import { Input } from '@expcat/tigercat-vue/Input'
import type { WizardStep } from '@expcat/tigercat-core'

const current = ref(0)
const name = ref('')
const team = ref('')
const includeTeam = ref(false)
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

const validateBeforeNext = async (index: number) => {
  if (index !== 0) return true
  await new Promise<void>((resolve) => setTimeout(resolve, 500))
  if (name.value.trim().length < 2) return '校验未通过：用户名至少需要两个字符。'
  return true
}
</script>

<template>
  <div class="space-y-3">
    <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
      <input v-model="includeTeam" type="checkbox" @change="finished = false" />
      配置团队信息（取消勾选时自动跳过第二步）
    </label>
    <FormWizard
      v-model:current="current"
      :steps="steps"
      :before-next="validateBeforeNext"
      @change="finished = false"
      @finish="finished = true">
      <template #step="{ index }">
        <Input v-if="index === 0" v-model="name" placeholder="请输入用户名" />
        <Input v-else-if="index === 1" v-model="team" placeholder="请输入团队名称" />
        <p v-else class="text-sm text-gray-600 dark:text-gray-300">
          用户名：{{ name }}；团队：{{ includeTeam ? team || '未填写' : '已跳过' }}
        </p>
      </template>
    </FormWizard>
    <p v-if="finished" class="text-sm text-green-600">流程已完成</p>
  </div>
</template>
