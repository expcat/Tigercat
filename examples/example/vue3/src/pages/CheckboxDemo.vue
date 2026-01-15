<script setup lang="ts">
import { ref, computed } from 'vue'
import { Checkbox, CheckboxGroup, Space, Divider } from '@expcat/tigercat-vue'

const checked = ref(false)
const fruitsIndeterminate = ref<string[]>(['apple'])
const fruits = ref<string[]>(['apple'])

const options = ['apple', 'banana', 'orange']

const allChecked = computed(() => fruitsIndeterminate.value.length === options.length)
const indeterminate = computed(
  () => fruitsIndeterminate.value.length > 0 && fruitsIndeterminate.value.length < options.length
)

const handleCheckAllChange = (value: boolean) => {
  fruitsIndeterminate.value = value ? [...options] : []
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Checkbox 多选框</h1>
      <p class="text-gray-600">在一组可选项中进行多项选择。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">单独使用可以表示两种状态之间的切换。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical">
          <Checkbox v-model="checked">复选框</Checkbox>
          <p class="text-sm text-gray-600">选中状态：{{ checked }}</p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 非受控模式 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">非受控模式</h2>
      <p class="text-gray-600 mb-6">使用 defaultChecked 设置默认选中，组件内部管理状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Checkbox :default-checked="true">默认选中</Checkbox>
          <Checkbox>默认未选中</Checkbox>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用状态</h2>
      <p class="text-gray-600 mb-6">多选框不可用状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Checkbox disabled>未选中禁用</Checkbox>
          <Checkbox :model-value="true" disabled>选中禁用</Checkbox>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不确定状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不确定状态</h2>
      <p class="text-gray-600 mb-6">通过 indeterminate 实现“全选/半选”效果。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical">
          <Checkbox
            :model-value="allChecked"
            :indeterminate="indeterminate"
            @change="handleCheckAllChange">
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
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 多选框组 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">多选框组</h2>
      <p class="text-gray-600 mb-6">适用于多个勾选框绑定到同一个数组的情景。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
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
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">尺寸</h2>
      <p class="text-gray-600 mb-6">支持 sm / md / lg 三种尺寸，可在 CheckboxGroup 中统一设置。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical">
          <Space>
            <Checkbox size="sm">Small</Checkbox>
            <Checkbox size="md">Medium</Checkbox>
            <Checkbox size="lg">Large</Checkbox>
          </Space>
        </Space>
      </div>
    </section>
  </div>
</template>
