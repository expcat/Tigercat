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
import { ref } from 'vue'
import { Form, FormItem, Input, Button } from '@expcat/tigercat-vue'

const formRef = ref()
const form = ref({ username: '', email: '' })
const rules = {
  username: [{ required: true, message: 'Required' }],
  email: [{ required: true }, { type: 'email', message: 'Invalid email' }]
}

const handleSubmit = async () => {
  if (await formRef.value.validate()) {
    console.log('Form data:', form.value)
  }
}
</script>

<template>
  <Form ref="formRef" :model="form" :rules="rules" label-width="100px">
    <FormItem prop="username" label="Username">
      <Input v-model="form.username" />
    </FormItem>
    <FormItem prop="email" label="Email">
      <Input v-model="form.email" />
    </FormItem>
    <FormItem>
      <Button @click="handleSubmit">Submit</Button>
      <Button variant="secondary" @click="formRef.resetFields()">Reset</Button>
    </FormItem>
  </Form>
</template>
```

> 错误提示方式：默认在 FormItem 下方显示错误信息（`show-message` 默认 `true`）。设置 `:show-message="false"` 可让 Input 内部显示错误（抖动 + 错误文字），推荐在 FormWizard 等紧凑布局中使用。

---

## Input 输入框

```vue
<script setup>
import { ref } from 'vue'
const value = ref('')
</script>

<template>
  <Input v-model="value" placeholder="Enter text" />
  <Input v-model="value" clearable />
  <Input v-model="value" type="password" />
  <Input v-model="value" status="error" error-message="Invalid" />

  <!-- Slots -->
  <Input v-model="value">
    <template #prefix>🔍</template>
    <template #suffix>USD</template>
  </Input>
</template>
```

---

## Textarea 文本域

```vue
<template>
  <Textarea v-model="content" :rows="4" />
  <Textarea v-model="content" autosize />
  <Textarea v-model="content" :autosize="{ minRows: 2, maxRows: 6 }" />
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
</script>

<template>
  <Select v-model="value" :options="options" />
  <Select v-model="multiValue" :options="options" multiple />
  <Select v-model="value" :options="options" clearable filterable />
</template>
```

---

## Checkbox & CheckboxGroup

```vue
<template>
  <Checkbox v-model="checked">Agree</Checkbox>
  <Checkbox v-model="checked" indeterminate>Partial</Checkbox>
  <CheckboxGroup v-model="checkedList" :options="options" />
</template>
```

---

## Radio & RadioGroup

```vue
<template>
  <RadioGroup v-model="value" :options="options" />
  <RadioGroup v-model="value" :options="options" button />
</template>
```

---

## Switch 开关

```vue
<template>
  <Switch v-model="enabled" />
  <Switch v-model="enabled" size="sm" />
  <Switch v-model="enabled" disabled />
</template>
```

---

## Slider 滑块

```vue
<template>
  <Slider v-model="value" />
  <Slider v-model="value" :min="0" :max="200" :step="10" />
  <Slider v-model="rangeValue" range show-tooltip />
</template>
```

---

## DatePicker 日期选择器

```vue
<template>
  <DatePicker v-model="date" placeholder="Select date" />
  <DatePicker v-model="date" format="YYYY/MM/DD" />
  <DatePicker v-model="dateRange" range />
</template>
```

---

## TimePicker 时间选择器

```vue
<template>
  <TimePicker v-model="time" placeholder="Select time" />
  <TimePicker v-model="time" format="HH:mm" />
</template>
```

---

## Upload 上传

```vue
<template>
  <Upload v-model:file-list="fileList" action="/api/upload" :limit="3" accept="image/*">
    <Button>Click to Upload</Button>
  </Upload>
  <Upload v-model:file-list="fileList" action="/api/upload" drag />
</template>
```
