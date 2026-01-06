<script setup lang="ts">
import { ref } from 'vue'
import { Alert, Divider } from '@tigercat/vue'

const showAlert1 = ref(true)
const showAlert2 = ref(true)
const showAlert3 = ref(true)
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Alert 警告提示</h1>
      <p class="text-gray-600">用于页面中展示重要的提示信息，支持成功、警告、失败、信息等多种状态。</p>
    </div>

    <!-- 基本用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本用法</h2>
      <p class="text-gray-600 mb-6">最简单的用法，适用于简短的警告提示。</p>
      <div class="p-6 bg-gray-50 rounded-lg space-y-4">
        <Alert title="这是一条提示信息" />
        <Alert type="success" title="这是一条成功提示" />
        <Alert type="warning" title="这是一条警告提示" />
        <Alert type="error" title="这是一条错误提示" />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 提示类型 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">提示类型</h2>
      <p class="text-gray-600 mb-6">Alert 组件支持 4 种不同的类型：info（信息）、success（成功）、warning（警告）、error（错误）。</p>
      <div class="p-6 bg-gray-50 rounded-lg space-y-4">
        <Alert type="info" title="信息提示" description="这是一条信息提示的详细内容" />
        <Alert type="success" title="成功提示" description="操作成功完成" />
        <Alert type="warning" title="警告提示" description="请注意相关事项" />
        <Alert type="error" title="错误提示" description="操作失败，请重试" />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 尺寸大小 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">尺寸大小</h2>
      <p class="text-gray-600 mb-6">Alert 组件支持 3 种不同的尺寸：小、中、大。</p>
      <div class="p-6 bg-gray-50 rounded-lg space-y-4">
        <Alert size="sm" type="info" title="小尺寸提示" description="这是小尺寸的提示内容" />
        <Alert size="md" type="success" title="中等尺寸提示" description="这是中等尺寸的提示内容" />
        <Alert size="lg" type="warning" title="大尺寸提示" description="这是大尺寸的提示内容" />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 带图标 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">带图标</h2>
      <p class="text-gray-600 mb-6">默认情况下会显示图标，可以通过 showIcon 属性控制。</p>
      <div class="p-6 bg-gray-50 rounded-lg space-y-4">
        <Alert type="success" title="带图标的成功提示" :show-icon="true" />
        <Alert type="warning" title="不带图标的警告提示" :show-icon="false" />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 可关闭 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">可关闭</h2>
      <p class="text-gray-600 mb-6">通过设置 closable 属性可以让 Alert 显示关闭按钮。</p>
      <div class="p-6 bg-gray-50 rounded-lg space-y-4">
        <Alert 
          v-if="showAlert1"
          type="info" 
          title="可关闭的提示" 
          description="点击右侧关闭按钮可以关闭此提示"
          closable
          @close="showAlert1 = false"
        />
        <Alert 
          v-if="showAlert2"
          type="success" 
          title="操作成功" 
          description="您的操作已成功完成"
          closable
          @close="showAlert2 = false"
        />
        <div v-if="!showAlert1 || !showAlert2" class="text-gray-500 text-center py-4">
          提示已关闭
          <button 
            class="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            @click="showAlert1 = true; showAlert2 = true"
          >
            重置
          </button>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 带描述信息 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">带描述信息</h2>
      <p class="text-gray-600 mb-6">使用 description 属性可以添加详细的描述内容。</p>
      <div class="p-6 bg-gray-50 rounded-lg space-y-4">
        <Alert
          type="success"
          title="操作成功"
          description="您的订单已成功提交，我们将尽快为您处理。订单号：202312310001"
        />
        <Alert
          type="warning"
          title="注意事项"
          description="请确保填写的信息准确无误，操作过程中请勿关闭页面。"
        />
        <Alert
          type="error"
          title="操作失败"
          description="网络连接失败，请检查您的网络设置后重试。错误代码：E001"
        />
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义内容 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义内容</h2>
      <p class="text-gray-600 mb-6">可以使用插槽自定义标题和描述内容。</p>
      <div class="p-6 bg-gray-50 rounded-lg space-y-4">
        <Alert type="info">
          <template #title>
            <strong>自定义标题内容</strong>
          </template>
          <template #description>
            <div>
              <p>这是自定义的描述内容，支持复杂的 HTML 结构：</p>
              <ul class="list-disc list-inside mt-2">
                <li>支持列表项</li>
                <li>支持多种格式</li>
                <li>支持任意 Vue 组件</li>
              </ul>
            </div>
          </template>
        </Alert>

        <Alert type="warning">
          这是通过默认插槽传入的内容
        </Alert>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 完整功能示例 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">完整功能示例</h2>
      <p class="text-gray-600 mb-6">综合展示所有功能。</p>
      <div class="p-6 bg-gray-50 rounded-lg space-y-4">
        <Alert
          v-if="showAlert3"
          type="warning"
          size="lg"
          title="重要提示"
          description="这是一条重要的警告信息，请仔细阅读。此提示包含了图标、标题、描述和关闭按钮等所有功能。"
          show-icon
          closable
          @close="showAlert3 = false"
        />
        <div v-if="!showAlert3" class="text-gray-500 text-center py-4">
          提示已关闭
          <button 
            class="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            @click="showAlert3 = true"
          >
            重置
          </button>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 实际应用场景 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">实际应用场景</h2>
      <p class="text-gray-600 mb-6">模拟真实的使用场景。</p>
      
      <div class="space-y-6">
        <!-- 表单提交成功 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">表单提交成功</h3>
          <div class="p-6 bg-gray-50 rounded-lg">
            <Alert
              type="success"
              title="提交成功"
              description="您的申请已成功提交，我们会在 3 个工作日内进行审核。"
              closable
            />
          </div>
        </div>

        <!-- 系统维护通知 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">系统维护通知</h3>
          <div class="p-6 bg-gray-50 rounded-lg">
            <Alert
              type="warning"
              title="系统维护通知"
              description="系统将于今晚 23:00 - 次日 01:00 进行维护升级，期间部分功能可能无法使用，请提前做好相关准备。"
              show-icon
            />
          </div>
        </div>

        <!-- 错误提示 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">错误提示</h3>
          <div class="p-6 bg-gray-50 rounded-lg">
            <Alert
              type="error"
              title="操作失败"
              description="文件上传失败，文件大小超过限制（最大 10MB）。请重新选择文件后再试。"
              closable
            />
          </div>
        </div>

        <!-- 信息提示 -->
        <div>
          <h3 class="text-lg font-semibold mb-3">信息提示</h3>
          <div class="p-6 bg-gray-50 rounded-lg">
            <Alert
              type="info"
              title="温馨提示"
              description="为了保护您的账号安全，建议您定期修改密码，并开启双因素认证。"
              show-icon
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
