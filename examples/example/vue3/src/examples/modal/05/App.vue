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
    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold mb-3">确认对话框</h3>
        <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-gray-700 dark:text-gray-300">用于需要用户确认的操作（示例：删除）。</p>
            <Button variant="outline" @click="visibleConfirm = true">删除确认</Button>
          </div>
          <p v-if="confirmResult" class="mt-3 text-sm text-green-700">{{ confirmResult }}</p>

          <Modal v-model:open="visibleConfirm" title="删除确认" :mask-closable="false">
            <p class="text-gray-800">此操作不可撤销，是否继续？</p>
            <p class="mt-2 text-gray-600 text-sm">提示：这里用按钮 loading 模拟异步提交。</p>
            <template #footer>
              <Space>
                <Button variant="secondary" :disabled="confirmLoading" @click="cancelConfirmDelete">
                  取消
                </Button>
                <Button :disabled="confirmLoading" @click="handleConfirmDelete">
                  {{ confirmLoading ? '删除中…' : '确认删除' }}
                </Button>
              </Space>
            </template>
          </Modal>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-semibold mb-3">信息展示</h3>
        <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-gray-700 dark:text-gray-300">
              用于展示较长内容（用户协议/隐私政策等）。
            </p>
            <Button @click="visibleInfo = true">查看详情</Button>
          </div>

          <Modal v-model:open="visibleInfo" title="服务协议（示例）" size="lg">
            <div class="max-h-[50vh] overflow-auto pr-2">
              <p v-for="(text, idx) in infoParagraphs" :key="idx" :class="idx === 0 ? '' : 'mt-2'">
                {{ text }}
              </p>
            </div>
            <template #footer>
              <Button @click="visibleInfo = false">我已阅读</Button>
            </template>
          </Modal>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-semibold mb-3">表单输入</h3>
        <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-gray-700 dark:text-gray-300">在对话框中嵌入表单，用于数据收集和编辑。</p>
            <Button @click="visibleForm = true">编辑资料</Button>
          </div>

          <Modal v-model:open="visibleForm" title="编辑资料" :mask-closable="false">
            <div class="space-y-4">
              <div>
                <div class="text-sm font-medium text-gray-700 mb-1">姓名</div>
                <Input v-model="formName" placeholder="请输入姓名" />
              </div>
              <div>
                <div class="text-sm font-medium text-gray-700 mb-1">邮箱</div>
                <Input v-model="formEmail" placeholder="name@example.com" />
              </div>
              <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
              <p class="text-xs text-gray-500">提示：这里仅做简单校验与异步保存模拟。</p>
            </div>
            <template #footer>
              <Space>
                <Button variant="secondary" :disabled="formLoading" @click="cancelFormEdit">
                  取消
                </Button>
                <Button :disabled="formLoading" @click="handleFormSubmit">
                  {{ formLoading ? '保存中…' : '保存' }}
                </Button>
              </Space>
            </template>
          </Modal>
        </div>
      </div>
    </div>
  </div>
</template>
