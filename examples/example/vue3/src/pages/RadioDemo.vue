<script setup lang="ts">
import { ref } from 'vue'
import { Radio, RadioGroup, Space } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicValue = ref<string | number>('male')
const agreed = ref(false)
const uncontrolledValue = ref<string | number>('male')
const disabledValue = ref<string | number>('medium')
const groupDisabledValue = ref<string | number>('a')

const sizeSmValue = ref<string | number>('a')
const sizeMdValue = ref<string | number>('a')
const sizeLgValue = ref<string | number>('a')

const numericValue = ref<string | number>(1)
const customValue = ref<string | number>('a')

const handleUncontrolledChange = (value: string | number) => {
  uncontrolledValue.value = value
}

const basicSnippet = `<Space direction="vertical">
  <RadioGroup v-model:value="basicValue" class="flex flex-wrap items-center gap-4">
    <Radio value="male">男</Radio>
    <Radio value="female">女</Radio>
    <Radio value="other">其他</Radio>
  </RadioGroup>
  <p class="text-sm text-gray-600">当前选中：{{ String(basicValue) }}</p>
</Space>`

const standaloneSnippet = `<Space direction="vertical">
  <Radio value="agree" v-model:checked="agreed">同意用户协议</Radio>
  <Radio value="standalone" :default-checked="true">默认选中的独立选项</Radio>
</Space>`

const uncontrolledSnippet = `<Space direction="vertical">
  <RadioGroup default-value="male" class="flex flex-wrap items-center gap-4" @change="handleUncontrolledChange">
    <Radio value="male">男</Radio>
    <Radio value="female">女</Radio>
    <Radio value="other">其他</Radio>
  </RadioGroup>
  <p class="text-sm text-gray-600">最近一次变更：{{ String(uncontrolledValue) }}</p>
</Space>`

const disabledSnippet = `<Space direction="vertical">
  <div>
    <div class="text-sm text-gray-700 mb-2">部分禁用</div>
    <RadioGroup v-model:value="disabledValue" class="flex flex-wrap items-center gap-4">
      <Radio value="small">小</Radio>
      <Radio value="medium">中</Radio>
      <Radio value="large" disabled>大（禁用）</Radio>
    </RadioGroup>
  </div>
  <div>
    <div class="text-sm text-gray-700 mb-2">整组禁用</div>
    <RadioGroup v-model:value="groupDisabledValue" disabled class="flex flex-wrap items-center gap-4">
      <Radio value="a">选项 A</Radio>
      <Radio value="b">选项 B</Radio>
      <Radio value="c">选项 C</Radio>
    </RadioGroup>
  </div>
</Space>`

const sizeSnippet = `<Space direction="vertical">
  <div>
    <div class="text-sm text-gray-700 mb-2">小号（sm）</div>
    <RadioGroup v-model:value="sizeSmValue" size="sm" class="flex flex-wrap items-center gap-4">
      <Radio value="a">选项 A</Radio>
      <Radio value="b">选项 B</Radio>
      <Radio value="c">选项 C</Radio>
    </RadioGroup>
  </div>
  <div>
    <div class="text-sm text-gray-700 mb-2">默认（md）</div>
    <RadioGroup v-model:value="sizeMdValue" size="md" class="flex flex-wrap items-center gap-4">
      <Radio value="a">选项 A</Radio>
      <Radio value="b">选项 B</Radio>
      <Radio value="c">选项 C</Radio>
    </RadioGroup>
  </div>
  <div>
    <div class="text-sm text-gray-700 mb-2">大号（lg）</div>
    <RadioGroup v-model:value="sizeLgValue" size="lg" class="flex flex-wrap items-center gap-4">
      <Radio value="a">选项 A</Radio>
      <Radio value="b">选项 B</Radio>
      <Radio value="c">选项 C</Radio>
    </RadioGroup>
  </div>
</Space>`

const numericSnippet = `<Space direction="vertical">
  <RadioGroup v-model:value="numericValue" class="flex flex-wrap items-center gap-4">
    <Radio :value="1">选项 1</Radio>
    <Radio :value="2">选项 2</Radio>
    <Radio :value="3">选项 3</Radio>
  </RadioGroup>
  <p class="text-sm text-gray-600">当前值：{{ String(numericValue) }}（类型：{{ typeof numericValue }}）</p>
</Space>`

const customSnippet = `<RadioGroup v-model:value="customValue"
            class="flex flex-wrap items-center gap-6"
            name="custom-radio">
  <Radio value="a" class-name="bg-blue-50 px-3 py-1 rounded">选项 A</Radio>
  <Radio value="b" class-name="bg-green-50 px-3 py-1 rounded">选项 B</Radio>
</RadioGroup>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Radio 单选框</h1>
      <p class="text-gray-600">在一组备选项中进行单选。</p>
    </div>

    <!-- 基础用法 -->
    <DemoBlock title="基础用法" description="单选框组合使用时，需要通过 RadioGroup 组件进行包裹。" :code="basicSnippet">
      <Space direction="vertical">
        <RadioGroup v-model:value="basicValue" class="flex flex-wrap items-center gap-4">
          <Radio value="male">男</Radio>
          <Radio value="female">女</Radio>
          <Radio value="other">其他</Radio>
        </RadioGroup>
        <p class="text-sm text-gray-600">当前选中：{{ String(basicValue) }}</p>
      </Space>
    </DemoBlock>

    <!-- 单独使用 -->
    <DemoBlock title="单独使用" description="Radio 可以脱离 RadioGroup 单独使用，支持 v-model:checked 和 defaultChecked。"
      :code="standaloneSnippet">
      <Space direction="vertical">
        <Radio value="agree" v-model:checked="agreed">同意用户协议</Radio>
        <Radio value="standalone" :default-checked="true">默认选中的独立选项</Radio>
      </Space>
    </DemoBlock>

    <!-- 非受控 -->
    <DemoBlock title="非受控" description="不使用 v-model，通过 defaultValue 初始化，并监听 change。" :code="uncontrolledSnippet">
      <Space direction="vertical">
        <RadioGroup default-value="male" class="flex flex-wrap items-center gap-4" @change="handleUncontrolledChange">
          <Radio value="male">男</Radio>
          <Radio value="female">女</Radio>
          <Radio value="other">其他</Radio>
        </RadioGroup>
        <p class="text-sm text-gray-600">最近一次变更：{{ String(uncontrolledValue) }}</p>
      </Space>
    </DemoBlock>

    <!-- 禁用状态 -->
    <DemoBlock title="禁用状态" description="单选框不可用的状态。" :code="disabledSnippet">
      <Space direction="vertical">
        <div>
          <div class="text-sm text-gray-700 mb-2">部分禁用</div>
          <RadioGroup v-model:value="disabledValue" class="flex flex-wrap items-center gap-4">
            <Radio value="small">小</Radio>
            <Radio value="medium">中</Radio>
            <Radio value="large" disabled>大（禁用）</Radio>
          </RadioGroup>
        </div>

        <div>
          <div class="text-sm text-gray-700 mb-2">整组禁用</div>
          <RadioGroup v-model:value="groupDisabledValue" disabled class="flex flex-wrap items-center gap-4">
            <Radio value="a">选项 A</Radio>
            <Radio value="b">选项 B</Radio>
            <Radio value="c">选项 C</Radio>
          </RadioGroup>
        </div>
      </Space>
    </DemoBlock>

    <!-- 尺寸 -->
    <DemoBlock title="尺寸" description="通过 RadioGroup 的 size 控制整组尺寸。" :code="sizeSnippet">
      <Space direction="vertical">
        <div>
          <div class="text-sm text-gray-700 mb-2">小号（sm）</div>
          <RadioGroup v-model:value="sizeSmValue" size="sm" class="flex flex-wrap items-center gap-4">
            <Radio value="a">选项 A</Radio>
            <Radio value="b">选项 B</Radio>
            <Radio value="c">选项 C</Radio>
          </RadioGroup>
        </div>

        <div>
          <div class="text-sm text-gray-700 mb-2">默认（md）</div>
          <RadioGroup v-model:value="sizeMdValue" size="md" class="flex flex-wrap items-center gap-4">
            <Radio value="a">选项 A</Radio>
            <Radio value="b">选项 B</Radio>
            <Radio value="c">选项 C</Radio>
          </RadioGroup>
        </div>

        <div>
          <div class="text-sm text-gray-700 mb-2">大号（lg）</div>
          <RadioGroup v-model:value="sizeLgValue" size="lg" class="flex flex-wrap items-center gap-4">
            <Radio value="a">选项 A</Radio>
            <Radio value="b">选项 B</Radio>
            <Radio value="c">选项 C</Radio>
          </RadioGroup>
        </div>
      </Space>
    </DemoBlock>

    <!-- 数字值 -->
    <DemoBlock title="数字值" description="Radio 的 value 支持 number 类型。" :code="numericSnippet">
      <Space direction="vertical">
        <RadioGroup v-model:value="numericValue" class="flex flex-wrap items-center gap-4">
          <Radio :value="1">选项 1</Radio>
          <Radio :value="2">选项 2</Radio>
          <Radio :value="3">选项 3</Radio>
        </RadioGroup>
        <p class="text-sm text-gray-600">当前值：{{ String(numericValue) }}（类型：{{ typeof numericValue }}）</p>
      </Space>
    </DemoBlock>

    <!-- 自定义样式 -->
    <DemoBlock title="自定义样式" description="通过 className 和 name 自定义 Radio 和 RadioGroup 的外观与分组。" :code="customSnippet">
      <RadioGroup v-model:value="customValue" class="flex flex-wrap items-center gap-6" name="custom-radio">
        <Radio value="a" class-name="bg-blue-50 px-3 py-1 rounded">选项 A</Radio>
        <Radio value="b" class-name="bg-green-50 px-3 py-1 rounded">选项 B</Radio>
      </RadioGroup>
    </DemoBlock>
  </div>
</template>
