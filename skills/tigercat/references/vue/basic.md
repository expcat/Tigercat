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
  <Alert type="success" title="Success" description="Operation completed" />
  <Alert type="warning" title="Warning" closable @close="handleClose" />
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
  <Icon>
    <svg viewBox="0 0 24 24">
      <path d="M5 12h14" />
    </svg>
  </Icon>
  <Icon size="xl" color="#f00">
    <svg viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6l-12 12" />
    </svg>
  </Icon>
</template>
```

---

## Text 文本

```vue
<template>
  <Text>Default text</Text>
  <Text size="lg" weight="bold">Large bold</Text>
  <Text ellipsis :max-width="200">Very long text...</Text>
</template>
```

---

## Code 代码

```vue
<template>
  <Code value="const x = 1" lang="javascript" />
  <Code value="npm install" copyable />
</template>
```

---

## Link 链接

```vue
<template>
  <Link href="https://example.com">External Link</Link>
  <Link href="/about" variant="primary">Primary</Link>
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
