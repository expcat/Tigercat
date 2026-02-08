---
name: tigercat-vue-basic
description: Vue 3 basic components usage - Alert, Avatar, Badge, Button, Code, Divider, Icon, Link, Tag, Text
---

# Basic Components (Vue 3)

基础组件：Alert, Avatar, Badge, Button, Code, Divider, Icon, Link, Tag, Text

> **Props Reference**: [shared/props/basic.md](../shared/props/basic.md) | **Patterns**: [shared/patterns/common.md](../shared/patterns/common.md)

---

## Button 按钮

```vue
<script setup>
import { Button } from '@expcat/tigercat-vue'
</script>

<template>
  <Button variant="primary">Primary</Button>
  <Button variant="outline" size="sm">Small Outline</Button>
  <Button disabled>Disabled</Button>
  <Button loading>Loading...</Button>
  <Button block>Full Width</Button>
  <Button type="submit" variant="primary">Submit</Button>
  <Button @click="handleClick">Click Me</Button>

  <!-- Custom loading icon (slot) -->
  <Button loading>
    <template #loading-icon><MySpinner /></template>
    Loading...
  </Button>
</template>
```

---

## Alert 警告提示

```vue
<template>
  <!-- 基本类型 -->
  <Alert type="success" title="Success" description="Operation completed" />
  <Alert type="warning" title="Warning" />
  <Alert type="error" title="Error" />
  <Alert type="info" title="Info" />

  <!-- 尺寸 -->
  <Alert size="sm" title="Small" />
  <Alert size="lg" title="Large" description="Detailed text" />

  <!-- 隐藏图标 -->
  <Alert title="No icon" :show-icon="false" />

  <!-- 可关闭 + 自定义无障碍标签 -->
  <Alert title="Closable" closable close-aria-label="关闭" @close="handleClose" />

  <!-- 插槽自定义内容 -->
  <Alert type="info">
    <template #title><strong>Custom title</strong></template>
    <template #description><em>Custom description</em></template>
  </Alert>

  <!-- 默认插槽 -->
  <Alert type="warning">Simple text content</Alert>
</template>
```

---

## Avatar & Badge

```vue
<template>
  <Avatar src="/avatar.jpg" size="lg" />
  <Avatar text="AB" shape="square" />

  <Badge :value="5"><Avatar /></Badge>
  <Badge dot><Avatar /></Badge>
</template>
```

---

## Tag 标签

```vue
<template>
  <Tag>Default</Tag>
  <Tag color="blue">Blue</Tag>
  <Tag closable @close="handleClose">Closable</Tag>
</template>
```

---

## Icon 图标

```vue
<template>
  <!-- 基础用法（默认 md / currentColor） -->
  <Icon>
    <svg viewBox="0 0 24 24">
      <path d="M5 12h14" />
    </svg>
  </Icon>

  <!-- 尺寸 + 颜色 -->
  <Icon size="xl" color="#f00">
    <svg viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6l-12 12" />
    </svg>
  </Icon>

  <!-- 填充图标（覆盖 SVG 默认值） -->
  <Icon size="lg">
    <svg viewBox="0 0 20 20" fill="currentColor" stroke="none">
      <path
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
    </svg>
  </Icon>

  <!-- 语义化图标（a11y） -->
  <Icon aria-label="搜索">
    <svg viewBox="0 0 24 24">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </Icon>
</template>
```

---

## Text 文本

```vue
<template>
  <Text>Default text</Text>
  <Text tag="h2" size="2xl" weight="bold">Heading</Text>
  <Text color="primary">Primary color</Text>
  <Text truncate>Very long text that will be truncated...</Text>
  <Text italic underline>Styled text</Text>
</template>
```

---

## Code 代码

```vue
<script setup>
import { Code } from '@expcat/tigercat-vue'
</script>

<template>
  <!-- 基础用法（默认显示复制按钮） -->
  <Code :code="'const x = 1'" />

  <!-- 自定义按钮文案 -->
  <Code :code="'npm install'" copy-label="复制代码" copied-label="已复制" />

  <!-- 禁用复制 -->
  <Code :code="'readonly'" :copyable="false" />

  <!-- 监听复制事件 -->
  <Code :code="'npm install'" @copy="handleCopy" />
</template>
```

---

## Link 链接

```vue
<template>
  <!-- 变体 -->
  <Link href="/about">Primary（默认）</Link>
  <Link href="/about" variant="secondary">Secondary</Link>
  <Link href="/about" variant="default">Default</Link>

  <!-- 尺寸 -->
  <Link href="#" size="sm">Small</Link>
  <Link href="#" size="lg">Large</Link>

  <!-- 禁用 -->
  <Link href="/no" disabled>Disabled</Link>

  <!-- 隐藏下划线 -->
  <Link href="#" :underline="false">No underline</Link>

  <!-- 外部链接（自动 rel） -->
  <Link href="https://github.com" target="_blank">GitHub</Link>

  <!-- 点击事件 -->
  <Link href="#" @click="handleClick">Click me</Link>
</template>
```

---

## Divider 分割线

```vue
<template>
  <Divider />
  <Divider direction="vertical" />
  <Divider>Text</Divider>
</template>
```
