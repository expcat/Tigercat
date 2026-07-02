<script setup lang="ts">
import { InputNumber } from '@expcat/tigercat-vue/InputNumber'
import { Space } from '@expcat/tigercat-vue/Space'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Button } from '@expcat/tigercat-vue/Button'
import { ref } from 'vue'
import { Input } from '@expcat/tigercat-vue/Input'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './InputDemo.vue?raw'
import type { InputStatus } from '@expcat/tigercat-core'

const basicText = ref('')
const controlledText = ref('')
const typeText = ref('')
const password = ref('')
const disabled = ref('禁用的输入框')
const readonly = ref('只读的输入框')
const limited = ref('')
const uncontrolled = ref('')

// InputNumber states
const numValue = ref(0)
const numFormatted = ref(1000)

// Shake Demo Logic
const shakeStatus = ref<InputStatus>('default')
const shakeError = ref('')

const triggerShake = () => {
  shakeStatus.value = 'default'
  shakeError.value = ''

  // 使用 nextTick 或 setTimeout 来确保状态变更被捕捉，从而由 default -> error 触发动画
  setTimeout(() => {
    shakeStatus.value = 'error'
    shakeError.value = '验证失败，请重试！'
  }, 50)
}
const resetShake = () => {
  shakeStatus.value = 'default'
  shakeError.value = ''
}

const handleUncontrolledInput = (event: Event) => {
  uncontrolled.value = (event.target as HTMLInputElement).value
}

const basicScriptSnippet = `import { ref } from 'vue'

const basicText = ref('')`

const basicSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <Input v-model="basicText" placeholder="请输入内容" />
  <p class="text-sm text-gray-600">输入的内容：{{ basicText }}</p>
</Space>`

const controlledSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <FormItem label="受控输入">
    <Input v-model="controlledText" placeholder="受控输入" />
  </FormItem>
  <FormItem label="非受控输入">
    <Input placeholder="非受控输入" @input="handleUncontrolledInput" />
    <p class="text-sm text-gray-600">输入的内容：{{ uncontrolled }}</p>
  </FormItem>
</Space>`

const typeSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <FormItem label="文本输入">
    <Input v-model="typeText" type="text" placeholder="文本输入" />
  </FormItem>
  <FormItem label="密码输入">
    <Input v-model="password" type="password" placeholder="密码输入" />
  </FormItem>
  <FormItem label="数字输入">
    <Input type="number" placeholder="数字输入" />
  </FormItem>
  <FormItem label="邮箱输入">
    <Input type="email" placeholder="邮箱输入" />
  </FormItem>
  <FormItem label="电话输入">
    <Input type="tel" placeholder="电话输入" />
  </FormItem>
  <FormItem label="网址输入">
    <Input type="url" placeholder="网址输入" />
  </FormItem>
  <FormItem label="搜索">
    <Input type="search" placeholder="搜索内容" />
  </FormItem>
</Space>`

const sizeSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <Input size="sm" placeholder="小尺寸输入框" />
  <Input size="md" placeholder="中尺寸输入框" />
  <Input size="lg" placeholder="大尺寸输入框" />
</Space>`

const disabledSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <Input v-model="disabled" disabled />
  <Input v-model="readonly" readonly />
</Space>`

const limitSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <FormItem label="必填输入">
    <Input required placeholder="必填项" />
  </FormItem>
  <FormItem label="长度限制（3~10）">
    <Input v-model="limited" :minLength="3" :maxLength="10" placeholder="请输入 3~10 个字符" />
    <p class="text-sm text-gray-600">当前长度：{{ limited.length }}</p>
  </FormItem>
</Space>`

const affixSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <Input placeholder="前缀图标">
    <template #prefix>👤</template>
  </Input>
  <Input placeholder="后缀图标">
    <template #suffix>🔍</template>
  </Input>
  <Input prefix="￥" suffix="RMB" placeholder="前缀后缀文本" />
</Space>`

const statusSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <Input status="error" placeholder="错误状态" />
  <Input status="warning" placeholder="警告状态" />
  <Input status="success" placeholder="成功状态" />
  <Input status="error" errorMessage="用户名已存在" placeholder="带错误信息" />
</Space>`

const shakeSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <Input :status="shakeStatus" :errorMessage="shakeError" placeholder="点击按钮触发错误抖动" />
  <Space>
    <Button @click="triggerShake" variant="primary">触发错误</Button>
    <Button @click="resetShake">重置</Button>
  </Space>
</Space>`

const inputNumberSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <FormItem label="基础">
    <InputNumber v-model="numValue" />
  </FormItem>
  <FormItem label="范围 (0~100, step=5)">
    <InputNumber v-model="numValue" :min="0" :max="100" :step="5" />
  </FormItem>
  <FormItem label="精度 (2位小数)">
    <InputNumber v-model="numValue" :precision="2" :step="0.1" />
  </FormItem>
  <FormItem label="尺寸">
    <Space>
      <InputNumber v-model="numValue" size="sm" />
      <InputNumber v-model="numValue" size="md" />
      <InputNumber v-model="numValue" size="lg" />
    </Space>
  </FormItem>
  <FormItem label="禁用 / 只读 / 错误">
    <Space>
      <InputNumber :model-value="5" disabled />
      <InputNumber :model-value="5" readonly />
      <InputNumber v-model="numValue" status="error" />
    </Space>
  </FormItem>
</Space>`

const inputNumberControlsSnippet = `<Space direction="vertical" class="w-full max-w-md">
  <FormItem label="右侧按钮（默认）">
    <InputNumber v-model="numValue" />
  </FormItem>
  <FormItem label="两侧按钮">
    <InputNumber v-model="numValue" controls-position="both" />
  </FormItem>
  <FormItem label="隐藏按钮">
    <InputNumber v-model="numValue" :controls="false" />
  </FormItem>
  <FormItem label="千分位格式化">
    <InputNumber
      v-model="numFormatted"
      :formatter="(v) => \`$ \${v}\`.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')"
      :parser="(v) => Number(v.replace(/\\$\\s?|(,*)/g, ''))" />
  </FormItem>
</Space>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Input 输入框</h1>
      <p class="text-gray-600 dark:text-gray-400">
        通过鼠标或键盘输入内容，是最基础的表单域的包装。
      </p>
    </div>

    <DemoBlock
      title="输入方式与外观"
      description="合并展示基础输入、受控/非受控、常见类型、尺寸、禁用只读和前后缀。"
      :code="fullPageSnippet">
      <Space direction="vertical" class="w-full max-w-2xl" size="lg">
        <FormItem label="基础输入">
          <Input v-model="basicText" placeholder="请输入内容" />
          <p class="text-sm text-gray-600">输入的内容：{{ basicText }}</p>
        </FormItem>
        <div class="grid gap-4 md:grid-cols-2">
          <FormItem label="受控输入">
            <Input v-model="controlledText" placeholder="受控输入" />
          </FormItem>
          <FormItem label="非受控输入">
            <Input placeholder="非受控输入" @input="handleUncontrolledInput" />
            <p class="text-sm text-gray-600">输入的内容：{{ uncontrolled }}</p>
          </FormItem>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <FormItem label="文本 / 密码">
            <Space direction="vertical" class="w-full">
              <Input v-model="typeText" type="text" placeholder="文本输入" />
              <Input v-model="password" type="password" placeholder="密码输入" />
            </Space>
          </FormItem>
          <FormItem label="其他类型">
            <Space direction="vertical" class="w-full">
              <Input type="email" placeholder="邮箱输入" />
              <Input type="tel" placeholder="电话输入" />
              <Input type="search" placeholder="搜索内容" />
            </Space>
          </FormItem>
        </div>
        <FormItem label="尺寸">
          <Space direction="vertical" class="w-full max-w-md">
            <Input size="sm" placeholder="小尺寸输入框" />
            <Input size="md" placeholder="中尺寸输入框" />
            <Input size="lg" placeholder="大尺寸输入框" />
          </Space>
        </FormItem>
        <div class="grid gap-4 md:grid-cols-2">
          <FormItem label="禁用 / 只读">
            <Space direction="vertical" class="w-full">
              <Input v-model="disabled" disabled />
              <Input v-model="readonly" readonly />
            </Space>
          </FormItem>
          <FormItem label="前缀 / 后缀">
            <Space direction="vertical" class="w-full">
              <Input placeholder="前缀图标">
                <template #prefix>👤</template>
              </Input>
              <Input placeholder="后缀图标">
                <template #suffix>🔍</template>
              </Input>
              <Input prefix="￥" suffix="RMB" placeholder="前缀后缀文本" />
            </Space>
          </FormItem>
        </div>
      </Space>
    </DemoBlock>

    <DemoBlock
      title="约束与反馈"
      description="合并展示 required、长度限制、状态提示和错误抖动。"
      :code="fullPageSnippet">
      <Space direction="vertical" class="w-full max-w-2xl" size="lg">
        <div class="grid gap-4 md:grid-cols-2">
          <FormItem label="必填输入">
            <Input required placeholder="必填项" />
          </FormItem>
          <FormItem label="长度限制（3~10）">
            <Input
              v-model="limited"
              :minLength="3"
              :maxLength="10"
              placeholder="请输入 3~10 个字符" />
            <p class="text-sm text-gray-600">当前长度：{{ limited.length }}</p>
          </FormItem>
        </div>
        <FormItem label="状态与错误提示">
          <Space direction="vertical" class="w-full max-w-md">
            <Input status="error" placeholder="错误状态" />
            <Input status="warning" placeholder="警告状态" />
            <Input status="success" placeholder="成功状态" />
            <Input status="error" errorMessage="用户名已存在" placeholder="带错误信息" />
          </Space>
        </FormItem>
        <FormItem label="错误抖动">
          <Space direction="vertical" class="w-full max-w-md">
            <Input
              :status="shakeStatus"
              :errorMessage="shakeError"
              placeholder="点击按钮触发错误抖动" />
            <Space>
              <Button @click="triggerShake" variant="primary">触发错误</Button>
              <Button @click="resetShake">重置</Button>
            </Space>
          </Space>
        </FormItem>
      </Space>
    </DemoBlock>

    <DemoBlock
      title="数字输入框 InputNumber"
      description="合并展示数值范围、精度、尺寸、状态、步进按钮和格式化。"
      :code="fullPageSnippet">
      <Space direction="vertical" class="w-full max-w-2xl" size="lg">
        <div class="grid gap-4 md:grid-cols-2">
          <FormItem label="基础 / 范围 / 精度">
            <Space direction="vertical" class="w-full">
              <InputNumber
                v-model="numValue"
                increment-aria-label="增加数值"
                decrement-aria-label="减少数值" />
              <InputNumber
                v-model="numValue"
                :min="0"
                :max="100"
                :step="5"
                increment-aria-label="增加数值"
                decrement-aria-label="减少数值" />
              <InputNumber
                v-model="numValue"
                :precision="2"
                :step="0.1"
                increment-aria-label="增加数值"
                decrement-aria-label="减少数值" />
            </Space>
          </FormItem>
          <FormItem label="尺寸与状态">
            <Space direction="vertical" class="w-full">
              <Space>
                <InputNumber
                  v-model="numValue"
                  size="sm"
                  increment-aria-label="增加数值"
                  decrement-aria-label="减少数值" />
                <InputNumber
                  v-model="numValue"
                  size="md"
                  increment-aria-label="增加数值"
                  decrement-aria-label="减少数值" />
                <InputNumber
                  v-model="numValue"
                  size="lg"
                  increment-aria-label="增加数值"
                  decrement-aria-label="减少数值" />
              </Space>
              <Space>
                <InputNumber
                  :model-value="5"
                  disabled
                  increment-aria-label="增加数值"
                  decrement-aria-label="减少数值" />
                <InputNumber
                  :model-value="5"
                  readonly
                  increment-aria-label="增加数值"
                  decrement-aria-label="减少数值" />
                <InputNumber
                  v-model="numValue"
                  status="error"
                  increment-aria-label="增加数值"
                  decrement-aria-label="减少数值" />
              </Space>
            </Space>
          </FormItem>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <FormItem label="步进按钮">
            <Space direction="vertical" class="w-full">
              <InputNumber
                v-model="numValue"
                increment-aria-label="增加数值"
                decrement-aria-label="减少数值" />
              <InputNumber
                v-model="numValue"
                controls-position="both"
                increment-aria-label="增加数值"
                decrement-aria-label="减少数值" />
              <InputNumber v-model="numValue" :controls="false" />
            </Space>
          </FormItem>
          <FormItem label="千分位格式化">
            <InputNumber
              v-model="numFormatted"
              :formatter="(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(v) => Number(v.replace(/\$\s?|(,*)/g, ''))"
              increment-aria-label="增加数值"
              decrement-aria-label="减少数值" />
          </FormItem>
        </div>
      </Space>
    </DemoBlock>
  </div>
</template>
