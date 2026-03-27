<script setup lang="ts">
import { Empty, Button, Space } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const presetSnippet = `<Space direction="vertical" :size="24" class="w-full">
  <Empty />
  <Empty preset="no-data" description="暂无数据" />
  <Empty preset="no-results" description="未找到匹配结果" />
  <Empty preset="error" description="加载出错了" />
</Space>`

const customSnippet = `<Empty description="这里什么都没有">
  <template #extra>
    <Button variant="primary">立即创建</Button>
  </template>
</Empty>

<Empty :show-image="false" description="无图片模式，仅显示文字描述" />`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">Empty 空状态</h1>
    <p class="text-gray-500 mb-8">空状态时的占位提示，支持多种预设样式。</p>

    <DemoBlock title="预设样式" description="通过 preset 切换不同空状态场景" :code="presetSnippet">
      <Space direction="vertical" :size="24" class="w-full">
        <div class="border rounded-lg p-6">
          <Empty />
        </div>
        <div class="border rounded-lg p-6">
          <Empty preset="no-data" description="暂无数据" />
        </div>
        <div class="border rounded-lg p-6">
          <Empty preset="no-results" description="未找到匹配结果" />
        </div>
        <div class="border rounded-lg p-6">
          <Empty preset="error" description="加载出错了" />
        </div>
      </Space>
    </DemoBlock>

    <DemoBlock title="自定义内容" description="自定义描述文字和操作按钮" :code="customSnippet">
      <Space direction="vertical" :size="24" class="w-full">
        <div class="border rounded-lg p-6">
          <Empty description="这里什么都没有">
            <template #extra>
              <Button variant="primary">立即创建</Button>
            </template>
          </Empty>
        </div>
        <div class="border rounded-lg p-6">
          <Empty :show-image="false" description="无图片模式，仅显示文字描述" />
        </div>
      </Space>
    </DemoBlock>
  </div>
</template>
