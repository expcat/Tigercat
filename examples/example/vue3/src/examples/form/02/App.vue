<script setup lang="ts">
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Input } from '@expcat/tigercat-vue/Input'
import { Textarea } from '@expcat/tigercat-vue/Textarea'
import { Select } from '@expcat/tigercat-vue/Select'
import { Checkbox } from '@expcat/tigercat-vue/Checkbox'
import { Radio } from '@expcat/tigercat-vue/Radio'
import { RadioGroup } from '@expcat/tigercat-vue/RadioGroup'
import { Button } from '@expcat/tigercat-vue/Button'
import { Space } from '@expcat/tigercat-vue/Space'
import { reactive, ref } from 'vue'
import { Form } from '@expcat/tigercat-vue/Form'
import { countries } from '@demo-shared/constants'

const basicForm = reactive({
  username: '',
  email: '',
  gender: 'male',
  country: 'china',
  bio: '',
  agreement: false
})
const basicSubmitFeedback = ref('尚未提交表单')

const handleBasicSubmit = ({
  valid,
  values
}: {
  valid: boolean
  values: Record<string, unknown>
}) => {
  basicSubmitFeedback.value = valid
    ? `提交成功：${String(values.username || '未填写用户名')}`
    : '提交失败，请检查输入。'
}

const resetBasic = () => {
  basicForm.username = ''
  basicForm.email = ''
  basicForm.gender = 'male'
  basicForm.country = 'china'
  basicForm.bio = ''
  basicForm.agreement = false
  basicSubmitFeedback.value = '表单已重置'
}

const validateFormRef = ref<any>(null)
const validateForm = reactive({
  username: '',
  email: '',
  age: '',
  website: ''
})
const validateRules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度应在 3 到 20 个字符之间' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email' as const, message: '请输入有效的邮箱地址' }
  ],
  age: [
    { required: true, message: '请输入年龄' },
    { type: 'number' as const, message: '年龄必须是数字' },
    { min: 1, max: 150, message: '年龄必须在 1 到 150 之间' }
  ],
  website: [{ type: 'url' as const, message: '请输入有效的 URL' }]
}
const lastValidateResult = ref<string>('')

const handleValidateSubmit = ({
  valid,
  values,
  errors
}: {
  valid: boolean
  values: Record<string, unknown>
  errors: unknown[]
}) => {
  lastValidateResult.value = JSON.stringify({ valid, values, errors }, null, 2)
}

const validateManually = async () => {
  const valid = await validateFormRef.value?.validate()
  lastValidateResult.value = JSON.stringify({ valid }, null, 2)
}

const clearValidateManually = () => {
  validateFormRef.value?.clearValidate()
}

const resetValidateForm = () => {
  validateForm.username = ''
  validateForm.email = ''
  validateForm.age = ''
  validateForm.website = ''
  validateFormRef.value?.clearValidate()
  lastValidateResult.value = ''
}

const layoutPosition = ref<'left' | 'right' | 'top'>('right')
const layoutModel = reactive({ name: '', email: '' })

const sizeValue = ref<'sm' | 'md' | 'lg'>('md')
const sizeModel = reactive({ name: '' })

const disabledModel = reactive({ name: '张三', email: 'zhangsan@example.com' })

const customValidatorFormRef = ref<any>(null)
const customValidatorModel = reactive({ username: '', age: '' })
const customValidatorRules = {
  username: [
    { required: true, message: '请输入用户名' },
    {
      validator: async (value: unknown) => {
        await new Promise((r) => setTimeout(r, 500))
        if (value === 'admin') return '用户名已被占用'
        return true
      },
      message: '用户名校验失败'
    }
  ],
  age: [
    { required: true, message: '请输入年龄' },
    {
      validator: (value: unknown) => {
        const num = Number(value)
        if (isNaN(num) || num < 18 || num > 120) return '年龄必须在 18-120 之间'
        return true
      }
    }
  ]
}

const showMessageFormRef = ref<any>(null)
const showMessageModel = reactive({ email: '' })
const showMessageRules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email' as const, message: '请输入有效的邮箱地址' }
  ]
}
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" class="w-full">
      <Form
        ref="validateFormRef"
        :model="validateForm"
        :rules="validateRules"
        @submit="handleValidateSubmit"
        class="max-w-md">
        <FormItem label="用户名" name="username">
          <Input v-model="validateForm.username" placeholder="至少 3 个字符" />
        </FormItem>

        <FormItem label="邮箱" name="email">
          <Input v-model="validateForm.email" placeholder="example@domain.com" />
        </FormItem>

        <FormItem label="年龄" name="age">
          <Input v-model="validateForm.age" type="number" placeholder="1-150" />
        </FormItem>

        <FormItem label="网站" name="website">
          <Input v-model="validateForm.website" placeholder="https://example.com" />
        </FormItem>

        <FormItem>
          <Space>
            <Button html-type="submit" variant="primary">提交并校验</Button>
            <Button html-type="button" variant="secondary" @click="validateManually"
              >手动校验</Button
            >
            <Button html-type="button" variant="secondary" @click="clearValidateManually"
              >清除校验</Button
            >
            <Button html-type="button" variant="secondary" @click="resetValidateForm">重置</Button>
          </Space>
        </FormItem>
      </Form>

      <div class="max-w-md w-full">
        <p class="text-sm text-gray-600 mb-2">最近一次校验结果：</p>
        <pre class="text-sm text-gray-700 bg-white p-4 rounded border whitespace-pre-wrap">{{
          lastValidateResult || '（无）'
        }}</pre>
      </div>
    </Space>
  </div>
</template>
