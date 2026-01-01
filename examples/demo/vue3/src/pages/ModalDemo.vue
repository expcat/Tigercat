<script setup lang="ts">
import { ref } from 'vue'
import { Modal, Button, Space, Divider } from '@tigercat/vue'

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

const handleOk = () => {
  console.log('OK clicked')
  visible1.value = false
}

const handleCancel = () => {
  console.log('Cancel clicked')
  visible1.value = false
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Modal 对话框</h1>
      <p class="text-gray-600">用于显示重要信息或需要用户交互的浮层对话框。</p>
    </div>

    <!-- 基本用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本用法</h2>
      <p class="text-gray-600 mb-6">最简单的用法，点击按钮打开对话框。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Button @click="visible1 = true">打开对话框</Button>
        <Modal
          v-model:visible="visible1"
          title="基本对话框"
          @ok="handleOk"
          @cancel="handleCancel"
        >
          <p>这是对话框的内容。</p>
          <p class="mt-2">您可以在这里添加任何内容。</p>
        </Modal>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同尺寸</h2>
      <p class="text-gray-600 mb-6">Modal 提供了多种尺寸选项：sm、md（默认）、lg、xl、full。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Button @click="visibleSm = true">小尺寸</Button>
          <Button @click="visibleMd = true">中等尺寸</Button>
          <Button @click="visibleLg = true">大尺寸</Button>
          <Button @click="visibleXl = true">超大尺寸</Button>
          <Button @click="visibleFull = true">全屏</Button>
        </Space>
        
        <Modal v-model:visible="visibleSm" title="小尺寸对话框" size="sm">
          <p>这是一个小尺寸的对话框。</p>
        </Modal>
        <Modal v-model:visible="visibleMd" title="中等尺寸对话框" size="md">
          <p>这是一个中等尺寸的对话框（默认）。</p>
        </Modal>
        <Modal v-model:visible="visibleLg" title="大尺寸对话框" size="lg">
          <p>这是一个大尺寸的对话框，可以容纳更多内容。</p>
        </Modal>
        <Modal v-model:visible="visibleXl" title="超大尺寸对话框" size="xl">
          <p>这是一个超大尺寸的对话框，适合复杂的内容展示。</p>
        </Modal>
        <Modal v-model:visible="visibleFull" title="全屏对话框" size="full">
          <p>这是一个全屏对话框，占据整个屏幕宽度。</p>
        </Modal>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 垂直居中 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">垂直居中</h2>
      <p class="text-gray-600 mb-6">设置 centered 属性可以让对话框垂直居中显示。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Button @click="visibleCentered = true">垂直居中对话框</Button>
        <Modal
          v-model:visible="visibleCentered"
          title="垂直居中对话框"
          centered
        >
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
      <div class="p-6 bg-gray-50 rounded-lg">
        <Button @click="visibleCustomFooter = true">自定义页脚</Button>
        <Modal
          v-model:visible="visibleCustomFooter"
          title="自定义页脚对话框"
        >
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
      <Divider class="my-6" />
    </section>

    <!-- 嵌套对话框 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">嵌套对话框</h2>
      <p class="text-gray-600 mb-6">对话框可以嵌套使用，通过 z-index 控制层级。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Button @click="visibleNested = true">打开嵌套对话框</Button>
        <Modal
          v-model:visible="visibleNested"
          title="第一层对话框"
        >
          <p>这是第一层对话框的内容。</p>
          <Button @click="visibleNested2 = true" class="mt-4">打开第二层对话框</Button>
          
          <Modal
            v-model:visible="visibleNested2"
            title="第二层对话框"
            :z-index="1100"
          >
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
      <div class="p-6 bg-gray-50 rounded-lg">
        <Button @click="visible2 = true">禁用遮罩关闭</Button>
        <Modal
          v-model:visible="visible2"
          title="禁用遮罩关闭"
          :mask-closable="false"
        >
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
      <div class="p-6 bg-gray-50 rounded-lg">
        <Button @click="visibleNoMask = true">无遮罩对话框</Button>
        <Modal
          v-model:visible="visibleNoMask"
          title="无遮罩对话框"
          :mask="false"
        >
          <p>这个对话框没有遮罩层。</p>
        </Modal>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 关闭时销毁 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">关闭时销毁</h2>
      <p class="text-gray-600 mb-6">设置 destroy-on-close 可以在关闭对话框时销毁其内容。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Button @click="visibleDestroyOnClose = true">关闭时销毁</Button>
        <Modal
          v-model:visible="visibleDestroyOnClose"
          title="关闭时销毁"
          destroy-on-close
        >
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
      <div class="p-6 bg-gray-50 rounded-lg">
        <Button @click="visible3 = true">无关闭按钮</Button>
        <Modal
          v-model:visible="visible3"
          title="无关闭按钮"
          :closable="false"
        >
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
      <p class="text-gray-600 mb-6">模拟真实的使用场景。</p>
      
      <div class="space-y-6">
        <!-- 确认对话框 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">确认对话框</h3>
          <div class="p-6 bg-gray-50 rounded-lg">
            <Button variant="outline" @click="() => { const v = ref(true); return v }">删除确认</Button>
          </div>
        </div>

        <!-- 信息展示 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">信息展示</h3>
          <div class="p-6 bg-gray-50 rounded-lg">
            <p>对话框可以用于展示详细信息、用户协议、隐私政策等。</p>
          </div>
        </div>

        <!-- 表单输入 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">表单输入</h3>
          <div class="p-6 bg-gray-50 rounded-lg">
            <p>在对话框中嵌入表单，用于数据收集和编辑。</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
