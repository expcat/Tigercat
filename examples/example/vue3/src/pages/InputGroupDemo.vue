<script setup lang="ts">
import { InputGroup, Input, Select, Button } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicSnippet = `<InputGroup>
  <Input placeholder="搜索内容" style="flex: 1" />
  <Button variant="primary">搜索</Button>
</InputGroup>`

const addonSnippet = `<InputGroup>
  <Select :options="[{ label: 'http://', value: 'http' }, { label: 'https://', value: 'https' }]" model-value="https" style="width: 120px" />
  <Input placeholder="请输入域名" style="flex: 1" />
  <Select :options="[{ label: '.com', value: 'com' }, { label: '.cn', value: 'cn' }]" model-value="com" style="width: 80px" />
</InputGroup>`

const sizeSnippet = `<Space direction="vertical" :size="12" class="w-full">
  <InputGroup size="sm">
    <Input placeholder="小尺寸" style="flex: 1" />
    <Button variant="primary">确定</Button>
  </InputGroup>
  <InputGroup size="md">
    <Input placeholder="中尺寸" style="flex: 1" />
    <Button variant="primary">确定</Button>
  </InputGroup>
  <InputGroup size="lg">
    <Input placeholder="大尺寸" style="flex: 1" />
    <Button variant="primary">确定</Button>
  </InputGroup>
</Space>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">InputGroup 输入框组</h1>
    <p class="text-gray-500 mb-8">将多个输入元素组合在一起，支持前后缀和紧凑模式。</p>

    <DemoBlock title="基本用法" description="输入框 + 按钮组合" :code="basicSnippet">
      <InputGroup>
        <Input placeholder="搜索内容" style="flex: 1" />
        <Button variant="primary">搜索</Button>
      </InputGroup>
    </DemoBlock>

    <DemoBlock title="混合组件" description="Select + Input + Select 组合" :code="addonSnippet">
      <InputGroup>
        <Select :options="[{ label: 'http://', value: 'http' }, { label: 'https://', value: 'https' }]" model-value="https" style="width: 120px" />
        <Input placeholder="请输入域名" style="flex: 1" />
        <Select :options="[{ label: '.com', value: 'com' }, { label: '.cn', value: 'cn' }]" model-value="com" style="width: 80px" />
      </InputGroup>
    </DemoBlock>

    <DemoBlock title="尺寸" description="sm / md / lg 三种尺寸" :code="sizeSnippet">
      <div class="space-y-3">
        <InputGroup size="sm">
          <Input placeholder="小尺寸" style="flex: 1" />
          <Button variant="primary">确定</Button>
        </InputGroup>
        <InputGroup size="md">
          <Input placeholder="中尺寸" style="flex: 1" />
          <Button variant="primary">确定</Button>
        </InputGroup>
        <InputGroup size="lg">
          <Input placeholder="大尺寸" style="flex: 1" />
          <Button variant="primary">确定</Button>
        </InputGroup>
      </div>
    </DemoBlock>
  </div>
</template>
