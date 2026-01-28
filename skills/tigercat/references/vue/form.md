---
name: tigercat-vue-form
description: Vue 3 form components - Checkbox, CheckboxGroup, DatePicker, Form, FormItem, Input, Radio, RadioGroup, Select, Slider, Switch, Textarea, TimePicker, Upload. All support v-model.
---

# Form Components (Vue 3)

表单组件，全部支持 `v-model` 双向绑定。

## Form & FormItem 表单

```vue
<script setup>
import { ref } from 'vue'
import { Form, FormItem, Input, Button } from '@expcat/tigercat-vue'

const formRef = ref()
const form = ref({
  username: '',
  email: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: 'Username is required' },
    { min: 3, max: 20, message: 'Length must be 3-20' }
  ],
  email: [
    { required: true, message: 'Email is required' },
    { type: 'email', message: 'Invalid email format' }
  ],
  password: [
    { required: true, message: 'Password is required' },
    { min: 6, message: 'At least 6 characters' }
  ]
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate()
  if (valid) {
    console.log('Form data:', form.value)
  }
}

const handleReset = () => {
  formRef.value.resetFields()
}
</script>

<template>
  <Form ref="formRef" :model="form" :rules="rules" label-width="100px">
    <FormItem prop="username" label="Username">
      <Input v-model="form.username" placeholder="Enter username" />
    </FormItem>
    <FormItem prop="email" label="Email">
      <Input v-model="form.email" placeholder="Enter email" />
    </FormItem>
    <FormItem prop="password" label="Password">
      <Input v-model="form.password" type="password" placeholder="Enter password" />
    </FormItem>
    <FormItem>
      <Button @click="handleSubmit">Submit</Button>
      <Button variant="secondary" @click="handleReset">Reset</Button>
    </FormItem>
  </Form>
</template>
```

**Form Props:**

| Prop          | Type                         | Default   | Description    |
| ------------- | ---------------------------- | --------- | -------------- |
| model         | `object`                     | -         | 表单数据对象   |
| rules         | `object`                     | -         | 校验规则       |
| labelWidth    | `string \| number`           | -         | 标签宽度       |
| labelPosition | `'left' \| 'right' \| 'top'` | `'right'` | 标签位置       |
| disabled      | `boolean`                    | `false`   | 禁用所有表单项 |

**Form Methods:**

- `validate(): Promise<boolean>` - 验证表单
- `validateField(prop): Promise<boolean>` - 验证单个字段
- `resetFields()` - 重置表单
- `clearValidate(props?)` - 清除验证状态

**FormItem Props:**

| Prop     | Type      | Default | Description                   |
| -------- | --------- | ------- | ----------------------------- |
| prop     | `string`  | -       | 字段名（对应 model 中的 key） |
| label    | `string`  | -       | 标签文本                      |
| required | `boolean` | `false` | 必填标记                      |
| error    | `string`  | -       | 错误信息                      |

---

## Input 输入框

```vue
<script setup>
import { ref } from 'vue'
import { Input } from '@expcat/tigercat-vue'

const value = ref('')
</script>

<template>
  <!-- Basic -->
  <Input v-model="value" placeholder="Enter text" />

  <!-- With prefix/suffix -->
  <Input v-model="value" placeholder="Search">
    <template #prefix>🔍</template>
  </Input>
  <Input v-model="value" placeholder="Amount">
    <template #suffix>USD</template>
  </Input>

  <!-- Clearable -->
  <Input v-model="value" clearable />

  <!-- Password -->
  <Input v-model="value" type="password" />

  <!-- Status -->
  <Input v-model="value" status="error" error-message="Invalid input" />

  <!-- Disabled -->
  <Input v-model="value" disabled />
</template>
```

**Props:**

| Prop         | Type                                          | Default  | Description      |
| ------------ | --------------------------------------------- | -------- | ---------------- |
| modelValue   | `string`                                      | -        | 绑定值 (v-model) |
| type         | `'text' \| 'password' \| 'email' \| 'number'` | `'text'` | 输入类型         |
| placeholder  | `string`                                      | -        | 占位符           |
| disabled     | `boolean`                                     | `false`  | 禁用             |
| clearable    | `boolean`                                     | `false`  | 可清除           |
| prefix       | `string`                                      | -        | 前缀文本         |
| suffix       | `string`                                      | -        | 后缀文本         |
| status       | `'error' \| 'warning'`                        | -        | 状态             |
| errorMessage | `string`                                      | -        | 错误信息         |

**Events:** `@update:modelValue`, `@change`, `@blur`, `@focus`, `@clear`

**Slots:** `prefix`, `suffix`

---

## Textarea 文本域

```vue
<script setup>
import { ref } from 'vue'
import { Textarea } from '@expcat/tigercat-vue'

const content = ref('')
</script>

<template>
  <Textarea v-model="content" placeholder="Enter content" :rows="4" />
  <Textarea v-model="content" autosize />
  <Textarea v-model="content" :autosize="{ minRows: 2, maxRows: 6 }" />
</template>
```

**Props:**

| Prop        | Type                                | Default | Description |
| ----------- | ----------------------------------- | ------- | ----------- |
| modelValue  | `string`                            | -       | 绑定值      |
| rows        | `number`                            | `3`     | 行数        |
| autosize    | `boolean \| { minRows?, maxRows? }` | `false` | 自适应高度  |
| placeholder | `string`                            | -       | 占位符      |
| disabled    | `boolean`                           | `false` | 禁用        |

---

## Select 选择器

```vue
<script setup>
import { ref } from 'vue'
import { Select } from '@expcat/tigercat-vue'

const value = ref('')
const multiValue = ref([])

const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3', disabled: true }
]
</script>

<template>
  <!-- Single select -->
  <Select v-model="value" :options="options" placeholder="Select one" />

  <!-- Multiple select -->
  <Select v-model="multiValue" :options="options" multiple placeholder="Select multiple" />

  <!-- Clearable -->
  <Select v-model="value" :options="options" clearable />

  <!-- Filterable -->
  <Select v-model="value" :options="options" filterable />
</template>
```

**Props:**

| Prop        | Type                                                  | Default | Description |
| ----------- | ----------------------------------------------------- | ------- | ----------- |
| modelValue  | `any`                                                 | -       | 绑定值      |
| options     | `{ label: string, value: any, disabled?: boolean }[]` | `[]`    | 选项        |
| multiple    | `boolean`                                             | `false` | 多选        |
| clearable   | `boolean`                                             | `false` | 可清除      |
| filterable  | `boolean`                                             | `false` | 可搜索      |
| placeholder | `string`                                              | -       | 占位符      |
| disabled    | `boolean`                                             | `false` | 禁用        |

**Events:** `@update:modelValue`, `@change`

---

## Checkbox & CheckboxGroup 复选框

```vue
<script setup>
import { ref } from 'vue'
import { Checkbox, CheckboxGroup } from '@expcat/tigercat-vue'

const checked = ref(false)
const checkedList = ref(['a'])
const options = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c', disabled: true }
]
</script>

<template>
  <!-- Single checkbox -->
  <Checkbox v-model="checked">Agree to terms</Checkbox>
  <Checkbox v-model="checked" indeterminate>Indeterminate</Checkbox>

  <!-- Checkbox group -->
  <CheckboxGroup v-model="checkedList" :options="options" />

  <!-- Vertical layout -->
  <CheckboxGroup v-model="checkedList" :options="options" direction="vertical" />
</template>
```

**Checkbox Props:**

| Prop          | Type      | Default | Description |
| ------------- | --------- | ------- | ----------- |
| modelValue    | `boolean` | `false` | 绑定值      |
| disabled      | `boolean` | `false` | 禁用        |
| indeterminate | `boolean` | `false` | 半选状态    |

**CheckboxGroup Props:**

| Prop       | Type                                                  | Default        | Description |
| ---------- | ----------------------------------------------------- | -------------- | ----------- |
| modelValue | `any[]`                                               | `[]`           | 绑定值      |
| options    | `{ label: string, value: any, disabled?: boolean }[]` | `[]`           | 选项        |
| direction  | `'horizontal' \| 'vertical'`                          | `'horizontal'` | 排列方向    |

---

## Radio & RadioGroup 单选框

```vue
<script setup>
import { ref } from 'vue'
import { Radio, RadioGroup } from '@expcat/tigercat-vue'

const value = ref('a')
const options = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c', disabled: true }
]
</script>

<template>
  <!-- Single radio -->
  <Radio v-model="value" value="a">Option A</Radio>
  <Radio v-model="value" value="b">Option B</Radio>

  <!-- Radio group -->
  <RadioGroup v-model="value" :options="options" />

  <!-- Button style -->
  <RadioGroup v-model="value" :options="options" button />
</template>
```

**RadioGroup Props:**

| Prop       | Type                                                  | Default        | Description |
| ---------- | ----------------------------------------------------- | -------------- | ----------- |
| modelValue | `any`                                                 | -              | 绑定值      |
| options    | `{ label: string, value: any, disabled?: boolean }[]` | `[]`           | 选项        |
| direction  | `'horizontal' \| 'vertical'`                          | `'horizontal'` | 排列方向    |
| button     | `boolean`                                             | `false`        | 按钮样式    |

---

## Switch 开关

```vue
<script setup>
import { ref } from 'vue'
import { Switch } from '@expcat/tigercat-vue'

const enabled = ref(false)
</script>

<template>
  <Switch v-model="enabled" />
  <Switch v-model="enabled" size="sm" />
  <Switch v-model="enabled" size="lg" />
  <Switch v-model="enabled" disabled />
</template>
```

**Props:**

| Prop       | Type                   | Default | Description |
| ---------- | ---------------------- | ------- | ----------- |
| modelValue | `boolean`              | `false` | 绑定值      |
| size       | `'sm' \| 'md' \| 'lg'` | `'md'`  | 尺寸        |
| disabled   | `boolean`              | `false` | 禁用        |

---

## Slider 滑块

```vue
<script setup>
import { ref } from 'vue'
import { Slider } from '@expcat/tigercat-vue'

const value = ref(50)
const rangeValue = ref([20, 80])
</script>

<template>
  <Slider v-model="value" />
  <Slider v-model="value" :min="0" :max="200" :step="10" />
  <Slider v-model="rangeValue" range />
  <Slider v-model="value" show-tooltip />
</template>
```

**Props:**

| Prop        | Type                         | Default | Description |
| ----------- | ---------------------------- | ------- | ----------- |
| modelValue  | `number \| [number, number]` | `0`     | 绑定值      |
| min         | `number`                     | `0`     | 最小值      |
| max         | `number`                     | `100`   | 最大值      |
| step        | `number`                     | `1`     | 步长        |
| range       | `boolean`                    | `false` | 范围选择    |
| disabled    | `boolean`                    | `false` | 禁用        |
| showTooltip | `boolean`                    | `false` | 显示提示    |

---

## DatePicker 日期选择器

```vue
<script setup>
import { ref } from 'vue'
import { DatePicker } from '@expcat/tigercat-vue'

const date = ref(null)
const dateRange = ref([])
</script>

<template>
  <DatePicker v-model="date" placeholder="Select date" />
  <DatePicker v-model="date" format="YYYY/MM/DD" />
  <DatePicker v-model="dateRange" range />
  <DatePicker v-model="date" disabled />
</template>
```

**Props:**

| Prop        | Type                           | Default        | Description |
| ----------- | ------------------------------ | -------------- | ----------- |
| modelValue  | `Date \| null \| [Date, Date]` | `null`         | 绑定值      |
| format      | `string`                       | `'YYYY-MM-DD'` | 日期格式    |
| placeholder | `string`                       | -              | 占位符      |
| range       | `boolean`                      | `false`        | 范围选择    |
| disabled    | `boolean`                      | `false`        | 禁用        |
| locale      | `DatePickerLocale`             | -              | 国际化配置  |

---

## TimePicker 时间选择器

```vue
<script setup>
import { ref } from 'vue'
import { TimePicker } from '@expcat/tigercat-vue'

const time = ref('')
</script>

<template>
  <TimePicker v-model="time" placeholder="Select time" />
  <TimePicker v-model="time" format="HH:mm" />
  <TimePicker v-model="time" :labels="{ hour: '时', minute: '分' }" />
</template>
```

**Props:**

| Prop        | Type               | Default      | Description |
| ----------- | ------------------ | ------------ | ----------- |
| modelValue  | `string`           | -            | 绑定值      |
| format      | `string`           | `'HH:mm:ss'` | 时间格式    |
| placeholder | `string`           | -            | 占位符      |
| disabled    | `boolean`          | `false`      | 禁用        |
| labels      | `TimePickerLabels` | -            | 标签文本    |

---

## Upload 上传

```vue
<script setup>
import { ref } from 'vue'
import { Upload } from '@expcat/tigercat-vue'

const fileList = ref([])

const handleSuccess = (file, response) => {
  console.log('Upload success:', file, response)
}
</script>

<template>
  <Upload
    v-model:file-list="fileList"
    action="/api/upload"
    :limit="3"
    accept="image/*"
    @success="handleSuccess">
    <template #default>
      <Button>Click to Upload</Button>
    </template>
  </Upload>

  <!-- Drag and drop -->
  <Upload v-model:file-list="fileList" action="/api/upload" drag />
</template>
```

**Props:**

| Prop     | Type           | Default | Description                  |
| -------- | -------------- | ------- | ---------------------------- |
| fileList | `UploadFile[]` | `[]`    | 文件列表 (v-model:file-list) |
| action   | `string`       | -       | 上传地址                     |
| limit    | `number`       | -       | 最大数量                     |
| accept   | `string`       | -       | 接受的文件类型               |
| drag     | `boolean`      | `false` | 拖拽上传                     |
| multiple | `boolean`      | `false` | 多选                         |
| disabled | `boolean`      | `false` | 禁用                         |

**Events:** `@change`, `@success`, `@error`, `@remove`
