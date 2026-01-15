<script setup lang="ts">
import { computed, ref } from 'vue'
import { Modal, Button, Space, Divider, Input } from '@tigercat/vue'

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

const infoParagraphs = computed(() => {
  return Array.from({ length: 14 }).map((_, index) => {
    return `这是一段用于演示滚动内容的示例文本（第 ${index + 1} 段）。当内容较长时，Modal 仍应保持良好的可读性与滚动体验。`
  })
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
  <div class="max-w-5xl mx-auto p-6 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Modal 对话框</h1>
      <p class="text-gray-600">用于显示重要信息或需要用户交互的浮层对话框。</p>
    </div>

    <!-- 基本用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本用法</h2>
      <p class="text-gray-600 mb-6">最简单的用法，点击按钮打开对话框。</p>
      <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Button @click="visible1 = true">打开对话框</Button>
        <Modal v-model:visible="visible1"
               title="基本对话框"
               @ok="handleOk"
               @cancel="handleCancel">
          <p>这是对话框的内容。</p>
          <p class="mt-2">您可以在这里添加任何内容。</p>
          <template #footer>
            <Space>
              <Button variant="secondary"
                      @click="handleCancel">取消</Button>
              <Button @click="handleOk">确定</Button>
            </Space>
          </template>
        </Modal>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同尺寸</h2>
      <p class="text-gray-600 mb-6">Modal 提供了多种尺寸选项：sm、md（默认）、lg、xl、full。</p>
      <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Space>
          <Button @click="visibleSm = true">小尺寸</Button>
          <Button @click="visibleMd = true">中等尺寸</Button>
          <Button @click="visibleLg = true">大尺寸</Button>
          <Button @click="visibleXl = true">超大尺寸</Button>
          <Button @click="visibleFull = true">全屏</Button>
        </Space>

        <Modal v-model:visible="visibleSm"
               title="小尺寸对话框"
               size="sm">
          <p>这是一个小尺寸的对话框。</p>
        </Modal>
        <Modal v-model:visible="visibleMd"
               title="中等尺寸对话框"
               size="md">
          <p>这是一个中等尺寸的对话框（默认）。</p>
        </Modal>
        <Modal v-model:visible="visibleLg"
               title="大尺寸对话框"
               size="lg">
          <p>这是一个大尺寸的对话框，可以容纳更多内容。</p>
        </Modal>
        <Modal v-model:visible="visibleXl"
               title="超大尺寸对话框"
               size="xl">
          <p>这是一个超大尺寸的对话框，适合复杂的内容展示。</p>
        </Modal>
        <Modal v-model:visible="visibleFull"
               title="全屏对话框"
               size="full">
          <p>这是一个全屏对话框，占据整个屏幕宽度。</p>
        </Modal>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 垂直居中 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">垂直居中</h2>
      <p class="text-gray-600 mb-6">设置 centered 属性可以让对话框垂直居中显示。</p>
      <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Button @click="visibleCentered = true">垂直居中对话框</Button>
        <Modal v-model:visible="visibleCentered"
               title="垂直居中对话框"
               centered>
          <p>这个对话框垂直居中显示。</p>
          <p class="mt-2">适合展示重要信息。</p>
        </Modal>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义页脚 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义页脚</h2>
      <p class="text-gray-600 mb-6">使用 footer 插槽可以自定义页脚内容。</p>
      <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Button @click="visibleCustomFooter = true">自定义页脚</Button>
        <Modal v-model:visible="visibleCustomFooter"
               title="自定义页脚对话框">
          <p>这是对话框的内容。</p>
          <template #footer>
            <Space>
              <Button variant="secondary"
                      @click="visibleCustomFooter = false">取消</Button>
              <Button variant="outline"
                      @click="console.log('保存草稿')">保存草稿</Button>
              <Button @click="visibleCustomFooter = false">提交</Button>
            </Space>
          </template>
        </Modal>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 嵌套对话框 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">嵌套对话框</h2>
      <p class="text-gray-600 mb-6">对话框可以嵌套使用，通过 z-index 控制层级。</p>
      <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Button @click="visibleNested = true">打开嵌套对话框</Button>
        <Modal v-model:visible="visibleNested"
               title="第一层对话框">
          <p>这是第一层对话框的内容。</p>
          <Button @click="visibleNested2 = true"
                  class="mt-4">打开第二层对话框</Button>

          <Modal v-model:visible="visibleNested2"
                 title="第二层对话框"
                 :z-index="1100">
            <p>这是第二层嵌套的对话框。</p>
          </Modal>
        </Modal>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用遮罩关闭 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用遮罩关闭</h2>
      <p class="text-gray-600 mb-6">设置 mask-closable 为 false 可以禁止点击遮罩层关闭对话框。</p>
      <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Button @click="visible2 = true">禁用遮罩关闭</Button>
        <Modal v-model:visible="visible2"
               title="禁用遮罩关闭"
               :mask-closable="false">
          <p>点击遮罩层不会关闭此对话框。</p>
          <p class="mt-2">只能通过关闭按钮或页脚按钮关闭。</p>
        </Modal>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 无遮罩 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">无遮罩</h2>
      <p class="text-gray-600 mb-6">设置 mask 为 false 可以不显示遮罩层。</p>
      <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Button @click="visibleNoMask = true">无遮罩对话框</Button>
        <Modal v-model:visible="visibleNoMask"
               title="无遮罩对话框"
               :mask="false">
          <p>这个对话框没有遮罩层。</p>
        </Modal>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 关闭时销毁 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">关闭时销毁</h2>
      <p class="text-gray-600 mb-6">设置 destroy-on-close 可以在关闭对话框时销毁其内容。</p>
      <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Button @click="visibleDestroyOnClose = true">关闭时销毁</Button>
        <Modal v-model:visible="visibleDestroyOnClose"
               title="关闭时销毁"
               destroy-on-close>
          <p>关闭对话框时，此内容将被销毁。</p>
          <p class="mt-2">组件状态：{{ new Date().toLocaleTimeString() }}</p>
        </Modal>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 无关闭按钮 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">无关闭按钮</h2>
      <p class="text-gray-600 mb-6">设置 closable 为 false 可以隐藏关闭按钮。</p>
      <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <Button @click="visible3 = true">无关闭按钮</Button>
        <Modal v-model:visible="visible3"
               title="无关闭按钮"
               :closable="false">
          <p>这个对话框没有关闭按钮。</p>
          <template #footer>
            <Button @click="visible3 = false">确定</Button>
          </template>
        </Modal>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 实际应用场景 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">实际应用场景</h2>
      <p class="text-gray-600 mb-6">用更贴近业务的例子展示交互、滚动与表单。</p>

      <div class="space-y-6">
        <!-- 确认对话框 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">确认对话框</h3>
          <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-gray-700">用于需要用户确认的操作（示例：删除）。</p>
              <Button variant="outline"
                      @click="visibleConfirm = true">删除确认</Button>
            </div>
            <p v-if="confirmResult"
               class="mt-3 text-sm text-green-700">{{ confirmResult }}</p>

            <Modal v-model:visible="visibleConfirm"
                   title="删除确认"
                   :mask-closable="false">
              <p class="text-gray-800">此操作不可撤销，是否继续？</p>
              <p class="mt-2 text-gray-600 text-sm">提示：这里用按钮 loading 模拟异步提交。</p>
              <template #footer>
                <Space>
                  <Button variant="secondary"
                          :disabled="confirmLoading"
                          @click="
                            visibleConfirm = false;
                          confirmResult = '已取消：未执行删除（示例）'
                            ">
                    取消
                  </Button>
                  <Button :disabled="confirmLoading"
                          @click="handleConfirmDelete">
                    {{ confirmLoading ? '删除中…' : '确认删除' }}
                  </Button>
                </Space>
              </template>
            </Modal>
          </div>
        </div>

        <!-- 信息展示 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">信息展示</h3>
          <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-gray-700">用于展示较长内容（用户协议/隐私政策等）。</p>
              <Button @click="visibleInfo = true">查看详情</Button>
            </div>

            <Modal v-model:visible="visibleInfo"
                   title="服务协议（示例）"
                   size="lg">
              <div class="max-h-[50vh] overflow-auto pr-2">
                <p v-for="(text, idx) in infoParagraphs"
                   :key="idx"
                   :class="idx === 0 ? '' : 'mt-2'">
                  {{ text }}
                </p>
              </div>
              <template #footer>
                <Button @click="visibleInfo = false">我已阅读</Button>
              </template>
            </Modal>
          </div>
        </div>

        <!-- 表单输入 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">表单输入</h3>
          <div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-gray-700">在对话框中嵌入表单，用于数据收集和编辑。</p>
              <Button @click="visibleForm = true">编辑资料</Button>
            </div>

            <Modal v-model:visible="visibleForm"
                   title="编辑资料"
                   :mask-closable="false">
              <div class="space-y-4">
                <div>
                  <div class="text-sm font-medium text-gray-700 mb-1">姓名</div>
                  <Input v-model="formName"
                         placeholder="请输入姓名" />
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-700 mb-1">邮箱</div>
                  <Input v-model="formEmail"
                         placeholder="name@example.com" />
                </div>
                <p v-if="formError"
                   class="text-sm text-red-600">{{ formError }}</p>
                <p class="text-xs text-gray-500">提示：这里仅做简单校验与异步保存模拟。</p>
              </div>
              <template #footer>
                <Space>
                  <Button variant="secondary"
                          :disabled="formLoading"
                          @click="
                            visibleForm = false;
                          formError = null
                            ">
                    取消
                  </Button>
                  <Button :disabled="formLoading"
                          @click="handleFormSubmit">
                    {{ formLoading ? '保存中…' : '保存' }}
                  </Button>
                </Space>
              </template>
            </Modal>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
