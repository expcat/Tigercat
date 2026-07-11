<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Space } from '@expcat/tigercat-vue/Space'
import { Input } from '@expcat/tigercat-vue/Input'
import { ref } from 'vue'
import { Modal } from '@expcat/tigercat-vue/Modal'

const visible1 = ref(false)
const visible2 = ref(false)
const visible3 = ref(false)
const visibleSm = ref(false)
const visibleMd = ref(false)
const visibleLg = ref(false)
const visibleXl = ref(false)
const visibleFull = ref(false)
const visibleCentered = ref(false)
const visibleNested = ref(false)
const visibleNested2 = ref(false)
const visibleNoMask = ref(false)
const visibleDestroyOnClose = ref(false)
const visibleCustomFooter = ref(false)
const visibleDefaultFooter = ref(false)
const visibleLabels = ref(false)

const visibleConfirm = ref(false)
const confirmLoading = ref(false)
const confirmResult = ref<string | null>(null)

const visibleInfo = ref(false)

const visibleForm = ref(false)
const formLoading = ref(false)
const formName = ref('')
const formEmail = ref('')
const formError = ref<string | null>(null)

const handleOk = () => {
  console.log('OK clicked')
  visible1.value = false
}

const handleCancel = () => {
  console.log('Cancel clicked')
  visible1.value = false
}

const infoParagraphs = Array.from({ length: 14 }).map((_, index) => {
  return `这是一段用于演示滚动内容的示例文本（第 ${index + 1} 段）。当内容较长时，Modal 仍应保持良好的可读性与滚动体验。`
})

const handleConfirmDelete = async () => {
  if (confirmLoading.value) return
  confirmLoading.value = true
  confirmResult.value = null
  try {
    await new Promise((resolve) => setTimeout(resolve, 900))
    visibleConfirm.value = false
    confirmResult.value = '已确认：删除操作已提交（示例）'
  } finally {
    confirmLoading.value = false
  }
}

const cancelConfirmDelete = () => {
  visibleConfirm.value = false
  confirmResult.value = '已取消：未执行删除（示例）'
}

const cancelFormEdit = () => {
  visibleForm.value = false
  formError.value = null
}

const handleFormSubmit = async () => {
  if (formLoading.value) return
  formError.value = null

  const name = formName.value.trim()
  const email = formEmail.value.trim()

  if (!name) {
    formError.value = '请填写姓名'
    return
  }
  if (!email || !email.includes('@')) {
    formError.value = '请填写正确的邮箱'
    return
  }

  formLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))
    visibleForm.value = false
  } finally {
    formLoading.value = false
  }
}
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
      <Button @click="visibleNested = true">打开嵌套对话框</Button>
      <Modal v-model:open="visibleNested" title="第一层对话框">
        <p>这是第一层对话框的内容。</p>
        <Button @click="visibleNested2 = true" class="mt-4">打开第二层对话框</Button>

        <Modal v-model:open="visibleNested2" title="第二层对话框" :z-index="1100">
          <p>这是第二层嵌套的对话框。</p>
        </Modal>
      </Modal>
    </div>
  </div>
</template>
