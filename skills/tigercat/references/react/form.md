---
name: tigercat-react-form
description: React form components usage - controlled components pattern
---

# Form Components (React)

表单组件，使用受控组件模式（`value` + `onChange`）。

> **Props Reference**: [shared/props/form.md](../shared/props/form.md) | **Patterns**: [shared/patterns/common.md](../shared/patterns/common.md)

---

## Form & FormItem 表单

```tsx
import { useRef, useState } from 'react'
import {
  Form,
  FormItem,
  Input,
  Button,
  Space,
  type FormHandle,
  type FormRules
} from '@expcat/tigercat-react'

function MyForm() {
  const formRef = useRef<FormHandle>(null)
  const [form, setForm] = useState({ username: '', email: '' })
  const rules: FormRules = {
    username: [{ required: true, message: 'Required' }],
    email: [{ required: true }, { type: 'email', message: 'Invalid email' }]
  }

  return (
    <>
      {/* 基础校验 */}
      <Form
        ref={formRef}
        model={form}
        rules={rules}
        labelWidth={100}
        onSubmit={({ valid, values, errors }) => {
          if (valid) console.log('Form data:', values)
          else console.error('Validation errors:', errors)
        }}>
        <FormItem name="username" label="Username">
          <Input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </FormItem>
        <FormItem name="email" label="Email">
          <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </FormItem>
        <FormItem>
          <Space>
            <Button type="submit" variant="primary">
              Submit
            </Button>
            <Button variant="secondary" onClick={() => formRef.current?.clearValidate()}>
              Clear
            </Button>
            <Button variant="secondary" onClick={() => formRef.current?.resetFields()}>
              Reset
            </Button>
          </Space>
        </FormItem>
      </Form>

      {/* 布局变体: label 在顶部 */}
      <Form model={form} labelPosition="top">
        <FormItem name="username" label="Username">
          <Input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </FormItem>
      </Form>

      {/* 表单尺寸 */}
      <Form model={form} size="sm">
        {' '}
        ...{' '}
      </Form>
      <Form model={form} size="lg">
        {' '}
        ...{' '}
      </Form>

      {/* 禁用表单 */}
      <Form model={form} disabled>
        {' '}
        ...{' '}
      </Form>

      {/* FormItem 级别规则 (覆盖 Form rules) */}
      <Form model={form}>
        <FormItem
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Required' }]}>
          <Input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </FormItem>
      </Form>

      {/* 关闭 FormItem 错误消息，让 Input 内部显示错误 */}
      <Form model={form} rules={rules}>
        <FormItem name="email" label="Email" showMessage={false}>
          <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </FormItem>
      </Form>
    </>
  )
}
```

> **错误提示方式**：默认在 FormItem 下方显示错误信息（`showMessage` 默认 `true`）。设置 `showMessage={false}` 可让 Input 内部显示错误（抖动 + 错误文字），推荐在 FormWizard 等紧凑布局中使用。
>
> **暴露方法**：通过 `useRef<FormHandle>` 获取 Form 实例后可调用 `validate()`、`validateFields(names)`、`validateField(name)`、`clearValidate(names?)`、`resetFields()`。

---

## Input 输入框

```tsx
const [value, setValue] = useState('')

{/* Basic */}
<Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter text" />

{/* Uncontrolled */}
<Input defaultValue="initial" />

{/* Sizes */}
<Input value={value} onChange={(e) => setValue(e.target.value)} size="sm" placeholder="Small" />
<Input value={value} onChange={(e) => setValue(e.target.value)} size="lg" placeholder="Large" />

{/* Types */}
<Input type="password" value={value} onChange={(e) => setValue(e.target.value)} />
<Input type="number" placeholder="Number" />
<Input type="email" placeholder="Email" />
<Input type="tel" placeholder="Phone" />
<Input type="url" placeholder="URL" />

{/* States */}
<Input value={value} disabled />
<Input value={value} readonly />

{/* Validation */}
<Input value={value} onChange={(e) => setValue(e.target.value)} status="error" errorMessage="Invalid" />
<Input value={value} onChange={(e) => setValue(e.target.value)} status="success" />
<Input value={value} onChange={(e) => setValue(e.target.value)} status="warning" />

{/* Prefix/Suffix */}
<Input value={value} onChange={(e) => setValue(e.target.value)} prefix="🔍" suffix="USD" />
<Input value={value} onChange={(e) => setValue(e.target.value)} prefix={<Icon />} />
```

---

## Textarea 文本域

```tsx
const [content, setContent] = useState('')

{/* 基础 */}
<Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="请输入内容" />

{/* 非受控 */}
<Textarea defaultValue="initial" />

{/* 尺寸 */}
<Textarea value={content} onChange={(e) => setContent(e.target.value)} size="sm" />
<Textarea value={content} onChange={(e) => setContent(e.target.value)} size="lg" />

{/* 自动高度 */}
<Textarea value={content} onChange={(e) => setContent(e.target.value)} autoResize />
<Textarea value={content} onChange={(e) => setContent(e.target.value)} autoResize minRows={2} maxRows={6} />

{/* 字符计数 */}
<Textarea value={content} onChange={(e) => setContent(e.target.value)} showCount maxLength={200} />

{/* 状态 */}
<Textarea value={content} disabled />
<Textarea value={content} readonly />
<Textarea value={content} required />
```

---

## Select 选择器

```tsx
const options = [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }]
const groupedOptions = [
  {
    label: 'Group A',
    options: [
      { label: 'A-1', value: 'a1' },
      { label: 'A-2', value: 'a2' }
    ]
  }
]

<Select value={value} onChange={setValue} options={options} />
<Select value={multiValue} onChange={setMultiValue} options={options} multiple />
<Select value={value} onChange={setValue} options={options} clearable searchable />
<Select value={value} onChange={setValue} options={groupedOptions} />
<Select value={value} onChange={setValue} options={options} size="sm" />
<Select value={value} onChange={setValue} options={[]} noDataText="暂无数据" />
```

---

## Checkbox & CheckboxGroup

```tsx
const [checked, setChecked] = useState(false)
const [checkedList, setCheckedList] = useState<string[]>(['apple'])

<Checkbox checked={checked} onChange={setChecked}>Agree</Checkbox>
<Checkbox checked={checked} onChange={setChecked} indeterminate>Partial</Checkbox>
<CheckboxGroup value={checkedList} onChange={setCheckedList}>
  <Checkbox value="apple">Apple</Checkbox>
  <Checkbox value="banana">Banana</Checkbox>
</CheckboxGroup>
```

---

## Radio & RadioGroup

```tsx
const [value, setValue] = useState('male')

{
  /* 基础用法 */
}
;<RadioGroup value={value} onChange={setValue}>
  <Radio value="male">男</Radio>
  <Radio value="female">女</Radio>
  <Radio value="other">其他</Radio>
</RadioGroup>

{
  /* 非受控 */
}
;<RadioGroup defaultValue="male" onChange={handleChange}>
  <Radio value="a">A</Radio>
  <Radio value="b">B</Radio>
</RadioGroup>

{
  /* 禁用 */
}
;<RadioGroup value={value} onChange={setValue} disabled>
  <Radio value="a">A</Radio>
  <Radio value="b">B</Radio>
</RadioGroup>

{
  /* 尺寸 */
}
;<RadioGroup value={value} onChange={setValue} size="sm">
  <Radio value="a">A</Radio>
  <Radio value="b">B</Radio>
</RadioGroup>

{
  /* 单独使用 */
}
;<Radio value="standalone" checked={checked} onChange={() => setChecked(true)}>
  独立选项
</Radio>
```

---

## Switch 开关

```tsx
<Switch checked={enabled} onChange={setEnabled} />
<Switch checked={enabled} onChange={setEnabled} size="sm" />
<Switch checked={enabled} disabled />
```

---

## Slider 滑块

```tsx
<Slider value={value} onChange={setValue} />
<Slider value={value} onChange={setValue} min={0} max={200} step={10} />
<Slider value={rangeValue} onChange={setRangeValue} range marks={marks} />
<Slider defaultValue={50} />
```

---

## DatePicker 日期选择器

```tsx
<DatePicker value={date} onChange={setDate} placeholder="Select date" />
<DatePicker value={date} onChange={setDate} format="yyyy/MM/dd" />
<DatePicker range value={dateRange} onChange={setDateRange} />
<DatePicker value={date} onChange={setDate} size="sm" />
<DatePicker value={date} onChange={setDate} minDate={minDate} maxDate={maxDate} />
<DatePicker value={date} onChange={setDate} disabled />
<DatePicker value={date} onChange={setDate} clearable onClear={onClear} />
<DatePicker defaultValue={new Date()} />
<DatePicker value={date} onChange={setDate} locale="zh-CN" labels={{ today: '今日' }} />
```

---

## TimePicker 时间选择器

```tsx
<TimePicker value={time} onChange={setTime} placeholder="Select time" />
<TimePicker value={time} onChange={setTime} format="12" />
<TimePicker value={time} onChange={setTime} showSeconds />
<TimePicker value={time} onChange={setTime} hourStep={2} minuteStep={15} />
<TimePicker range value={timeRange} onChange={setTimeRange} />
<TimePicker value={time} onChange={setTime} size="sm" />
<TimePicker value={time} onChange={setTime} minTime="09:00" maxTime="18:00" />
<TimePicker value={time} onChange={setTime} disabled />
<TimePicker value={time} onChange={setTime} readonly />
<TimePicker value={time} onChange={setTime} clearable onClear={onClear} />
<TimePicker defaultValue="10:00" />
<TimePicker value={time} onChange={setTime} locale="zh-CN" labels={{ now: '此刻' }} />
```

---

## Upload 上传

```tsx
<Upload fileList={fileList} onChange={setFileList} action="/api/upload" limit={3} accept="image/*">
  <Button>Click to Upload</Button>
</Upload>
<Upload fileList={fileList} onChange={setFileList} action="/api/upload" drag />
```
