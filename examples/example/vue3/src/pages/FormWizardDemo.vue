<script setup lang="ts">
import { reactive, ref } from 'vue'
import { FormWizard, Form, FormItem, Input, Alert } from '@expcat/tigercat-vue'
import type { WizardStep } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'

const steps: WizardStep[] = [
    { title: '基本信息', description: '填写姓名与邮箱' },
    { title: '联系方式', description: '填写手机号' },
    { title: '完成', description: '提交并确认' }
]

const current = ref(0)
const finished = ref(false)
type FormExpose = { validate: () => Promise<boolean> }
const formRef = ref<FormExpose | null>(null)
const model = reactive({ name: '', email: '', phone: '' })

const handleBeforeNext = async () => {
    const valid = await formRef.value?.validate()
    if (!valid) {
        return '请先完成当前步骤校验'
    }
    return true
}

const handleFinish = () => {
    finished.value = true
}

const handleChange = () => {
    finished.value = false
}

const basicSnippet = `<FormWizard
  v-model:current="current"
  :steps="steps"
  :before-next="handleBeforeNext"
  @change="handleChange"
  @finish="handleFinish">
  <template #step="{ index }">
    <Form ref="formRef" :model="model" class="max-w-xl mx-auto">
      <template v-if="index === 0">
        <FormItem name="name" label="姓名" required :rules="{ required: true, message: '请输入姓名' }">
          <Input v-model="model.name" placeholder="请输入姓名" />
        </FormItem>
        <FormItem name="email" label="邮箱" required :rules="{ required: true, message: '请输入邮箱' }">
          <Input v-model="model.email" placeholder="请输入邮箱" />
        </FormItem>
      </template>
      <template v-else-if="index === 1">
        <FormItem name="phone" label="手机号" required :rules="{ required: true, message: '请输入手机号' }">
          <Input v-model="model.phone" placeholder="请输入手机号" />
        </FormItem>
      </template>
      <template v-else>
        <div class="space-y-3">
          <div class="text-sm text-gray-600">确认信息无误后点击完成。</div>
          <Alert :type="finished ? 'success' : 'info'" :description="finished ? '已完成提交' : '等待完成提交'" />
        </div>
      </template>
    </Form>
  </template>
</FormWizard>`
</script>

<template>
    <div class="max-w-6xl mx-auto p-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-2">FormWizard 表单向导</h1>
            <p class="text-gray-600">多步表单流，支持校验阻断与完成态。</p>
        </div>

        <DemoBlock title="基础用法"
               description="多步校验阻断 + 完成态"
               :code="basicSnippet">
          <FormWizard v-model:current="current"
                :steps="steps"
                :before-next="handleBeforeNext"
                @change="handleChange"
                @finish="handleFinish">
            <template #step="{ index }">
              <Form ref="formRef"
                  :model="model"
                  class="max-w-xl mx-auto">
                <template v-if="index === 0">
                  <FormItem name="name"
                        label="姓名"
                        required
                        :rules="{ required: true, message: '请输入姓名' }">
                    <Input v-model="model.name"
                         placeholder="请输入姓名" />
                  </FormItem>
                  <FormItem name="email"
                        label="邮箱"
                        required
                        :rules="{ required: true, message: '请输入邮箱' }">
                    <Input v-model="model.email"
                         placeholder="请输入邮箱" />
                  </FormItem>
                </template>
                <template v-else-if="index === 1">
                  <FormItem name="phone"
                        label="手机号"
                        required
                        :rules="{ required: true, message: '请输入手机号' }">
                    <Input v-model="model.phone"
                         placeholder="请输入手机号" />
                  </FormItem>
                </template>
                <template v-else>
                  <div class="space-y-3">
                    <div class="text-sm text-gray-600">确认信息无误后点击完成。</div>
                    <Alert :type="finished ? 'success' : 'info'"
                         :description="finished ? '已完成提交' : '等待完成提交'" />
                  </div>
                </template>
              </Form>
            </template>
          </FormWizard>
        </DemoBlock>
    </div>
</template>
