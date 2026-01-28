---
name: tigercat-react-form
description: React form components - Checkbox, CheckboxGroup, DatePicker, Form, FormItem, Input, Radio, RadioGroup, Select, Slider, Switch, Textarea, TimePicker, Upload. Controlled components pattern.
---

# Form Components (React)

表单组件，使用受控组件模式（`value` + `onChange`）。

## Form & FormItem 表单

```tsx
import { useState } from 'react'
import { Form, FormItem, Input, Button } from '@expcat/tigercat-react'

function MyForm() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.username) newErrors.username = 'Username is required'
    if (form.username.length < 3) newErrors.username = 'At least 3 characters'
    if (!form.email) newErrors.email = 'Email is required'
    if (!form.password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      console.log('Form data:', form)
    }
  }

  const handleReset = () => {
    setForm({ username: '', email: '', password: '' })
    setErrors({})
  }

  return (
    <Form labelWidth={100}>
      <FormItem label="Username" error={errors.username}>
        <Input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="Enter username"
        />
      </FormItem>
      <FormItem label="Email" error={errors.email}>
        <Input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Enter email"
        />
      </FormItem>
      <FormItem label="Password" error={errors.password}>
        <Input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Enter password"
        />
      </FormItem>
      <FormItem>
        <Button onClick={handleSubmit}>Submit</Button>
        <Button variant="secondary" onClick={handleReset}>
          Reset
        </Button>
      </FormItem>
    </Form>
  )
}
```

**Form Props:**

| Prop          | Type                         | Default   | Description    |
| ------------- | ---------------------------- | --------- | -------------- |
| labelWidth    | `string \| number`           | -         | 标签宽度       |
| labelPosition | `'left' \| 'right' \| 'top'` | `'right'` | 标签位置       |
| disabled      | `boolean`                    | `false`   | 禁用所有表单项 |

**FormItem Props:**

| Prop     | Type      | Default | Description |
| -------- | --------- | ------- | ----------- |
| name     | `string`  | -       | 字段名      |
| label    | `string`  | -       | 标签文本    |
| required | `boolean` | `false` | 必填标记    |
| error    | `string`  | -       | 错误信息    |

---

## Input 输入框

```tsx
import { useState } from 'react'
import { Input } from '@expcat/tigercat-react'

function App() {
  const [value, setValue] = useState('')

  return (
    <>
      {/* Basic */}
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter text" />

      {/* With prefix/suffix */}
      <Input value={value} onChange={(e) => setValue(e.target.value)} prefix="🔍" />
      <Input value={value} onChange={(e) => setValue(e.target.value)} suffix="USD" />

      {/* Clearable */}
      <Input value={value} onChange={(e) => setValue(e.target.value)} clearable />

      {/* Password */}
      <Input type="password" value={value} onChange={(e) => setValue(e.target.value)} />

      {/* Status */}
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        status="error"
        errorMessage="Invalid input"
      />

      {/* Disabled */}
      <Input value={value} disabled />
    </>
  )
}
```

**Props:**

| Prop         | Type                                          | Default  | Description |
| ------------ | --------------------------------------------- | -------- | ----------- |
| value        | `string`                                      | -        | 绑定值      |
| type         | `'text' \| 'password' \| 'email' \| 'number'` | `'text'` | 输入类型    |
| placeholder  | `string`                                      | -        | 占位符      |
| disabled     | `boolean`                                     | `false`  | 禁用        |
| clearable    | `boolean`                                     | `false`  | 可清除      |
| prefix       | `ReactNode`                                   | -        | 前缀        |
| suffix       | `ReactNode`                                   | -        | 后缀        |
| status       | `'error' \| 'warning'`                        | -        | 状态        |
| errorMessage | `string`                                      | -        | 错误信息    |

**Callbacks:** `onChange`, `onBlur`, `onFocus`, `onClear`

---

## Textarea 文本域

```tsx
import { useState } from 'react'
import { Textarea } from '@expcat/tigercat-react'

function App() {
  const [content, setContent] = useState('')

  return (
    <>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter content"
        rows={4}
      />
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} autosize />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        autosize={{ minRows: 2, maxRows: 6 }}
      />
    </>
  )
}
```

**Props:**

| Prop        | Type                                | Default | Description |
| ----------- | ----------------------------------- | ------- | ----------- |
| value       | `string`                            | -       | 绑定值      |
| rows        | `number`                            | `3`     | 行数        |
| autosize    | `boolean \| { minRows?, maxRows? }` | `false` | 自适应高度  |
| placeholder | `string`                            | -       | 占位符      |
| disabled    | `boolean`                           | `false` | 禁用        |

---

## Select 选择器

```tsx
import { useState } from 'react'
import { Select } from '@expcat/tigercat-react'

const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3', disabled: true }
]

function App() {
  const [value, setValue] = useState('')
  const [multiValue, setMultiValue] = useState<string[]>([])

  return (
    <>
      {/* Single select */}
      <Select value={value} onChange={setValue} options={options} placeholder="Select one" />

      {/* Multiple select */}
      <Select
        value={multiValue}
        onChange={setMultiValue}
        options={options}
        multiple
        placeholder="Select multiple"
      />

      {/* Clearable */}
      <Select value={value} onChange={setValue} options={options} clearable />

      {/* Filterable */}
      <Select value={value} onChange={setValue} options={options} filterable />
    </>
  )
}
```

**Props:**

| Prop        | Type                                                  | Default | Description |
| ----------- | ----------------------------------------------------- | ------- | ----------- |
| value       | `any`                                                 | -       | 绑定值      |
| options     | `{ label: string, value: any, disabled?: boolean }[]` | `[]`    | 选项        |
| multiple    | `boolean`                                             | `false` | 多选        |
| clearable   | `boolean`                                             | `false` | 可清除      |
| filterable  | `boolean`                                             | `false` | 可搜索      |
| placeholder | `string`                                              | -       | 占位符      |
| disabled    | `boolean`                                             | `false` | 禁用        |

**Callbacks:** `onChange`

---

## Checkbox & CheckboxGroup 复选框

```tsx
import { useState } from 'react'
import { Checkbox, CheckboxGroup } from '@expcat/tigercat-react'

const options = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c', disabled: true }
]

function App() {
  const [checked, setChecked] = useState(false)
  const [checkedList, setCheckedList] = useState(['a'])

  return (
    <>
      {/* Single checkbox */}
      <Checkbox checked={checked} onChange={setChecked}>
        Agree to terms
      </Checkbox>
      <Checkbox checked={checked} onChange={setChecked} indeterminate>
        Indeterminate
      </Checkbox>

      {/* Checkbox group */}
      <CheckboxGroup value={checkedList} onChange={setCheckedList} options={options} />

      {/* Vertical layout */}
      <CheckboxGroup
        value={checkedList}
        onChange={setCheckedList}
        options={options}
        direction="vertical"
      />
    </>
  )
}
```

**Checkbox Props:**

| Prop          | Type      | Default | Description |
| ------------- | --------- | ------- | ----------- |
| checked       | `boolean` | `false` | 选中状态    |
| disabled      | `boolean` | `false` | 禁用        |
| indeterminate | `boolean` | `false` | 半选状态    |

**CheckboxGroup Props:**

| Prop      | Type                                                  | Default        | Description |
| --------- | ----------------------------------------------------- | -------------- | ----------- |
| value     | `any[]`                                               | `[]`           | 选中值数组  |
| options   | `{ label: string, value: any, disabled?: boolean }[]` | `[]`           | 选项        |
| direction | `'horizontal' \| 'vertical'`                          | `'horizontal'` | 排列方向    |

**Callbacks:** `onChange`

---

## Radio & RadioGroup 单选框

```tsx
import { useState } from 'react'
import { RadioGroup } from '@expcat/tigercat-react'

const options = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c', disabled: true }
]

function App() {
  const [value, setValue] = useState('a')

  return (
    <>
      {/* Radio group */}
      <RadioGroup value={value} onChange={setValue} options={options} />

      {/* Button style */}
      <RadioGroup value={value} onChange={setValue} options={options} button />
    </>
  )
}
```

**RadioGroup Props:**

| Prop      | Type                                                  | Default        | Description |
| --------- | ----------------------------------------------------- | -------------- | ----------- |
| value     | `any`                                                 | -              | 当前值      |
| options   | `{ label: string, value: any, disabled?: boolean }[]` | `[]`           | 选项        |
| direction | `'horizontal' \| 'vertical'`                          | `'horizontal'` | 排列方向    |
| button    | `boolean`                                             | `false`        | 按钮样式    |

---

## Switch 开关

```tsx
import { useState } from 'react'
import { Switch } from '@expcat/tigercat-react'

function App() {
  const [enabled, setEnabled] = useState(false)

  return (
    <>
      <Switch checked={enabled} onChange={setEnabled} />
      <Switch checked={enabled} onChange={setEnabled} size="sm" />
      <Switch checked={enabled} onChange={setEnabled} size="lg" />
      <Switch checked={enabled} disabled />
    </>
  )
}
```

**Props:**

| Prop     | Type                   | Default | Description |
| -------- | ---------------------- | ------- | ----------- |
| checked  | `boolean`              | `false` | 开关状态    |
| size     | `'sm' \| 'md' \| 'lg'` | `'md'`  | 尺寸        |
| disabled | `boolean`              | `false` | 禁用        |

---

## Slider 滑块

```tsx
import { useState } from 'react'
import { Slider } from '@expcat/tigercat-react'

function App() {
  const [value, setValue] = useState(50)
  const [rangeValue, setRangeValue] = useState<[number, number]>([20, 80])

  return (
    <>
      <Slider value={value} onChange={setValue} />
      <Slider value={value} onChange={setValue} min={0} max={200} step={10} />
      <Slider value={rangeValue} onChange={setRangeValue} range />
      <Slider value={value} onChange={setValue} showTooltip />
    </>
  )
}
```

**Props:**

| Prop        | Type                         | Default | Description |
| ----------- | ---------------------------- | ------- | ----------- |
| value       | `number \| [number, number]` | `0`     | 值          |
| min         | `number`                     | `0`     | 最小值      |
| max         | `number`                     | `100`   | 最大值      |
| step        | `number`                     | `1`     | 步长        |
| range       | `boolean`                    | `false` | 范围选择    |
| disabled    | `boolean`                    | `false` | 禁用        |
| showTooltip | `boolean`                    | `false` | 显示提示    |

---

## DatePicker 日期选择器

```tsx
import { useState } from 'react'
import { DatePicker } from '@expcat/tigercat-react'

function App() {
  const [date, setDate] = useState<Date | null>(null)
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null)

  return (
    <>
      <DatePicker value={date} onChange={setDate} placeholder="Select date" />
      <DatePicker value={date} onChange={setDate} format="YYYY/MM/DD" />
      <DatePicker value={dateRange} onChange={setDateRange} range />
      <DatePicker value={date} onChange={setDate} disabled />
    </>
  )
}
```

**Props:**

| Prop        | Type                           | Default        | Description |
| ----------- | ------------------------------ | -------------- | ----------- |
| value       | `Date \| null \| [Date, Date]` | `null`         | 值          |
| format      | `string`                       | `'YYYY-MM-DD'` | 日期格式    |
| placeholder | `string`                       | -              | 占位符      |
| range       | `boolean`                      | `false`        | 范围选择    |
| disabled    | `boolean`                      | `false`        | 禁用        |
| locale      | `DatePickerLocale`             | -              | 国际化配置  |

---

## TimePicker 时间选择器

```tsx
import { useState } from 'react'
import { TimePicker } from '@expcat/tigercat-react'

function App() {
  const [time, setTime] = useState('')

  return (
    <>
      <TimePicker value={time} onChange={setTime} placeholder="Select time" />
      <TimePicker value={time} onChange={setTime} format="HH:mm" />
      <TimePicker value={time} onChange={setTime} labels={{ hour: '时', minute: '分' }} />
    </>
  )
}
```

---

## Upload 上传

```tsx
import { useState } from 'react'
import { Upload, Button } from '@expcat/tigercat-react'

function App() {
  const [fileList, setFileList] = useState([])

  return (
    <>
      <Upload
        fileList={fileList}
        onChange={setFileList}
        action="/api/upload"
        limit={3}
        accept="image/*"
        onSuccess={(file, response) => console.log('Success:', file, response)}>
        <Button>Click to Upload</Button>
      </Upload>

      {/* Drag and drop */}
      <Upload fileList={fileList} onChange={setFileList} action="/api/upload" drag />
    </>
  )
}
```

**Props:**

| Prop     | Type           | Default | Description    |
| -------- | -------------- | ------- | -------------- |
| fileList | `UploadFile[]` | `[]`    | 文件列表       |
| action   | `string`       | -       | 上传地址       |
| limit    | `number`       | -       | 最大数量       |
| accept   | `string`       | -       | 接受的文件类型 |
| drag     | `boolean`      | `false` | 拖拽上传       |
| multiple | `boolean`      | `false` | 多选           |
| disabled | `boolean`      | `false` | 禁用           |

**Callbacks:** `onChange`, `onSuccess`, `onError`, `onRemove`
