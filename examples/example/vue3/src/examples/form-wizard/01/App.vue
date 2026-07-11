<script setup lang="ts">
import { ref } from 'vue'
import { FormWizard } from '@expcat/tigercat-vue/FormWizard'
import { Input } from '@expcat/tigercat-vue/Input'
import type { WizardStep } from '@expcat/tigercat-core'

const steps: WizardStep[] = [{ title: '填写信息' }, { title: '确认提交' }]
const current = ref(0)
const name = ref('')
const finished = ref(false)

const handleChange = () => {
  finished.value = false
}
</script>

<template>
  <div class="space-y-3">
    <FormWizard
      v-model:current="current"
      :steps="steps"
      :labels="{ prevText: '返回', nextText: '继续', finishText: '提交' }"
      @change="handleChange"
      @finish="finished = true">
      <template #step="{ index }">
        <Input v-if="index === 0" v-model="name" placeholder="请输入姓名" />
        <p v-else class="text-sm text-gray-600 dark:text-gray-300">
          姓名：{{ name || '尚未填写' }}
        </p>
      </template>
    </FormWizard>
    <p v-if="finished" class="text-sm text-green-600">提交完成</p>
  </div>
</template>
