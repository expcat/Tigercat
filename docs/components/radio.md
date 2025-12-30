# Radio 单选框

单选框组件，支持单独使用或分组使用，支持受控和非受控模式，完整的键盘导航支持。

## 基本用法

### Vue 3

```vue
<script setup>
import { Radio } from '@tigercat/vue'
</script>

<template>
  <Radio value="option1">Option 1</Radio>
  <Radio value="option2">Option 2</Radio>
</template>
```

### React

```tsx
import { Radio } from '@tigercat/react'

function App() {
  return (
    <>
      <Radio value="option1">Option 1</Radio>
      <Radio value="option2">Option 2</Radio>
    </>
  )
}
```

## 单选框组 (Radio Group)

使用 RadioGroup 可以轻松管理一组单选框。

### Vue 3 - 受控模式

```vue
<script setup>
import { ref } from 'vue'
import { RadioGroup, Radio } from '@tigercat/vue'

const selected = ref('option1')
</script>

<template>
  <RadioGroup v-model:value="selected">
    <Radio value="option1">Option 1</Radio>
    <Radio value="option2">Option 2</Radio>
    <Radio value="option3">Option 3</Radio>
  </RadioGroup>
  
  <p>Selected: {{ selected }}</p>
</template>
```

### Vue 3 - 非受控模式

```vue
<script setup>
import { RadioGroup, Radio } from '@tigercat/vue'

const handleChange = (value) => {
  console.log('Changed to:', value)
}
</script>

<template>
  <RadioGroup default-value="option2" @change="handleChange">
    <Radio value="option1">Option 1</Radio>
    <Radio value="option2">Option 2</Radio>
    <Radio value="option3">Option 3</Radio>
  </RadioGroup>
</template>
```

### React - 受控模式

```tsx
import { useState } from 'react'
import { RadioGroup, Radio } from '@tigercat/react'

function App() {
  const [selected, setSelected] = useState('option1')

  return (
    <>
      <RadioGroup value={selected} onChange={setSelected}>
        <Radio value="option1">Option 1</Radio>
        <Radio value="option2">Option 2</Radio>
        <Radio value="option3">Option 3</Radio>
      </RadioGroup>
      
      <p>Selected: {selected}</p>
    </>
  )
}
```

### React - 非受控模式

```tsx
import { RadioGroup, Radio } from '@tigercat/react'

function App() {
  const handleChange = (value) => {
    console.log('Changed to:', value)
  }

  return (
    <RadioGroup defaultValue="option2" onChange={handleChange}>
      <Radio value="option1">Option 1</Radio>
      <Radio value="option2">Option 2</Radio>
      <Radio value="option3">Option 3</Radio>
    </RadioGroup>
  )
}
```

## 单选框尺寸 (Sizes)

Radio 组件支持 3 种不同的尺寸：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸

### Vue 3

```vue
<template>
  <RadioGroup size="sm" default-value="option1">
    <Radio value="option1">Small Radio</Radio>
    <Radio value="option2">Small Radio</Radio>
  </RadioGroup>
  
  <RadioGroup size="md" default-value="option1">
    <Radio value="option1">Medium Radio</Radio>
    <Radio value="option2">Medium Radio</Radio>
  </RadioGroup>
  
  <RadioGroup size="lg" default-value="option1">
    <Radio value="option1">Large Radio</Radio>
    <Radio value="option2">Large Radio</Radio>
  </RadioGroup>
</template>
```

### React

```tsx
<>
  <RadioGroup size="sm" defaultValue="option1">
    <Radio value="option1">Small Radio</Radio>
    <Radio value="option2">Small Radio</Radio>
  </RadioGroup>
  
  <RadioGroup size="md" defaultValue="option1">
    <Radio value="option1">Medium Radio</Radio>
    <Radio value="option2">Medium Radio</Radio>
  </RadioGroup>
  
  <RadioGroup size="lg" defaultValue="option1">
    <Radio value="option1">Large Radio</Radio>
    <Radio value="option2">Large Radio</Radio>
  </RadioGroup>
</>
```

## 禁用状态 (Disabled)

### 禁用整个组

#### Vue 3

```vue
<template>
  <RadioGroup disabled default-value="option1">
    <Radio value="option1">Option 1</Radio>
    <Radio value="option2">Option 2</Radio>
    <Radio value="option3">Option 3</Radio>
  </RadioGroup>
</template>
```

#### React

```tsx
<RadioGroup disabled defaultValue="option1">
  <Radio value="option1">Option 1</Radio>
  <Radio value="option2">Option 2</Radio>
  <Radio value="option3">Option 3</Radio>
</RadioGroup>
```

### 禁用单个选项

#### Vue 3

```vue
<template>
  <RadioGroup default-value="option1">
    <Radio value="option1">Option 1</Radio>
    <Radio value="option2" disabled>Option 2 (Disabled)</Radio>
    <Radio value="option3">Option 3</Radio>
  </RadioGroup>
</template>
```

#### React

```tsx
<RadioGroup defaultValue="option1">
  <Radio value="option1">Option 1</Radio>
  <Radio value="option2" disabled>Option 2 (Disabled)</Radio>
  <Radio value="option3">Option 3</Radio>
</RadioGroup>
```

## 键盘导航 (Keyboard Navigation)

Radio 组件支持完整的键盘导航：

- `Tab` - 聚焦到单选框组
- `↑` / `←` - 选择上一个选项
- `↓` / `→` - 选择下一个选项
- `Space` / `Enter` - 选中当前聚焦的选项

### Vue 3

```vue
<template>
  <RadioGroup default-value="option1">
    <Radio value="option1">Use arrow keys to navigate</Radio>
    <Radio value="option2">Option 2</Radio>
    <Radio value="option3">Option 3</Radio>
    <Radio value="option4">Option 4</Radio>
  </RadioGroup>
</template>
```

### React

```tsx
<RadioGroup defaultValue="option1">
  <Radio value="option1">Use arrow keys to navigate</Radio>
  <Radio value="option2">Option 2</Radio>
  <Radio value="option3">Option 3</Radio>
  <Radio value="option4">Option 4</Radio>
</RadioGroup>
```

## 数字值 (Numeric Values)

Radio 组件支持字符串和数字值。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { RadioGroup, Radio } from '@tigercat/vue'

const quantity = ref(1)
</script>

<template>
  <RadioGroup v-model:value="quantity">
    <Radio :value="1">1 item</Radio>
    <Radio :value="2">2 items</Radio>
    <Radio :value="5">5 items</Radio>
    <Radio :value="10">10 items</Radio>
  </RadioGroup>
  
  <p>Quantity: {{ quantity }}</p>
</template>
```

### React

```tsx
import { useState } from 'react'
import { RadioGroup, Radio } from '@tigercat/react'

function App() {
  const [quantity, setQuantity] = useState(1)

  return (
    <>
      <RadioGroup value={quantity} onChange={setQuantity}>
        <Radio value={1}>1 item</Radio>
        <Radio value={2}>2 items</Radio>
        <Radio value={5}>5 items</Radio>
        <Radio value={10}>10 items</Radio>
      </RadioGroup>
      
      <p>Quantity: {quantity}</p>
    </>
  )
}
```

## API

### Radio Props / 属性

| 属性 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| value | 单选框的值（必填） | `string \| number` | - | - |
| size | 单选框尺寸 | `RadioSize` | `'md'` | `'sm'` \| `'md'` \| `'lg'` |
| disabled | 是否禁用 | `boolean` | `false` | `true` \| `false` |
| name | 原生 name 属性 | `string` | - | - |
| checked | 是否选中（受控模式） | `boolean` | - | `true` \| `false` |

#### React 专属属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| onChange | 选中状态变化时的回调 | `(value: string \| number) => void` | - |
| className | 额外的 CSS 类名 | `string` | - |
| children | 单选框标签内容 | `React.ReactNode` | - |

### Radio Events / 事件 (Vue)

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 选中状态变化时触发 | `(value: string \| number)` |
| update:checked | 更新 checked 状态（v-model） | `(checked: boolean)` |

### Radio Slots / 插槽 (Vue)

| 插槽名 | 说明 |
|--------|------|
| default | 单选框标签内容 |

### RadioGroup Props / 属性

| 属性 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| value | 当前选中的值（受控模式） | `string \| number` | - | - |
| defaultValue | 默认选中的值（非受控模式） | `string \| number` | - | - |
| name | 原生 name 属性 | `string` | 自动生成 | - |
| disabled | 是否禁用所有选项 | `boolean` | `false` | `true` \| `false` |
| size | 所有选项的尺寸 | `RadioSize` | `'md'` | `'sm'` \| `'md'` \| `'lg'` |

#### React 专属属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| onChange | 选中值变化时的回调 | `(value: string \| number) => void` | - |
| className | 额外的 CSS 类名 | `string` | - |
| children | RadioGroup 的子元素 | `React.ReactNode` | - |

### RadioGroup Events / 事件 (Vue)

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 选中值变化时触发 | `(value: string \| number)` |
| update:value | 更新 value 状态（v-model） | `(value: string \| number)` |

### RadioGroup Slots / 插槽 (Vue)

| 插槽名 | 说明 |
|--------|------|
| default | RadioGroup 的内容（Radio 组件） |

## 样式定制

Radio 组件使用 Tailwind CSS 构建，支持通过 CSS 变量进行主题配置。

### 主题颜色配置

Radio 组件使用与 Button 相同的主题变量来保持一致性。

#### 使用 CSS 变量

```css
/* 默认主题 */
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

#### 使用 JavaScript API

**Vue 3:**

```vue
<script setup>
import { RadioGroup, Radio, setThemeColors } from '@tigercat/vue'

const switchTheme = () => {
  setThemeColors({
    primary: '#10b981',
    primaryHover: '#059669',
    primaryDisabled: '#6ee7b7',
  })
}
</script>

<template>
  <button @click="switchTheme">切换主题</button>
  <RadioGroup default-value="option1">
    <Radio value="option1">Option 1</Radio>
    <Radio value="option2">Option 2</Radio>
  </RadioGroup>
</template>
```

**React:**

```tsx
import { RadioGroup, Radio, setThemeColors } from '@tigercat/react'

function App() {
  const switchTheme = () => {
    setThemeColors({
      primary: '#10b981',
      primaryHover: '#059669',
      primaryDisabled: '#6ee7b7',
    })
  }

  return (
    <>
      <button onClick={switchTheme}>切换主题</button>
      <RadioGroup defaultValue="option1">
        <Radio value="option1">Option 1</Radio>
        <Radio value="option2">Option 2</Radio>
      </RadioGroup>
    </>
  )
}
```

查看完整的主题配置文档：[主题配置指南](../theme.md)

## 无障碍 (Accessibility)

- 使用原生的 `<input type="radio">` 元素确保屏幕阅读器兼容性
- 支持完整的键盘导航（Tab、箭头键、Space、Enter）
- 使用 `role="radiogroup"` 标识单选框组
- 禁用状态会自动设置相应的 ARIA 属性
- 使用 `sr-only` 类隐藏原生 radio，保留可访问性
- 提供清晰的焦点指示器

## TypeScript 支持

Radio 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type { RadioProps, RadioGroupProps, RadioSize } from '@tigercat/core'
// Vue
import type { Radio, RadioGroup } from '@tigercat/vue'
// React
import type { Radio, RadioGroup, RadioProps as ReactRadioProps, RadioGroupProps as ReactRadioGroupProps } from '@tigercat/react'
```

## 示例

### 表单集成

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { RadioGroup, Radio, Button } from '@tigercat/vue'

const preference = ref('email')

const handleSubmit = () => {
  console.log('Notification preference:', preference.value)
  // 提交表单
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-4">
      <label class="block mb-2 font-semibold">通知偏好设置</label>
      <RadioGroup v-model:value="preference">
        <Radio value="email">Email</Radio>
        <Radio value="sms">SMS</Radio>
        <Radio value="push">Push Notification</Radio>
        <Radio value="none">No Notifications</Radio>
      </RadioGroup>
    </div>
    <Button type="submit">Save Preferences</Button>
  </form>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { RadioGroup, Radio, Button } from '@tigercat/react'

function PreferenceForm() {
  const [preference, setPreference] = useState('email')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Notification preference:', preference)
    // 提交表单
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">通知偏好设置</label>
        <RadioGroup value={preference} onChange={setPreference}>
          <Radio value="email">Email</Radio>
          <Radio value="sms">SMS</Radio>
          <Radio value="push">Push Notification</Radio>
          <Radio value="none">No Notifications</Radio>
        </RadioGroup>
      </div>
      <Button type="submit">Save Preferences</Button>
    </form>
  )
}
```

### 自定义布局

#### Vue 3

```vue
<template>
  <RadioGroup default-value="standard">
    <div class="grid grid-cols-2 gap-4">
      <Radio value="standard" class="border p-4 rounded-lg hover:bg-gray-50">
        <div class="font-semibold">Standard</div>
        <div class="text-sm text-gray-500">Free shipping (5-7 days)</div>
      </Radio>
      <Radio value="express" class="border p-4 rounded-lg hover:bg-gray-50">
        <div class="font-semibold">Express</div>
        <div class="text-sm text-gray-500">$10 (2-3 days)</div>
      </Radio>
      <Radio value="overnight" class="border p-4 rounded-lg hover:bg-gray-50">
        <div class="font-semibold">Overnight</div>
        <div class="text-sm text-gray-500">$25 (1 day)</div>
      </Radio>
      <Radio value="pickup" class="border p-4 rounded-lg hover:bg-gray-50">
        <div class="font-semibold">Pickup</div>
        <div class="text-sm text-gray-500">Free (Today)</div>
      </Radio>
    </div>
  </RadioGroup>
</template>
```

#### React

```tsx
<RadioGroup defaultValue="standard">
  <div className="grid grid-cols-2 gap-4">
    <Radio value="standard" className="border p-4 rounded-lg hover:bg-gray-50">
      <div className="font-semibold">Standard</div>
      <div className="text-sm text-gray-500">Free shipping (5-7 days)</div>
    </Radio>
    <Radio value="express" className="border p-4 rounded-lg hover:bg-gray-50">
      <div className="font-semibold">Express</div>
      <div className="text-sm text-gray-500">$10 (2-3 days)</div>
    </Radio>
    <Radio value="overnight" className="border p-4 rounded-lg hover:bg-gray-50">
      <div className="font-semibold">Overnight</div>
      <div className="text-sm text-gray-500">$25 (1 day)</div>
    </Radio>
    <Radio value="pickup" className="border p-4 rounded-lg hover:bg-gray-50">
      <div className="font-semibold">Pickup</div>
      <div className="text-sm text-gray-500">Free (Today)</div>
    </Radio>
  </div>
</RadioGroup>
```

### 水平布局

#### Vue 3

```vue
<template>
  <RadioGroup default-value="option1">
    <div class="flex gap-4">
      <Radio value="option1">Option 1</Radio>
      <Radio value="option2">Option 2</Radio>
      <Radio value="option3">Option 3</Radio>
    </div>
  </RadioGroup>
</template>
```

#### React

```tsx
<RadioGroup defaultValue="option1">
  <div className="flex gap-4">
    <Radio value="option1">Option 1</Radio>
    <Radio value="option2">Option 2</Radio>
    <Radio value="option3">Option 3</Radio>
  </div>
</RadioGroup>
```

## RadioGroup 使用

当需要管理一组单选框时，建议使用 RadioGroup 组件。它提供了统一的状态管理、键盘导航和样式配置。

详细文档请参考：[RadioGroup 单选框组](./radio-group.md)

## 表单验证

Radio 可以与 Form 和 FormItem 组件配合使用，实现表单验证。详细示例请参考 [RadioGroup 文档](./radio-group.md#表单验证)。

## 最佳实践

### 1. 使用 RadioGroup 管理一组选项

始终使用 RadioGroup 来管理相关的单选框，而不是使用独立的 Radio 组件。

### 2. 提供清晰的标签

确保单选框的标签清晰明确，避免歧义。

### 3. 限制选项数量

单选框选项不宜过多（建议不超过 7 个）。选项过多时考虑使用 Select 组件。

### 4. 提供默认选项

通常应该为 RadioGroup 提供一个默认选中的选项。

## 常见问题

### 1. 为什么 RadioGroup 中的单选框不能切换？

确保在 RadioGroup 中的 Radio 设置了唯一的 `value` 属性。

### 2. 单选框和复选框如何选择？

- **单选框（Radio）**：用户只能选择一个选项（如性别、支付方式）
- **复选框（Checkbox）**：用户可以选择多个选项（如兴趣爱好、功能偏好）

## 相关组件

- [RadioGroup 单选框组](./radio-group.md) - 管理一组单选框
- [Checkbox 复选框](./checkbox.md) - 复选框组件  
- [CheckboxGroup 复选框组](./checkbox-group.md) - 复选框组组件
- [Select 选择器](./select.md) - 下拉选择组件
- [Form 表单](./form.md) - 表单容器组件
- [FormItem 表单项](./form-item.md) - 表单项组件
