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
      <FormItem label="基础输入">
        <Input v-model="basicText" placeholder="请输入内容" />
        <p class="text-sm text-gray-600">输入的内容：{{ basicText }}</p>
      </FormItem>
      <div class="grid gap-4 md:grid-cols-2">
        <FormItem label="受控输入">
          <Input v-model="controlledText" placeholder="受控输入" />
        </FormItem>
        <FormItem label="非受控输入">
          <Input placeholder="非受控输入" @input="handleUncontrolledInput" />
          <p class="text-sm text-gray-600">输入的内容：{{ uncontrolled }}</p>
        </FormItem>
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <FormItem label="文本 / 密码">
          <Space direction="vertical" class="w-full">
            <Input v-model="typeText" type="text" placeholder="文本输入" />
            <Input v-model="password" type="password" placeholder="密码输入" />
          </Space>
        </FormItem>
        <FormItem label="其他类型">
          <Space direction="vertical" class="w-full">
            <Input type="email" placeholder="邮箱输入" />
            <Input type="tel" placeholder="电话输入" />
            <Input type="search" placeholder="搜索内容" />
          </Space>
        </FormItem>
      </div>
      <FormItem label="尺寸">
        <Space direction="vertical" class="w-full max-w-md">
          <Input size="sm" placeholder="小尺寸输入框" />
          <Input size="md" placeholder="中尺寸输入框" />
          <Input size="lg" placeholder="大尺寸输入框" />
        </Space>
      </FormItem>
      <div class="grid gap-4 md:grid-cols-2">
        <FormItem label="禁用 / 只读">
          <Space direction="vertical" class="w-full">
            <Input v-model="disabled" disabled />
            <Input v-model="readonly" readonly />
          </Space>
        </FormItem>
        <FormItem label="前缀 / 后缀">
          <Space direction="vertical" class="w-full">
            <Input placeholder="前缀图标">
              <template #prefix>👤</template>
            </Input>
            <Input placeholder="后缀图标">
              <template #suffix>🔍</template>
            </Input>
            <Input prefix="￥" suffix="RMB" placeholder="前缀后缀文本" />
          </Space>
        </FormItem>
      </div>
    </Space>
  </div>
</template>
