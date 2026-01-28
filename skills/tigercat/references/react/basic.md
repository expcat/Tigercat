---
name: tigercat-react-basic
description: React basic components - Alert, Avatar, Badge, Button, Code, Divider, Icon, Link, Tag, Text
---

# Basic Components (React)

基础组件：Alert, Avatar, Badge, Button, Code, Divider, Icon, Link, Tag, Text

## Button 按钮

```tsx
import { Button } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      {/* Variants */}
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>

      {/* Sizes */}
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>

      {/* States */}
      <Button disabled>Disabled</Button>
      <Button loading>Loading...</Button>
      <Button block>Block Button</Button>

      {/* Events */}
      <Button onClick={handleClick}>Click Me</Button>

      {/* Custom loading icon */}
      <Button loading loadingIcon={<MySpinner />}>
        Loading...
      </Button>
    </>
  )
}
```

**Props:**

| Prop        | Type                                                         | Default     | Description    |
| ----------- | ------------------------------------------------------------ | ----------- | -------------- |
| variant     | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'link'` | `'primary'` | 按钮样式       |
| size        | `'sm' \| 'md' \| 'lg'`                                       | `'md'`      | 按钮尺寸       |
| disabled    | `boolean`                                                    | `false`     | 禁用状态       |
| loading     | `boolean`                                                    | `false`     | 加载状态       |
| loadingIcon | `ReactNode`                                                  | -           | 自定义加载图标 |
| block       | `boolean`                                                    | `false`     | 块级按钮       |
| type        | `'button' \| 'submit' \| 'reset'`                            | `'button'`  | 原生类型       |
| className   | `string`                                                     | -           | 自定义类名     |

**Callbacks:** `onClick`

---

## Alert 警告提示

```tsx
import { Alert } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Alert type="success" title="Success" description="Operation completed" />
      <Alert type="info" title="Info" closable onClose={handleClose} />
      <Alert type="warning" title="Warning" />
      <Alert type="error" title="Error" />
    </>
  )
}
```

**Props:**

| Prop        | Type                                          | Default  | Description |
| ----------- | --------------------------------------------- | -------- | ----------- |
| type        | `'success' \| 'info' \| 'warning' \| 'error'` | `'info'` | 类型        |
| title       | `string`                                      | -        | 标题        |
| description | `string`                                      | -        | 描述内容    |
| closable    | `boolean`                                     | `false`  | 可关闭      |

**Callbacks:** `onClose`

---

## Avatar 头像

```tsx
import { Avatar } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Avatar src="/avatar.jpg" size="lg" />
      <Avatar text="AB" />
      <Avatar shape="square" size="sm" />
    </>
  )
}
```

**Props:**

| Prop  | Type                             | Default    | Description          |
| ----- | -------------------------------- | ---------- | -------------------- |
| src   | `string`                         | -          | 图片地址             |
| size  | `'sm' \| 'md' \| 'lg' \| number` | `'md'`     | 尺寸                 |
| shape | `'circle' \| 'square'`           | `'circle'` | 形状                 |
| text  | `string`                         | -          | 文字（无图片时显示） |

---

## Badge 徽标

```tsx
import { Badge, Avatar } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Badge value={5}>
        <Avatar />
      </Badge>
      <Badge value={100} max={99}>
        <Avatar />
      </Badge>
      <Badge dot>
        <Avatar />
      </Badge>
    </>
  )
}
```

**Props:**

| Prop  | Type               | Default | Description |
| ----- | ------------------ | ------- | ----------- |
| value | `number \| string` | -       | 显示值      |
| max   | `number`           | `99`    | 最大值      |
| dot   | `boolean`          | `false` | 小红点模式  |

---

## Tag 标签

```tsx
import { Tag } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Tag>Default</Tag>
      <Tag color="blue">Blue</Tag>
      <Tag color="green">Green</Tag>
      <Tag color="red">Red</Tag>
      <Tag closable onClose={handleClose}>
        Closable
      </Tag>
      <Tag size="sm">Small</Tag>
    </>
  )
}
```

**Props:**

| Prop     | Type           | Default | Description |
| -------- | -------------- | ------- | ----------- |
| color    | `string`       | -       | 颜色        |
| size     | `'sm' \| 'md'` | `'md'`  | 尺寸        |
| closable | `boolean`      | `false` | 可关闭      |

**Callbacks:** `onClose`

---

## Icon 图标

```tsx
import { Icon } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Icon name="check" />
      <Icon name="close" size={24} color="#f00" />
      <Icon name="loading" rotate />
    </>
  )
}
```

**Props:**

| Prop   | Type               | Default | Description |
| ------ | ------------------ | ------- | ----------- |
| name   | `string`           | -       | 图标名称    |
| size   | `number \| string` | `16`    | 尺寸        |
| color  | `string`           | -       | 颜色        |
| rotate | `boolean`          | `false` | 旋转动画    |

---

## Text 文本

```tsx
import { Text } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Text>Default text</Text>
      <Text size="lg" weight="bold">
        Large bold
      </Text>
      <Text color="secondary">Secondary color</Text>
      <Text ellipsis maxWidth={200}>
        Very long text that will be truncated...
      </Text>
    </>
  )
}
```

**Props:**

| Prop     | Type                                                            | Default    | Description  |
| -------- | --------------------------------------------------------------- | ---------- | ------------ |
| size     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                          | `'md'`     | 字号         |
| weight   | `'normal' \| 'medium' \| 'semibold' \| 'bold'`                  | `'normal'` | 字重         |
| color    | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error'` | -          | 颜色         |
| ellipsis | `boolean`                                                       | `false`    | 文本溢出省略 |

---

## Code 代码

```tsx
import { Code } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Code value="const x = 1" lang="javascript" />
      <Code value="npm install" copyable />
    </>
  )
}
```

**Props:**

| Prop     | Type      | Default | Description |
| -------- | --------- | ------- | ----------- |
| value    | `string`  | -       | 代码内容    |
| lang     | `string`  | -       | 语言        |
| copyable | `boolean` | `false` | 可复制      |

---

## Link 链接

```tsx
import { Link } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Link href="https://example.com">External Link</Link>
      <Link href="/about" variant="primary">
        Primary Link
      </Link>
      <Link disabled>Disabled</Link>
    </>
  )
}
```

**Props:**

| Prop     | Type                     | Default     | Description |
| -------- | ------------------------ | ----------- | ----------- |
| href     | `string`                 | -           | 链接地址    |
| variant  | `'default' \| 'primary'` | `'default'` | 样式        |
| disabled | `boolean`                | `false`     | 禁用        |

**Callbacks:** `onClick`

---

## Divider 分割线

```tsx
import { Divider } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Divider />
      <Divider direction="vertical" />
      <Divider>Text</Divider>
      <Divider align="left">Left aligned</Divider>
    </>
  )
}
```

**Props:**

| Prop      | Type                            | Default        | Description |
| --------- | ------------------------------- | -------------- | ----------- |
| direction | `'horizontal' \| 'vertical'`    | `'horizontal'` | 方向        |
| align     | `'left' \| 'center' \| 'right'` | `'center'`     | 文本对齐    |
| children  | `ReactNode`                     | -              | 分割线文本  |
