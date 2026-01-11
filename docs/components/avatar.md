# Avatar 头像

用于展示用户或实体的头像组件，支持图片、文字、图标等多种展示形式。

## 基本用法

### Vue 3

```vue
<script setup>
import { Avatar } from '@tigercat/vue';
</script>

<template>
  <!-- 图片头像 -->
  <Avatar src="/user.jpg" alt="User" />

  <!-- 文字头像 -->
  <Avatar text="John Doe" />

  <!-- 图标头像 -->
  <Avatar>
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  </Avatar>
</template>
```

### React

```tsx
import { Avatar } from '@tigercat/react';

function App() {
  return (
    <>
      {/* 图片头像 */}
      <Avatar src="/user.jpg" alt="User" />

      {/* 文字头像 */}
      <Avatar text="John Doe" />

      {/* 图标头像 */}
      <Avatar>
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </Avatar>
    </>
  );
}
```

## 头像尺寸 (Sizes)

Avatar 组件支持 4 种不同的尺寸：

- `sm` - 小尺寸 (32px)
- `md` - 中等尺寸（默认，40px）
- `lg` - 大尺寸 (48px)
- `xl` - 超大尺寸 (64px)

### Vue 3

```vue
<template>
  <Avatar size="sm" text="SM" />
  <Avatar size="md" text="MD" />
  <Avatar size="lg" text="LG" />
  <Avatar size="xl" text="XL" />
</template>
```

### React

```tsx
<Avatar size="sm" text="SM" />
<Avatar size="md" text="MD" />
<Avatar size="lg" text="LG" />
<Avatar size="xl" text="XL" />
```

## 头像形状 (Shapes)

Avatar 组件支持 2 种不同的形状：

- `circle` - 圆形（默认）
- `square` - 方形

### Vue 3

```vue
<template>
  <Avatar shape="circle" text="Circle" />
  <Avatar shape="square" text="Square" />
</template>
```

### React

```tsx
<Avatar shape="circle" text="Circle" />
<Avatar shape="square" text="Square" />
```

## 图片头像 (Image Avatar)

使用 `src` 属性显示图片头像。当图片加载失败时，会自动降级显示文字或图标。

### Vue 3

```vue
<template>
  <!-- 正常加载图片 -->
  <Avatar src="/avatar.jpg" alt="User Avatar" />

  <!-- 图片加载失败时显示文字 -->
  <Avatar src="/invalid.jpg" text="Fallback" alt="User Avatar" />
</template>
```

### React

```tsx
{
  /* 正常加载图片 */
}
<Avatar src="/avatar.jpg" alt="User Avatar" />;

{
  /* 图片加载失败时显示文字 */
}
<Avatar src="/invalid.jpg" text="Fallback" alt="User Avatar" />;
```

## 文字头像 (Text Avatar)

使用 `text` 属性显示文字头像。组件会自动提取首字母或缩写。

### Vue 3

```vue
<template>
  <!-- 单个词：显示首字母 -->
  <Avatar text="Alice" />
  <!-- 显示 "A" -->

  <!-- 多个词：显示首字母缩写 -->
  <Avatar text="John Doe" />
  <!-- 显示 "JD" -->

  <!-- 中文名：显示前两个字 -->
  <Avatar text="张三" />
  <!-- 显示 "张三" -->
</template>
```

### React

```tsx
{
  /* 单个词：显示首字母 */
}
<Avatar text="Alice" />;
{
  /* 显示 "A" */
}

{
  /* 多个词：显示首字母缩写 */
}
<Avatar text="John Doe" />;
{
  /* 显示 "JD" */
}

{
  /* 中文名：显示前两个字 */
}
<Avatar text="张三" />;
{
  /* 显示 "张三" */
}
```

## 图标头像 (Icon Avatar)

通过插槽/子元素传入图标内容。

### Vue 3

```vue
<template>
  <Avatar>
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  </Avatar>
</template>
```

### React

```tsx
<Avatar>
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
</Avatar>
```

## 自定义颜色 (Custom Colors)

可以通过 `bgColor` 和 `textColor` 属性自定义文字/图标头像的背景色和文字色。

### Vue 3

```vue
<template>
  <!-- 使用 Tailwind 类名 -->
  <Avatar text="AB" bg-color="bg-blue-500" text-color="text-white" />
  <Avatar text="CD" bg-color="bg-green-500" text-color="text-white" />
  <Avatar text="EF" bg-color="bg-purple-500" text-color="text-white" />

  <!-- 使用 CSS 颜色值（需要通过 style 传入） -->
  <Avatar text="GH">
    <template #default>
      <span class="bg-[#3b82f6] text-white">GH</span>
    </template>
  </Avatar>
</template>
```

### React

```tsx
{/* 使用 Tailwind 类名 */}
<Avatar text="AB" bgColor="bg-blue-500" textColor="text-white" />
<Avatar text="CD" bgColor="bg-green-500" textColor="text-white" />
<Avatar text="EF" bgColor="bg-purple-500" textColor="text-white" />
```

## 实际应用示例

### 用户列表

#### Vue 3

```vue
<script setup>
import { ref } from 'vue';
import { Avatar } from '@tigercat/vue';

const users = ref([
  { id: 1, name: 'Alice Johnson', avatar: '/alice.jpg' },
  { id: 2, name: 'Bob Smith', avatar: null },
  { id: 3, name: '张三', avatar: null },
]);
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-for="user in users" :key="user.id" class="flex items-center gap-3">
      <Avatar :src="user.avatar" :text="user.name" :alt="user.name" />
      <span>{{ user.name }}</span>
    </div>
  </div>
</template>
```

#### React

```tsx
import { Avatar } from '@tigercat/react';

function UserList() {
  const users = [
    { id: 1, name: 'Alice Johnson', avatar: '/alice.jpg' },
    { id: 2, name: 'Bob Smith', avatar: null },
    { id: 3, name: '张三', avatar: null },
  ];

  return (
    <div className="flex flex-col gap-4">
      {users.map((user) => (
        <div key={user.id} className="flex items-center gap-3">
          <Avatar
            src={user.avatar || undefined}
            text={user.name}
            alt={user.name}
          />
          <span>{user.name}</span>
        </div>
      ))}
    </div>
  );
}
```

### 头像组 (Avatar Group)

#### Vue 3

```vue
<script setup>
import { Avatar } from '@tigercat/vue';

const team = [
  { name: 'Alice', avatar: '/alice.jpg' },
  { name: 'Bob', avatar: '/bob.jpg' },
  { name: 'Charlie', avatar: '/charlie.jpg' },
  { name: 'David', avatar: null },
];
</script>

<template>
  <div class="flex -space-x-2">
    <Avatar
      v-for="(member, index) in team"
      :key="index"
      :src="member.avatar"
      :text="member.name"
      :alt="member.name"
      size="md"
      class="ring-2 ring-white" />
  </div>
</template>
```

#### React

```tsx
import { Avatar } from '@tigercat/react';

function TeamAvatars() {
  const team = [
    { name: 'Alice', avatar: '/alice.jpg' },
    { name: 'Bob', avatar: '/bob.jpg' },
    { name: 'Charlie', avatar: '/charlie.jpg' },
    { name: 'David', avatar: null },
  ];

  return (
    <div className="flex -space-x-2">
      {team.map((member, index) => (
        <Avatar
          key={index}
          src={member.avatar || undefined}
          text={member.name}
          alt={member.name}
          size="md"
          className="ring-2 ring-white"
        />
      ))}
    </div>
  );
}
```

### 在线状态指示器

#### Vue 3

```vue
<script setup>
import { Avatar, Badge } from '@tigercat/vue';
</script>

<template>
  <Badge
    type="dot"
    variant="success"
    :standalone="false"
    position="bottom-right">
    <Avatar src="/user.jpg" alt="Online User" size="lg" />
  </Badge>
</template>
```

#### React

```tsx
import { Avatar, Badge } from '@tigercat/react';

function OnlineAvatar() {
  return (
    <Badge
      type="dot"
      variant="success"
      standalone={false}
      position="bottom-right">
      <Avatar src="/user.jpg" alt="Online User" size="lg" />
    </Badge>
  );
}
```

## API

### Props

| 属性      | 说明                                     | 类型                           | 默认值                                                              |
| --------- | ---------------------------------------- | ------------------------------ | ------------------------------------------------------------------- |
| size      | 头像尺寸                                 | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`                                                              |
| shape     | 头像形状                                 | `'circle' \| 'square'`         | `'circle'`                                                          |
| src       | 图片源地址                               | `string`                       | -                                                                   |
| alt       | 图片替代文本                             | `string`                       | `''`                                                                |
| text      | 文字内容（用于生成缩写）                 | `string`                       | -                                                                   |
| bgColor   | 背景色（仅文字/图标头像）                | `string`                       | `'bg-[var(--tiger-avatar-bg,#e5e7eb)]'`                             |
| textColor | 文字颜色（仅文字/图标头像）              | `string`                       | `'text-[var(--tiger-avatar-text,var(--tiger-text-muted,#6b7280))]'` |
| className | 自定义 CSS 类名                          | `string`                       | -                                                                   |
| style     | 自定义样式（Vue: object / React: style） | `object`                       | -                                                                   |

### Slots (Vue)

| 名称    | 说明                                          |
| ------- | --------------------------------------------- |
| default | 图标内容（当 `src` 和 `text` 都未提供时显示） |

### Children (React)

| 名称     | 说明                                          |
| -------- | --------------------------------------------- |
| children | 图标内容（当 `src` 和 `text` 都未提供时显示） |

## 优先级

Avatar 组件的内容显示遵循以下优先级：

1. **图片** (`src`) - 最高优先级，当提供 `src` 且图片加载成功时显示
2. **文字** (`text`) - 当图片不可用或未提供时，显示文字缩写
3. **图标** (slot/children) - 当图片和文字都不可用时，显示插槽/子元素内容

## 样式定制

Avatar 组件使用 Tailwind CSS 类，可以通过 Tailwind 配置自定义样式。

### 主题变量（推荐）

默认样式使用 CSS 变量（带 fallback），便于统一主题：

- `--tiger-avatar-bg`：默认背景（文字/图标头像）
- `--tiger-avatar-text`：默认文字颜色（可配合 `--tiger-text-muted`）
- `--tiger-avatar-color-1` ~ `--tiger-avatar-color-10`：`generateAvatarColor()` 生成色盘

### 自定义类名

可以通过 `className` 属性添加额外的样式类：

```tsx
<Avatar text="AB" className="ring-2 ring-blue-500" />
```

## 可访问性

- 当提供 `text` 或显式的 `alt` / `aria-label` / `aria-labelledby` 时，Avatar 会作为可感知内容暴露给屏幕阅读器
- 当未提供任何可访问名称时，Avatar 会默认视为装饰性内容（`aria-hidden="true"`）
- 图片头像通过 `<img alt="...">` 提供可访问名称；若 `alt` 为空字符串则视为装饰性图片

## 使用场景

- **用户资料** - 显示用户头像和基本信息
- **评论系统** - 在评论列表中显示用户头像
- **团队展示** - 展示团队成员头像组
- **在线状态** - 结合 Badge 组件显示在线状态
- **联系人列表** - 显示联系人头像和名称
- **消息列表** - 在消息/通知列表中显示发送者头像

## 设计原则

Avatar 组件遵循以下设计原则：

1. **清晰识别** - 通过图片、文字或图标清晰标识用户或实体
2. **灵活适配** - 支持多种尺寸和形状，适应不同场景
3. **优雅降级** - 图片加载失败时自动降级到文字或图标显示
4. **主题一致** - 使用与其他 Tigercat 组件一致的设计风格
5. **易于定制** - 支持自定义颜色和样式，满足个性化需求
