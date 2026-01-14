# Progress 进度条

用于展示操作进度的组件，支持线形和圆形两种展示方式，可以展示任务的进度状态。

## 基本用法

### Vue 3

```vue
<script setup>
import { Progress } from '@tigercat/vue'
</script>

<template>
  <Progress :percentage="50" />
  <Progress :percentage="100" status="success" />
  <Progress :percentage="70" status="exception" />
</template>
```

### React

```tsx
import { Progress } from '@tigercat/react'

function App() {
  return (
    <>
      <Progress percentage={50} />
      <Progress percentage={100} status="success" />
      <Progress percentage={70} status="exception" />
    </>
  )
}
```

## 进度条变体 (Variants)

Progress 组件支持 6 种不同的变体：

- `default` - 默认进度条，灰色
- `primary` - 主要进度条，蓝色（默认）
- `success` - 成功进度条，绿色
- `warning` - 警告进度条，黄色
- `danger` - 危险进度条，红色
- `info` - 信息进度条，天蓝色

### Vue 3

```vue
<template>
  <Progress variant="default" :percentage="20" />
  <Progress variant="primary" :percentage="40" />
  <Progress variant="success" :percentage="60" />
  <Progress variant="warning" :percentage="80" />
  <Progress variant="danger" :percentage="100" />
  <Progress variant="info" :percentage="50" />
</template>
```

### React

```tsx
<Progress variant="default" percentage={20} />
<Progress variant="primary" percentage={40} />
<Progress variant="success" percentage={60} />
<Progress variant="warning" percentage={80} />
<Progress variant="danger" percentage={100} />
<Progress variant="info" percentage={50} />
```

## 进度条尺寸 (Sizes)

Progress 组件支持 3 种不同的尺寸：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸

### Vue 3

```vue
<template>
  <Progress size="sm" :percentage="50" />
  <Progress size="md" :percentage="50" />
  <Progress size="lg" :percentage="50" />
</template>
```

### React

```tsx
<Progress size="sm" percentage={50} />
<Progress size="md" percentage={50} />
<Progress size="lg" percentage={50} />
```

## 进度条状态 (Status)

Progress 组件支持多种状态，状态会覆盖变体的颜色：

- `normal` - 正常状态（使用 variant 颜色）
- `success` - 成功状态（绿色）
- `exception` - 异常状态（红色）
- `paused` - 暂停状态（黄色）

### Vue 3

```vue
<template>
  <Progress :percentage="100" status="success" />
  <Progress :percentage="50" status="exception" />
  <Progress :percentage="70" status="paused" />
</template>
```

### React

```tsx
<Progress percentage={100} status="success" />
<Progress percentage={50} status="exception" />
<Progress percentage={70} status="paused" />
```

## 圆形进度条 (Circle Type)

除了线形进度条，还支持圆形进度条。

### Vue 3

```vue
<template>
  <Progress type="circle" :percentage="75" />
  <Progress type="circle" :percentage="100" status="success" />
  <Progress type="circle" :percentage="50" status="exception" />
</template>
```

### React

```tsx
<Progress type="circle" percentage={75} />
<Progress type="circle" percentage={100} status="success" />
<Progress type="circle" percentage={50} status="exception" />
```

## 圆形进度条尺寸

圆形进度条也支持三种尺寸：

### Vue 3

```vue
<template>
  <Progress type="circle" size="sm" :percentage="50" />
  <Progress type="circle" size="md" :percentage="75" />
  <Progress type="circle" size="lg" :percentage="100" />
</template>
```

### React

```tsx
<Progress type="circle" size="sm" percentage={50} />
<Progress type="circle" size="md" percentage={75} />
<Progress type="circle" size="lg" percentage={100} />
```

## 自定义文本

可以自定义进度条显示的文本。

### Vue 3

```vue
<template>
  <Progress :percentage="50" text="进行中" />
  <Progress :percentage="100" text="已完成" />

  <!-- 使用格式化函数 -->
  <Progress :percentage="50" :format="(p) => `${p}个/100个`" />
</template>
```

### React

```tsx
<Progress percentage={50} text="进行中" />
<Progress percentage={100} text="已完成" />

{/* 使用格式化函数 */}
<Progress percentage={50} format={(p) => `${p}个/100个`} />
```

## 不显示文字

可以隐藏进度条的文本显示。

### Vue 3

```vue
<template>
  <Progress :percentage="50" :show-text="false" />
  <Progress type="circle" :percentage="75" :show-text="false" />
</template>
```

### React

```tsx
<Progress percentage={50} showText={false} />
<Progress type="circle" percentage={75} showText={false} />
```

## 条纹进度条 (Striped)

线形进度条支持条纹样式和动画效果。

### Vue 3

```vue
<template>
  <!-- 静态条纹 -->
  <Progress :percentage="70" :striped="true" />

  <!-- 动画条纹 -->
  <Progress :percentage="70" :striped="true" :striped-animation="true" />
</template>
```

### React

```tsx
{
  /* 静态条纹 */
}
;<Progress percentage={70} striped={true} />

{
  /* 动画条纹 */
}
;<Progress percentage={70} striped={true} stripedAnimation={true} />
```

## 自定义宽度和高度

可以自定义进度条的宽度和高度。

### Vue 3

```vue
<template>
  <!-- 自定义宽度 -->
  <Progress :percentage="50" width="300px" />
  <Progress :percentage="50" :width="400" />

  <!-- 自定义高度 -->
  <Progress :percentage="50" :height="20" />
</template>
```

### React

```tsx
{/* 自定义宽度 */}
<Progress percentage={50} width="300px" />
<Progress percentage={50} width={400} />

{/* 自定义高度 */}
<Progress percentage={50} height={20} />
```

## 自定义圆形进度条的线宽

可以自定义圆形进度条的线宽。

### Vue 3

```vue
<template>
  <Progress type="circle" :percentage="75" :stroke-width="4" />
  <Progress type="circle" :percentage="75" :stroke-width="8" />
  <Progress type="circle" :percentage="75" :stroke-width="12" />
</template>
```

### React

```tsx
<Progress type="circle" percentage={75} strokeWidth={4} />
<Progress type="circle" percentage={75} strokeWidth={8} />
<Progress type="circle" percentage={75} strokeWidth={12} />
```

## 实际应用示例

### 文件上传进度

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Progress } from '@tigercat/vue'

const uploadProgress = ref(0)

const uploadFile = () => {
  // 模拟文件上传
  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
    }
  }, 500)
}
</script>

<template>
  <div>
    <Progress :percentage="uploadProgress" />
    <button @click="uploadFile">开始上传</button>
  </div>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { Progress } from '@tigercat/react'

function FileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadFile = () => {
    // 模拟文件上传
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const next = prev + 10
        if (next >= 100) {
          clearInterval(interval)
        }
        return next
      })
    }, 500)
  }

  return (
    <div>
      <Progress percentage={uploadProgress} />
      <button onClick={uploadFile}>开始上传</button>
    </div>
  )
}
```

### 任务完成度

#### Vue 3

```vue
<script setup>
import { ref, computed } from 'vue'
import { Progress } from '@tigercat/vue'

const tasks = ref([
  { id: 1, name: '需求分析', completed: true },
  { id: 2, name: '设计方案', completed: true },
  { id: 3, name: '开发实现', completed: true },
  { id: 4, name: '测试验收', completed: false },
  { id: 5, name: '部署上线', completed: false }
])

const completionRate = computed(() => {
  const completed = tasks.value.filter((t) => t.completed).length
  return (completed / tasks.value.length) * 100
})

const getStatus = computed(() => {
  if (completionRate.value === 100) return 'success'
  if (completionRate.value >= 75) return 'normal'
  if (completionRate.value >= 50) return 'paused'
  return 'exception'
})
</script>

<template>
  <div>
    <h3>项目进度</h3>
    <Progress
      :percentage="completionRate"
      :status="getStatus"
      :format="(p) => `${Math.round(p)}% 完成`" />
    <ul>
      <li v-for="task in tasks" :key="task.id">
        <input type="checkbox" v-model="task.completed" />
        {{ task.name }}
      </li>
    </ul>
  </div>
</template>
```

#### React

```tsx
import { useState, useMemo } from 'react'
import { Progress } from '@tigercat/react'

function TaskProgress() {
  const [tasks, setTasks] = useState([
    { id: 1, name: '需求分析', completed: true },
    { id: 2, name: '设计方案', completed: true },
    { id: 3, name: '开发实现', completed: true },
    { id: 4, name: '测试验收', completed: false },
    { id: 5, name: '部署上线', completed: false }
  ])

  const completionRate = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length
    return (completed / tasks.length) * 100
  }, [tasks])

  const status = useMemo(() => {
    if (completionRate === 100) return 'success'
    if (completionRate >= 75) return 'normal'
    if (completionRate >= 50) return 'paused'
    return 'exception'
  }, [completionRate])

  const toggleTask = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  return (
    <div>
      <h3>项目进度</h3>
      <Progress
        percentage={completionRate}
        status={status}
        format={(p) => `${Math.round(p)}% 完成`}
      />
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />
            {task.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### 仪表盘展示

#### Vue 3

```vue
<script setup>
import { Progress } from '@tigercat/vue'
</script>

<template>
  <div class="dashboard">
    <div class="metric">
      <h4>CPU 使用率</h4>
      <Progress type="circle" :percentage="75" variant="primary" />
    </div>

    <div class="metric">
      <h4>内存使用率</h4>
      <Progress type="circle" :percentage="60" variant="success" />
    </div>

    <div class="metric">
      <h4>磁盘使用率</h4>
      <Progress type="circle" :percentage="85" status="paused" />
    </div>

    <div class="metric">
      <h4>网络带宽</h4>
      <Progress type="circle" :percentage="95" status="exception" />
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
}

.metric {
  text-align: center;
}
</style>
```

#### React

```tsx
import { Progress } from '@tigercat/react'

function Dashboard() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div className="text-center">
        <h4 className="mb-4">CPU 使用率</h4>
        <Progress type="circle" percentage={75} variant="primary" />
      </div>

      <div className="text-center">
        <h4 className="mb-4">内存使用率</h4>
        <Progress type="circle" percentage={60} variant="success" />
      </div>

      <div className="text-center">
        <h4 className="mb-4">磁盘使用率</h4>
        <Progress type="circle" percentage={85} status="paused" />
      </div>

      <div className="text-center">
        <h4 className="mb-4">网络带宽</h4>
        <Progress type="circle" percentage={95} status="exception" />
      </div>
    </div>
  )
}
```

## API

### Props

| 属性             | 说明                                 | 类型                                                                     | 默认值                            |
| ---------------- | ------------------------------------ | ------------------------------------------------------------------------ | --------------------------------- |
| variant          | 进度条变体                           | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'primary'`                       |
| size             | 进度条尺寸                           | `'sm' \| 'md' \| 'lg'`                                                   | `'md'`                            |
| type             | 进度条类型（形状）                   | `'line' \| 'circle'`                                                     | `'line'`                          |
| percentage       | 当前进度百分比（0-100）              | `number`                                                                 | `0`                               |
| status           | 进度状态（会覆盖 variant 颜色）      | `'normal' \| 'success' \| 'exception' \| 'paused'`                       | `'normal'`                        |
| showText         | 是否显示进度文本                     | `boolean`                                                                | 线形默认 `true`，圆形默认 `false` |
| text             | 自定义显示文本（替代百分比）         | `string`                                                                 | -                                 |
| format           | 自定义文本格式化函数                 | `(percentage: number) => string`                                         | -                                 |
| striped          | 是否显示条纹（仅线形）               | `boolean`                                                                | `false`                           |
| stripedAnimation | 条纹是否动画（需要 striped 为 true） | `boolean`                                                                | `false`                           |
| strokeWidth      | 圆形进度条线宽（像素）               | `number`                                                                 | `6`                               |
| width            | 线形进度条宽度                       | `string \| number`                                                       | `'auto'`                          |
| height           | 线形进度条高度（像素）               | `number`                                                                 | 根据 size 自动                    |
| className        | 自定义 CSS 类名                      | `string`                                                                 | -                                 |
| style            | 自定义样式                           | Vue：`Record<string, string \| number>` / React：`React.CSSProperties`   | -                                 |

## 样式定制

Progress 组件使用 Tailwind CSS 类，可以通过 Tailwind 配置自定义颜色。同时也支持 CSS 变量进行主题定制。

### 主题变量

```css
:root {
  --tiger-primary: #2563eb;
  --tiger-success: #16a34a;
  --tiger-warning: #f59e0b;
  --tiger-error: #dc2626;
  --tiger-info: #0ea5e9;
  --tiger-border: #e5e7eb;
  --tiger-text: #374151;
  --tiger-text-muted: #6b7280;
}
```

## 可访问性

- Progress 使用 `role="progressbar"` 属性提供语义化信息
- 包含 `aria-valuenow`、`aria-valuemin`、`aria-valuemax` 属性，描述进度值
- 支持通过组件上传入 `aria-label` / `aria-labelledby` / `aria-describedby`，并会作用在实际的 `progressbar` 元素上
- 支持屏幕阅读器访问

## 使用场景

- **文件上传** - 显示文件上传进度
- **任务进度** - 展示任务完成情况
- **数据加载** - 显示数据加载进度
- **系统监控** - 展示 CPU、内存等资源使用率
- **学习进度** - 显示课程或学习任务完成度
- **目标达成** - 展示目标完成百分比

## 设计原则

Progress 组件遵循以下设计原则：

1. **清晰直观** - 使用颜色和数字清晰展示进度状态
2. **多种形态** - 支持线形和圆形两种展示方式，适应不同场景
3. **状态丰富** - 支持成功、异常、暂停等多种状态，增强信息表达
4. **主题一致** - 使用与其他 Tigercat 组件一致的颜色系统和视觉风格
5. **高度可定制** - 支持自定义文本、尺寸、颜色等，满足各种需求
