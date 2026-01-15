<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  Form,
  FormItem,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  Button,
  Space
} from '@expcat/tigercat-vue'
import { countries } from '@demo-shared/constants'
import DemoBlock from '../components/DemoBlock.vue'

const basicForm = reactive({
  username: '',
  email: '',
  gender: 'male',
  country: 'china',
  bio: '',
  agreement: false
})

const handleBasicSubmit = ({
  valid,
  values
}: {
  valid: boolean
  values: Record<string, unknown>
}) => {
  console.log('表单提交:', { valid, values })
  alert(valid ? '表单提交成功！请查看控制台。' : '表单验证失败，请检查输入。')
}

const resetBasic = () => {
  basicForm.username = ''
  basicForm.email = ''
  basicForm.gender = 'male'
  basicForm.country = 'china'
  basicForm.bio = ''
  basicForm.agreement = false
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

const basicSnippet = `<Form :model="basicForm" @submit="handleBasicSubmit" class="max-w-md">
  <FormItem label="用户名" name="username" required>
    <Input v-model="basicForm.username" placeholder="请输入用户名" />
  </FormItem>
  <FormItem label="邮箱" name="email" required>
    <Input v-model="basicForm.email" type="email" placeholder="请输入邮箱" />
  </FormItem>
  <FormItem label="性别">
    <RadioGroup v-model="basicForm.gender">
      <Radio value="male">男</Radio>
      <Radio value="female">女</Radio>
      <Radio value="other">其他</Radio>
    </RadioGroup>
  </FormItem>
  <FormItem label="国家">
    <Select v-model="basicForm.country" :options="countries" />
  </FormItem>
  <FormItem label="个人简介">
    <Textarea v-model="basicForm.bio" placeholder="请输入个人简介" :rows="4" />
  </FormItem>
  <FormItem>
    <Checkbox v-model="basicForm.agreement"> 我已阅读并同意用户协议 </Checkbox>
  </FormItem>
  <FormItem>
    <Space>
      <Button type="submit" variant="primary">提交</Button>
      <Button type="button" variant="secondary" @click="resetBasic">重置</Button>
    </Space>
  </FormItem>
</Form>`

const validateSnippet = `<Space direction="vertical" class="w-full">
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
        <Button type="submit" variant="primary">提交并校验</Button>
        <Button type="button" variant="secondary" @click="validateManually">手动校验</Button>
        <Button type="button" variant="secondary" @click="clearValidateManually">清除校验</Button>
        <Button type="button" variant="secondary" @click="resetValidateForm">重置</Button>
      </Space>
    </FormItem>
  </Form>
  <div class="max-w-md w-full">
    <p class="text-sm text-gray-600 mb-2">最近一次校验结果：</p>
    <pre class="text-sm text-gray-700 bg-white p-4 rounded border whitespace-pre-wrap">{{
      lastValidateResult || '（无）'
    }}</pre>
  </div>
</Space>`

const previewSnippet = `<pre class="text-sm text-gray-700 bg-white p-4 rounded border">
  {{ JSON.stringify({ basicForm, validateForm }, null, 2) }}
</pre>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Form 表单</h1>
      <p class="text-gray-600">
        由输入框、选择器、单选框、多选框等控件组成，用以收集、校验、提交数据。
      </p>
    </div>

    <!-- 基础用法 -->
    <DemoBlock title="基础用法"
               description="完整的表单示例，包含多种表单控件。"
               :code="basicSnippet">
      <Form :model="basicForm"
            @submit="handleBasicSubmit"
            class="max-w-md">
        <FormItem label="用户名"
                  name="username"
                  required>
          <Input v-model="basicForm.username"
                 placeholder="请输入用户名" />
        </FormItem>

        <FormItem label="邮箱"
                  name="email"
                  required>
          <Input v-model="basicForm.email"
                 type="email"
                 placeholder="请输入邮箱" />
        </FormItem>

        <FormItem label="性别">
          <RadioGroup v-model="basicForm.gender">
            <Radio value="male">男</Radio>
            <Radio value="female">女</Radio>
            <Radio value="other">其他</Radio>
          </RadioGroup>
        </FormItem>

        <FormItem label="国家">
          <Select v-model="basicForm.country"
                  :options="countries" />
        </FormItem>

        <FormItem label="个人简介">
          <Textarea v-model="basicForm.bio"
                    placeholder="请输入个人简介"
                    :rows="4" />
        </FormItem>

        <FormItem>
          <Checkbox v-model="basicForm.agreement"> 我已阅读并同意用户协议 </Checkbox>
        </FormItem>

        <FormItem>
          <Space>
            <Button type="submit"
                    variant="primary">提交</Button>
            <Button type="button"
                    variant="secondary"
                    @click="resetBasic">重置</Button>
          </Space>
        </FormItem>
      </Form>
    </DemoBlock>

    <!-- 表单验证 -->
    <DemoBlock title="表单验证"
               description="通过 rules + name 实现校验，支持提交校验与手动校验。"
               :code="validateSnippet">
      <Space direction="vertical"
             class="w-full">
        <Form ref="validateFormRef"
              :model="validateForm"
              :rules="validateRules"
              @submit="handleValidateSubmit"
              class="max-w-md">
          <FormItem label="用户名"
                    name="username">
            <Input v-model="validateForm.username"
                   placeholder="至少 3 个字符" />
          </FormItem>

          <FormItem label="邮箱"
                    name="email">
            <Input v-model="validateForm.email"
                   placeholder="example@domain.com" />
          </FormItem>

          <FormItem label="年龄"
                    name="age">
            <Input v-model="validateForm.age"
                   type="number"
                   placeholder="1-150" />
          </FormItem>

          <FormItem label="网站"
                    name="website">
            <Input v-model="validateForm.website"
                   placeholder="https://example.com" />
          </FormItem>

          <FormItem>
            <Space>
              <Button type="submit"
                      variant="primary">提交并校验</Button>
              <Button type="button"
                      variant="secondary"
                      @click="validateManually">手动校验</Button>
              <Button type="button"
                      variant="secondary"
                      @click="clearValidateManually">清除校验</Button>
              <Button type="button"
                      variant="secondary"
                      @click="resetValidateForm">重置</Button>
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
    </DemoBlock>

    <!-- 表单数据预览 -->
    <DemoBlock title="表单数据预览"
               description="实时查看表单数据。"
               :code="previewSnippet">
      <pre class="text-sm text-gray-700 bg-white p-4 rounded border">{{
        JSON.stringify({ basicForm, validateForm }, null, 2)
      }}</pre>
    </DemoBlock>
  </div>
</template>
