<script setup lang="ts">
import { ref } from 'vue'
import { Input, InputNumber, Space, FormItem, Button } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'
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
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Input 输入框</h1>
      <p class="text-gray-600">通过鼠标或键盘输入内容，是最基础的表单域的包装。</p>
    </div>

    <!-- 基础用法 -->
    <DemoBlock title="基础用法" description="基础的输入框组件。" :code="basicSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <Input v-model="basicText" placeholder="请输入内容" />
        <p class="text-sm text-gray-600">输入的内容：{{ basicText }}</p>
      </Space>
    </DemoBlock>

    <!-- 受控与非受控 -->
    <DemoBlock title="受控与非受控" description="受控模式绑定值（v-model）；非受控模式不绑定值，仅监听 input 事件。" :code="controlledSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <FormItem label="受控输入">
          <Input v-model="controlledText" placeholder="受控输入" />
        </FormItem>
        <FormItem label="非受控输入">
          <Input placeholder="非受控输入" @input="handleUncontrolledInput" />
          <p class="text-sm text-gray-600">输入的内容：{{ uncontrolled }}</p>
        </FormItem>
      </Space>
    </DemoBlock>

    <!-- 不同类型 -->
    <DemoBlock title="不同类型" description="Input 支持多种类型，如文本、密码、数字等。" :code="typeSnippet">
      <Space direction="vertical" class="w-full max-w-md">
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
      </Space>
    </DemoBlock>

    <!-- 不同尺寸 -->
    <DemoBlock title="不同尺寸" description="输入框有三种尺寸：小、中、大。" :code="sizeSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <Input size="sm" placeholder="小尺寸输入框" />
        <Input size="md" placeholder="中尺寸输入框" />
        <Input size="lg" placeholder="大尺寸输入框" />
      </Space>
    </DemoBlock>

    <!-- 禁用和只读 -->
    <DemoBlock title="禁用和只读" description="输入框可以设置为禁用或只读状态。" :code="disabledSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <Input v-model="disabled" disabled />
        <Input v-model="readonly" readonly />
      </Space>
    </DemoBlock>

    <!-- 必填与长度限制 -->
    <DemoBlock title="必填与长度限制" description="使用 required / minLength / maxLength 约束输入。" :code="limitSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <FormItem label="必填输入">
          <Input required placeholder="必填项" />
        </FormItem>
        <FormItem label="长度限制（3~10）">
          <Input v-model="limited" :minLength="3" :maxLength="10" placeholder="请输入 3~10 个字符" />
          <p class="text-sm text-gray-600">当前长度：{{ limited.length }}</p>
        </FormItem>
      </Space>
    </DemoBlock>

    <!-- 前缀与后缀 -->
    <DemoBlock title="前缀与后缀" description="可以在输入框前后添加图标或文本。" :code="affixSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <Input placeholder="前缀图标">
          <template #prefix>👤</template>
        </Input>
        <Input placeholder="后缀图标">
          <template #suffix>🔍</template>
        </Input>
        <Input prefix="￥" suffix="RMB" placeholder="前缀后缀文本" />
      </Space>
    </DemoBlock>

    <!-- 状态与错误提示 -->
    <DemoBlock title="状态与错误提示" description="支持 error、warning、success 状态，error 状态下可显示内部错误信息。" :code="statusSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <Input status="error" placeholder="错误状态" />
        <Input status="warning" placeholder="警告状态" />
        <Input status="success" placeholder="成功状态" />
        <Input status="error" errorMessage="用户名已存在" placeholder="带错误信息" />
      </Space>
    </DemoBlock>

    <!-- 错误抖动 -->
    <DemoBlock title="错误抖动" description="当状态变为 error 时会自动触发抖动动画。" :code="shakeSnippet">
      <Space direction="vertical" class="w-full max-w-md">
        <Input :status="shakeStatus" :errorMessage="shakeError" placeholder="点击按钮触发错误抖动" />
        <Space>
          <Button @click="triggerShake" variant="primary">触发错误</Button>
          <Button @click="resetShake">重置</Button>
        </Space>
      </Space>
    </DemoBlock>

    <!-- 数字输入框 InputNumber -->
    <DemoBlock title="数字输入框 InputNumber" description="专用的数字输入组件，支持范围限制、精度、多种尺寸和状态。" :code="inputNumberSnippet">
      <Space direction="vertical" class="w-full max-w-md">
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
      </Space>
    </DemoBlock>

    <!-- 步进按钮与格式化 -->
    <DemoBlock title="步进按钮与格式化" description="InputNumber 支持不同按钮布局和自定义格式化。" :code="inputNumberControlsSnippet">
      <Space direction="vertical" class="w-full max-w-md">
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
            :formatter="(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(v) => Number(v.replace(/\$\s?|(,*)/g, ''))" />
        </FormItem>
      </Space>
    </DemoBlock>
  </div>
</template>
