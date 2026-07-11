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
    <div class="max-w-md">
      <Space class="mb-4">
        <Button
          :variant="sizeValue === 'sm' ? 'primary' : 'secondary'"
          size="sm"
          @click="sizeValue = 'sm'"
          >Small</Button
        >
        <Button
          :variant="sizeValue === 'md' ? 'primary' : 'secondary'"
          size="sm"
          @click="sizeValue = 'md'"
          >Medium</Button
        >
        <Button
          :variant="sizeValue === 'lg' ? 'primary' : 'secondary'"
          size="sm"
          @click="sizeValue = 'lg'"
          >Large</Button
        >
      </Space>
      <Form :model="sizeModel" :size="sizeValue">
        <FormItem label="姓名" name="name">
          <Input v-model="sizeModel.name" placeholder="请输入姓名" />
        </FormItem>
      </Form>
    </div>
  </div>
</template>
