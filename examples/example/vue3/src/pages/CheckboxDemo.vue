<script setup lang="ts">
import { ref, computed } from 'vue'
import { Checkbox, CheckboxGroup, Space } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const checked = ref(false)
const fruitsIndeterminate = ref<string[]>(['apple'])
const fruits = ref<string[]>(['apple'])
const groupSizeValues = ref<string[]>(['apple'])

const options = ['apple', 'banana', 'orange']

const allChecked = computed(() => fruitsIndeterminate.value.length === options.length)
const indeterminate = computed(
  () => fruitsIndeterminate.value.length > 0 && fruitsIndeterminate.value.length < options.length
)

const handleCheckAllChange = (value: boolean) => {
  fruitsIndeterminate.value = value ? [...options] : []
}

const basicSnippet = `<Space direction="vertical">
  <Checkbox v-model="checked">复选框</Checkbox>
  <p class="text-sm text-gray-600">选中状态：{{ checked }}</p>
</Space>`

const uncontrolledSnippet = `<Space>
  <Checkbox :default-checked="true">默认选中</Checkbox>
  <Checkbox>默认未选中</Checkbox>
</Space>`

const disabledSnippet = `<Space>
  <Checkbox disabled>未选中禁用</Checkbox>
  <Checkbox :model-value="true" disabled>选中禁用</Checkbox>
</Space>`

const indeterminateSnippet = `<Space direction="vertical">
  <Checkbox :model-value="allChecked" :indeterminate="indeterminate" @change="handleCheckAllChange">
    全选
  </Checkbox>
  <CheckboxGroup v-model="fruitsIndeterminate">
    <div class="flex flex-wrap gap-4">
      <Checkbox value="apple">苹果</Checkbox>
      <Checkbox value="banana">香蕉</Checkbox>
      <Checkbox value="orange">橙子</Checkbox>
    </div>
  </CheckboxGroup>
  <p class="text-sm text-gray-600">已选择：{{ fruitsIndeterminate.join(', ') }}</p>
</Space>`

const groupSnippet = `<Space direction="vertical">
  <CheckboxGroup v-model="fruits">
    <div class="flex flex-wrap gap-4">
      <Checkbox value="apple">苹果</Checkbox>
      <Checkbox value="banana">香蕉</Checkbox>
      <Checkbox value="orange">橙子</Checkbox>
      <Checkbox value="grape">葡萄</Checkbox>
    </div>
  </CheckboxGroup>
  <p class="text-sm text-gray-600">选中的水果：{{ fruits.join(', ') }}</p>
</Space>`

const sizeSnippet = `<Space>
  <Checkbox size="sm">Small</Checkbox>
  <Checkbox size="md">Medium</Checkbox>
  <Checkbox size="lg">Large</Checkbox>
</Space>`

const groupDisabledSnippet = `<Space direction="vertical">
  <CheckboxGroup disabled :model-value="['apple']">
    <Checkbox value="apple">苹果</Checkbox>
    <Checkbox value="banana">香蕉</Checkbox>
    <Checkbox value="orange">橙子</Checkbox>
  </CheckboxGroup>
</Space>`

const groupSizeSnippet = `<Space direction="vertical">
  <CheckboxGroup size="lg" v-model="groupSizeValues">
    <Checkbox value="apple">苹果</Checkbox>
    <Checkbox value="banana">香蕉</Checkbox>
    <Checkbox value="orange" size="sm">橙子 (sm 覆盖)</Checkbox>
  </CheckboxGroup>
  <p class="text-sm text-gray-600">已选择：{{ groupSizeValues.join(', ') }}</p>
</Space>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Checkbox 多选框</h1>
      <p class="text-gray-600">在一组可选项中进行多项选择。</p>
    </div>

    <!-- 基础用法 -->
    <DemoBlock title="基础用法" description="单独使用可以表示两种状态之间的切换。" :code="basicSnippet">
      <Space direction="vertical">
        <Checkbox v-model="checked">复选框</Checkbox>
        <p class="text-sm text-gray-600">选中状态：{{ checked }}</p>
      </Space>
    </DemoBlock>

    <!-- 非受控模式 -->
    <DemoBlock title="非受控模式" description="使用 defaultChecked 设置默认选中，组件内部管理状态。" :code="uncontrolledSnippet">
      <Space>
        <Checkbox :default-checked="true">默认选中</Checkbox>
        <Checkbox>默认未选中</Checkbox>
      </Space>
    </DemoBlock>

    <!-- 禁用状态 -->
    <DemoBlock title="禁用状态" description="多选框不可用状态。" :code="disabledSnippet">
      <Space>
        <Checkbox disabled>未选中禁用</Checkbox>
        <Checkbox :model-value="true" disabled>选中禁用</Checkbox>
      </Space>
    </DemoBlock>

    <!-- 不确定状态 -->
    <DemoBlock title="不确定状态" description="通过 indeterminate 实现“全选/半选”效果。" :code="indeterminateSnippet">
      <Space direction="vertical">
        <Checkbox :model-value="allChecked" :indeterminate="indeterminate" @change="handleCheckAllChange">
          全选
        </Checkbox>
        <CheckboxGroup v-model="fruitsIndeterminate">
          <div class="flex flex-wrap gap-4">
            <Checkbox :value="options[0]">苹果</Checkbox>
            <Checkbox :value="options[1]">香蕉</Checkbox>
            <Checkbox :value="options[2]">橙子</Checkbox>
          </div>
        </CheckboxGroup>
        <p class="text-sm text-gray-600">已选择：{{ fruitsIndeterminate.join(', ') }}</p>
      </Space>
    </DemoBlock>

    <!-- 多选框组 -->
    <DemoBlock title="多选框组" description="适用于多个勾选框绑定到同一个数组的情景。" :code="groupSnippet">
      <Space direction="vertical">
        <CheckboxGroup v-model="fruits">
          <div class="flex flex-wrap gap-4">
            <Checkbox value="apple">苹果</Checkbox>
            <Checkbox value="banana">香蕉</Checkbox>
            <Checkbox value="orange">橙子</Checkbox>
            <Checkbox value="grape">葡萄</Checkbox>
          </div>
        </CheckboxGroup>
        <p class="text-sm text-gray-600">选中的水果：{{ fruits.join(', ') }}</p>
      </Space>
    </DemoBlock>

    <!-- 尺寸 -->
    <DemoBlock title="尺寸" description="支持 sm / md / lg 三种尺寸，可在 CheckboxGroup 中统一设置。" :code="sizeSnippet">
      <Space>
        <Checkbox size="sm">Small</Checkbox>
        <Checkbox size="md">Medium</Checkbox>
        <Checkbox size="lg">Large</Checkbox>
      </Space>
    </DemoBlock>

    <!-- 分组禁用 -->
    <DemoBlock title="分组禁用" description="设置 CheckboxGroup 的 disabled 可禁用所有子复选框。" :code="groupDisabledSnippet">
      <Space direction="vertical">
        <CheckboxGroup disabled :model-value="['apple']">
          <Checkbox value="apple">苹果</Checkbox>
          <Checkbox value="banana">香蕉</Checkbox>
          <Checkbox value="orange">橙子</Checkbox>
        </CheckboxGroup>
      </Space>
    </DemoBlock>

    <!-- 分组尺寸继承 -->
    <DemoBlock title="分组尺寸继承" description="CheckboxGroup 设置 size 后子复选框继承，个别子项可通过自身 size 覆盖。" :code="groupSizeSnippet">
      <Space direction="vertical">
        <CheckboxGroup size="lg" v-model="groupSizeValues">
          <Checkbox value="apple">苹果</Checkbox>
          <Checkbox value="banana">香蕉</Checkbox>
          <Checkbox value="orange" size="sm">橙子 (sm 覆盖)</Checkbox>
        </CheckboxGroup>
        <p class="text-sm text-gray-600">已选择：{{ groupSizeValues.join(', ') }}</p>
      </Space>
    </DemoBlock>
  </div>
</template>
