<script setup lang="ts">
import { ref } from 'vue'
import { Slider, Space, Text } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

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
  100: '100°C'
}

const tooltipOffValue = ref(50)
const tooltipOnValue = ref(50)

const disabledValue = ref(75)

const sizeSm = ref(30)
const sizeMd = ref(50)
const sizeLg = ref(70)

const basicSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <div class="flex items-center gap-4 w-full">
    <Slider v-model:value="basicValue" :min="0" :max="100" class="flex-1" />
    <Text>{{ basicValue }}</Text>
  </div>
</Space>`

const rangeSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <div class="w-full">
    <Text class="text-sm text-gray-600 mb-2">0-100 (默认)</Text>
    <div class="flex items-center gap-4 w-full">
      <Slider v-model:value="rangeMinMaxDefaultValue" :min="0" :max="100" class="flex-1" />
      <Text>{{ rangeMinMaxDefaultValue }}</Text>
    </div>
  </div>
  <div class="w-full">
    <Text class="text-sm text-gray-600 mb-2">0-200</Text>
    <div class="flex items-center gap-4 w-full">
      <Slider v-model:value="rangeMinMaxWideValue" :min="0" :max="200" class="flex-1" />
      <Text>{{ rangeMinMaxWideValue }}</Text>
    </div>
  </div>
</Space>`

const stepSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <div class="flex items-center gap-4 w-full">
    <Slider v-model:value="stepValue" :min="0" :max="100" :step="10" class="flex-1" />
    <Text>{{ stepValue }}</Text>
  </div>
</Space>`

const rangeValueSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <div class="flex items-center gap-4 w-full">
    <Slider v-model:value="rangeValue" range :min="0" :max="100" class="flex-1" />
    <Text>{{ rangeValue[0] }} - {{ rangeValue[1] }}</Text>
  </div>
</Space>`

const marksSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <div class="flex items-center gap-4 w-full">
    <Slider v-model:value="marksValue" :min="0" :max="100" :marks="marks" class="flex-1" />
    <Text>{{ marksValue }}</Text>
  </div>
</Space>`

const tooltipSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <div class="w-full">
    <Text class="text-sm text-gray-600 mb-2">tooltip on（默认）</Text>
    <div class="flex items-center gap-4 w-full">
      <Slider v-model:value="tooltipOnValue" :min="0" :max="100" class="flex-1" />
      <Text>{{ tooltipOnValue }}</Text>
    </div>
  </div>
  <div class="w-full">
    <Text class="text-sm text-gray-600 mb-2">tooltip off</Text>
    <div class="flex items-center gap-4 w-full">
      <Slider v-model:value="tooltipOffValue" :min="0" :max="100" :tooltip="false" class="flex-1" />
      <Text>{{ tooltipOffValue }}</Text>
    </div>
  </div>
</Space>`

const disabledSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <div class="flex items-center gap-4 w-full">
    <Slider v-model:value="disabledValue" :min="0" :max="100" disabled class="flex-1" />
    <Text>{{ disabledValue }}</Text>
  </div>
</Space>`

const sizeSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <div class="w-full">
    <Text class="text-sm text-gray-600 mb-2">sm</Text>
    <div class="flex items-center gap-4 w-full">
      <Slider v-model:value="sizeSm" size="sm" :min="0" :max="100" class="flex-1" />
      <Text>{{ sizeSm }}</Text>
    </div>
  </div>
  <div class="w-full">
    <Text class="text-sm text-gray-600 mb-2">md</Text>
    <div class="flex items-center gap-4 w-full">
      <Slider v-model:value="sizeMd" size="md" :min="0" :max="100" class="flex-1" />
      <Text>{{ sizeMd }}</Text>
    </div>
  </div>
  <div class="w-full">
    <Text class="text-sm text-gray-600 mb-2">lg</Text>
    <div class="flex items-center gap-4 w-full">
      <Slider v-model:value="sizeLg" size="lg" :min="0" :max="100" class="flex-1" />
      <Text>{{ sizeLg }}</Text>
    </div>
  </div>
</Space>`

const defaultValueSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <div class="flex items-center gap-4 w-full">
    <Slider :default-value="60" :min="0" :max="100" class="flex-1" />
  </div>
</Space>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Slider 滑块</h1>
      <p class="text-gray-600">通过拖动滑块在一个固定区间内进行选择。</p>
    </div>

    <!-- 基础用法 -->
    <DemoBlock title="基础用法" description="基础的滑块用法，显示当前值。" :code="basicSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <div class="flex items-center gap-4 w-full">
          <Slider v-model:value="basicValue" :min="0" :max="100" class="flex-1" />
          <Text>{{ basicValue }}</Text>
        </div>
      </Space>
    </DemoBlock>

    <!-- 不同范围 -->
    <DemoBlock title="不同范围" description="通过 min 和 max 属性设置范围。" :code="rangeSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <div class="w-full">
          <Text class="text-sm text-gray-600 mb-2">0-100 (默认)</Text>
          <div class="flex items-center gap-4 w-full">
            <Slider v-model:value="rangeMinMaxDefaultValue" :min="0" :max="100" class="flex-1" />
            <Text>{{ rangeMinMaxDefaultValue }}</Text>
          </div>
        </div>
        <div class="w-full">
          <Text class="text-sm text-gray-600 mb-2">0-200</Text>
          <div class="flex items-center gap-4 w-full">
            <Slider v-model:value="rangeMinMaxWideValue" :min="0" :max="200" class="flex-1" />
            <Text>{{ rangeMinMaxWideValue }}</Text>
          </div>
        </div>
      </Space>
    </DemoBlock>

    <!-- 步进 -->
    <DemoBlock title="步进" description="通过 step 设置步进值。" :code="stepSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <div class="flex items-center gap-4 w-full">
          <Slider v-model:value="stepValue" :min="0" :max="100" :step="10" class="flex-1" />
          <Text>{{ stepValue }}</Text>
        </div>
      </Space>
    </DemoBlock>

    <!-- 范围选择 -->
    <DemoBlock title="范围选择" description="通过 range 启用范围选择，此时值为 [min, max]。" :code="rangeValueSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <div class="flex items-center gap-4 w-full">
          <Slider v-model:value="rangeValue" range :min="0" :max="100" class="flex-1" />
          <Text>{{ rangeValue[0] }} - {{ rangeValue[1] }}</Text>
        </div>
      </Space>
    </DemoBlock>

    <!-- 带标记 -->
    <DemoBlock title="带标记" description="通过 marks 显示刻度标记。" :code="marksSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <div class="flex items-center gap-4 w-full">
          <Slider v-model:value="marksValue" :min="0" :max="100" :marks="marks" class="flex-1" />
          <Text>{{ marksValue }}</Text>
        </div>
      </Space>
    </DemoBlock>

    <!-- 工具提示 -->
    <DemoBlock title="工具提示" description="通过 tooltip 控制是否显示提示（默认开启）。" :code="tooltipSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <div class="w-full">
          <Text class="text-sm text-gray-600 mb-2">tooltip on（默认）</Text>
          <div class="flex items-center gap-4 w-full">
            <Slider v-model:value="tooltipOnValue" :min="0" :max="100" class="flex-1" />
            <Text>{{ tooltipOnValue }}</Text>
          </div>
        </div>
        <div class="w-full">
          <Text class="text-sm text-gray-600 mb-2">tooltip off</Text>
          <div class="flex items-center gap-4 w-full">
            <Slider v-model:value="tooltipOffValue" :min="0" :max="100" :tooltip="false" class="flex-1" />
            <Text>{{ tooltipOffValue }}</Text>
          </div>
        </div>
      </Space>
    </DemoBlock>

    <!-- 禁用状态 -->
    <DemoBlock title="禁用状态" description="通过 disabled 属性禁用滑块。" :code="disabledSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <div class="flex items-center gap-4 w-full">
          <Slider v-model:value="disabledValue" :min="0" :max="100" disabled class="flex-1" />
          <Text>{{ disabledValue }}</Text>
        </div>
      </Space>
    </DemoBlock>

    <!-- 不同尺寸 -->
    <DemoBlock title="不同尺寸" description="Slider 支持 sm / md / lg 三种尺寸。" :code="sizeSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <div class="w-full">
          <Text class="text-sm text-gray-600 mb-2">sm</Text>
          <div class="flex items-center gap-4 w-full">
            <Slider v-model:value="sizeSm" size="sm" :min="0" :max="100" class="flex-1" />
            <Text>{{ sizeSm }}</Text>
          </div>
        </div>
        <div class="w-full">
          <Text class="text-sm text-gray-600 mb-2">md</Text>
          <div class="flex items-center gap-4 w-full">
            <Slider v-model:value="sizeMd" size="md" :min="0" :max="100" class="flex-1" />
            <Text>{{ sizeMd }}</Text>
          </div>
        </div>
        <div class="w-full">
          <Text class="text-sm text-gray-600 mb-2">lg</Text>
          <div class="flex items-center gap-4 w-full">
            <Slider v-model:value="sizeLg" size="lg" :min="0" :max="100" class="flex-1" />
            <Text>{{ sizeLg }}</Text>
          </div>
        </div>
      </Space>
    </DemoBlock>

    <!-- 默认值（非受控） -->
    <DemoBlock title="默认值" description="通过 default-value 设置初始值，无需绑定 v-model（非受控模式）。" :code="defaultValueSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <div class="flex items-center gap-4 w-full">
          <Slider :default-value="60" :min="0" :max="100" class="flex-1" />
        </div>
      </Space>
    </DemoBlock>
  </div>
</template>
