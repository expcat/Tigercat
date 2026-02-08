---
name: tigercat-vue-form
description: Vue 3 form components usage - all support v-model
---

# Form Components (Vue 3)

表单组件，全部支持 `v-model` 双向绑定。

> **Props Reference**: [shared/props/form.md](../shared/props/form.md) | **Patterns**: [shared/patterns/common.md](../shared/patterns/common.md)

---

## Form & FormItem 表单

```vue
<script setup>
import { ref, reactive } from 'vue'
import { Form, FormItem, Input, Button, Space } from '@expcat/tigercat-vue'

const formRef = ref()
const form = reactive({ username: '', email: '' })
const rules = {
  username: [{ required: true, message: 'Required' }],
  email: [{ required: true }, { type: 'email', message: 'Invalid email' }]
}

const handleSubmit = ({ valid, values, errors }) => {
  if (valid) console.log('Form data:', values)
  else console.error('Validation errors:', errors)
}
</script>

<template>
  <!-- 基础校验 -->
  <Form ref="formRef" :model="form" :rules="rules" label-width="100px" @submit="handleSubmit">
    <FormItem name="username" label="Username">
      <Input v-model="form.username" />
    </FormItem>
    <FormItem name="email" label="Email">
      <Input v-model="form.email" />
    </FormItem>
    <FormItem>
      <Space>
        <Button type="submit" variant="primary">Submit</Button>
        <Button variant="secondary" @click="formRef.clearValidate()">Clear</Button>
        <Button variant="secondary" @click="formRef.resetFields()">Reset</Button>
      </Space>
    </FormItem>
  </Form>

  <!-- 布局变体: label 在顶部 -->
  <Form :model="form" label-position="top">
    <FormItem name="username" label="Username">
      <Input v-model="form.username" />
    </FormItem>
  </Form>

  <!-- 表单尺寸 -->
  <Form :model="form" size="sm"> ... </Form>
  <Form :model="form" size="lg"> ... </Form>

  <!-- 禁用表单 -->
  <Form :model="form" disabled> ... </Form>

  <!-- FormItem 级别规则 (覆盖 Form rules) -->
  <Form :model="form">
    <FormItem name="username" label="Username" :rules="[{ required: true, message: 'Required' }]">
      <Input v-model="form.username" />
    </FormItem>
  </Form>

  <!-- 关闭 FormItem 错误消息，让 Input 内部显示错误 -->
  <Form :model="form" :rules="rules">
    <FormItem name="email" label="Email" :show-message="false">
      <Input v-model="form.email" />
    </FormItem>
  </Form>
</template>
```

> **错误提示方式**：默认在 FormItem 下方显示错误信息（`show-message` 默认 `true`）。设置 `:show-message="false"` 可让 Input 内部显示错误（抖动 + 错误文字），推荐在 FormWizard 等紧凑布局中使用。
>
> **暴露方法**：通过 `ref` 获取 Form 实例后可调用 `validate()`、`validateFields(names)`、`validateField(name)`、`clearValidate(names?)`、`resetFields()`。

---

## Input 输入框

```vue
<script setup>
import { ref } from 'vue'
const value = ref('')
</script>

<template>
  <!-- Basic -->
  <Input v-model="value" placeholder="Enter text" />

  <!-- Sizes -->
  <Input v-model="value" size="sm" placeholder="Small" />
  <Input v-model="value" size="lg" placeholder="Large" />

  <!-- Types -->
  <Input v-model="value" type="password" />
  <Input type="number" placeholder="Number" />
  <Input type="email" placeholder="Email" />
  <Input type="tel" placeholder="Phone" />
  <Input type="url" placeholder="URL" />

  <!-- States -->
  <Input v-model="value" disabled />
  <Input v-model="value" readonly />

  <!-- Validation -->
  <Input v-model="value" status="error" error-message="Invalid" />
  <Input v-model="value" status="success" />
  <Input v-model="value" status="warning" />

  <!-- Prefix/Suffix Slots -->
  <Input v-model="value">
    <template #prefix>🔍</template>
    <template #suffix>USD</template>
  </Input>

  <!-- Prefix/Suffix Props -->
  <Input v-model="value" prefix="$" suffix=".00" />
</template>
```

---

## Textarea 文本域

```vue
<script setup>
import { ref } from 'vue'
const content = ref('')
</script>

<template>
  <!-- 基础 -->
  <Textarea v-model="content" :rows="4" placeholder="请输入内容" />

  <!-- 尺寸 -->
  <Textarea v-model="content" size="sm" />
  <Textarea v-model="content" size="lg" />

  <!-- 自动高度 -->
  <Textarea v-model="content" autoResize />
  <Textarea v-model="content" autoResize :minRows="2" :maxRows="6" />

  <!-- 字符计数 -->
  <Textarea v-model="content" showCount :maxLength="200" />

  <!-- 状态 -->
  <Textarea v-model="content" disabled />
  <Textarea v-model="content" readonly />
  <Textarea v-model="content" required />
</template>
```

---

## Select 选择器

```vue
<script setup>
const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' }
]
const groupedOptions = [
  {
    label: 'Group A',
    options: [
      { label: 'A-1', value: 'a1' },
      { label: 'A-2', value: 'a2' }
    ]
  }
]
</script>

<template>
  <Select v-model="value" :options="options" />
  <Select v-model="multiValue" :options="options" multiple />
  <Select v-model="value" :options="options" clearable searchable />
  <Select v-model="value" :options="groupedOptions" />
  <Select v-model="value" :options="options" size="sm" />
  <Select v-model="value" :options="[]" no-data-text="暂无数据" />
</template>
```

---

## Checkbox & CheckboxGroup

```vue
<script setup>
import { ref } from 'vue'
const checked = ref(false)
const checkedList = ref(['apple'])
</script>

<template>
  <Checkbox v-model="checked">Agree</Checkbox>
  <Checkbox v-model="checked" indeterminate>Partial</Checkbox>
  <CheckboxGroup v-model="checkedList">
    <Checkbox value="apple">Apple</Checkbox>
    <Checkbox value="banana">Banana</Checkbox>
  </CheckboxGroup>
</template>
```

---

## Radio & RadioGroup

```vue
<script setup>
import { ref } from 'vue'
const value = ref('male')
</script>

<template>
  <!-- 基础用法 -->
  <RadioGroup v-model:value="value">
    <Radio value="male">男</Radio>
    <Radio value="female">女</Radio>
    <Radio value="other">其他</Radio>
  </RadioGroup>

  <!-- 非受控 -->
  <RadioGroup default-value="male" @change="handleChange">
    <Radio value="a">A</Radio>
    <Radio value="b">B</Radio>
  </RadioGroup>

  <!-- 禁用 -->
  <RadioGroup v-model:value="value" disabled>
    <Radio value="a">A</Radio>
    <Radio value="b">B</Radio>
  </RadioGroup>

  <!-- 尺寸 -->
  <RadioGroup v-model:value="value" size="sm">
    <Radio value="a">A</Radio>
    <Radio value="b">B</Radio>
  </RadioGroup>

  <!-- 单独使用 -->
  <Radio value="standalone" :checked="checked" @update:checked="setChecked">独立选项</Radio>
</template>
```

---

## Switch 开关

```vue
<template>
  <Switch v-model:checked="enabled" />
  <Switch v-model:checked="enabled" size="sm" />
  <Switch v-model:checked="enabled" disabled />
</template>
```

---

## Slider 滑块

```vue
<template>
  <Slider v-model:value="value" />
  <Slider v-model:value="value" :min="0" :max="200" :step="10" />
  <Slider v-model:value="rangeValue" range :marks="marks" />
  <Slider :default-value="50" />
</template>
```

---

## DatePicker 日期选择器

```vue
<template>
  <DatePicker v-model="date" placeholder="Select date" />
  <DatePicker v-model="date" format="yyyy/MM/dd" />
  <DatePicker v-model="dateRange" range />
  <DatePicker v-model="date" size="sm" />
  <DatePicker v-model="date" :min-date="minDate" :max-date="maxDate" />
  <DatePicker v-model="date" disabled />
  <DatePicker v-model="date" clearable @clear="onClear" />
  <DatePicker v-model="date" locale="zh-CN" :labels="{ today: '今日' }" />
</template>
```

---

## TimePicker 时间选择器

```vue
<template>
  <TimePicker v-model="time" placeholder="Select time" />
  <TimePicker v-model="time" format="12" />
  <TimePicker v-model="time" :show-seconds="true" />
  <TimePicker v-model="time" :hour-step="2" :minute-step="15" />
  <TimePicker v-model="timeRange" range />
  <TimePicker v-model="time" size="sm" />
  <TimePicker v-model="time" min-time="09:00" max-time="18:00" />
  <TimePicker v-model="time" disabled />
  <TimePicker v-model="time" readonly />
  <TimePicker v-model="time" clearable @clear="onClear" />
  <TimePicker v-model="time" locale="zh-CN" :labels="{ now: '此刻' }" />
</template>
```

---

## Upload 上传

```vue
<template>
  <!-- 基础按钮上传 -->
  <Upload v-model:file-list="fileList" :limit="3" accept="image/*"> Click to Upload </Upload>

  <!-- 拖拽上传 -->
  <Upload v-model:file-list="fileList" drag />

  <!-- 自定义上传请求 -->
  <Upload v-model:file-list="fileList" :custom-request="simulateUpload" drag />
</template>
```
