<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Input } from '@expcat/tigercat-vue/Input'
import { Modal } from '@expcat/tigercat-vue/Modal'
import { Select } from '@expcat/tigercat-vue/Select'
import { DatePicker } from '@expcat/tigercat-vue/DatePicker'

const open = ref(false)
const name = ref('')
const email = ref('')
const project = ref('website')
const dueDate = ref<Date | null>(null)
const error = ref('')
const saving = ref(false)

function save() {
  if (!name.value.trim()) {
    error.value = '请填写姓名'
    return
  }
  error.value = ''
  saving.value = true
  window.setTimeout(() => {
    saving.value = false
    open.value = false
  }, 500)
}
</script>

<template>
  <Button @click="open = true">编辑资料</Button>
  <Modal v-model:open="open" title="编辑资料" :mask-closable="false">
    <div class="space-y-3">
      <label class="space-y-1 text-sm">
        <span>姓名</span>
        <Input v-model="name" placeholder="请输入姓名" />
      </label>
      <label class="block space-y-1 text-sm">
        <span>项目（浮层自动使用 Modal layer）</span>
        <Select
          v-model="project"
          :options="[
            { label: '网站改版', value: 'website' },
            { label: '移动端发布', value: 'mobile' },
            { label: '设计系统', value: 'design-system' }
          ]" />
      </label>
      <label class="block space-y-1 text-sm">
        <span>截止日期</span>
        <DatePicker v-model="dueDate" />
      </label>
      <label class="space-y-1 text-sm">
        <span>邮箱</span>
        <Input v-model="email" placeholder="name@example.com" />
      </label>
      <p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="secondary" :disabled="saving" @click="open = false">取消</Button>
        <Button :loading="saving" @click="save">保存</Button>
      </div>
    </template>
  </Modal>
</template>
