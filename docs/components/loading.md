# Loading / Spinner 加载中

用于展示加载状态的组件，支持多种加载动画样式，可用于页面和区块的加载状态。

## 基本用法

### Vue 3

```vue
<script setup>
import { Loading } from '@expcat/tigercat-vue'
</script>

<template>
  <Loading />
  <Loading text="加载中..." />
</template>
```

### React

```tsx
import { Loading } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Loading />
      <Loading text="加载中..." />
    </>
  )
}
```

## 加载动画变体 (Variants)

Loading 组件支持 5 种不同的动画样式：

- `spinner` - 旋转圆环（默认）
- `ring` - 旋转环形
- `dots` - 跳动点
- `bars` - 缩放条形
- `pulse` - 脉冲圆形

### Vue 3

```vue
<template>
  <Loading variant="spinner" />
  <Loading variant="ring" />
  <Loading variant="dots" />
  <Loading variant="bars" />
  <Loading variant="pulse" />
</template>
```

### React

```tsx
<Loading variant="spinner" />
<Loading variant="ring" />
<Loading variant="dots" />
<Loading variant="bars" />
<Loading variant="pulse" />
```

## 尺寸 (Sizes)

Loading 组件支持 4 种不同的尺寸：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸
- `xl` - 超大尺寸

### Vue 3

```vue
<template>
  <Loading size="sm" />
  <Loading size="md" />
  <Loading size="lg" />
  <Loading size="xl" />
</template>
```

### React

```tsx
<Loading size="sm" />
<Loading size="md" />
<Loading size="lg" />
<Loading size="xl" />
```

## 颜色变体 (Colors)

Loading 组件支持 7 种颜色变体：

- `primary` - 主要颜色（默认）
- `secondary` - 次要颜色
- `success` - 成功颜色
- `warning` - 警告颜色
- `danger` - 危险颜色
- `info` - 信息颜色
- `default` - 默认颜色（灰色）

### Vue 3

```vue
<template>
  <Loading color="primary" />
  <Loading color="secondary" />
  <Loading color="success" />
  <Loading color="warning" />
  <Loading color="danger" />
  <Loading color="info" />
  <Loading color="default" />
</template>
```

### React

```tsx
<Loading color="primary" />
<Loading color="secondary" />
<Loading color="success" />
<Loading color="warning" />
<Loading color="danger" />
<Loading color="info" />
<Loading color="default" />
```

## 自定义颜色

可以使用 `customColor` 属性自定义加载器的颜色。

### Vue 3

```vue
<template>
  <Loading custom-color="#ff6b6b" />
  <Loading custom-color="rgb(255, 107, 107)" />
  <Loading variant="dots" custom-color="#4ecdc4" />
</template>
```

### React

```tsx
<Loading customColor="#ff6b6b" />
<Loading customColor="rgb(255, 107, 107)" />
<Loading variant="dots" customColor="#4ecdc4" />
```

## 全屏加载

使用 `fullscreen` 属性可以创建全屏加载遮罩层。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Loading } from '@expcat/tigercat-vue'

const loading = ref(true)

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<template>
  <div>
    <button @click="loadData">加载数据</button>
    <Loading v-if="loading" fullscreen text="加载中..." />
  </div>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Loading } from '@expcat/tigercat-react'

function App() {
  const [loading, setLoading] = useState(false)

  const loadData = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  return (
    <div>
      <button onClick={loadData}>加载数据</button>
      {loading && <Loading fullscreen text="加载中..." />}
    </div>
  )
}
```

## 自定义背景色

全屏模式下可以自定义背景颜色。

### Vue 3

```vue
<template>
  <Loading fullscreen text="加载中..." background="rgba(0, 0, 0, 0.8)" />
</template>
```

### React

```tsx
<Loading fullscreen text="加载中..." background="rgba(0, 0, 0, 0.8)" />
```

## 延迟显示

使用 `delay` 属性可以延迟显示加载器，避免闪烁（单位：毫秒）。

### Vue 3

```vue
<template>
  <!-- 延迟 300ms 后显示 -->
  <Loading :delay="300" text="加载中..." />
</template>
```

### React

```tsx
{
  /* 延迟 300ms 后显示 */
}
;<Loading delay={300} text="加载中..." />
```

## 与 Button 组合使用

Loading 组件可以很好地与 Button 组件的 loading 状态配合使用。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue'

const loading = ref(false)

const handleSubmit = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<template>
  <Button :loading="loading" @click="handleSubmit"> 提交 </Button>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Button } from '@expcat/tigercat-react'

function SubmitButton() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  return (
    <Button loading={loading} onClick={handleSubmit}>
      提交
    </Button>
  )
}
```

## 实际应用示例

### 页面加载

#### Vue 3

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { Loading } from '@expcat/tigercat-vue'

const pageLoading = ref(true)
const data = ref([])

onMounted(async () => {
  try {
    // 模拟数据加载
    await new Promise((resolve) => setTimeout(resolve, 1500))
    data.value = [
      { id: 1, name: '项目一' },
      { id: 2, name: '项目二' },
      { id: 3, name: '项目三' }
    ]
  } finally {
    pageLoading.value = false
  }
})
</script>

<template>
  <div>
    <Loading v-if="pageLoading" fullscreen text="页面加载中..." />
    <div v-else>
      <h1>项目列表</h1>
      <ul>
        <li v-for="item in data" :key="item.id">{{ item.name }}</li>
      </ul>
    </div>
  </div>
</template>
```

#### React

```tsx
import { useState, useEffect } from 'react'
import { Loading } from '@expcat/tigercat-react'

function PageContent() {
  const [pageLoading, setPageLoading] = useState(true)
  const [data, setData] = useState([])

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setData([
        { id: 1, name: '项目一' },
        { id: 2, name: '项目二' },
        { id: 3, name: '项目三' }
      ])
      setPageLoading(false)
    }, 1500)
  }, [])

  if (pageLoading) {
    return <Loading fullscreen text="页面加载中..." />
  }

  return (
    <div>
      <h1>项目列表</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

### 卡片加载

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Card, Loading, Button } from '@expcat/tigercat-vue'

const cardLoading = ref(false)

const refreshCard = () => {
  cardLoading.value = true
  setTimeout(() => {
    cardLoading.value = false
  }, 1500)
}
</script>

<template>
  <Card title="数据统计">
    <div class="relative min-h-[200px]">
      <div v-if="cardLoading" class="absolute inset-0 flex items-center justify-center bg-white/80">
        <Loading text="刷新中..." />
      </div>
      <div v-else>
        <p>总用户数: 1,234</p>
        <p>活跃用户: 567</p>
        <p>新增用户: 89</p>
        <Button @click="refreshCard" class="mt-4">刷新数据</Button>
      </div>
    </div>
  </Card>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { Card, Loading, Button } from '@expcat/tigercat-react'

function DataCard() {
  const [cardLoading, setCardLoading] = useState(false)

  const refreshCard = () => {
    setCardLoading(true)
    setTimeout(() => {
      setCardLoading(false)
    }, 1500)
  }

  return (
    <Card title="数据统计">
      <div className="relative min-h-[200px]">
        {cardLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <Loading text="刷新中..." />
          </div>
        ) : (
          <div>
            <p>总用户数: 1,234</p>
            <p>活跃用户: 567</p>
            <p>新增用户: 89</p>
            <Button onClick={refreshCard} className="mt-4">
              刷新数据
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
```

### 表单提交

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Form, FormItem, Input, Button, Loading } from '@expcat/tigercat-vue'

const formLoading = ref(false)
const formData = ref({
  username: '',
  email: ''
})

const handleSubmit = () => {
  formLoading.value = true
  setTimeout(() => {
    alert('提交成功！')
    formLoading.value = false
  }, 2000)
}
</script>

<template>
  <Form @submit.prevent="handleSubmit">
    <FormItem label="用户名">
      <Input v-model="formData.username" :disabled="formLoading" />
    </FormItem>
    <FormItem label="邮箱">
      <Input v-model="formData.email" :disabled="formLoading" />
    </FormItem>
    <FormItem>
      <Button type="submit" :disabled="formLoading">
        <span v-if="!formLoading">提交</span>
        <Loading v-else size="sm" color="default" />
      </Button>
    </FormItem>
  </Form>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { Form, FormItem, Input, Button, Loading } from '@expcat/tigercat-react'

function SubmitForm() {
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setTimeout(() => {
      alert('提交成功！')
      setFormLoading(false)
    }, 2000)
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormItem label="用户名">
        <Input
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          disabled={formLoading}
        />
      </FormItem>
      <FormItem label="邮箱">
        <Input
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={formLoading}
        />
      </FormItem>
      <FormItem>
        <Button type="submit" disabled={formLoading}>
          {formLoading ? <Loading size="sm" color="default" /> : '提交'}
        </Button>
      </FormItem>
    </Form>
  )
}
```

## API

### Props

| 属性        | 说明                        | 类型                                                                                    | 默认值                       |
| ----------- | --------------------------- | --------------------------------------------------------------------------------------- | ---------------------------- |
| variant     | 加载动画样式                | `'spinner' \| 'ring' \| 'dots' \| 'bars' \| 'pulse'`                                    | `'spinner'`                  |
| size        | 加载器尺寸                  | `'sm' \| 'md' \| 'lg' \| 'xl'`                                                          | `'md'`                       |
| color       | 颜色变体                    | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'default'` | `'primary'`                  |
| text        | 加载文本                    | `string`                                                                                | -                            |
| fullscreen  | 是否全屏显示                | `boolean`                                                                               | `false`                      |
| delay       | 延迟显示时间（毫秒）        | `number`                                                                                | `0`                          |
| background  | 自定义背景色（全屏模式）    | `string`                                                                                | `'rgba(255, 255, 255, 0.9)'` |
| customColor | 自定义加载器颜色            | `string`                                                                                | -                            |
| className   | 自定义 CSS 类名（仅 React） | `string`                                                                                | -                            |

## 样式定制

Loading 组件使用 Tailwind CSS 类，可以通过 Tailwind 配置自定义颜色。同时也支持 CSS 变量进行主题定制。

### 主题变量

```css
:root {
  --tiger-primary: #2563eb;
  --tiger-secondary: #4b5563;
}
```

### 自定义动画

组件会自动添加以下 CSS 动画到文档中：

```css
@keyframes bounce-dot {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-100%);
  }
}

@keyframes scale-bar {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.5);
  }
}
```

## 可访问性

- Loading 使用 `role="status"` 属性提供语义化信息
- 包含 `aria-label` 和 `aria-live="polite"` 属性，支持屏幕阅读器
- 渲染时默认带 `aria-busy="true"`，用于表达“当前区域处于忙碌状态”
- 全屏模式下不会阻止键盘导航

## 使用场景

- **页面加载** - 页面初始化或路由切换时的加载状态
- **数据刷新** - 刷新列表、表格等数据时的加载提示
- **表单提交** - 表单提交过程中的等待状态
- **异步操作** - API 请求、文件上传等异步操作的进度提示
- **懒加载** - 图片、组件懒加载时的占位符
- **长时间操作** - 导出、导入等长时间操作的等待提示

## 设计原则

Loading 组件遵循以下设计原则：

1. **多样化** - 提供多种动画样式，适应不同的设计需求
2. **灵活配置** - 支持尺寸、颜色、延迟等多种配置选项
3. **场景适配** - 支持局部加载和全屏加载两种模式
4. **性能优化** - 使用 CSS 动画保证流畅性，支持延迟显示避免闪烁
5. **主题一致** - 使用与其他 Tigercat 组件一致的颜色系统和视觉风格
6. **易于集成** - 可与 Button、Modal、Card 等组件无缝配合使用
