<script setup lang="ts">
import { ref } from 'vue'
import { Radio, RadioGroup, Space } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicValue = ref<string | number>('male')
const uncontrolledValue = ref<string | number>('male')
const disabledValue = ref<string | number>('medium')
const groupDisabledValue = ref<string | number>('a')

const sizeSmValue = ref<string | number>('a')
const sizeMdValue = ref<string | number>('a')
const sizeLgValue = ref<string | number>('a')

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
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Radio 单选框</h1>
      <p class="text-gray-600">在一组备选项中进行单选。</p>
    </div>

    <!-- 基础用法 -->
    <DemoBlock title="基础用法"
               description="单选框组合使用时，需要通过 RadioGroup 组件进行包裹。"
               :code="basicSnippet">
      <Space direction="vertical">
        <RadioGroup v-model:value="basicValue"
                    class="flex flex-wrap items-center gap-4">
          <Radio value="male">男</Radio>
          <Radio value="female">女</Radio>
          <Radio value="other">其他</Radio>
        </RadioGroup>
        <p class="text-sm text-gray-600">当前选中：{{ String(basicValue) }}</p>
      </Space>
    </DemoBlock>

    <!-- 非受控 -->
    <DemoBlock title="非受控"
               description="不使用 v-model，通过 defaultValue 初始化，并监听 change。"
               :code="uncontrolledSnippet">
      <Space direction="vertical">
        <RadioGroup default-value="male"
                    class="flex flex-wrap items-center gap-4"
                    @change="handleUncontrolledChange">
          <Radio value="male">男</Radio>
          <Radio value="female">女</Radio>
          <Radio value="other">其他</Radio>
        </RadioGroup>
        <p class="text-sm text-gray-600">最近一次变更：{{ String(uncontrolledValue) }}</p>
      </Space>
    </DemoBlock>

    <!-- 禁用状态 -->
    <DemoBlock title="禁用状态"
               description="单选框不可用的状态。"
               :code="disabledSnippet">
      <Space direction="vertical">
        <div>
          <div class="text-sm text-gray-700 mb-2">部分禁用</div>
          <RadioGroup v-model:value="disabledValue"
                      class="flex flex-wrap items-center gap-4">
            <Radio value="small">小</Radio>
            <Radio value="medium">中</Radio>
            <Radio value="large"
                   disabled>大（禁用）</Radio>
          </RadioGroup>
        </div>

        <div>
          <div class="text-sm text-gray-700 mb-2">整组禁用</div>
          <RadioGroup v-model:value="groupDisabledValue"
                      disabled
                      class="flex flex-wrap items-center gap-4">
            <Radio value="a">选项 A</Radio>
            <Radio value="b">选项 B</Radio>
            <Radio value="c">选项 C</Radio>
          </RadioGroup>
        </div>
      </Space>
    </DemoBlock>

    <!-- 尺寸 -->
    <DemoBlock title="尺寸"
               description="通过 RadioGroup 的 size 控制整组尺寸。"
               :code="sizeSnippet">
      <Space direction="vertical">
        <div>
          <div class="text-sm text-gray-700 mb-2">小号（sm）</div>
          <RadioGroup v-model:value="sizeSmValue"
                      size="sm"
                      class="flex flex-wrap items-center gap-4">
            <Radio value="a">选项 A</Radio>
            <Radio value="b">选项 B</Radio>
            <Radio value="c">选项 C</Radio>
          </RadioGroup>
        </div>

        <div>
          <div class="text-sm text-gray-700 mb-2">默认（md）</div>
          <RadioGroup v-model:value="sizeMdValue"
                      size="md"
                      class="flex flex-wrap items-center gap-4">
            <Radio value="a">选项 A</Radio>
            <Radio value="b">选项 B</Radio>
            <Radio value="c">选项 C</Radio>
          </RadioGroup>
        </div>

        <div>
          <div class="text-sm text-gray-700 mb-2">大号（lg）</div>
          <RadioGroup v-model:value="sizeLgValue"
                      size="lg"
                      class="flex flex-wrap items-center gap-4">
            <Radio value="a">选项 A</Radio>
            <Radio value="b">选项 B</Radio>
            <Radio value="c">选项 C</Radio>
          </RadioGroup>
        </div>
      </Space>
    </DemoBlock>
  </div>
</template>
