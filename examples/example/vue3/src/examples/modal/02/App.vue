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
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">不同尺寸</h3>
        <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Space>
            <Button @click="visibleSm = true">小尺寸</Button>
            <Button @click="visibleMd = true">中等尺寸</Button>
            <Button @click="visibleLg = true">大尺寸</Button>
            <Button @click="visibleXl = true">超大尺寸</Button>
            <Button @click="visibleFull = true">全屏</Button>
          </Space>

          <Modal v-model:open="visibleSm" title="小尺寸对话框" size="sm">
            <p>这是一个小尺寸的对话框。</p>
          </Modal>
          <Modal v-model:open="visibleMd" title="中等尺寸对话框" size="md">
            <p>这是一个中等尺寸的对话框（默认）。</p>
          </Modal>
          <Modal v-model:open="visibleLg" title="大尺寸对话框" size="lg">
            <p>这是一个大尺寸的对话框，可以容纳更多内容。</p>
          </Modal>
          <Modal v-model:open="visibleXl" title="超大尺寸对话框" size="xl">
            <p>这是一个超大尺寸的对话框，适合复杂的内容展示。</p>
          </Modal>
          <Modal v-model:open="visibleFull" title="全屏对话框" size="full">
            <p>这是一个全屏对话框，占据整个屏幕宽度。</p>
          </Modal>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">居中显示</h3>
        <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button @click="visibleCentered = true">打开居中对话框</Button>
          <Modal v-model:open="visibleCentered" title="居中对话框" centered>
            <p>这是一个垂直居中显示的对话框。</p>
            <p>默认情况下，Modal 会显示在距离顶部 10% 的位置。</p>
          </Modal>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义页脚</h3>
        <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button @click="visibleCustomFooter = true">自定义页脚对话框</Button>
          <Modal v-model:open="visibleCustomFooter" title="自定义页脚对话框">
            <p>这是对话框的内容。</p>
            <template #footer>
              <Space>
                <Button variant="secondary" @click="visibleCustomFooter = false">取消</Button>
                <Button variant="outline" @click="console.log('保存草稿')">保存草稿</Button>
                <Button @click="visibleCustomFooter = false">提交</Button>
              </Space>
            </template>
          </Modal>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">默认页脚</h3>
        <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button @click="visibleDefaultFooter = true">默认页脚对话框</Button>
          <Modal
            v-model:open="visibleDefaultFooter"
            title="默认页脚对话框"
            show-default-footer
            @ok="
              () => {
                console.log('OK clicked')
              }
            "
            @cancel="
              () => {
                console.log('Cancel clicked')
              }
            ">
            <p>这个对话框使用内置的默认页脚按钮。</p>
          </Modal>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义文案 (labels)</h3>
        <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <Button @click="visibleLabels = true">自定义文案对话框</Button>
          <Modal
            v-model:open="visibleLabels"
            title="自定义文案"
            show-default-footer
            :labels="{ okText: '提交', cancelText: '关闭', closeAriaLabel: '关闭对话框' }">
            <p>页脚按钮与右上角关闭按钮的文案均由 labels 提供。</p>
          </Modal>
        </div>
      </div>
    </div>
  </div>
</template>
