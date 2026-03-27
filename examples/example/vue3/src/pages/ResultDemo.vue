<script setup lang="ts">
import { Result, Button, Space } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const statusSnippet = `<Space direction="vertical" :size="24" class="w-full">
  <Result status="success" title="操作成功" sub-title="订单已提交，预计2小时内送达" />
  <Result status="error" title="提交失败" sub-title="请检查网络连接后重试" />
  <Result status="warning" title="警告提示" sub-title="当前操作存在风险" />
  <Result status="info" title="提示信息" sub-title="这是一条普通信息提示" />
</Space>`

const httpSnippet = `<Space direction="vertical" :size="24" class="w-full">
  <Result status="403" title="403" sub-title="抱歉，您没有权限访问此页面" />
  <Result status="404" title="404" sub-title="抱歉，您访问的页面不存在" />
  <Result status="500" title="500" sub-title="服务器出错了，请稍后重试" />
</Space>`

const customSnippet = `<Result status="success" title="购买成功">
  <template #extra>
    <Space>
      <Button variant="primary">返回首页</Button>
      <Button variant="secondary">查看订单</Button>
    </Space>
  </template>
</Result>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">Result 结果页</h1>
    <p class="text-gray-500 mb-8">用于反馈操作结果，包括成功、失败、警告和 HTTP 状态码。</p>

    <DemoBlock title="状态类型" description="success / error / warning / info 四种基础状态" :code="statusSnippet">
      <Space direction="vertical" :size="24" class="w-full">
        <div class="border rounded-lg p-6"><Result status="success" title="操作成功" sub-title="订单已提交，预计2小时内送达" /></div>
        <div class="border rounded-lg p-6"><Result status="error" title="提交失败" sub-title="请检查网络连接后重试" /></div>
        <div class="border rounded-lg p-6"><Result status="warning" title="警告提示" sub-title="当前操作存在风险" /></div>
        <div class="border rounded-lg p-6"><Result status="info" title="提示信息" sub-title="这是一条普通信息提示" /></div>
      </Space>
    </DemoBlock>

    <DemoBlock title="HTTP 状态码" description="403 / 404 / 500 页面" :code="httpSnippet">
      <Space direction="vertical" :size="24" class="w-full">
        <div class="border rounded-lg p-6"><Result status="403" title="403" sub-title="抱歉，您没有权限访问此页面" /></div>
        <div class="border rounded-lg p-6"><Result status="404" title="404" sub-title="抱歉，您访问的页面不存在" /></div>
        <div class="border rounded-lg p-6"><Result status="500" title="500" sub-title="服务器出错了，请稍后重试" /></div>
      </Space>
    </DemoBlock>

    <DemoBlock title="自定义操作按钮" description="通过 extra 插槽添加操作按钮" :code="customSnippet">
      <div class="border rounded-lg p-6">
        <Result status="success" title="购买成功">
          <template #extra>
            <Space>
              <Button variant="primary">返回首页</Button>
              <Button variant="secondary">查看订单</Button>
            </Space>
          </template>
        </Result>
      </div>
    </DemoBlock>
  </div>
</template>
