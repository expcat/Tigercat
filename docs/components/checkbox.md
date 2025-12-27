# Checkbox 多选框

多选框组件，支持单个复选框和复选框组，可用于表单中选择多个选项。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Checkbox } from '@tigercat/vue'

const checked = ref(false)
</script>

<template>
  <Checkbox v-model="checked">同意条款</Checkbox>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Checkbox } from '@tigercat/react'

function App() {
  const [checked, setChecked] = useState(false)

  return (
    <Checkbox checked={checked} onChange={setChecked}>
      同意条款
    </Checkbox>
  )
}
```

## 非受控模式

可以使用 `defaultChecked` 属性设置默认选中状态，组件内部管理状态。

### Vue 3

```vue
<template>
  <Checkbox :default-checked="true">默认选中</Checkbox>
</template>
```

### React

```tsx
<Checkbox defaultChecked={true}>默认选中</Checkbox>
```

## 禁用状态

通过 `disabled` 属性禁用复选框。

### Vue 3

```vue
<template>
  <Checkbox disabled>禁用状态</Checkbox>
  <Checkbox :model-value="true" disabled>已选中且禁用</Checkbox>
</template>
```

### React

```tsx
<>
  <Checkbox disabled>禁用状态</Checkbox>
  <Checkbox checked={true} disabled>已选中且禁用</Checkbox>
</>
```

## 不确定状态

通过 `indeterminate` 属性设置不确定状态，常用于"全选"功能。

### Vue 3

```vue
<script setup>
import { ref, computed } from 'vue'
import { Checkbox } from '@tigercat/vue'

const options = ref(['Apple', 'Banana', 'Orange'])
const checkedItems = ref(['Apple'])

const allChecked = computed(() => checkedItems.value.length === options.value.length)
const indeterminate = computed(() => 
  checkedItems.value.length > 0 && checkedItems.value.length < options.value.length
)

const handleCheckAll = (checked) => {
  checkedItems.value = checked ? [...options.value] : []
}
</script>

<template>
  <div>
    <Checkbox 
      :model-value="allChecked"
      :indeterminate="indeterminate"
      @change="handleCheckAll"
    >
      全选
    </Checkbox>
    <div v-for="item in options" :key="item">
      <Checkbox v-model="checkedItems" :value="item">{{ item }}</Checkbox>
    </div>
  </div>
</template>
```

### React

```tsx
import { useState, useMemo } from 'react'
import { Checkbox } from '@tigercat/react'

function App() {
  const options = ['Apple', 'Banana', 'Orange']
  const [checkedItems, setCheckedItems] = useState(['Apple'])

  const allChecked = useMemo(
    () => checkedItems.length === options.length,
    [checkedItems]
  )
  const indeterminate = useMemo(
    () => checkedItems.length > 0 && checkedItems.length < options.length,
    [checkedItems]
  )

  const handleCheckAll = (checked: boolean) => {
    setCheckedItems(checked ? [...options] : [])
  }

  return (
    <div>
      <Checkbox
        checked={allChecked}
        indeterminate={indeterminate}
        onChange={handleCheckAll}
      >
        全选
      </Checkbox>
      {options.map((item) => (
        <Checkbox
          key={item}
          value={item}
          checked={checkedItems.includes(item)}
          onChange={(checked) => {
            setCheckedItems(
              checked
                ? [...checkedItems, item]
                : checkedItems.filter((i) => i !== item)
            )
          }}
        >
          {item}
        </Checkbox>
      ))}
    </div>
  )
}
```

## 复选框组

使用 `CheckboxGroup` 组件可以方便地管理一组复选框。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Checkbox, CheckboxGroup } from '@tigercat/vue'

const selectedFruits = ref(['apple'])
</script>

<template>
  <CheckboxGroup v-model="selectedFruits">
    <Checkbox value="apple">苹果</Checkbox>
    <Checkbox value="banana">香蕉</Checkbox>
    <Checkbox value="orange">橙子</Checkbox>
  </CheckboxGroup>
  <p>已选择: {{ selectedFruits.join(', ') }}</p>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Checkbox, CheckboxGroup } from '@tigercat/react'

function App() {
  const [selectedFruits, setSelectedFruits] = useState(['apple'])

  return (
    <>
      <CheckboxGroup value={selectedFruits} onChange={setSelectedFruits}>
        <Checkbox value="apple">苹果</Checkbox>
        <Checkbox value="banana">香蕉</Checkbox>
        <Checkbox value="orange">橙子</Checkbox>
      </CheckboxGroup>
      <p>已选择: {selectedFruits.join(', ')}</p>
    </>
  )
}
```

## 复选框尺寸

复选框支持三种尺寸：`sm`（小）、`md`（中，默认）、`lg`（大）。

### Vue 3

```vue
<template>
  <Checkbox size="sm">小尺寸</Checkbox>
  <Checkbox size="md">中尺寸</Checkbox>
  <Checkbox size="lg">大尺寸</Checkbox>
</template>
```

### React

```tsx
<>
  <Checkbox size="sm">小尺寸</Checkbox>
  <Checkbox size="md">中尺寸</Checkbox>
  <Checkbox size="lg">大尺寸</Checkbox>
</>
```

## 复选框组尺寸

可以通过 `CheckboxGroup` 的 `size` 属性统一设置组内所有复选框的尺寸。

### Vue 3

```vue
<template>
  <CheckboxGroup v-model="selected" size="lg">
    <Checkbox value="1">选项 1</Checkbox>
    <Checkbox value="2">选项 2</Checkbox>
    <Checkbox value="3">选项 3</Checkbox>
  </CheckboxGroup>
</template>
```

### React

```tsx
<CheckboxGroup value={selected} onChange={setSelected} size="lg">
  <Checkbox value="1">选项 1</Checkbox>
  <Checkbox value="2">选项 2</Checkbox>
  <Checkbox value="3">选项 3</Checkbox>
</CheckboxGroup>
```

## 复选框组禁用

可以通过 `CheckboxGroup` 的 `disabled` 属性禁用组内所有复选框。

### Vue 3

```vue
<template>
  <CheckboxGroup v-model="selected" disabled>
    <Checkbox value="1">选项 1</Checkbox>
    <Checkbox value="2">选项 2</Checkbox>
    <Checkbox value="3">选项 3</Checkbox>
  </CheckboxGroup>
</template>
```

### React

```tsx
<CheckboxGroup value={selected} onChange={setSelected} disabled>
  <Checkbox value="1">选项 1</Checkbox>
  <Checkbox value="2">选项 2</Checkbox>
  <Checkbox value="3">选项 3</Checkbox>
</CheckboxGroup>
```

## API

### Checkbox Props / 属性

| 属性 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| size | 复选框尺寸 | `CheckboxSize` | `'md'` | `'sm'` \| `'md'` \| `'lg'` |
| disabled | 是否禁用 | `boolean` | `false` | `true` \| `false` |
| indeterminate | 是否处于不确定状态 | `boolean` | `false` | `true` \| `false` |
| value | 复选框的值（用于复选框组） | `string \| number \| boolean` | - | - |

#### Vue 专属属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 复选框选中状态（v-model） | `boolean` | - |
| defaultChecked | 默认选中状态（非受控模式） | `boolean` | `false` |

#### React 专属属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| checked | 复选框选中状态（受控模式） | `boolean` | - |
| defaultChecked | 默认选中状态（非受控模式） | `boolean` | `false` |
| onChange | 选中状态改变时的回调 | `(checked: boolean, event: ChangeEvent) => void` | - |
| className | 额外的 CSS 类名 | `string` | - |
| children | 复选框标签内容 | `React.ReactNode` | - |

### CheckboxGroup Props / 属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| disabled | 是否禁用所有复选框 | `boolean` | `false` |
| size | 复选框尺寸 | `CheckboxSize` | `'md'` |

#### Vue 专属属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 选中的值数组（v-model） | `(string \| number \| boolean)[]` | - |
| defaultValue | 默认选中的值数组（非受控模式） | `(string \| number \| boolean)[]` | `[]` |

#### React 专属属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value | 选中的值数组（受控模式） | `(string \| number \| boolean)[]` | - |
| defaultValue | 默认选中的值数组（非受控模式） | `(string \| number \| boolean)[]` | `[]` |
| onChange | 选中值改变时的回调 | `(value: (string \| number \| boolean)[]) => void` | - |
| className | 额外的 CSS 类名 | `string` | - |
| children | 复选框组内容 | `React.ReactNode` | - |

### Events / 事件 (Vue)

#### Checkbox

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 选中状态改变时触发 | `(value: boolean)` |
| change | 选中状态改变时触发 | `(value: boolean, event: Event)` |

#### CheckboxGroup

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 选中值改变时触发 | `(value: (string \| number \| boolean)[])` |
| change | 选中值改变时触发 | `(value: (string \| number \| boolean)[])` |

### Slots / 插槽 (Vue)

#### Checkbox

| 插槽名 | 说明 |
|--------|------|
| default | 复选框标签内容 |

#### CheckboxGroup

| 插槽名 | 说明 |
|--------|------|
| default | 复选框组内容 |

## 样式定制

Checkbox 组件使用 Tailwind CSS 构建，支持通过 CSS 变量进行主题配置。

### 主题颜色配置

```css
:root {
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;
  --tiger-primary-disabled: #93c5fd;
}

/* 自定义主题 */
.custom-theme {
  --tiger-primary: #10b981;
  --tiger-primary-hover: #059669;
  --tiger-primary-disabled: #6ee7b7;
}
```

查看完整的主题配置文档：[主题配置指南](../theme.md)

## 无障碍 (Accessibility)

- 复选框支持键盘操作（空格键切换选中状态）
- 在禁用状态下会自动设置 `disabled` 属性
- 使用 `focus:ring` 提供清晰的焦点指示器
- 支持不确定状态的视觉反馈
- 建议为复选框提供清晰的标签文本

## TypeScript 支持

Checkbox 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
// Core types
import type { 
  CheckboxProps, 
  CheckboxGroupProps, 
  CheckboxSize 
} from '@tigercat/core'

// Vue
import type { Checkbox, CheckboxGroup } from '@tigercat/vue'

// React
import type { 
  Checkbox, 
  CheckboxGroup,
  CheckboxProps as ReactCheckboxProps,
  CheckboxGroupProps as ReactCheckboxGroupProps
} from '@tigercat/react'
```

## 示例

### 表单中的复选框

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Checkbox, CheckboxGroup } from '@tigercat/vue'

const form = ref({
  agree: false,
  interests: [],
})

const handleSubmit = () => {
  console.log('Form data:', form.value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <Checkbox v-model="form.agree">我同意服务条款</Checkbox>
    </div>
    
    <div>
      <label>兴趣爱好：</label>
      <CheckboxGroup v-model="form.interests">
        <Checkbox value="reading">阅读</Checkbox>
        <Checkbox value="sports">运动</Checkbox>
        <Checkbox value="music">音乐</Checkbox>
        <Checkbox value="travel">旅行</Checkbox>
      </CheckboxGroup>
    </div>
    
    <button type="submit">提交</button>
  </form>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { Checkbox, CheckboxGroup } from '@tigercat/react'

function FormExample() {
  const [form, setForm] = useState({
    agree: false,
    interests: [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form data:', form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Checkbox
          checked={form.agree}
          onChange={(checked) => setForm({ ...form, agree: checked })}
        >
          我同意服务条款
        </Checkbox>
      </div>
      
      <div>
        <label>兴趣爱好：</label>
        <CheckboxGroup
          value={form.interests}
          onChange={(interests) => setForm({ ...form, interests })}
        >
          <Checkbox value="reading">阅读</Checkbox>
          <Checkbox value="sports">运动</Checkbox>
          <Checkbox value="music">音乐</Checkbox>
          <Checkbox value="travel">旅行</Checkbox>
        </CheckboxGroup>
      </div>
      
      <button type="submit">提交</button>
    </form>
  )
}
```
