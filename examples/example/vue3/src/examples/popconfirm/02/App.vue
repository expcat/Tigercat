<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue/Button'
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Popconfirm } from '@expcat/tigercat-vue/Popconfirm'

const visible1 = ref(false)
const lastAction = ref('尚未确认或取消操作')

const handleConfirm = () => {
  lastAction.value = '已确认删除记录'
}

const handleCancel = () => {
  lastAction.value = '已取消操作'
}
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">不同位置</h3>
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
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">不同图标类型</h3>
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
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义按钮文字</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Popconfirm
            title="确定要提交这个表单吗？"
            ok-text="提交"
            cancel-text="取消"
            @confirm="lastAction = '表单已提交'">
            <Button>提交表单</Button>
          </Popconfirm>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">危险操作</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Popconfirm
            title="确定要删除这个用户吗？"
            description="此操作不可撤销，用户的所有数据将被永久删除。"
            icon="error"
            ok-type="danger"
            ok-text="删除"
            @confirm="lastAction = '用户已删除'">
            <Button variant="secondary">删除用户</Button>
          </Popconfirm>
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">带描述信息</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Popconfirm
            title="确定要发布这篇文章吗？"
            description="发布后，文章将对所有用户可见。"
            @confirm="lastAction = '文章已发布'">
            <Button>发布文章</Button>
          </Popconfirm>
        </div>
      </div>
    </div>
  </div>
</template>
