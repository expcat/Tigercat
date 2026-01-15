# RadioGroup 单选框组

用于管理一组单选框的组件，提供统一的状态管理和样式配置，确保同一组内只有一个选项被选中。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { RadioGroup, Radio } from '@expcat/tigercat-vue'

const selectedValue = ref('apple')
const options = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'orange', label: '橙子' }
]
</script>

<template>
  <RadioGroup v-model:value="selectedValue">
    <Radio v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </Radio>
  </RadioGroup>
</template>
```

### React

```tsx
import { useState } from 'react'
import { RadioGroup, Radio } from '@expcat/tigercat-react'

function App() {
  const [selectedValue, setSelectedValue] = useState('apple')
  const options = [
    { value: 'apple', label: '苹果' },
    { value: 'banana', label: '香蕉' },
    { value: 'orange', label: '橙子' }
  ]

  return (
    <RadioGroup value={selectedValue} onChange={setSelectedValue}>
      {options.map((option) => (
        <Radio key={option.value} value={option.value}>
          {option.label}
        </Radio>
      ))}
    </RadioGroup>
  )
}
```

## 统一尺寸 (Unified Size)

通过 RadioGroup 的 `size` 属性可以统一设置所有子单选框的尺寸（`sm`、`md`、`lg`）。

### Vue 3

```vue
<template>
  <RadioGroup v-model:value="selectedValue" size="lg">
    <Radio value="1">选项 1</Radio>
    <Radio value="2">选项 2</Radio>
  </RadioGroup>
</template>
```

### React

```tsx
<RadioGroup value={selectedValue} onChange={setSelectedValue} size="lg">
  <Radio value="1">选项 1</Radio>
  <Radio value="2">选项 2</Radio>
</RadioGroup>
```

## 统一禁用 (Unified Disabled)

通过 RadioGroup 的 `disabled` 属性可以统一禁用所有子单选框。

### Vue 3

```vue
<template>
  <RadioGroup v-model:value="selectedValue" disabled>
    <Radio value="1">选项 1</Radio>
    <Radio value="2">选项 2</Radio>
    <Radio value="3">选项 3</Radio>
  </RadioGroup>
</template>
```

### React

```tsx
<RadioGroup value={selectedValue} onChange={setSelectedValue} disabled>
  <Radio value="1">选项 1</Radio>
  <Radio value="2">选项 2</Radio>
  <Radio value="3">选项 3</Radio>
</RadioGroup>
```

## 设置 name 属性

可以通过 `name` 属性为所有单选框设置统一的 name，这对于表单提交很有用。

### Vue 3

```vue
<template>
  <RadioGroup v-model:value="selectedValue" name="fruit">
    <Radio value="apple">苹果</Radio>
    <Radio value="banana">香蕉</Radio>
    <Radio value="orange">橙子</Radio>
  </RadioGroup>
</template>
```

### React

```tsx
<RadioGroup value={selectedValue} onChange={setSelectedValue} name="fruit">
  <Radio value="apple">苹果</Radio>
  <Radio value="banana">香蕉</Radio>
  <Radio value="orange">橙子</Radio>
</RadioGroup>
```

## 受控与非受控模式

### 受控模式 (Controlled)

在受控模式下，选中值由父组件完全控制。

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { RadioGroup, Radio } from '@expcat/tigercat-vue'

const selectedValue = ref('vue')

const handleChange = (value) => {
  console.log('Selected value:', value)
  selectedValue.value = value
}
</script>

<template>
  <RadioGroup :value="selectedValue" @change="handleChange">
    <Radio value="vue">Vue</Radio>
    <Radio value="react">React</Radio>
    <Radio value="angular">Angular</Radio>
  </RadioGroup>
  <p>已选择: {{ selectedValue }}</p>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { RadioGroup, Radio } from '@expcat/tigercat-react'

function ControlledExample() {
  const [selectedValue, setSelectedValue] = useState('vue')

  const handleChange = (value: string | number) => {
    console.log('Selected value:', value)
    setSelectedValue(value as string)
  }

  return (
    <>
      <RadioGroup value={selectedValue} onChange={handleChange}>
        <Radio value="vue">Vue</Radio>
        <Radio value="react">React</Radio>
        <Radio value="angular">Angular</Radio>
      </RadioGroup>
      <p>已选择: {selectedValue}</p>
    </>
  )
}
```

### 非受控模式 (Uncontrolled)

在非受控模式下，组件自己管理选中状态。

#### Vue 3

```vue
<script setup>
import { RadioGroup, Radio } from '@expcat/tigercat-vue'

const handleChange = (value) => {
  console.log('Selected value:', value)
}
</script>

<template>
  <RadioGroup default-value="vue" @change="handleChange">
    <Radio value="vue">Vue</Radio>
    <Radio value="react">React</Radio>
    <Radio value="angular">Angular</Radio>
  </RadioGroup>
</template>
```

#### React

```tsx
import { RadioGroup, Radio } from '@expcat/tigercat-react'

function UncontrolledExample() {
  const handleChange = (value: string | number) => {
    console.log('Selected value:', value)
  }

  return (
    <RadioGroup defaultValue="vue" onChange={handleChange}>
      <Radio value="vue">Vue</Radio>
      <Radio value="react">React</Radio>
      <Radio value="angular">Angular</Radio>
    </RadioGroup>
  )
}
```

## 键盘导航

RadioGroup 支持完整的键盘导航功能：

- **方向键上/左** - 选择上一个选项
- **方向键下/右** - 选择下一个选项
- **Tab** - 在单选框组之间切换
- **Space/Enter** - 选中当前聚焦的选项（在 Radio 上）

```vue
<template>
  <RadioGroup v-model:value="selectedValue">
    <Radio value="1">使用方向键可以快速切换</Radio>
    <Radio value="2">无需点击</Radio>
    <Radio value="3">提升用户体验</Radio>
  </RadioGroup>
</template>
```

## API

### Props / 属性

| 属性      | 说明                      | 类型                               | 默认值   |
| --------- | ------------------------- | ---------------------------------- | -------- |
| size      | 所有单选框的尺寸          | `'sm' \| 'md' \| 'lg'`             | `'md'`   |
| disabled  | 是否禁用所有单选框        | `boolean`                          | `false`  |
| name      | 所有单选框的 name 属性    | `string`                           | 自动生成 |
| className | 额外的 CSS 类名（根元素） | `string`                           | -        |
| style     | 内联样式（根元素）        | `Record<string, string \| number>` | -        |

#### Vue 专属属性

| 属性         | 说明                     | 类型               | 默认值 |
| ------------ | ------------------------ | ------------------ | ------ |
| value        | 选中值（v-model:value）  | `string \| number` | -      |
| defaultValue | 默认选中值（非受控模式） | `string \| number` | -      |

#### React 专属属性

| 属性         | 说明                     | 类型                                | 默认值 |
| ------------ | ------------------------ | ----------------------------------- | ------ |
| value        | 选中值（受控模式）       | `string \| number`                  | -      |
| defaultValue | 默认选中值（非受控模式） | `string \| number`                  | -      |
| onChange     | 值改变时的回调           | `(value: string \| number) => void` | -      |
| children     | 子组件                   | `React.ReactNode`                   | -      |

### Events / 事件 (Vue)

| 事件名       | 说明                              | 回调参数                    |
| ------------ | --------------------------------- | --------------------------- |
| update:value | 选中值更新时触发（v-model:value） | `(value: string \| number)` |
| change       | 选中值改变时触发                  | `(value: string \| number)` |

### Slots / 插槽 (Vue)

| 插槽名  | 说明                               |
| ------- | ---------------------------------- |
| default | RadioGroup 内容，应包含 Radio 组件 |

### Context (React)

RadioGroup 通过 React Context 向子 Radio 组件提供以下信息：

```typescript
interface RadioGroupContextValue {
  value?: string | number // 当前选中值
  name: string // name 属性
  disabled: boolean // 是否禁用
  size: RadioSize // 尺寸
  onChange?: (value: string | number) => void // 改变回调
}
```

子 Radio 组件通过 `useContext(RadioGroupContext)` 访问这些信息。

## 最佳实践

### 1. 使用语义化的值

```vue
<script setup>
import { ref } from 'vue'
import { RadioGroup, Radio } from '@expcat/tigercat-vue'

const paymentMethod = ref('credit-card')
</script>

<template>
  <RadioGroup v-model:value="paymentMethod">
    <Radio value="credit-card">信用卡</Radio>
    <Radio value="paypal">PayPal</Radio>
    <Radio value="bank-transfer">银行转账</Radio>
  </RadioGroup>
</template>
```

### 2. 垂直布局

默认情况下，RadioGroup 使用垂直布局（`space-y-2`）：

```vue
<template>
  <RadioGroup v-model:value="selectedValue">
    <Radio value="1">选项 1</Radio>
    <Radio value="2">选项 2</Radio>
    <Radio value="3">选项 3</Radio>
  </RadioGroup>
</template>
```

### 3. 水平布局

可以通过自定义 CSS 类实现水平布局：

```vue
<template>
  <RadioGroup v-model:value="selectedValue" class="flex flex-row gap-4">
    <Radio value="1">选项 1</Radio>
    <Radio value="2">选项 2</Radio>
    <Radio value="3">选项 3</Radio>
  </RadioGroup>
</template>
```

```tsx
<RadioGroup value={selectedValue} onChange={setSelectedValue} className="flex flex-row gap-4">
  <Radio value="1">选项 1</Radio>
  <Radio value="2">选项 2</Radio>
  <Radio value="3">选项 3</Radio>
</RadioGroup>
```

### 4. 网格布局

```vue
<template>
  <RadioGroup v-model:value="selectedValue" class="grid grid-cols-2 gap-4">
    <Radio value="1">选项 1</Radio>
    <Radio value="2">选项 2</Radio>
    <Radio value="3">选项 3</Radio>
    <Radio value="4">选项 4</Radio>
  </RadioGroup>
</template>
```

### 5. 带描述的选项

```vue
<template>
  <RadioGroup v-model:value="plan">
    <div v-for="option in plans" :key="option.value" class="border rounded p-3">
      <Radio :value="option.value">
        <div>
          <div class="font-medium">{{ option.name }}</div>
          <div class="text-sm text-gray-500">{{ option.description }}</div>
        </div>
      </Radio>
    </div>
  </RadioGroup>
</template>

<script setup>
const plans = [
  { value: 'free', name: '免费版', description: '基础功能，适合个人使用' },
  { value: 'pro', name: '专业版', description: '完整功能，适合团队使用' },
  {
    value: 'enterprise',
    name: '企业版',
    description: '定制服务，适合大型企业'
  }
]
</script>
```

## 常见问题

### 1. 为什么我的单选框没有响应选中？

确保在 RadioGroup 中使用的 Radio 设置了 `value` 属性，且该值与 RadioGroup 的 `value` 一致。

```vue
<!-- ✅ 正确 -->
<RadioGroup v-model:value="selectedValue">
  <Radio value="1">选项 1</Radio>
</RadioGroup>

<!-- ❌ 错误：没有设置 value -->
<RadioGroup v-model:value="selectedValue">
  <Radio>选项 1</Radio>
</RadioGroup>
```

### 2. 如何禁用单个单选框？

即使在 RadioGroup 中，也可以单独禁用某个 Radio：

```vue
<RadioGroup v-model:value="selectedValue">
  <Radio value="1">可选择</Radio>
  <Radio value="2" disabled>已禁用</Radio>
  <Radio value="3">可选择</Radio>
</RadioGroup>
```

### 3. RadioGroup 会自动生成 name 属性吗？

是的，如果没有提供 `name` 属性，RadioGroup 会自动生成一个唯一的 name，确保单选框组的正常工作。

### 4. 值的类型可以是数字吗？

可以，RadioGroup 支持 `string` 和 `number` 类型的值：

```vue
<RadioGroup v-model:value="selectedValue">
  <Radio :value="1">选项 1</Radio>
  <Radio :value="2">选项 2</Radio>
  <Radio :value="3">选项 3</Radio>
</RadioGroup>
```

### 5. 如何实现条件渲染的选项？

```vue
<script setup>
import { ref } from 'vue'
import { RadioGroup, Radio } from '@expcat/tigercat-vue'

const selectedValue = ref('basic')
const showAdvanced = ref(false)
</script>

<template>
  <RadioGroup v-model:value="selectedValue">
    <Radio value="basic">基础模式</Radio>
    <Radio value="standard">标准模式</Radio>
    <Radio v-if="showAdvanced" value="advanced">高级模式</Radio>
  </RadioGroup>
</template>
```

## 无障碍 (Accessibility)

- RadioGroup 使用 `role="radiogroup"` 确保屏幕阅读器正确识别
- 支持完整的键盘导航（方向键切换选项）
- 禁用状态会传递到所有子单选框
- 建议为 RadioGroup 添加合适的 `aria-label` 或可见的标签

```vue
<template>
  <div>
    <label id="payment-label" class="block font-medium mb-2">选择支付方式</label>
    <RadioGroup v-model:value="paymentMethod" aria-labelledby="payment-label">
      <Radio value="credit-card">信用卡</Radio>
      <Radio value="paypal">PayPal</Radio>
    </RadioGroup>
  </div>
</template>
```

## TypeScript 支持

RadioGroup 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type { RadioGroupProps, RadioGroupContext } from '@expcat/tigercat-core'
// Vue
import type { RadioGroup } from '@expcat/tigercat-vue'
// React
import { RadioGroup, RadioGroupContext } from '@expcat/tigercat-react'
```

## 相关组件

- [Radio 单选框](./radio.md) - 单个单选框组件
- [Checkbox 复选框](./checkbox.md) - 复选框组件
- [CheckboxGroup 复选框组](./checkbox-group.md) - 复选框组组件
- [Form 表单](./form.md) - 表单组件

## 示例

### 完整的表单示例

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { RadioGroup, Radio, Button } from '@expcat/tigercat-vue'

const gender = ref('male')
const ageRange = ref('18-25')

const handleSubmit = () => {
  console.log('提交:', { gender: gender.value, ageRange: ageRange.value })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label class="block text-sm font-medium mb-2">性别</label>
      <RadioGroup v-model:value="gender">
        <Radio value="male">男</Radio>
        <Radio value="female">女</Radio>
        <Radio value="other">其他</Radio>
      </RadioGroup>
    </div>

    <div>
      <label class="block text-sm font-medium mb-2">年龄范围</label>
      <RadioGroup v-model:value="ageRange">
        <Radio value="under-18">18岁以下</Radio>
        <Radio value="18-25">18-25岁</Radio>
        <Radio value="26-35">26-35岁</Radio>
        <Radio value="36-50">36-50岁</Radio>
        <Radio value="over-50">50岁以上</Radio>
      </RadioGroup>
    </div>

    <Button type="submit">提交</Button>
  </form>
</template>
```

#### React

```tsx
import { useState, FormEvent } from 'react'
import { RadioGroup, Radio, Button } from '@expcat/tigercat-react'

function FormExample() {
  const [gender, setGender] = useState('male')
  const [ageRange, setAgeRange] = useState('18-25')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    console.log('提交:', { gender, ageRange })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">性别</label>
        <RadioGroup value={gender} onChange={setGender}>
          <Radio value="male">男</Radio>
          <Radio value="female">女</Radio>
          <Radio value="other">其他</Radio>
        </RadioGroup>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">年龄范围</label>
        <RadioGroup value={ageRange} onChange={setAgeRange}>
          <Radio value="under-18">18岁以下</Radio>
          <Radio value="18-25">18-25岁</Radio>
          <Radio value="26-35">26-35岁</Radio>
          <Radio value="36-50">36-50岁</Radio>
          <Radio value="over-50">50岁以上</Radio>
        </RadioGroup>
      </div>

      <Button type="submit">提交</Button>
    </form>
  )
}
```

### 卡片式单选框组

```vue
<script setup>
import { ref } from 'vue'
import { RadioGroup, Radio } from '@expcat/tigercat-vue'

const selectedPlan = ref('pro')
const plans = [
  { value: 'free', name: '免费版', price: '$0/月', description: '基础功能' },
  { value: 'pro', name: '专业版', price: '$29/月', description: '完整功能' },
  {
    value: 'enterprise',
    name: '企业版',
    price: '定制',
    description: '定制服务'
  }
]
</script>

<template>
  <RadioGroup v-model:value="selectedPlan" class="grid grid-cols-3 gap-4">
    <label
      v-for="plan in plans"
      :key="plan.value"
      class="border-2 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
      :class="{ 'border-blue-500 bg-blue-50': selectedPlan === plan.value }">
      <Radio :value="plan.value">
        <div class="ml-2">
          <div class="font-bold">{{ plan.name }}</div>
          <div class="text-2xl font-bold my-2">{{ plan.price }}</div>
          <div class="text-sm text-gray-600">{{ plan.description }}</div>
        </div>
      </Radio>
    </label>
  </RadioGroup>
</template>
```
