<script setup lang="ts">
import { InputNumber } from '@expcat/tigercat-vue/InputNumber'
import { Space } from '@expcat/tigercat-vue/Space'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Button } from '@expcat/tigercat-vue/Button'
import { ref } from 'vue'
import { Input } from '@expcat/tigercat-vue/Input'
import type { InputStatus } from '@expcat/tigercat-core'

const basicText = ref('')
const controlledText = ref('')
const typeText = ref('')
const password = ref('')
const disabled = ref('禁用的输入框')
const readonly = ref('只读的输入框')
const limited = ref('')
const uncontrolled = ref('')

// InputNumber states
const numValue = ref(0)
const numFormatted = ref(1000)

// Shake Demo Logic
const shakeStatus = ref<InputStatus>('default')
const shakeError = ref('')

const triggerShake = () => {
  shakeStatus.value = 'default'
  shakeError.value = ''

  // 使用 nextTick 或 setTimeout 来确保状态变更被捕捉，从而由 default -> error 触发动画
  setTimeout(() => {
    shakeStatus.value = 'error'
    shakeError.value = '验证失败，请重试！'
  }, 50)
}
const resetShake = () => {
  shakeStatus.value = 'default'
  shakeError.value = ''
}

const handleUncontrolledInput = (event: Event) => {
  uncontrolled.value = (event.target as HTMLInputElement).value
}
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" class="w-full max-w-2xl" size="lg">
      <div class="grid gap-4 md:grid-cols-2">
        <FormItem label="必填输入">
          <Input required placeholder="必填项" />
        </FormItem>
        <FormItem label="长度限制（3~10）">
          <Input
            v-model="limited"
            :minLength="3"
            :maxLength="10"
            placeholder="请输入 3~10 个字符" />
          <p class="text-sm text-gray-600">当前长度：{{ limited.length }}</p>
        </FormItem>
      </div>
      <FormItem label="状态与错误提示">
        <Space direction="vertical" class="w-full max-w-md">
          <Input status="error" placeholder="错误状态" />
          <Input status="warning" placeholder="警告状态" />
          <Input status="success" placeholder="成功状态" />
          <Input status="error" errorMessage="用户名已存在" placeholder="带错误信息" />
        </Space>
      </FormItem>
      <FormItem label="错误抖动">
        <Space direction="vertical" class="w-full max-w-md">
          <Input
            :status="shakeStatus"
            :errorMessage="shakeError"
            placeholder="点击按钮触发错误抖动" />
          <Space>
            <Button @click="triggerShake" variant="primary">触发错误</Button>
            <Button @click="resetShake">重置</Button>
          </Space>
        </Space>
      </FormItem>
    </Space>
  </div>
</template>
