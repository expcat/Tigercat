<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Input } from '@expcat/tigercat-vue/Input'
import { Modal } from '@expcat/tigercat-vue/Modal'

const open = ref(false)
const name = ref('')
const email = ref('')
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
