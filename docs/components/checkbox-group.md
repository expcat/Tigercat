# CheckboxGroup 复选框组

用于管理一组复选框的组件，提供统一的状态管理和样式配置。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { CheckboxGroup, Checkbox } from '@tigercat/vue'

const selectedValues = ref(['apple', 'orange'])
const options = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'orange', label: '橙子' }
]
</script>

<template>
  <CheckboxGroup v-model="selectedValues">
    <Checkbox v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </Checkbox>
  </CheckboxGroup>
</template>
```

### React

```tsx
import { useState } from 'react'
import { CheckboxGroup, Checkbox } from '@tigercat/react'

function App() {
  const [selectedValues, setSelectedValues] = useState(['apple', 'orange'])
  const options = [
    { value: 'apple', label: '苹果' },
    { value: 'banana', label: '香蕉' },
    { value: 'orange', label: '橙子' }
  ]

  return (
    <CheckboxGroup value={selectedValues} onChange={setSelectedValues}>
      {options.map((option) => (
        <Checkbox key={option.value} value={option.value}>
          {option.label}
        </Checkbox>
      ))}
    </CheckboxGroup>
  )
}
```

## 统一尺寸 (Unified Size)

通过 CheckboxGroup 的 `size` 属性可以统一设置所有子复选框的尺寸（`sm`、`md`、`lg`）。

### Vue 3

```vue
<template>
  <CheckboxGroup v-model="selectedValues" size="lg">
    <Checkbox value="1">选项 1</Checkbox>
    <Checkbox value="2">选项 2</Checkbox>
  </CheckboxGroup>
</template>
```

### React

```tsx
<CheckboxGroup value={selectedValues} onChange={setSelectedValues} size="lg">
  <Checkbox value="1">选项 1</Checkbox>
  <Checkbox value="2">选项 2</Checkbox>
</CheckboxGroup>
```

## 统一禁用 (Unified Disabled)

通过 CheckboxGroup 的 `disabled` 属性可以统一禁用所有子复选框。

### Vue 3

```vue
<template>
  <CheckboxGroup v-model="selectedValues" disabled>
    <Checkbox value="1">选项 1</Checkbox>
    <Checkbox value="2">选项 2</Checkbox>
    <Checkbox value="3">选项 3</Checkbox>
  </CheckboxGroup>
</template>
```

### React

```tsx
<CheckboxGroup value={selectedValues} onChange={setSelectedValues} disabled>
  <Checkbox value="1">选项 1</Checkbox>
  <Checkbox value="2">选项 2</Checkbox>
  <Checkbox value="3">选项 3</Checkbox>
</CheckboxGroup>
```

## 受控与非受控模式

### 受控模式 (Controlled)

在受控模式下，选中值由父组件完全控制。

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { CheckboxGroup, Checkbox } from '@tigercat/vue'

const selectedValues = ref(['vue'])

const handleChange = (values) => {
  console.log('Selected values:', values)
  // 可以在这里添加验证逻辑
  if (values.length <= 2) {
    selectedValues.value = values
  }
}
</script>

<template>
  <CheckboxGroup :model-value="selectedValues" @change="handleChange">
    <Checkbox value="vue">Vue</Checkbox>
    <Checkbox value="react">React</Checkbox>
    <Checkbox value="angular">Angular</Checkbox>
  </CheckboxGroup>
  <p>已选择: {{ selectedValues.join(', ') }}</p>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { CheckboxGroup, Checkbox } from '@tigercat/react'

function ControlledExample() {
  const [selectedValues, setSelectedValues] = useState(['vue'])

  const handleChange = (values: (string | number | boolean)[]) => {
    console.log('Selected values:', values)
    // 可以在这里添加验证逻辑
    if (values.length <= 2) {
      setSelectedValues(values)
    }
  }

  return (
    <>
      <CheckboxGroup value={selectedValues} onChange={handleChange}>
        <Checkbox value="vue">Vue</Checkbox>
        <Checkbox value="react">React</Checkbox>
        <Checkbox value="angular">Angular</Checkbox>
      </CheckboxGroup>
      <p>已选择: {selectedValues.join(', ')}</p>
    </>
  )
}
```

### 非受控模式 (Uncontrolled)

在非受控模式下，组件自己管理选中状态。

#### Vue 3

```vue
<script setup>
import { CheckboxGroup, Checkbox } from '@tigercat/vue'

const handleChange = (values) => {
  console.log('Selected values:', values)
}
</script>

<template>
  <CheckboxGroup :default-value="['vue']" @change="handleChange">
    <Checkbox value="vue">Vue</Checkbox>
    <Checkbox value="react">React</Checkbox>
    <Checkbox value="angular">Angular</Checkbox>
  </CheckboxGroup>
</template>
```

#### React

```tsx
import { CheckboxGroup, Checkbox } from '@tigercat/react'

function UncontrolledExample() {
  const handleChange = (values: (string | number | boolean)[]) => {
    console.log('Selected values:', values)
  }

  return (
    <CheckboxGroup defaultValue={['vue']} onChange={handleChange}>
      <Checkbox value="vue">Vue</Checkbox>
      <Checkbox value="react">React</Checkbox>
      <Checkbox value="angular">Angular</Checkbox>
    </CheckboxGroup>
  )
}
```

## API

### Props / 属性

| 属性     | 说明               | 类型                   | 默认值  |
| -------- | ------------------ | ---------------------- | ------- |
| size     | 所有复选框的尺寸   | `'sm' \| 'md' \| 'lg'` | `'md'`  |
| disabled | 是否禁用所有复选框 | `boolean`              | `false` |

#### Vue 专属属性

| 属性         | 说明                     | 类型                              | 默认值 |
| ------------ | ------------------------ | --------------------------------- | ------ |
| modelValue   | 选中值（v-model）        | `(string \| number \| boolean)[]` | -      |
| defaultValue | 默认选中值（非受控模式） | `(string \| number \| boolean)[]` | `[]`   |

#### React 专属属性

| 属性         | 说明                     | 类型                                               | 默认值 |
| ------------ | ------------------------ | -------------------------------------------------- | ------ |
| value        | 选中值（受控模式）       | `(string \| number \| boolean)[]`                  | -      |
| defaultValue | 默认选中值（非受控模式） | `(string \| number \| boolean)[]`                  | `[]`   |
| onChange     | 值改变时的回调           | `(value: (string \| number \| boolean)[]) => void` | -      |
| className    | 额外的 CSS 类名          | `string`                                           | -      |
| children     | 子组件                   | `React.ReactNode`                                  | -      |

### Events / 事件 (Vue)

| 事件名            | 说明                        | 回调参数                                   |
| ----------------- | --------------------------- | ------------------------------------------ |
| update:modelValue | 选中值更新时触发（v-model） | `(value: (string \| number \| boolean)[])` |
| change            | 选中值改变时触发            | `(value: (string \| number \| boolean)[])` |

### Slots / 插槽 (Vue)

| 插槽名  | 说明                                     |
| ------- | ---------------------------------------- |
| default | CheckboxGroup 内容，应包含 Checkbox 组件 |

### Hooks / Context (React)

#### `useCheckboxGroup()`

在 Checkbox 组件内部使用，获取 CheckboxGroup 的上下文（内部实现细节，不作为公共 API 导出）。

```typescript
const context = useCheckboxGroup()
// context: CheckboxGroupContext | null

interface CheckboxGroupContext {
  value: (string | number | boolean)[]
  disabled: boolean
  size: CheckboxSize
  updateValue: (val: string | number | boolean, checked: boolean) => void
}
```

## 最佳实践

### 1. 限制选择数量

```vue
<script setup>
import { ref, watch } from 'vue'
import { CheckboxGroup, Checkbox } from '@tigercat/vue'

const selectedValues = ref([])
const maxSelection = 2

watch(selectedValues, (newValues) => {
  if (newValues.length > maxSelection) {
    selectedValues.value = newValues.slice(0, maxSelection)
  }
})
</script>

<template>
  <CheckboxGroup v-model="selectedValues">
    <Checkbox value="1">选项 1</Checkbox>
    <Checkbox value="2">选项 2</Checkbox>
    <Checkbox value="3">选项 3</Checkbox>
    <Checkbox value="4">选项 4</Checkbox>
  </CheckboxGroup>
  <p>最多选择 {{ maxSelection }} 项 (已选 {{ selectedValues.length }} 项)</p>
</template>
```

### 2. 动态选项

```tsx
import { useState } from 'react'
import { CheckboxGroup, Checkbox } from '@tigercat/react'

function DynamicOptions() {
  const [selectedValues, setSelectedValues] = useState([])
  const [options, setOptions] = useState([
    { value: '1', label: '选项 1' },
    { value: '2', label: '选项 2' }
  ])

  const addOption = () => {
    const newValue = String(options.length + 1)
    setOptions([...options, { value: newValue, label: `选项 ${newValue}` }])
  }

  return (
    <>
      <CheckboxGroup value={selectedValues} onChange={setSelectedValues}>
        {options.map((option) => (
          <Checkbox key={option.value} value={option.value}>
            {option.label}
          </Checkbox>
        ))}
      </CheckboxGroup>
      <button onClick={addOption}>添加选项</button>
    </>
  )
}
```

### 3. 垂直布局

```vue
<template>
  <CheckboxGroup v-model="selectedValues" class="flex flex-col gap-2">
    <Checkbox value="1">选项 1</Checkbox>
    <Checkbox value="2">选项 2</Checkbox>
    <Checkbox value="3">选项 3</Checkbox>
  </CheckboxGroup>
</template>
```

### 4. 网格布局

```tsx
<CheckboxGroup
  value={selectedValues}
  onChange={setSelectedValues}
  className="grid grid-cols-2 gap-4">
  <Checkbox value="1">选项 1</Checkbox>
  <Checkbox value="2">选项 2</Checkbox>
  <Checkbox value="3">选项 3</Checkbox>
  <Checkbox value="4">选项 4</Checkbox>
</CheckboxGroup>
```

## 常见问题

### 1. 为什么我的复选框没有响应选中？

确保在 CheckboxGroup 中使用的 Checkbox 设置了 `value` 属性，且该值与 CheckboxGroup 的 `modelValue`/`value` 数组中的值类型一致。

```vue
<!-- ✅ 正确 -->
<CheckboxGroup v-model="selectedValues">
  <Checkbox value="1">选项 1</Checkbox>
</CheckboxGroup>

<!-- ❌ 错误：没有设置 value -->
<CheckboxGroup v-model="selectedValues">
  <Checkbox>选项 1</Checkbox>
</CheckboxGroup>
```

### 2. 如何禁用单个复选框？

即使在 CheckboxGroup 中，也可以单独禁用某个 Checkbox：

```vue
<CheckboxGroup v-model="selectedValues">
  <Checkbox value="1">可选择</Checkbox>
  <Checkbox value="2" disabled>已禁用</Checkbox>
  <Checkbox value="3">可选择</Checkbox>
</CheckboxGroup>
```

### 3. 值的类型可以混用吗？

可以，CheckboxGroup 支持 `string`、`number` 和 `boolean` 类型的值混用：

```vue
<CheckboxGroup v-model="selectedValues">
  <Checkbox :value="1">数字 1</Checkbox>
  <Checkbox value="two">字符串 two</Checkbox>
  <Checkbox :value="true">布尔值 true</Checkbox>
</CheckboxGroup>
```

### 4. 如何实现全选功能？

参考 [Checkbox 文档](./checkbox.md#不确定状态) 中的全选示例。

## 无障碍 (Accessibility)

- CheckboxGroup 自动管理其内部 Checkbox 组件的状态
- 支持键盘导航（Tab 键在复选框间切换）
- 禁用状态会传递到所有子复选框
- 建议为 CheckboxGroup 添加合适的标签或说明文本

## TypeScript 支持

CheckboxGroup 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type { CheckboxGroupProps, CheckboxGroupContext } from '@tigercat/core'
// Vue
import type { CheckboxGroup } from '@tigercat/vue'
// React
import { CheckboxGroup, useCheckboxGroup } from '@tigercat/react'
```

## 相关组件

- [Checkbox 复选框](./checkbox.md) - 单个复选框组件
- [Radio 单选框](./radio.md) - 单选框组件
- [RadioGroup 单选框组](./radio-group.md) - 单选框组组件
- [Form 表单](./form.md) - 表单组件

## 示例

### 完整的表单示例

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { CheckboxGroup, Checkbox, Button } from '@tigercat/vue'

const interests = ref(['reading'])

const handleSubmit = () => {
  console.log('兴趣爱好:', interests.value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">选择您的兴趣爱好：</label>
      <CheckboxGroup v-model="interests" class="space-y-2">
        <Checkbox value="reading">阅读</Checkbox>
        <Checkbox value="sports">运动</Checkbox>
        <Checkbox value="music">音乐</Checkbox>
        <Checkbox value="travel">旅游</Checkbox>
        <Checkbox value="cooking">烹饪</Checkbox>
      </CheckboxGroup>
    </div>
    <Button type="submit">提交</Button>
  </form>
</template>
```

#### React

```tsx
import { useState, FormEvent } from 'react'
import { CheckboxGroup, Checkbox, Button } from '@tigercat/react'

function FormExample() {
  const [interests, setInterests] = useState(['reading'])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    console.log('兴趣爱好:', interests)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">选择您的兴趣爱好：</label>
        <CheckboxGroup value={interests} onChange={setInterests} className="space-y-2">
          <Checkbox value="reading">阅读</Checkbox>
          <Checkbox value="sports">运动</Checkbox>
          <Checkbox value="music">音乐</Checkbox>
          <Checkbox value="travel">旅游</Checkbox>
          <Checkbox value="cooking">烹饪</Checkbox>
        </CheckboxGroup>
      </div>
      <Button type="submit">提交</Button>
    </form>
  )
}
```
