# Modal / Dialog

对话框组件，用于在浮层中显示重要信息或需要用户交互的内容。

## 基本用法

### Vue 3

```vue
<template>
  <div>
    <Button @click="visible = true">打开对话框</Button>
    
    <Modal
      v-model:visible="visible"
      title="基本对话框"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <p>这是对话框的内容。</p>
    </Modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Modal, Button } from '@tigercat/vue'

const visible = ref(false)

const handleOk = () => {
  console.log('确定')
  visible.value = false
}

const handleCancel = () => {
  console.log('取消')
  visible.value = false
}
</script>
```

### React

```tsx
import React, { useState } from 'react'
import { Modal, Button } from '@tigercat/react'

function App() {
  const [visible, setVisible] = useState(false)

  const handleOk = () => {
    console.log('确定')
    setVisible(false)
  }

  const handleCancel = () => {
    console.log('取消')
    setVisible(false)
  }

  return (
    <div>
      <Button onClick={() => setVisible(true)}>打开对话框</Button>
      
      <Modal
        visible={visible}
        title="基本对话框"
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>这是对话框的内容。</p>
      </Modal>
    </div>
  )
}
```

## 自定义页脚

### Vue 3

```vue
<template>
  <Modal
    v-model:visible="visible"
    title="自定义页脚"
  >
    <p>这是对话框的内容。</p>
    
    <template #footer>
      <Button variant="secondary" @click="visible = false">取消</Button>
      <Button @click="handleSubmit">提交</Button>
    </template>
  </Modal>
</template>
```

### React

```tsx
<Modal
  visible={visible}
  title="自定义页脚"
  footer={
    <>
      <Button variant="secondary" onClick={() => setVisible(false)}>取消</Button>
      <Button onClick={handleSubmit}>提交</Button>
    </>
  }
>
  <p>这是对话框的内容。</p>
</Modal>
```

## 不同尺寸

Modal 提供了多种尺寸选项：`sm`、`md`（默认）、`lg`、`xl`、`full`。

### Vue 3

```vue
<template>
  <div>
    <Button @click="showModal('sm')">小尺寸</Button>
    <Button @click="showModal('md')">中等尺寸</Button>
    <Button @click="showModal('lg')">大尺寸</Button>
    <Button @click="showModal('xl')">超大尺寸</Button>
    <Button @click="showModal('full')">全屏</Button>
    
    <Modal
      v-model:visible="visible"
      :size="size"
      title="不同尺寸的对话框"
    >
      <p>这是一个 {{ size }} 尺寸的对话框。</p>
    </Modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Modal, Button } from '@tigercat/vue'

const visible = ref(false)
const size = ref('md')

const showModal = (newSize) => {
  size.value = newSize
  visible.value = true
}
</script>
```

### React

```tsx
import React, { useState } from 'react'
import { Modal, Button } from '@tigercat/react'

function App() {
  const [visible, setVisible] = useState(false)
  const [size, setSize] = useState('md')

  const showModal = (newSize) => {
    setSize(newSize)
    setVisible(true)
  }

  return (
    <div>
      <Button onClick={() => showModal('sm')}>小尺寸</Button>
      <Button onClick={() => showModal('md')}>中等尺寸</Button>
      <Button onClick={() => showModal('lg')}>大尺寸</Button>
      <Button onClick={() => showModal('xl')}>超大尺寸</Button>
      <Button onClick={() => showModal('full')}>全屏</Button>
      
      <Modal
        visible={visible}
        size={size}
        title="不同尺寸的对话框"
        onCancel={() => setVisible(false)}
      >
        <p>这是一个 {size} 尺寸的对话框。</p>
      </Modal>
    </div>
  )
}
```

## 垂直居中

设置 `centered` 属性可以让对话框垂直居中显示。

### Vue 3

```vue
<template>
  <Modal
    v-model:visible="visible"
    title="垂直居中对话框"
    centered
  >
    <p>这个对话框垂直居中显示。</p>
  </Modal>
</template>
```

### React

```tsx
<Modal
  visible={visible}
  title="垂直居中对话框"
  centered
  onCancel={() => setVisible(false)}
>
  <p>这个对话框垂直居中显示。</p>
</Modal>
```

## 禁用遮罩关闭

设置 `maskClosable={false}` 可以禁止点击遮罩层关闭对话框。

### Vue 3

```vue
<template>
  <Modal
    v-model:visible="visible"
    title="禁用遮罩关闭"
    :mask-closable="false"
  >
    <p>点击遮罩层不会关闭此对话框。</p>
  </Modal>
</template>
```

### React

```tsx
<Modal
  visible={visible}
  title="禁用遮罩关闭"
  maskClosable={false}
  onCancel={() => setVisible(false)}
>
  <p>点击遮罩层不会关闭此对话框。</p>
</Modal>
```

## 关闭时销毁

设置 `destroyOnClose` 可以在关闭对话框时销毁其内容。

### Vue 3

```vue
<template>
  <Modal
    v-model:visible="visible"
    title="关闭时销毁"
    destroy-on-close
  >
    <p>关闭对话框时，此内容将被销毁。</p>
  </Modal>
</template>
```

### React

```tsx
<Modal
  visible={visible}
  title="关闭时销毁"
  destroyOnClose
  onCancel={() => setVisible(false)}
>
  <p>关闭对话框时，此内容将被销毁。</p>
</Modal>
```

## 自定义标题

### Vue 3

```vue
<template>
  <Modal v-model:visible="visible">
    <template #title>
      <div style="display: flex; align-items: center;">
        <Icon name="info-circle" />
        <span style="margin-left: 8px;">自定义标题</span>
      </div>
    </template>
    
    <p>这是对话框的内容。</p>
  </Modal>
</template>
```

### React

```tsx
<Modal
  visible={visible}
  titleContent={
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Icon name="info-circle" />
      <span style={{ marginLeft: '8px' }}>自定义标题</span>
    </div>
  }
  onCancel={() => setVisible(false)}
>
  <p>这是对话框的内容。</p>
</Modal>
```

## API

### Props / Attributes

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| visible | 是否显示对话框 | `boolean` | `false` |
| size | 对话框尺寸 | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` |
| title | 对话框标题 | `string` | - |
| closable | 是否显示关闭按钮 | `boolean` | `true` |
| mask | 是否显示遮罩层 | `boolean` | `true` |
| maskClosable | 点击遮罩层是否关闭对话框 | `boolean` | `true` |
| centered | 是否垂直居中显示 | `boolean` | `false` |
| destroyOnClose | 关闭时是否销毁内容 | `boolean` | `false` |
| zIndex | 对话框的 z-index | `number` | `1000` |
| className | 自定义类名 | `string` | - |

### React 特有 Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| titleContent | 自定义标题内容（替代 title） | `ReactNode` | - |
| footer | 自定义页脚内容 | `ReactNode` | - |
| onVisibleChange | 显示状态改变的回调 | `(visible: boolean) => void` | - |
| onClose | 对话框关闭时的回调 | `() => void` | - |
| onCancel | 点击取消或关闭按钮的回调 | `() => void` | - |
| onOk | 点击确定按钮的回调 | `() => void` | - |

### Vue 3 Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:visible | 显示状态改变时触发 | `(visible: boolean)` |
| close | 对话框关闭时触发 | - |
| cancel | 点击取消或关闭按钮时触发 | - |
| ok | 点击确定按钮时触发 | - |

### Vue 3 Slots

| 插槽名 | 说明 |
|--------|------|
| default | 对话框内容 |
| title | 自定义标题 |
| footer | 自定义页脚 |

### React Children/Props

| 属性 | 说明 |
|------|------|
| children | 对话框内容 |
| titleContent | 自定义标题内容 |
| footer | 自定义页脚内容 |

## 样式定制

Modal 组件使用 Tailwind CSS 类，支持通过 CSS 变量进行主题定制。

### CSS 变量

```css
:root {
  --tiger-primary: #2563eb;
}
```

### 自定义样式

可以通过 `className` prop 添加自定义样式：

```tsx
<Modal
  visible={visible}
  className="custom-modal"
  title="自定义样式"
>
  <p>自定义样式的对话框。</p>
</Modal>
```

## 无障碍性

- Modal 使用 `role="dialog"` 和 `aria-modal="true"` 属性
- 标题通过 `aria-labelledby` 与对话框关联
- 关闭按钮包含 `aria-label="Close"` 属性
- 遮罩层使用 `aria-hidden="true"` 标记

## 注意事项

1. Modal 使用 Teleport/Portal 将内容渲染到 `body` 元素
2. 多个 Modal 可以嵌套使用，通过 `zIndex` 控制层级
3. 默认情况下，关闭 Modal 不会销毁内容，设置 `destroyOnClose` 可以改变此行为
4. Modal 包含淡入淡出和缩放动画效果
