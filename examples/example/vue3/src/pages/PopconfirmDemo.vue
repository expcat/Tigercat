<script setup lang="ts">
import { ref } from 'vue'
import { Popconfirm, Button, Space, Divider } from '@tigercat/vue'

const visible1 = ref(false)

const handleConfirm = () => {
  console.log('Confirmed!')
}

const handleCancel = () => {
  console.log('Cancelled!')
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Popconfirm 弹出确认</h1>
      <p class="text-gray-600">用于在执行敏感操作时向用户确认。</p>
    </div>

    <!-- 基本用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本用法</h2>
      <p class="text-gray-600 mb-6">最简单的用法，点击按钮打开确认框。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Popconfirm title="确定要删除这条记录吗？" @confirm="handleConfirm" @cancel="handleCancel">
          <Button variant="secondary">删除</Button>
        </Popconfirm>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同位置 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同位置</h2>
      <p class="text-gray-600 mb-6">通过 placement 属性设置弹出位置。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-2 gap-4">
          <Popconfirm title="确定要删除吗？" placement="top">
            <Button>上方</Button>
          </Popconfirm>

          <Popconfirm title="确定要删除吗？" placement="bottom">
            <Button>下方</Button>
          </Popconfirm>

          <Popconfirm title="确定要删除吗？" placement="left">
            <Button>左侧</Button>
          </Popconfirm>

          <Popconfirm title="确定要删除吗？" placement="right">
            <Button>右侧</Button>
          </Popconfirm>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同图标类型 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同图标类型</h2>
      <p class="text-gray-600 mb-6">支持 warning、info、error、success、question 五种图标类型。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Popconfirm title="这是警告信息" icon="warning">
            <Button>警告</Button>
          </Popconfirm>

          <Popconfirm title="这是提示信息" icon="info">
            <Button>信息</Button>
          </Popconfirm>

          <Popconfirm title="这是错误信息" icon="error">
            <Button variant="secondary">错误</Button>
          </Popconfirm>

          <Popconfirm title="操作成功" icon="success">
            <Button>成功</Button>
          </Popconfirm>

          <Popconfirm title="确定继续吗？" icon="question">
            <Button>疑问</Button>
          </Popconfirm>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 自定义按钮文字 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义按钮文字</h2>
      <p class="text-gray-600 mb-6">通过 okText 和 cancelText 属性自定义按钮文字。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Popconfirm
          title="确定要提交这个表单吗？"
          ok-text="提交"
          cancel-text="取消"
          @confirm="() => console.log('Form submitted')">
          <Button>提交表单</Button>
        </Popconfirm>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 危险操作 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">危险操作</h2>
      <p class="text-gray-600 mb-6">通过 okType="danger" 将确认按钮设置为危险样式。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Popconfirm
          title="确定要删除这个用户吗？"
          description="此操作不可撤销，用户的所有数据将被永久删除。"
          icon="error"
          ok-type="danger"
          ok-text="删除"
          @confirm="() => console.log('User deleted')">
          <Button variant="secondary">删除用户</Button>
        </Popconfirm>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 带描述信息 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">带描述信息</h2>
      <p class="text-gray-600 mb-6">通过 description 属性添加详细描述。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Popconfirm
          title="确定要发布这篇文章吗？"
          description="发布后，文章将对所有用户可见。"
          @confirm="() => console.log('Article published')">
          <Button>发布文章</Button>
        </Popconfirm>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 受控模式 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">受控模式</h2>
      <p class="text-gray-600 mb-6">通过 v-model:visible 控制 Popconfirm 的显示状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Popconfirm
            v-model:visible="visible1"
            title="确定要执行此操作吗？"
            @confirm="
              () => {
                handleConfirm()
                visible1 = false
              }
            "
            @cancel="
              () => {
                handleCancel()
                visible1 = false
              }
            ">
            <Button>受控弹窗</Button>
          </Popconfirm>

          <Button @click="visible1 = true"> 外部控制打开 </Button>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 隐藏图标 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">隐藏图标</h2>
      <p class="text-gray-600 mb-6">通过 showIcon 属性控制图标显示。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Popconfirm
          title="确定要继续吗？"
          :show-icon="false"
          @confirm="() => console.log('Confirmed')">
          <Button>无图标</Button>
        </Popconfirm>
      </div>
    </section>
  </div>
</template>
