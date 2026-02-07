---
name: tigercat-react-basic
description: React basic components usage - Alert, Avatar, Badge, Button, Code, Divider, Icon, Link, Tag, Text
---

# Basic Components (React)

基础组件：Alert, Avatar, Badge, Button, Code, Divider, Icon, Link, Tag, Text

> **Props Reference**: [shared/props/basic.md](../shared/props/basic.md) | **Patterns**: [shared/patterns/common.md](../shared/patterns/common.md)

---

## Button 按钮

```tsx
import { Button } from '@expcat/tigercat-react'

<Button variant="primary">Primary</Button>
<Button variant="outline" size="sm">Small Outline</Button>
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
<Button block>Full Width</Button>
<Button type="submit" variant="primary">Submit</Button>
<Button onClick={handleClick}>Click Me</Button>

{/* Custom loading icon (prop) */}
<Button loading loadingIcon={<MySpinner />}>Loading...</Button>
```

---

## Alert 警告提示

```tsx
<Alert type="success" title="Success" description="Operation completed" />
<Alert type="warning" title="Warning" closable onClose={handleClose} />
```

---

## Avatar & Badge

```tsx
<Avatar src="/avatar.jpg" size="lg" />
<Avatar text="AB" shape="square" />

<Badge value={5}><Avatar /></Badge>
<Badge dot><Avatar /></Badge>
```

---

## Tag 标签

```tsx
<Tag>Default</Tag>
<Tag color="blue">Blue</Tag>
<Tag closable onClose={handleClose}>Closable</Tag>
```

---

## Icon 图标

```tsx
{
  /* 基础用法（默认 md / currentColor） */
}
;<Icon>
  <svg viewBox="0 0 24 24">
    <path d="M5 12h14" />
  </svg>
</Icon>

{
  /* 尺寸 + 颜色 */
}
;<Icon size="xl" color="#f00">
  <svg viewBox="0 0 24 24">
    <path d="M6 6l12 12M18 6l-12 12" />
  </svg>
</Icon>

{
  /* 填充图标（覆盖 SVG 默认值） */
}
;<Icon size="lg">
  <svg viewBox="0 0 20 20" fill="currentColor" stroke="none">
    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
  </svg>
</Icon>

{
  /* 语义化图标（a11y） */
}
;<Icon aria-label="搜索">
  <svg viewBox="0 0 24 24">
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
</Icon>
```

---

## Text 文本

```tsx
<Text>Default text</Text>
<Text size="lg" weight="bold">Large bold</Text>
<Text ellipsis maxWidth={200}>Very long text...</Text>
```

---

## Code 代码

```tsx
<Code value="const x = 1" lang="javascript" />
<Code value="npm install" copyable />
```

---

## Link 链接

```tsx
<Link href="https://example.com">External Link</Link>
<Link href="/about" variant="primary">Primary</Link>
```

---

## Divider 分割线

```tsx
<Divider />
<Divider direction="vertical" />
<Divider>Text</Divider>
```
