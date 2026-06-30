<script setup lang="ts">
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Input } from '@expcat/tigercat-vue/Input'
import { Alert } from '@expcat/tigercat-vue/Alert'
import { reactive, ref } from 'vue'
import { FormWizard } from '@expcat/tigercat-vue/FormWizard'
import type { WizardStep } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './FormWizardDemo.vue?raw'

const steps: WizardStep[] = [
  { title: '基本信息', description: '填写姓名与邮箱', fields: ['name', 'email'] },
  { title: '联系方式', description: '填写手机号', fields: ['phone'] },
  { title: '完成', description: '提交并确认', fields: [] }
]

const current = ref(0)
const finished = ref(false)
const currentLabels = ref(0)

const basicScriptSnippet = `import { reactive, ref } from 'vue'

const current = ref(0)
const model = reactive({ name: '', email: '', phone: '' })`
type FormExpose = {
  validate: () => Promise<boolean>
  validateFields: (fieldNames: string[]) => Promise<boolean>
}
const formRef = ref<FormExpose | null>(null)
const model = reactive({ name: '', email: '', phone: '' })

const handleBeforeNext = async (_current: number, step: WizardStep) => {
  const fields = step.fields ?? []
  if (fields.length === 0) {
    return true
  }
  const valid = await formRef.value?.validateFields(fields)
  return valid === true
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
    <Form ref="formRef" :model="model" class="w-full max-w-md">
      <template v-if="index === 0">
        <FormItem name="name" label="姓名" required :show-message="false">
          <Input v-model="model.name" placeholder="请输入姓名" />
        </FormItem>
        <FormItem name="email" label="邮箱" required :show-message="false">
          <Input v-model="model.email" placeholder="请输入邮箱" />
        </FormItem>
      </template>
      <template v-else-if="index === 1">
        <FormItem name="phone" label="手机号" required :show-message="false">
          <Input v-model="model.phone" placeholder="请输入手机号" />
        </FormItem>
      </template>
      <template v-else>
        <div>确认信息无误后点击完成。</div>
      </template>
    </Form>
  </template>
</FormWizard>`

const labelsSnippet = `<!-- 单语言项目：无需 locale，直接用扁平 labels 覆盖按钮文案 -->
<FormWizard
  v-model:current="currentLabels"
  :steps="steps"
  :labels="{ prevText: '返回', nextText: '继续', finishText: '提交完成' }">
  <template #step="{ index }">
    <div class="text-sm text-gray-600">第 {{ index + 1 }} 步内容</div>
  </template>
</FormWizard>`
</script>

<template>
  <div class="max-w-6xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">FormWizard 表单向导</h1>
      <p class="text-gray-600 dark:text-gray-400">多步表单流，支持校验阻断与完成态。</p>
    </div>

    <DemoBlock title="基础用法" description="多步校验阻断 + 完成态" :code="fullPageSnippet">
      <FormWizard
        v-model:current="current"
        :steps="steps"
        :before-next="handleBeforeNext"
        @change="handleChange"
        @finish="handleFinish">
        <template #step="{ index }">
          <Form ref="formRef" :model="model" class="w-full max-w-md">
            <template v-if="index === 0">
              <FormItem
                name="name"
                label="姓名"
                required
                :rules="{ required: true, message: '请输入姓名' }"
                :show-message="false">
                <Input v-model="model.name" placeholder="请输入姓名" />
              </FormItem>
              <FormItem
                name="email"
                label="邮箱"
                required
                :rules="{ required: true, message: '请输入邮箱' }"
                :show-message="false">
                <Input v-model="model.email" placeholder="请输入邮箱" />
              </FormItem>
            </template>
            <template v-else-if="index === 1">
              <FormItem
                name="phone"
                label="手机号"
                required
                :rules="{ required: true, message: '请输入手机号' }"
                :show-message="false">
                <Input v-model="model.phone" placeholder="请输入手机号" />
              </FormItem>
            </template>
            <template v-else>
              <div class="space-y-3">
                <div class="text-sm text-(--tiger-text-secondary,#6b7280)">
                  确认信息无误后点击完成。
                </div>
                <Alert
                  :type="finished ? 'success' : 'info'"
                  :description="finished ? '已完成提交' : '等待完成提交'" />
              </div>
            </template>
          </Form>
        </template>
      </FormWizard>
    </DemoBlock>

    <DemoBlock
      title="自定义文案 (labels)"
      description="单语言项目无需引入 locale，直接用扁平 labels 覆盖上一步/下一步/完成按钮文案。"
      :code="fullPageSnippet">
      <FormWizard
        v-model:current="currentLabels"
        :steps="steps"
        :labels="{ prevText: '返回', nextText: '继续', finishText: '提交完成' }">
        <template #step="{ index }">
          <div class="text-sm text-gray-600">第 {{ index + 1 }} 步内容</div>
        </template>
      </FormWizard>
    </DemoBlock>
  </div>
</template>
