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
        <FormItem label="基础 / 范围 / 精度">
          <Space direction="vertical" class="w-full">
            <InputNumber
              v-model="numValue"
              increment-aria-label="增加数值"
              decrement-aria-label="减少数值" />
            <InputNumber
              v-model="numValue"
              :min="0"
              :max="100"
              :step="5"
              increment-aria-label="增加数值"
              decrement-aria-label="减少数值" />
            <InputNumber
              v-model="numValue"
              :precision="2"
              :step="0.1"
              increment-aria-label="增加数值"
              decrement-aria-label="减少数值" />
          </Space>
        </FormItem>
        <FormItem label="尺寸与状态">
          <Space direction="vertical" class="w-full">
            <Space>
              <InputNumber
                v-model="numValue"
                size="sm"
                increment-aria-label="增加数值"
                decrement-aria-label="减少数值" />
              <InputNumber
                v-model="numValue"
                size="md"
                increment-aria-label="增加数值"
                decrement-aria-label="减少数值" />
              <InputNumber
                v-model="numValue"
                size="lg"
                increment-aria-label="增加数值"
                decrement-aria-label="减少数值" />
            </Space>
            <Space>
              <InputNumber
                :model-value="5"
                disabled
                increment-aria-label="增加数值"
                decrement-aria-label="减少数值" />
              <InputNumber
                :model-value="5"
                readonly
                increment-aria-label="增加数值"
                decrement-aria-label="减少数值" />
              <InputNumber
                v-model="numValue"
                status="error"
                increment-aria-label="增加数值"
                decrement-aria-label="减少数值" />
            </Space>
          </Space>
        </FormItem>
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <FormItem label="步进按钮">
          <Space direction="vertical" class="w-full">
            <InputNumber
              v-model="numValue"
              increment-aria-label="增加数值"
              decrement-aria-label="减少数值" />
            <InputNumber
              v-model="numValue"
              controls-position="both"
              increment-aria-label="增加数值"
              decrement-aria-label="减少数值" />
            <InputNumber v-model="numValue" :controls="false" />
          </Space>
        </FormItem>
        <FormItem label="千分位格式化">
          <InputNumber
            v-model="numFormatted"
            :formatter="(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(v) => Number(v.replace(/\$\s?|(,*)/g, ''))"
            increment-aria-label="增加数值"
            decrement-aria-label="减少数值" />
        </FormItem>
      </div>
    </Space>
  </div>
</template>
