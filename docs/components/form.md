# Form 表单

表单组件用于数据收集、验证和提交，支持丰富的验证规则和双向数据绑定。

## 基本用法

### Vue 3

```vue
<script setup>
import { reactive } from 'vue';
import { Form, FormItem } from '@tigercat/vue';

const formData = reactive({
  username: '',
  email: '',
  password: '',
});

const handleSubmit = ({ valid, values }) => {
  if (valid) {
    console.log('Form submitted:', values);
  } else {
    console.log('Form validation failed');
  }
};
</script>

<template>
  <Form :model="formData" @submit="handleSubmit">
    <FormItem label="用户名" name="username">
      <input v-model="formData.username" />
    </FormItem>
    <FormItem label="邮箱" name="email">
      <input v-model="formData.email" type="email" />
    </FormItem>
    <FormItem label="密码" name="password">
      <input v-model="formData.password" type="password" />
    </FormItem>
    <button type="submit">提交</button>
  </Form>
</template>
```

### React

```tsx
import { useState, useRef } from 'react';
import { Form, FormItem, FormHandle } from '@tigercat/react';

function App() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const formRef = useRef<FormHandle>(null);

  const handleSubmit = ({ valid, values }) => {
    if (valid) {
      console.log('Form submitted:', values);
    } else {
      console.log('Form validation failed');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Form ref={formRef} model={formData} onSubmit={handleSubmit}>
      <FormItem label="用户名" name="username">
        <input
          value={formData.username}
          onChange={(e) => updateField('username', e.target.value)}
        />
      </FormItem>
      <FormItem label="邮箱" name="email">
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
        />
      </FormItem>
      <FormItem label="密码" name="password">
        <input
          type="password"
          value={formData.password}
          onChange={(e) => updateField('password', e.target.value)}
        />
      </FormItem>
      <button type="submit">提交</button>
    </Form>
  );
}
```

## 表单验证

使用 `rules` 属性定义验证规则。

### Vue 3

```vue
<script setup>
import { reactive, ref } from 'vue';
import { Form, FormItem } from '@tigercat/vue';

const formRef = ref();

const formData = reactive({
  username: '',
  email: '',
  age: '',
  website: '',
});

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度应在 3 到 20 个字符之间' },
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入有效的邮箱地址' },
  ],
  age: [
    { required: true, message: '请输入年龄' },
    { type: 'number', message: '年龄必须是数字' },
    { min: 1, max: 150, message: '年龄必须在 1 到 150 之间' },
  ],
  website: [{ type: 'url', message: '请输入有效的 URL' }],
};

const handleSubmit = async ({ valid, values, errors }) => {
  if (valid) {
    console.log('提交成功:', values);
  } else {
    console.log('验证失败:', errors);
  }
};

const validateManually = async () => {
  const valid = await formRef.value.validate();
  console.log('手动验证结果:', valid);
};
</script>

<template>
  <Form ref="formRef" :model="formData" :rules="rules" @submit="handleSubmit">
    <FormItem label="用户名" name="username">
      <input v-model="formData.username" />
    </FormItem>
    <FormItem label="邮箱" name="email">
      <input v-model="formData.email" />
    </FormItem>
    <FormItem label="年龄" name="age">
      <input v-model.number="formData.age" type="number" />
    </FormItem>
    <FormItem label="网站" name="website">
      <input v-model="formData.website" />
    </FormItem>
    <button type="submit">提交</button>
    <button type="button" @click="validateManually">手动验证</button>
  </Form>
</template>
```

### React

```tsx
import { useState, useRef } from 'react';
import { Form, FormItem, FormHandle, FormRules } from '@tigercat/react';

function App() {
  const formRef = useRef<FormHandle>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    age: '',
    website: '',
  });

  const rules: FormRules = {
    username: [
      { required: true, message: '请输入用户名' },
      { min: 3, max: 20, message: '用户名长度应在 3 到 20 个字符之间' },
    ],
    email: [
      { required: true, message: '请输入邮箱' },
      { type: 'email', message: '请输入有效的邮箱地址' },
    ],
    age: [
      { required: true, message: '请输入年龄' },
      { type: 'number', message: '年龄必须是数字' },
      { min: 1, max: 150, message: '年龄必须在 1 到 150 之间' },
    ],
    website: [{ type: 'url', message: '请输入有效的 URL' }],
  };

  const handleSubmit = ({ valid, values, errors }) => {
    if (valid) {
      console.log('提交成功:', values);
    } else {
      console.log('验证失败:', errors);
    }
  };

  const validateManually = async () => {
    const valid = await formRef.current?.validate();
    console.log('手动验证结果:', valid);
  };

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Form ref={formRef} model={formData} rules={rules} onSubmit={handleSubmit}>
      <FormItem label="用户名" name="username">
        <input
          value={formData.username}
          onChange={(e) => updateField('username', e.target.value)}
        />
      </FormItem>
      <FormItem label="邮箱" name="email">
        <input
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
        />
      </FormItem>
      <FormItem label="年龄" name="age">
        <input
          type="number"
          value={formData.age}
          onChange={(e) => updateField('age', Number(e.target.value))}
        />
      </FormItem>
      <FormItem label="网站" name="website">
        <input
          value={formData.website}
          onChange={(e) => updateField('website', e.target.value)}
        />
      </FormItem>
      <button type="submit">提交</button>
      <button type="button" onClick={validateManually}>
        手动验证
      </button>
    </Form>
  );
}
```

## 自定义验证规则

使用 `validator` 属性定义自定义验证函数。

### Vue 3

```vue
<script setup>
import { reactive } from 'vue';
import { Form, FormItem } from '@tigercat/vue';

const formData = reactive({
  password: '',
  confirmPassword: '',
});

const validatePassword = (value, values) => {
  if (value.length < 6) {
    return '密码至少需要 6 个字符';
  }
  if (!/[A-Z]/.test(value)) {
    return '密码必须包含至少一个大写字母';
  }
  if (!/[0-9]/.test(value)) {
    return '密码必须包含至少一个数字';
  }
  return true;
};

const validateConfirmPassword = (value, values) => {
  if (value !== values.password) {
    return '两次输入的密码不一致';
  }
  return true;
};

const rules = {
  password: [
    { required: true, message: '请输入密码' },
    { validator: validatePassword },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码' },
    { validator: validateConfirmPassword },
  ],
};
</script>

<template>
  <Form :model="formData" :rules="rules">
    <FormItem label="密码" name="password">
      <input v-model="formData.password" type="password" />
    </FormItem>
    <FormItem label="确认密码" name="confirmPassword">
      <input v-model="formData.confirmPassword" type="password" />
    </FormItem>
    <button type="submit">提交</button>
  </Form>
</template>
```

### React

```tsx
import { useState } from 'react';
import { Form, FormItem, FormRules } from '@tigercat/react';

function App() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const validatePassword = (value: string, values?: { password?: string }) => {
    if (value.length < 6) {
      return '密码至少需要 6 个字符';
    }
    if (!/[A-Z]/.test(value)) {
      return '密码必须包含至少一个大写字母';
    }
    if (!/[0-9]/.test(value)) {
      return '密码必须包含至少一个数字';
    }
    return true;
  };

  const validateConfirmPassword = (
    value: string,
    values?: { password?: string }
  ) => {
    if (value !== values?.password) {
      return '两次输入的密码不一致';
    }
    return true;
  };

  const rules: FormRules = {
    password: [
      { required: true, message: '请输入密码' },
      { validator: validatePassword },
    ],
    confirmPassword: [
      { required: true, message: '请再次输入密码' },
      { validator: validateConfirmPassword },
    ],
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Form model={formData} rules={rules}>
      <FormItem label="密码" name="password">
        <input
          type="password"
          value={formData.password}
          onChange={(e) => updateField('password', e.target.value)}
        />
      </FormItem>
      <FormItem label="确认密码" name="confirmPassword">
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
        />
      </FormItem>
      <button type="submit">提交</button>
    </Form>
  );
}
```

## 表单布局

通过 `labelPosition` 属性控制标签位置。

### Vue 3

```vue
<template>
  <!-- 标签在右侧（默认） -->
  <Form :model="formData" label-position="right">
    <FormItem label="用户名" name="username">
      <input v-model="formData.username" />
    </FormItem>
  </Form>

  <!-- 标签在左侧 -->
  <Form :model="formData" label-position="left">
    <FormItem label="用户名" name="username">
      <input v-model="formData.username" />
    </FormItem>
  </Form>

  <!-- 标签在顶部 -->
  <Form :model="formData" label-position="top">
    <FormItem label="用户名" name="username">
      <input v-model="formData.username" />
    </FormItem>
  </Form>

  <!-- 自定义标签宽度 -->
  <Form :model="formData" label-width="120px">
    <FormItem label="用户名" name="username">
      <input v-model="formData.username" />
    </FormItem>
  </Form>
</template>
```

### React

```tsx
<>
  {/* 标签在右侧（默认） */}
  <Form model={formData} labelPosition="right">
    <FormItem label="用户名" name="username">
      <input value={formData.username} onChange={...} />
    </FormItem>
  </Form>

  {/* 标签在左侧 */}
  <Form model={formData} labelPosition="left">
    <FormItem label="用户名" name="username">
      <input value={formData.username} onChange={...} />
    </FormItem>
  </Form>

  {/* 标签在顶部 */}
  <Form model={formData} labelPosition="top">
    <FormItem label="用户名" name="username">
      <input value={formData.username} onChange={...} />
    </FormItem>
  </Form>

  {/* 自定义标签宽度 */}
  <Form model={formData} labelWidth="120px">
    <FormItem label="用户名" name="username">
      <input value={formData.username} onChange={...} />
    </FormItem>
  </Form>
</>
```

## 表单尺寸

通过 `size` 属性控制表单尺寸。

### Vue 3

```vue
<template>
  <Form :model="formData" size="sm">
    <FormItem label="小尺寸" name="field1">
      <input v-model="formData.field1" />
    </FormItem>
  </Form>

  <Form :model="formData" size="md">
    <FormItem label="中尺寸" name="field2">
      <input v-model="formData.field2" />
    </FormItem>
  </Form>

  <Form :model="formData" size="lg">
    <FormItem label="大尺寸" name="field3">
      <input v-model="formData.field3" />
    </FormItem>
  </Form>
</template>
```

### React

```tsx
<>
  <Form model={formData} size="sm">
    <FormItem label="小尺寸" name="field1">
      <input value={formData.field1} onChange={...} />
    </FormItem>
  </Form>

  <Form model={formData} size="md">
    <FormItem label="中尺寸" name="field2">
      <input value={formData.field2} onChange={...} />
    </FormItem>
  </Form>

  <Form model={formData} size="lg">
    <FormItem label="大尺寸" name="field3">
      <input value={formData.field3} onChange={...} />
    </FormItem>
  </Form>
</>
```

## API

### Form Props / 属性

| 属性                 | 说明                   | 类型                         | 默认值    |
| -------------------- | ---------------------- | ---------------------------- | --------- |
| model                | 表单数据对象           | `FormValues`                 | `{}`      |
| rules                | 表单验证规则           | `FormRules`                  | -         |
| labelWidth           | 标签宽度               | `string \| number`           | -         |
| labelPosition        | 标签位置               | `'left' \| 'right' \| 'top'` | `'right'` |
| labelAlign           | 标签对齐方式           | `'left' \| 'right' \| 'top'` | `'right'` |
| size                 | 表单尺寸               | `'sm' \| 'md' \| 'lg'`       | `'md'`    |
| inlineMessage        | 是否在行内显示验证消息 | `boolean`                    | `true`    |
| showRequiredAsterisk | 是否显示必填字段的星号 | `boolean`                    | `true`    |
| disabled             | 是否禁用整个表单       | `boolean`                    | `false`   |

#### React 专属属性

| 属性       | 说明            | 类型                                                                  |
| ---------- | --------------- | --------------------------------------------------------------------- |
| onSubmit   | 表单提交处理器  | `(event: FormSubmitEvent) => void`                                    |
| onValidate | 字段验证处理器  | `(fieldName: string, valid: boolean, error?: string \| null) => void` |
| onChange   | 值变化处理器    | `(values: FormValues) => void`                                        |
| className  | 额外的 CSS 类名 | `string`                                                              |

### Form Events / 事件 (Vue)

| 事件名   | 说明           | 回调参数                                                      |
| -------- | -------------- | ------------------------------------------------------------- |
| submit   | 表单提交时触发 | `{ valid: boolean, values: FormValues, errors: FormError[] }` |
| validate | 字段验证时触发 | `(fieldName: string, valid: boolean, error?: string \| null)` |

### Form Methods / 方法

| 方法名        | 说明         | 参数                              | 返回值             |
| ------------- | ------------ | --------------------------------- | ------------------ |
| validate      | 验证整个表单 | -                                 | `Promise<boolean>` |
| validateField | 验证单个字段 | `fieldName: string`               | `Promise<void>`    |
| clearValidate | 清除验证结果 | `fieldNames?: string \| string[]` | `void`             |
| resetFields   | 重置表单字段 | -                                 | `void`             |

### FormItem Props / 属性

| 属性        | 说明                              | 类型                     | 默认值 |
| ----------- | --------------------------------- | ------------------------ | ------ |
| name        | 字段名（对应表单 model 中的键）   | `string`                 | -      |
| label       | 标签文本                          | `string`                 | -      |
| labelWidth  | 标签宽度（覆盖表单的 labelWidth） | `string \| number`       | -      |
| required    | 是否必填                          | `boolean`                | -      |
| rules       | 该字段的验证规则                  | `FormRule \| FormRule[]` | -      |
| error       | 错误消息（受控模式）              | `string`                 | -      |
| showMessage | 是否显示验证消息                  | `boolean`                | `true` |
| size        | 尺寸（覆盖表单的 size）           | `'sm' \| 'md' \| 'lg'`   | -      |

#### React 专属属性

| 属性      | 说明            | 类型     |
| --------- | --------------- | -------- |
| className | 额外的 CSS 类名 | `string` |

### FormRule 验证规则

| 属性      | 说明                               | 类型                                                                                       |
| --------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| type      | 规则类型                           | `'string' \| 'number' \| 'boolean' \| 'array' \| 'object' \| 'email' \| 'url' \| 'date'`   |
| required  | 是否必填                           | `boolean`                                                                                  |
| min       | 最小长度（字符串）或最小值（数字） | `number`                                                                                   |
| max       | 最大长度（字符串）或最大值（数字） | `number`                                                                                   |
| pattern   | 正则表达式模式                     | `RegExp`                                                                                   |
| validator | 自定义验证函数                     | `(value: unknown, values?: FormValues) => boolean \| string \| Promise<boolean \| string>` |
| message   | 验证失败时的错误消息               | `string`                                                                                   |
| trigger   | 触发验证的时机                     | `'blur' \| 'change' \| 'submit' \| Array<'blur' \| 'change' \| 'submit'>`                  |
| transform | 验证前转换值                       | `(value: unknown) => unknown`                                                              |

## TypeScript 支持

Form 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type {
  FormProps,
  FormItemProps,
  FormRule,
  FormRules,
  FormValues,
  FormError,
  FormValidationResult,
  FormLabelAlign,
  FormLabelPosition,
  FormSize,
} from '@tigercat/core';

// Vue
import type { Form, FormItem } from '@tigercat/vue';

// React
import type {
  Form,
  FormItem,
  FormHandle,
  FormSubmitEvent,
  FormContextValue,
} from '@tigercat/react';
```

## 样式定制

Form 组件使用标准的 CSS 类名，可以通过覆盖这些类名来自定义样式：

```css
/* 表单容器 */
.tiger-form {
  /* 自定义样式 */
}

/* 表单项 */
.tiger-form-item {
  margin-bottom: 1rem;
}

/* 标签 */
.tiger-form-item__label {
  /* 自定义样式 */
}

/* 必填星号 */
.tiger-form-item__asterisk {
  color: red;
  margin-right: 4px;
}

/* 错误消息 */
.tiger-form-item__error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* 错误状态 */
.tiger-form-item--error .tiger-form-item__field {
  /* 自定义样式 */
}
```

## 无障碍 (Accessibility)

- FormItem 自动为输入字段关联 label
- 支持键盘导航
- 提供清晰的错误消息显示
- 必填字段显示视觉指示（星号）
- 支持屏幕阅读器

## 注意事项

1. **数据绑定**：

   - Vue: 使用 `v-model` 绑定表单字段到 `model` 对象
   - React: 需要手动管理受控组件的值和 onChange 事件

2. **验证时机**：

   - 表单提交时会自动触发完整验证
   - 字段失焦（blur）和值改变（change）时会触发单个字段验证
   - 可以通过 `trigger` 属性自定义验证触发时机

3. **异步验证**：

   - 支持在 `validator` 函数中返回 Promise
   - 适用于需要后端验证的场景（如检查用户名是否已存在）

4. **表单重置**：

   - `resetFields` 方法会清除验证结果
   - 需要手动重置表单数据到初始值

5. **性能优化**：
   - 避免在验证函数中执行耗时操作
   - 大型表单建议使用字段级验证而非整体验证

## 示例

### 完整的注册表单

#### Vue 3

```vue
<script setup>
import { reactive, ref } from 'vue';
import { Form, FormItem, Button } from '@tigercat/vue';

const formRef = ref();
const loading = ref(false);

const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false,
});

const checkUsernameExists = async (value) => {
  // 模拟 API 调用
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (value === 'admin') {
    return '用户名已存在';
  }
  return true;
};

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度应在 3 到 20 个字符之间' },
    { validator: checkUsernameExists },
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入有效的邮箱地址' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少需要 6 个字符' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码' },
    {
      validator: (value, values) => {
        return value === values.password || '两次输入的密码不一致';
      },
    },
  ],
  agree: [
    {
      validator: (value) => {
        return value === true || '请同意用户协议';
      },
    },
  ],
};

const handleSubmit = async ({ valid, values }) => {
  if (!valid) return;

  loading.value = true;
  try {
    // 提交表单数据
    await submitRegistration(values);
    alert('注册成功！');
  } catch (error) {
    alert('注册失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  formRef.value.resetFields();
  Object.keys(formData).forEach((key) => {
    formData[key] = '';
  });
  formData.agree = false;
};
</script>

<template>
  <Form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="100px"
    @submit="handleSubmit">
    <FormItem label="用户名" name="username">
      <input v-model="formData.username" />
    </FormItem>
    <FormItem label="邮箱" name="email">
      <input v-model="formData.email" type="email" />
    </FormItem>
    <FormItem label="密码" name="password">
      <input v-model="formData.password" type="password" />
    </FormItem>
    <FormItem label="确认密码" name="confirmPassword">
      <input v-model="formData.confirmPassword" type="password" />
    </FormItem>
    <FormItem name="agree">
      <label>
        <input v-model="formData.agree" type="checkbox" />
        我同意用户协议
      </label>
    </FormItem>
    <FormItem>
      <Button type="submit" :loading="loading">注册</Button>
      <Button variant="secondary" @click="handleReset">重置</Button>
    </FormItem>
  </Form>
</template>
```

#### React

```tsx
import { useState, useRef } from 'react';
import { Form, FormItem, Button, FormHandle, FormRules } from '@tigercat/react';

function RegistrationForm() {
  const formRef = useRef<FormHandle>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });

  const checkUsernameExists = async (value: string) => {
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (value === 'admin') {
      return '用户名已存在';
    }
    return true;
  };

  const rules: FormRules = {
    username: [
      { required: true, message: '请输入用户名' },
      { min: 3, max: 20, message: '用户名长度应在 3 到 20 个字符之间' },
      { validator: checkUsernameExists },
    ],
    email: [
      { required: true, message: '请输入邮箱' },
      { type: 'email', message: '请输入有效的邮箱地址' },
    ],
    password: [
      { required: true, message: '请输入密码' },
      { min: 6, message: '密码至少需要 6 个字符' },
    ],
    confirmPassword: [
      { required: true, message: '请再次输入密码' },
      {
        validator: (value, values) => {
          return value === values?.password || '两次输入的密码不一致';
        },
      },
    ],
    agree: [
      {
        validator: (value) => {
          return value === true || '请同意用户协议';
        },
      },
    ],
  };

  const handleSubmit = async ({ valid, values }) => {
    if (!valid) return;

    setLoading(true);
    try {
      // 提交表单数据
      await submitRegistration(values);
      alert('注册成功！');
    } catch (error) {
      alert('注册失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    formRef.current?.resetFields();
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agree: false,
    });
  };

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Form
      ref={formRef}
      model={formData}
      rules={rules}
      labelWidth="100px"
      onSubmit={handleSubmit}>
      <FormItem label="用户名" name="username">
        <input
          value={formData.username}
          onChange={(e) => updateField('username', e.target.value)}
        />
      </FormItem>
      <FormItem label="邮箱" name="email">
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
        />
      </FormItem>
      <FormItem label="密码" name="password">
        <input
          type="password"
          value={formData.password}
          onChange={(e) => updateField('password', e.target.value)}
        />
      </FormItem>
      <FormItem label="确认密码" name="confirmPassword">
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
        />
      </FormItem>
      <FormItem name="agree">
        <label>
          <input
            type="checkbox"
            checked={formData.agree}
            onChange={(e) => updateField('agree', e.target.checked)}
          />
          我同意用户协议
        </label>
      </FormItem>
      <FormItem>
        <Button type="submit" loading={loading}>
          注册
        </Button>
        <Button variant="secondary" onClick={handleReset}>
          重置
        </Button>
      </FormItem>
    </Form>
  );
}
```
