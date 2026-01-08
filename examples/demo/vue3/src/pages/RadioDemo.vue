<script setup lang="ts">
import { ref } from 'vue'
import { Radio, RadioGroup, Space, Divider } from '@tigercat/vue'

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
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Radio 单选框</h1>
      <p class="text-gray-600">在一组备选项中进行单选。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">单选框组合使用时，需要通过 RadioGroup 组件进行包裹。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical">
          <RadioGroup v-model:value="basicValue"
                      class="flex flex-wrap items-center gap-4">
            <Radio value="male">男</Radio>
            <Radio value="female">女</Radio>
            <Radio value="other">其他</Radio>
          </RadioGroup>
          <p class="text-sm text-gray-600">当前选中：{{ String(basicValue) }}</p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 非受控 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">非受控</h2>
      <p class="text-gray-600 mb-6">不使用 v-model，通过 defaultValue 初始化，并监听 change。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
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
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用状态</h2>
      <p class="text-gray-600 mb-6">单选框不可用的状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
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
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">尺寸</h2>
      <p class="text-gray-600 mb-6">通过 RadioGroup 的 size 控制整组尺寸。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
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
      </div>
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/"
                   class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>
