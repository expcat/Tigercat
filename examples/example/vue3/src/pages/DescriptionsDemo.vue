<script setup lang="ts">
import { Button, Descriptions } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicSnippet = `<Descriptions title="用户信息" :items="userInfo" />`

const borderedSnippet = `<Descriptions title="用户信息" bordered :items="userInfo" />`

const sizeSnippet = `<Descriptions size="sm" bordered :items="userInfo" :column="2" />
<Descriptions size="md" bordered :items="userInfo" :column="2" />
<Descriptions size="lg" bordered :items="userInfo" :column="2" />`

const verticalSnippet = `<Descriptions layout="vertical" :items="serverConfig" :column="2" />`

const columnSnippet = `<Descriptions bordered :column="2" :items="userInfo" />
<Descriptions bordered :column="4" :items="userInfo" />`

const spanSnippet = `<Descriptions title="产品详情" bordered :column="3" :items="productDetails" />`

const extraSnippet = `<Descriptions title="订单详情" bordered :column="3" :items="orderInfo">
  <template #extra><Button size="sm">编辑</Button></template>
</Descriptions>`

const styleSnippet = `<Descriptions bordered :column="2" :items="userInfo" :labelStyle="{ fontWeight: '600' }" />`

const colonSnippet = `<Descriptions title="服务器配置" :colon="false" bordered :items="serverConfig" />`

const itemClassSnippet = `<Descriptions bordered :column="2" :items="highlightItems" />`

// Basic user information
const userInfo = [
  { label: '姓名', content: '张三' },
  { label: '电话', content: '1234567890' },
  { label: '邮箱', content: 'zhangsan@example.com' },
  { label: '地址', content: '北京市朝阳区某街道' },
  { label: '公司', content: '某科技有限公司' },
  { label: '职位', content: '高级前端工程师' }
]

// Product details with spanning
const productDetails = [
  { label: '产品名称', content: '云数据库' },
  { label: '计费方式', content: '包年包月' },
  { label: '创建时间', content: '2024-01-01 10:00:00' },
  { label: '到期时间', content: '2025-01-01 10:00:00' },
  {
    label: '描述',
    content: '这是一个高性能的云数据库服务，支持多种数据库引擎，提供自动备份、监控和扩展功能。',
    span: 2
  }
]

// Order information
const orderInfo = [
  { label: '订单编号', content: 'ORDER-2024-001' },
  { label: '订单状态', content: '已完成' },
  { label: '下单时间', content: '2024-01-15 14:30:00' },
  { label: '支付时间', content: '2024-01-15 14:35:00' },
  { label: '收货地址', content: '上海市浦东新区张江高科技园区', span: 2 },
  { label: '订单总额', content: '¥1,299.00' },
  { label: '优惠金额', content: '¥100.00' },
  { label: '实付金额', content: '¥1,199.00' }
]

// Server configuration
const serverConfig = [
  { label: 'CPU', content: '8 核' },
  { label: '内存', content: '16 GB' },
  { label: '磁盘', content: '500 GB SSD' },
  { label: '带宽', content: '10 Mbps' },
  { label: '操作系统', content: 'Ubuntu 20.04 LTS' },
  { label: 'IP 地址', content: '192.168.1.100' }
]

// Items with per-item custom classes
const highlightItems = [
  { label: '状态', content: '运行中', labelClassName: 'text-blue-600', contentClassName: 'text-green-600 font-semibold' },
  { label: '告警', content: '2 条未处理', contentClassName: 'text-amber-600' },
  { label: '错误', content: '无', contentClassName: 'text-gray-400' },
  { label: 'CPU 使用率', content: '68%' }
]
</script>

<template>
  <div class="max-w-6xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Descriptions 描述列表</h1>
      <p class="text-gray-600">用于展示结构化数据、详情信息的描述列表组件。</p>
    </div>

    <DemoBlock title="基本用法"
               description="最简单的描述列表展示。"
               :code="basicSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Descriptions title="用户信息"
                      :items="userInfo" />
      </div>
    </DemoBlock>

    <DemoBlock title="带边框"
               description="使用 bordered 属性添加边框。"
               :code="borderedSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Descriptions title="用户信息"
                      bordered
                      :items="userInfo" />
      </div>
    </DemoBlock>

    <DemoBlock title="不同尺寸"
               description="支持三种尺寸：small、medium、large。"
               :code="sizeSnippet">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-4">小尺寸</h3>
          <Descriptions size="sm"
                        bordered
                        :items="userInfo"
                        :column="2" />
        </div>
        <div class="p-6 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-4">中等尺寸（默认）</h3>
          <Descriptions size="md"
                        bordered
                        :items="userInfo"
                        :column="2" />
        </div>
        <div class="p-6 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-4">大尺寸</h3>
          <Descriptions size="lg"
                        bordered
                        :items="userInfo"
                        :column="2" />
        </div>
      </div>
    </DemoBlock>

    <DemoBlock title="垂直布局"
               description='使用 layout="vertical" 设置垂直布局。'
               :code="verticalSnippet">
      <div class="space-y-6">
        <div class="p-6 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-4">垂直布局（无边框）</h3>
          <Descriptions layout="vertical"
                        :items="serverConfig"
                        :column="2" />
        </div>
        <div class="p-6 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-4">垂直布局（带边框）</h3>
          <Descriptions layout="vertical"
                        bordered
                        :items="serverConfig"
                        :column="2" />
        </div>
      </div>
    </DemoBlock>

    <DemoBlock title="自定义列数"
               description="通过 column 属性设置每行显示的列数。"
               :code="columnSnippet">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-6 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-4">2 列布局</h3>
          <Descriptions bordered
                        :column="2"
                        :items="userInfo" />
        </div>
        <div class="p-6 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-4">4 列布局</h3>
          <Descriptions bordered
                        :column="4"
                        :items="userInfo" />
        </div>
      </div>
    </DemoBlock>

    <DemoBlock title="跨列显示"
               description="描述项可以通过 span 属性实现跨列显示。"
               :code="spanSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Descriptions title="产品详情"
                      bordered
                      :column="3"
                      :items="productDetails" />
      </div>
    </DemoBlock>

    <DemoBlock title="带操作区域"
               description="可以通过 extra 插槽添加操作按钮。"
               :code="extraSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Descriptions title="订单详情"
                      bordered
                      :column="3"
                      :items="orderInfo">
          <template #extra>
            <Button size="sm">编辑</Button>
          </template>
        </Descriptions>
      </div>
    </DemoBlock>

    <DemoBlock title="自定义样式"
               description="通过 labelStyle 和 contentStyle 自定义标签/内容样式。"
               :code="styleSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Descriptions title="用户信息（自定义样式）"
                      bordered
                      :column="2"
                      :items="userInfo"
                      :labelStyle="{ fontWeight: '600', color: '#1f2937' }"
                      :contentStyle="{ color: '#6b7280' }" />
      </div>
    </DemoBlock>

    <DemoBlock title="无冒号"
               description="通过设置 colon 为 false 隐藏标签后的冒号。"
               :code="colonSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Descriptions title="服务器配置"
                      :colon="false"
                      bordered
                      :items="serverConfig" />
      </div>
    </DemoBlock>

    <DemoBlock title="Item 级自定义 class"
               description="通过 labelClassName / contentClassName 为单个描述项设置独立样式。"
               :code="itemClassSnippet">
      <div class="p-6 bg-gray-50 rounded-lg">
        <Descriptions bordered :column="2" :items="highlightItems" />
      </div>
    </DemoBlock>
  </div>
</template>
