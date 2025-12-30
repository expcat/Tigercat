# FormItem 表单项

表单项组件，用于包装表单控件，提供标签、验证、错误提示等功能。通常与 Form 组件配合使用。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Form, FormItem, Input, Button } from '@tigercat/vue'

const formData = ref({
  username: '',
  email: '',
})
</script>

<template>
  <Form :model="formData">
    <FormItem label="用户名" name="username">
      <Input v-model="formData.username" />
    </FormItem>
    
    <FormItem label="邮箱" name="email">
      <Input v-model="formData.email" type="email" />
    </FormItem>
    
    <FormItem>
      <Button type="submit">提交</Button>
    </FormItem>
  </Form>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Form, FormItem, Input, Button } from '@tigercat/react'

function App() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  })

  return (
    <Form model={formData}>
      <FormItem label="用户名" name="username">
        <Input 
          value={formData.username} 
          onChange={(e) => setFormData({...formData, username: e.target.value})}
        />
      </FormItem>
      
      <FormItem label="邮箱" name="email">
        <Input 
          type="email"
          value={formData.email} 
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </FormItem>
      
      <FormItem>
        <Button type="submit">提交</Button>
      </FormItem>
    </Form>
  )
}
```

## 必填标记

通过 `required` 属性或验证规则自动显示必填标记（*）。

### Vue 3

```vue
<template>
  <Form :model="formData">
    <FormItem label="用户名" name="username" required>
      <Input v-model="formData.username" />
    </FormItem>
    
    <!-- 通过验证规则自动显示必填标记 -->
    <FormItem 
      label="邮箱" 
      name="email"
      :rules="{ required: true, message: '请输入邮箱' }"
    >
      <Input v-model="formData.email" />
    </FormItem>
  </Form>
</template>
```

### React

```tsx
<Form model={formData}>
  <FormItem label="用户名" name="username" required>
    <Input 
      value={formData.username} 
      onChange={(e) => setFormData({...formData, username: e.target.value})}
    />
  </FormItem>
  
  {/* 通过验证规则自动显示必填标记 */}
  <FormItem 
    label="邮箱" 
    name="email"
    rules={{ required: true, message: '请输入邮箱' }}
  >
    <Input 
      value={formData.email} 
      onChange={(e) => setFormData({...formData, email: e.target.value})}
    />
  </FormItem>
</Form>
```

## 自定义标签宽度

可以为单个 FormItem 设置标签宽度，覆盖 Form 组件的设置。

### Vue 3

```vue
<template>
  <Form :model="formData" label-width="100px">
    <!-- 使用 Form 的标签宽度 -->
    <FormItem label="姓名" name="name">
      <Input v-model="formData.name" />
    </FormItem>
    
    <!-- 覆盖标签宽度 -->
    <FormItem label="详细地址" name="address" label-width="120px">
      <Input v-model="formData.address" />
    </FormItem>
  </Form>
</template>
```

### React

```tsx
<Form model={formData} labelWidth="100px">
  {/* 使用 Form 的标签宽度 */}
  <FormItem label="姓名" name="name">
    <Input 
      value={formData.name} 
      onChange={(e) => setFormData({...formData, name: e.target.value})}
    />
  </FormItem>
  
  {/* 覆盖标签宽度 */}
  <FormItem label="详细地址" name="address" labelWidth="120px">
    <Input 
      value={formData.address} 
      onChange={(e) => setFormData({...formData, address: e.target.value})}
    />
  </FormItem>
</Form>
```

## 字段验证

FormItem 支持多种验证规则。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Form, FormItem, Input, Button } from '@tigercat/vue'

const formData = ref({
  username: '',
  password: '',
  confirmPassword: '',
})

const usernameRules = [
  { required: true, message: '请输入用户名' },
  { min: 3, max: 20, message: '用户名长度应在 3-20 个字符之间' },
]

const passwordRules = [
  { required: true, message: '请输入密码' },
  { min: 6, message: '密码至少 6 个字符' },
]

const confirmPasswordRules = [
  { required: true, message: '请确认密码' },
  {
    validator: (value) => {
      return value === formData.value.password
    },
    message: '两次输入的密码不一致',
  },
]
</script>

<template>
  <Form :model="formData">
    <FormItem label="用户名" name="username" :rules="usernameRules">
      <Input v-model="formData.username" />
    </FormItem>
    
    <FormItem label="密码" name="password" :rules="passwordRules">
      <Input v-model="formData.password" type="password" />
    </FormItem>
    
    <FormItem label="确认密码" name="confirmPassword" :rules="confirmPasswordRules">
      <Input v-model="formData.confirmPassword" type="password" />
    </FormItem>
    
    <FormItem>
      <Button type="submit">注册</Button>
    </FormItem>
  </Form>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Form, FormItem, Input, Button } from '@tigercat/react'

function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  })

  const usernameRules = [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度应在 3-20 个字符之间' },
  ]

  const passwordRules = [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少 6 个字符' },
  ]

  const confirmPasswordRules = [
    { required: true, message: '请确认密码' },
    {
      validator: (value: string) => value === formData.password,
      message: '两次输入的密码不一致',
    },
  ]

  return (
    <Form model={formData}>
      <FormItem label="用户名" name="username" rules={usernameRules}>
        <Input 
          value={formData.username} 
          onChange={(e) => setFormData({...formData, username: e.target.value})}
        />
      </FormItem>
      
      <FormItem label="密码" name="password" rules={passwordRules}>
        <Input 
          type="password"
          value={formData.password} 
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
      </FormItem>
      
      <FormItem label="确认密码" name="confirmPassword" rules={confirmPasswordRules}>
        <Input 
          type="password"
          value={formData.confirmPassword} 
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
        />
      </FormItem>
      
      <FormItem>
        <Button type="submit">注册</Button>
      </FormItem>
    </Form>
  )
}
```

## 自定义错误信息

可以通过 `error` 属性自定义错误信息。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Form, FormItem, Input } from '@tigercat/vue'

const formData = ref({ email: '' })
const emailError = ref('')

const validateEmail = () => {
  if (!formData.value.email.includes('@')) {
    emailError.value = '邮箱格式不正确'
  } else {
    emailError.value = ''
  }
}
</script>

<template>
  <Form :model="formData">
    <FormItem label="邮箱" name="email" :error="emailError">
      <Input v-model="formData.email" @blur="validateEmail" />
    </FormItem>
  </Form>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Form, FormItem, Input } from '@tigercat/react'

function CustomErrorExample() {
  const [formData, setFormData] = useState({ email: '' })
  const [emailError, setEmailError] = useState('')

  const validateEmail = () => {
    if (!formData.email.includes('@')) {
      setEmailError('邮箱格式不正确')
    } else {
      setEmailError('')
    }
  }

  return (
    <Form model={formData}>
      <FormItem label="邮箱" name="email" error={emailError}>
        <Input 
          value={formData.email} 
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          onBlur={validateEmail}
        />
      </FormItem>
    </Form>
  )
}
```

## 隐藏错误信息

通过 `showMessage={false}` 可以隐藏错误提示。

```vue
<FormItem label="用户名" name="username" :show-message="false">
  <Input v-model="formData.username" />
</FormItem>
```

## API

### Props / 属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 字段名（用于验证和数据绑定） | `string` | - |
| label | 标签文本 | `string` | - |
| labelWidth | 标签宽度（覆盖 Form 的设置） | `string \| number` | - |
| required | 是否显示必填标记 | `boolean` | - |
| rules | 验证规则（覆盖 Form 的规则） | `FormRule \| FormRule[]` | - |
| error | 自定义错误信息 | `string` | - |
| showMessage | 是否显示验证信息 | `boolean` | `true` |
| size | 字段尺寸（覆盖 Form 的设置） | `'sm' \| 'md' \| 'lg'` | - |

#### React 专属属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| className | 额外的 CSS 类名 | `string` | - |
| children | 表单控件内容 | `React.ReactNode` | - |

### Slots / 插槽 (Vue)

| 插槽名 | 说明 |
|--------|------|
| default | 表单控件内容 |

### FormRule 类型定义

```typescript
interface FormRule {
  required?: boolean                          // 是否必填
  message?: string                           // 错误提示信息
  min?: number                               // 最小长度/值
  max?: number                               // 最大长度/值
  pattern?: RegExp                           // 正则表达式验证
  validator?: (value: any) => boolean        // 自定义验证函数
  trigger?: 'blur' | 'change'               // 触发时机
}
```

## 最佳实践

### 1. 合理使用 name 属性

`name` 属性不仅用于验证，还用于表单数据的映射。确保 `name` 与表单数据的字段名一致。

```vue
<script setup>
const formData = ref({
  username: '',
  profile: {
    email: '',
    phone: '',
  }
})
</script>

<template>
  <Form :model="formData">
    <!-- 简单字段 -->
    <FormItem label="用户名" name="username">
      <Input v-model="formData.username" />
    </FormItem>
    
    <!-- 嵌套字段 -->
    <FormItem label="邮箱" name="profile.email">
      <Input v-model="formData.profile.email" />
    </FormItem>
  </Form>
</template>
```

### 2. 验证规则优先级

FormItem 的 `rules` 优先于 Form 的 `rules`，可以用于特殊字段的自定义验证。

```vue
<Form :model="formData" :rules="formRules">
  <!-- 使用 Form 级别的规则 -->
  <FormItem label="用户名" name="username">
    <Input v-model="formData.username" />
  </FormItem>
  
  <!-- 覆盖 Form 级别的规则 -->
  <FormItem label="邮箱" name="email" :rules="customEmailRules">
    <Input v-model="formData.email" />
  </FormItem>
</Form>
```

### 3. 标签位置和对齐

FormItem 会继承 Form 的 `labelPosition` 和 `labelAlign` 设置，无需单独配置。

```vue
<Form :model="formData" label-position="top">
  <FormItem label="用户名" name="username">
    <Input v-model="formData.username" />
  </FormItem>
</Form>
```

### 4. 响应式布局

```vue
<template>
  <Form :model="formData" class="max-w-2xl">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormItem label="姓" name="firstName">
        <Input v-model="formData.firstName" />
      </FormItem>
      
      <FormItem label="名" name="lastName">
        <Input v-model="formData.lastName" />
      </FormItem>
    </div>
    
    <FormItem label="地址" name="address">
      <Input v-model="formData.address" />
    </FormItem>
  </Form>
</template>
```

## 常见问题

### 1. 为什么验证不生效？

确保：
- FormItem 有 `name` 属性
- FormItem 在 Form 组件内部
- 表单数据对象包含对应的字段

```vue
<!-- ✅ 正确 -->
<Form :model="{ username: '' }">
  <FormItem name="username" :rules="{ required: true }">
    <Input v-model="formData.username" />
  </FormItem>
</Form>

<!-- ❌ 错误：缺少 name -->
<Form :model="formData">
  <FormItem :rules="{ required: true }">
    <Input v-model="formData.username" />
  </FormItem>
</Form>
```

### 2. 如何实时验证？

默认情况下，验证在 `blur` 和 `change` 事件时触发。可以通过 Form 的 `validateField` 方法手动触发验证。

```vue
<script setup>
import { ref } from 'vue'

const formRef = ref(null)

const validateUsername = () => {
  formRef.value?.validateField('username')
}
</script>

<template>
  <Form ref="formRef" :model="formData">
    <FormItem name="username">
      <Input v-model="formData.username" @input="validateUsername" />
    </FormItem>
  </Form>
</template>
```

### 3. 如何清除验证错误？

使用 Form 的 `clearValidate` 方法：

```vue
<script setup>
const formRef = ref(null)

const clearErrors = () => {
  formRef.value?.clearValidate('username')  // 清除特定字段
  // 或
  formRef.value?.clearValidate()  // 清除所有字段
}
</script>
```

### 4. 为什么必填标记不显示？

确保：
- 设置了 `required` 属性，或
- 验证规则中包含 `required: true`，且
- Form 的 `showRequiredAsterisk` 不为 `false`

## 样式定制

FormItem 使用以下 CSS 类名，可以自定义样式：

```css
/* 表单项容器 */
.tiger-form-item { }

/* 不同尺寸 */
.tiger-form-item--sm { }
.tiger-form-item--md { }
.tiger-form-item--lg { }

/* 标签位置 */
.tiger-form-item--label-top { }
.tiger-form-item--label-left { }
.tiger-form-item--label-right { }

/* 错误状态 */
.tiger-form-item--error { }

/* 禁用状态 */
.tiger-form-item--disabled { }

/* 标签 */
.tiger-form-item__label { }

/* 必填标记 */
.tiger-form-item__asterisk { }

/* 内容区域 */
.tiger-form-item__content { }

/* 字段容器 */
.tiger-form-item__field { }

/* 错误信息 */
.tiger-form-item__error { }
.tiger-form-item__error--show { }
```

## 无障碍 (Accessibility)

- FormItem 的 `label` 会自动关联到表单控件（通过 `htmlFor`/`for` 属性）
- 错误信息具有合适的语义标记
- 必填标记通过 `aria-required` 传达给辅助技术
- 支持键盘导航

## TypeScript 支持

FormItem 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type { FormItemProps, FormRule } from '@tigercat/core'
// Vue
import type { FormItem } from '@tigercat/vue'
// React
import { FormItem } from '@tigercat/react'
```

## 相关组件

- [Form 表单](./form.md) - 表单容器组件
- [Input 输入框](./input.md) - 文本输入组件
- [Select 选择器](./select.md) - 下拉选择组件
- [Checkbox 复选框](./checkbox.md) - 复选框组件
- [Radio 单选框](./radio.md) - 单选框组件

## 示例

### 完整的注册表单

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Form, FormItem, Input, Select, Checkbox, Button } from '@tigercat/vue'

const formRef = ref(null)
const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  country: '',
  agreeTerms: false,
})

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度应在 3-20 个字符之间' },
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少 6 个字符' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码' },
    {
      validator: (value) => value === formData.value.password,
      message: '两次输入的密码不一致',
    },
  ],
  country: [
    { required: true, message: '请选择国家' },
  ],
  agreeTerms: [
    {
      validator: (value) => value === true,
      message: '请同意服务条款',
    },
  ],
}

const countries = [
  { value: 'cn', label: '中国' },
  { value: 'us', label: '美国' },
  { value: 'uk', label: '英国' },
]

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    console.log('提交表单:', formData.value)
  }
}
</script>

<template>
  <Form 
    ref="formRef" 
    :model="formData" 
    :rules="rules"
    label-width="100px"
    class="max-w-md mx-auto"
  >
    <FormItem label="用户名" name="username">
      <Input v-model="formData.username" placeholder="请输入用户名" />
    </FormItem>
    
    <FormItem label="邮箱" name="email">
      <Input v-model="formData.email" type="email" placeholder="请输入邮箱" />
    </FormItem>
    
    <FormItem label="密码" name="password">
      <Input v-model="formData.password" type="password" placeholder="请输入密码" />
    </FormItem>
    
    <FormItem label="确认密码" name="confirmPassword">
      <Input v-model="formData.confirmPassword" type="password" placeholder="请再次输入密码" />
    </FormItem>
    
    <FormItem label="国家" name="country">
      <Select v-model="formData.country" :options="countries" placeholder="请选择国家" />
    </FormItem>
    
    <FormItem name="agreeTerms">
      <Checkbox v-model="formData.agreeTerms">
        我同意服务条款和隐私政策
      </Checkbox>
    </FormItem>
    
    <FormItem>
      <Button type="submit" @click="handleSubmit">注册</Button>
    </FormItem>
  </Form>
</template>
```
