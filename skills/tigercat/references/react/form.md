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
import { useState } from 'react'
import { Form, FormItem, Input, Button } from '@expcat/tigercat-react'

function MyForm() {
  const [form, setForm] = useState({ username: '', email: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    if (!form.username) newErrors.username = 'Required'
    if (!form.email) newErrors.email = 'Required'
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) console.log(form)
  }

  return (
    <Form labelWidth={100}>
      <FormItem label="Username" error={errors.username}>
        <Input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
      </FormItem>
      <FormItem label="Email" error={errors.email}>
        <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </FormItem>
      <FormItem>
        <Button onClick={handleSubmit}>Submit</Button>
      </FormItem>
    </Form>
  )
}
```

> 错误提示方式：默认在 FormItem 下方显示错误信息（`showMessage` 默认 `true`）。设置 `showMessage={false}` 可让 Input 内部显示错误（抖动 + 错误文字），推荐在 FormWizard 等紧凑布局中使用。

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

<Select value={value} onChange={setValue} options={options} />
<Select value={multiValue} onChange={setMultiValue} options={options} multiple />
<Select value={value} onChange={setValue} options={options} clearable filterable />
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
<Slider value={rangeValue} onChange={setRangeValue} range showTooltip />
```

---

## DatePicker 日期选择器

```tsx
<DatePicker value={date} onChange={setDate} placeholder="Select date" />
<DatePicker value={date} onChange={setDate} format="YYYY/MM/DD" />
<DatePicker value={dateRange} onChange={setDateRange} range />
```

---

## TimePicker 时间选择器

```tsx
<TimePicker value={time} onChange={setTime} placeholder="Select time" />
<TimePicker value={time} onChange={setTime} format="HH:mm" />
```

---

## Upload 上传

```tsx
<Upload fileList={fileList} onChange={setFileList} action="/api/upload" limit={3} accept="image/*">
  <Button>Click to Upload</Button>
</Upload>
<Upload fileList={fileList} onChange={setFileList} action="/api/upload" drag />
```
