<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { FormWizard } from '@expcat/tigercat-vue/FormWizard'
import { Input } from '@expcat/tigercat-vue/Input'
import type { WizardStep } from '@expcat/tigercat-core'

const steps: WizardStep[] = [{ title: '填写信息', fields: ['name'] }, { title: '确认提交' }]
const current = ref(0)
const model = reactive({ name: '' })
const finished = ref(false)

const handleChange = () => {
  finished.value = false
}
</script>

<template>
  <div class="space-y-3">
    <Form
      :model="model"
      :rules="{ name: [{ required: true, message: '请输入姓名' }] }"
      @submit="finished = $event.valid">
      <FormWizard
        v-model:current="current"
        :steps="steps"
        :labels="{ prevText: '返回', nextText: '继续', finishText: '提交' }"
        @change="handleChange"
        @finish="finished = true">
        <template #step="{ index }">
          <FormItem v-if="index === 0" name="name" label="姓名">
            <Input placeholder="请输入姓名" />
          </FormItem>
          <p v-else class="text-sm text-gray-600 dark:text-gray-300">
            姓名：{{ model.name || '尚未填写' }}
          </p>
        </template>
      </FormWizard>
    </Form>
    <p v-if="finished" class="text-sm text-green-600">提交完成</p>
  </div>
</template>
