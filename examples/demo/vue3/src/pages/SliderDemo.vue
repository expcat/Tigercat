<script setup lang="ts">
import { ref } from 'vue'
import { Slider, Space, Divider, Text } from '@tigercat/vue'

const basicValue = ref(50)

const rangeMinMaxDefaultValue = ref(50)
const rangeMinMaxWideValue = ref(30)

const stepValue = ref(30)

const rangeValue = ref<[number, number]>([20, 80])

const marksValue = ref(25)
const marks = {
  0: '0°C',
  25: '25°C',
  50: '50°C',
  75: '75°C',
  100: '100°C',
}

const tooltipOffValue = ref(50)

const disabledValue = ref(75)

const sizeSm = ref(30)
const sizeMd = ref(50)
const sizeLg = ref(70)
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Slider 滑块</h1>
      <p class="text-gray-600">通过拖动滑块在一个固定区间内进行选择。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">基础的滑块用法，显示当前值。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <div class="flex items-center gap-4 w-full">
            <Slider v-model:value="basicValue"
                    :min="0"
                    :max="100"
                    class="flex-1" />
            <Text>{{ basicValue }}</Text>
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同范围 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同范围</h2>
      <p class="text-gray-600 mb-6">通过 min 和 max 属性设置范围。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <div class="w-full">
            <Text class="text-sm text-gray-600 mb-2">0-100 (默认)</Text>
            <div class="flex items-center gap-4 w-full">
              <Slider v-model:value="rangeMinMaxDefaultValue"
                      :min="0"
                      :max="100"
                      class="flex-1" />
              <Text>{{ rangeMinMaxDefaultValue }}</Text>
            </div>
          </div>
          <div class="w-full">
            <Text class="text-sm text-gray-600 mb-2">0-200</Text>
            <div class="flex items-center gap-4 w-full">
              <Slider v-model:value="rangeMinMaxWideValue"
                      :min="0"
                      :max="200"
                      class="flex-1" />
              <Text>{{ rangeMinMaxWideValue }}</Text>
            </div>
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 步进 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">步进</h2>
      <p class="text-gray-600 mb-6">通过 step 设置步进值。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <div class="flex items-center gap-4 w-full">
            <Slider v-model:value="stepValue"
                    :min="0"
                    :max="100"
                    :step="10"
                    class="flex-1" />
            <Text>{{ stepValue }}</Text>
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 范围选择 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">范围选择</h2>
      <p class="text-gray-600 mb-6">通过 range 启用范围选择，此时值为 [min, max]。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <div class="flex items-center gap-4 w-full">
            <Slider v-model:value="rangeValue"
                    range
                    :min="0"
                    :max="100"
                    class="flex-1" />
            <Text>{{ rangeValue[0] }} - {{ rangeValue[1] }}</Text>
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 带标记 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">带标记</h2>
      <p class="text-gray-600 mb-6">通过 marks 显示刻度标记。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <div class="flex items-center gap-4 w-full">
            <Slider v-model:value="marksValue"
                    :min="0"
                    :max="100"
                    :marks="marks"
                    class="flex-1" />
            <Text>{{ marksValue }}</Text>
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 工具提示 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">工具提示</h2>
      <p class="text-gray-600 mb-6">通过 tooltip 控制是否显示提示（默认开启）。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <div class="flex items-center gap-4 w-full">
            <Slider v-model:value="tooltipOffValue"
                    :min="0"
                    :max="100"
                    :tooltip="false"
                    class="flex-1" />
            <Text>{{ tooltipOffValue }}</Text>
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用状态</h2>
      <p class="text-gray-600 mb-6">通过 disabled 属性禁用滑块。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <div class="flex items-center gap-4 w-full">
            <Slider v-model:value="disabledValue"
                    :min="0"
                    :max="100"
                    disabled
                    class="flex-1" />
            <Text>{{ disabledValue }}</Text>
          </div>
        </Space>
      </div>
    </section>

    <!-- 不同尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同尺寸</h2>
      <p class="text-gray-600 mb-6">Slider 支持 sm / md / lg 三种尺寸。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical"
               class="w-full max-w-md">
          <div class="w-full">
            <Text class="text-sm text-gray-600 mb-2">sm</Text>
            <div class="flex items-center gap-4 w-full">
              <Slider v-model:value="sizeSm"
                      size="sm"
                      :min="0"
                      :max="100"
                      class="flex-1" />
              <Text>{{ sizeSm }}</Text>
            </div>
          </div>
          <div class="w-full">
            <Text class="text-sm text-gray-600 mb-2">md</Text>
            <div class="flex items-center gap-4 w-full">
              <Slider v-model:value="sizeMd"
                      size="md"
                      :min="0"
                      :max="100"
                      class="flex-1" />
              <Text>{{ sizeMd }}</Text>
            </div>
          </div>
          <div class="w-full">
            <Text class="text-sm text-gray-600 mb-2">lg</Text>
            <div class="flex items-center gap-4 w-full">
              <Slider v-model:value="sizeLg"
                      size="lg"
                      :min="0"
                      :max="100"
                      class="flex-1" />
              <Text>{{ sizeLg }}</Text>
            </div>
          </div>
        </Space>
      </div>
    </section>
  </div>
</template>
