# Checkbox 多选框

多选框组件，支持单个复选框和复选框组，可用于表单中选择多个选项。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Checkbox } from '@expcat/tigercat-vue'

const checked = ref(false)
</script>

<template>
  <Checkbox v-model="checked">同意条款</Checkbox>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Checkbox } from '@expcat/tigercat-react'

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
  <Checkbox checked={true} disabled>
    已选中且禁用
  </Checkbox>
</>
```

## 不确定状态

通过 `indeterminate` 属性设置不确定状态，常用于"全选"功能。

### Vue 3

```vue
<script setup>
import { ref, computed } from 'vue'
import { Checkbox, CheckboxGroup } from '@expcat/tigercat-vue'

const options = ref(['Apple', 'Banana', 'Orange'])
const checkedItems = ref(['Apple'])

const allChecked = computed(() => checkedItems.value.length === options.value.length)
const indeterminate = computed(
  () => checkedItems.value.length > 0 && checkedItems.value.length < options.value.length
)

const handleCheckAll = (checked) => {
  checkedItems.value = checked ? [...options.value] : []
}
</script>

<template>
  <div>
    <Checkbox :model-value="allChecked" :indeterminate="indeterminate" @change="handleCheckAll">
      全选
    </Checkbox>
    <CheckboxGroup v-model="checkedItems">
      <div v-for="item in options" :key="item">
        <Checkbox :value="item">{{ item }}</Checkbox>
      </div>
    </CheckboxGroup>
  </div>
</template>
```

### React

```tsx
import { useState, useMemo } from 'react'
import { Checkbox } from '@expcat/tigercat-react'

function App() {
  const options = ['Apple', 'Banana', 'Orange']
  const [checkedItems, setCheckedItems] = useState(['Apple'])

  const allChecked = useMemo(() => checkedItems.length === options.length, [checkedItems])
  const indeterminate = useMemo(
    () => checkedItems.length > 0 && checkedItems.length < options.length,
    [checkedItems]
  )

  const handleCheckAll = (checked: boolean) => {
    setCheckedItems(checked ? [...options] : [])
  }

  return (
    <div>
      <Checkbox checked={allChecked} indeterminate={indeterminate} onChange={handleCheckAll}>
        全选
      </Checkbox>
      {options.map((item) => (
        <Checkbox
          key={item}
          value={item}
          checked={checkedItems.includes(item)}
          onChange={(checked) => {
            setCheckedItems(
              checked ? [...checkedItems, item] : checkedItems.filter((i) => i !== item)
            )
          }}>
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
import { Checkbox, CheckboxGroup } from '@expcat/tigercat-vue'

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
import { Checkbox, CheckboxGroup } from '@expcat/tigercat-react'

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

| 属性          | 说明                       | 类型                          | 默认值  | 可选值                     |
| ------------- | -------------------------- | ----------------------------- | ------- | -------------------------- |
| size          | 复选框尺寸                 | `CheckboxSize`                | `'md'`  | `'sm'` \| `'md'` \| `'lg'` |
| disabled      | 是否禁用                   | `boolean`                     | `false` | `true` \| `false`          |
| indeterminate | 是否处于不确定状态         | `boolean`                     | `false` | `true` \| `false`          |
| value         | 复选框的值（用于复选框组） | `string \| number \| boolean` | -       | -                          |

#### Vue 专属属性

| 属性           | 说明                       | 类型      | 默认值  |
| -------------- | -------------------------- | --------- | ------- |
| modelValue     | 复选框选中状态（v-model）  | `boolean` | -       |
| defaultChecked | 默认选中状态（非受控模式） | `boolean` | `false` |

#### React 专属属性

| 属性           | 说明                       | 类型                                             | 默认值  |
| -------------- | -------------------------- | ------------------------------------------------ | ------- |
| checked        | 复选框选中状态（受控模式） | `boolean`                                        | -       |
| defaultChecked | 默认选中状态（非受控模式） | `boolean`                                        | `false` |
| onChange       | 选中状态改变时的回调       | `(checked: boolean, event: ChangeEvent) => void` | -       |
| className      | 额外的 CSS 类名            | `string`                                         | -       |
| children       | 复选框标签内容             | `React.ReactNode`                                | -       |

### CheckboxGroup Props / 属性

| 属性     | 说明               | 类型           | 默认值  |
| -------- | ------------------ | -------------- | ------- |
| disabled | 是否禁用所有复选框 | `boolean`      | `false` |
| size     | 复选框尺寸         | `CheckboxSize` | `'md'`  |

#### Vue 专属属性

| 属性         | 说明                           | 类型                              | 默认值 |
| ------------ | ------------------------------ | --------------------------------- | ------ |
| modelValue   | 选中的值数组（v-model）        | `(string \| number \| boolean)[]` | -      |
| defaultValue | 默认选中的值数组（非受控模式） | `(string \| number \| boolean)[]` | `[]`   |

#### React 专属属性

| 属性         | 说明                           | 类型                                               | 默认值 |
| ------------ | ------------------------------ | -------------------------------------------------- | ------ |
| value        | 选中的值数组（受控模式）       | `(string \| number \| boolean)[]`                  | -      |
| defaultValue | 默认选中的值数组（非受控模式） | `(string \| number \| boolean)[]`                  | `[]`   |
| onChange     | 选中值改变时的回调             | `(value: (string \| number \| boolean)[]) => void` | -      |
| className    | 额外的 CSS 类名                | `string`                                           | -      |
| children     | 复选框组内容                   | `React.ReactNode`                                  | -      |

### Events / 事件 (Vue)

#### Checkbox

| 事件名            | 说明               | 回调参数                         |
| ----------------- | ------------------ | -------------------------------- |
| update:modelValue | 选中状态改变时触发 | `(value: boolean)`               |
| change            | 选中状态改变时触发 | `(value: boolean, event: Event)` |

#### CheckboxGroup

| 事件名            | 说明             | 回调参数                                   |
| ----------------- | ---------------- | ------------------------------------------ |
| update:modelValue | 选中值改变时触发 | `(value: (string \| number \| boolean)[])` |
| change            | 选中值改变时触发 | `(value: (string \| number \| boolean)[])` |

### Slots / 插槽 (Vue)

#### Checkbox

| 插槽名  | 说明           |
| ------- | -------------- |
| default | 复选框标签内容 |

#### CheckboxGroup

| 插槽名  | 说明         |
| ------- | ------------ |
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

## CheckboxGroup 使用

当需要管理一组复选框时，建议使用 CheckboxGroup 组件。它提供了统一的状态管理和样式配置。

详细文档请参考：[CheckboxGroup 复选框组](./checkbox-group.md)

### 基本示例

```vue
<script setup>
import { ref } from 'vue'
import { CheckboxGroup, Checkbox } from '@expcat/tigercat-vue'

const selectedValues = ref(['apple', 'banana'])
</script>

<template>
  <CheckboxGroup v-model="selectedValues">
    <Checkbox value="apple">苹果</Checkbox>
    <Checkbox value="banana">香蕉</Checkbox>
    <Checkbox value="orange">橙子</Checkbox>
  </CheckboxGroup>
</template>
```

## 表单验证

Checkbox 可以与 Form 和 FormItem 组件配合使用，实现表单验证。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Form, FormItem, Checkbox, CheckboxGroup, Button } from '@expcat/tigercat-vue'

const formData = ref({
  agree: false,
  interests: []
})

const rules = {
  agree: [
    {
      validator: (value) => value === true,
      message: '请同意服务条款'
    }
  ],
  interests: [
    {
      validator: (value) => value.length > 0,
      message: '请至少选择一项兴趣'
    }
  ]
}

const formRef = ref(null)

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    console.log('表单验证通过:', formData.value)
  }
}
</script>

<template>
  <Form ref="formRef" :model="formData" :rules="rules">
    <FormItem name="agree" required>
      <Checkbox v-model="formData.agree"> 我已阅读并同意《用户协议》和《隐私政策》 </Checkbox>
    </FormItem>

    <FormItem label="兴趣爱好" name="interests" required>
      <CheckboxGroup v-model="formData.interests">
        <Checkbox value="reading">阅读</Checkbox>
        <Checkbox value="sports">运动</Checkbox>
        <Checkbox value="music">音乐</Checkbox>
        <Checkbox value="travel">旅行</Checkbox>
      </CheckboxGroup>
    </FormItem>

    <FormItem>
      <Button @click="handleSubmit">提交</Button>
    </FormItem>
  </Form>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Form, FormItem, Checkbox, CheckboxGroup, Button } from '@expcat/tigercat-react'

function ValidationExample() {
  const [formData, setFormData] = useState({
    agree: false,
    interests: []
  })

  const rules = {
    agree: [
      {
        validator: (value: boolean) => value === true,
        message: '请同意服务条款'
      }
    ],
    interests: [
      {
        validator: (value: unknown[]) => value.length > 0,
        message: '请至少选择一项兴趣'
      }
    ]
  }

  const handleSubmit = async () => {
    // 表单验证逻辑
    console.log('表单数据:', formData)
  }

  return (
    <Form model={formData} rules={rules}>
      <FormItem name="agree" required>
        <Checkbox
          checked={formData.agree}
          onChange={(checked) => setFormData({ ...formData, agree: checked })}>
          我已阅读并同意《用户协议》和《隐私政策》
        </Checkbox>
      </FormItem>

      <FormItem label="兴趣爱好" name="interests" required>
        <CheckboxGroup
          value={formData.interests}
          onChange={(interests) => setFormData({ ...formData, interests })}>
          <Checkbox value="reading">阅读</Checkbox>
          <Checkbox value="sports">运动</Checkbox>
          <Checkbox value="music">音乐</Checkbox>
          <Checkbox value="travel">旅行</Checkbox>
        </CheckboxGroup>
      </FormItem>

      <FormItem>
        <Button onClick={handleSubmit}>提交</Button>
      </FormItem>
    </Form>
  )
}
```

## 最佳实践

### 1. 使用清晰的标签

确保复选框的标签清晰明确，用户能够理解选择的含义。

```vue
<!-- ✅ 好的实践 -->
<Checkbox v-model="emailNotifications">
  接收每周邮件通知
</Checkbox>

<!-- ❌ 不好的实践 -->
<Checkbox v-model="emailNotifications">
  邮件
</Checkbox>
```

### 2. 限制选择数量

当使用 CheckboxGroup 时，可以限制用户的最大选择数量。

```vue
<script setup>
import { ref, watch } from 'vue'

const selectedValues = ref([])
const maxSelection = 3

watch(selectedValues, (newValues) => {
  if (newValues.length > maxSelection) {
    selectedValues.value = newValues.slice(0, maxSelection)
  }
})
</script>

<template>
  <div>
    <CheckboxGroup v-model="selectedValues">
      <Checkbox value="1">选项 1</Checkbox>
      <Checkbox value="2">选项 2</Checkbox>
      <Checkbox value="3">选项 3</Checkbox>
      <Checkbox value="4">选项 4</Checkbox>
    </CheckboxGroup>
    <p class="text-sm text-gray-500">已选择 {{ selectedValues.length }} / {{ maxSelection }}</p>
  </div>
</template>
```

### 3. 提供禁用说明

当禁用复选框时，最好提供说明原因。

```vue
<template>
  <div>
    <Checkbox v-model="premium" disabled> 高级功能（需要升级到专业版） </Checkbox>
  </div>
</template>
```

### 4. 使用不确定状态表示部分选中

```vue
<script setup>
import { ref, computed } from 'vue'

const allItems = ['item1', 'item2', 'item3']
const selectedItems = ref(['item1'])

const allChecked = computed(() => selectedItems.value.length === allItems.length)
const indeterminate = computed(() => selectedItems.value.length > 0 && !allChecked.value)

const toggleAll = (checked) => {
  selectedItems.value = checked ? [...allItems] : []
}
</script>

<template>
  <div>
    <Checkbox
      :model-value="allChecked"
      :indeterminate="indeterminate"
      @update:model-value="toggleAll">
      全选
    </Checkbox>
    <CheckboxGroup v-model="selectedItems" class="ml-4">
      <Checkbox value="item1">项目 1</Checkbox>
      <Checkbox value="item2">项目 2</Checkbox>
      <Checkbox value="item3">项目 3</Checkbox>
    </CheckboxGroup>
  </div>
</template>
```

## 常见问题

### 1. 为什么 CheckboxGroup 中的复选框没有响应？

确保在 CheckboxGroup 中的 Checkbox 设置了 `value` 属性：

```vue
<!-- ✅ 正确 -->
<CheckboxGroup v-model="selectedValues">
  <Checkbox value="option1">选项 1</Checkbox>
</CheckboxGroup>

<!-- ❌ 错误：没有 value -->
<CheckboxGroup v-model="selectedValues">
  <Checkbox>选项 1</Checkbox>
</CheckboxGroup>
```

### 2. 如何实现条件禁用？

可以根据其他状态动态设置 `disabled` 属性：

```vue
<script setup>
const isPremiumUser = ref(false)
</script>

<template>
  <Checkbox :disabled="!isPremiumUser" v-model="advancedFeature">
    高级功能（仅限高级用户）
  </Checkbox>
</template>
```

### 3. v-model 和 onChange 哪个更好？

- Vue 中使用 `v-model` 更简洁
- React 中使用 `checked` + `onChange` 组合
- 两者都支持，根据使用场景选择

## TypeScript 支持

Checkbox 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
// Core types
import type { CheckboxProps, CheckboxGroupProps, CheckboxSize } from '@expcat/tigercat-core'

// Vue
import type { Checkbox, CheckboxGroup } from '@expcat/tigercat-vue'

// React
import type {
  Checkbox,
  CheckboxGroup,
  CheckboxProps as ReactCheckboxProps,
  CheckboxGroupProps as ReactCheckboxGroupProps
} from '@expcat/tigercat-react'
```

## 相关组件

- [CheckboxGroup 复选框组](./checkbox-group.md) - 管理一组复选框
- [Radio 单选框](./radio.md) - 单选框组件
- [RadioGroup 单选框组](./radio-group.md) - 单选框组组件
- [Form 表单](./form.md) - 表单容器组件
- [FormItem 表单项](./form-item.md) - 表单项组件

## 示例

### 表单中的复选框

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Checkbox, CheckboxGroup } from '@expcat/tigercat-vue'

const form = ref({
  agree: false,
  interests: []
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
import { Checkbox, CheckboxGroup } from '@expcat/tigercat-react'

function FormExample() {
  const [form, setForm] = useState({
    agree: false,
    interests: []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form data:', form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Checkbox checked={form.agree} onChange={(checked) => setForm({ ...form, agree: checked })}>
          我同意服务条款
        </Checkbox>
      </div>

      <div>
        <label>兴趣爱好：</label>
        <CheckboxGroup
          value={form.interests}
          onChange={(interests) => setForm({ ...form, interests })}>
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
