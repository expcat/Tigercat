---
name: tigercat-vue-basic
description: Vue 3 basic components usage - Alert, Avatar, Badge, Button, Code, Divider, Empty, Icon, Image, ImagePreview, ImageGroup, ImageCropper, ImageViewer, Link, QRCode, Rate, Result, Segmented, Statistic, Tag, Text, Watermark
---

# Basic Components (Vue 3)

基础组件：Alert, Avatar, Badge, Button, Code, Divider, Empty, Icon, Image, ImagePreview, ImageGroup, ImageCropper, ImageViewer, Link, QRCode, Rate, Result, Segmented, Statistic, Tag, Text, Watermark

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
  <!-- 图片头像 -->
  <Avatar src="/avatar.jpg" alt="User Name" size="lg" />
  <!-- 文字头像 -->
  <Avatar text="AB" shape="square" />
  <!-- 图标头像 -->
  <Avatar aria-label="用户">
    <svg class="w-5 h-5" viewBox="0 0 24 24"><path d="..." /></svg>
  </Avatar>
  <!-- 自定义颜色 -->
  <Avatar text="U" bg-color="bg-[var(--tiger-primary,#2563eb)]" text-color="text-white" />
  <!-- 图片加载失败回退到文字 -->
  <Avatar src="/broken.jpg" text="Fallback" alt="Fallback" />

  <!-- 搭配 Badge -->
  <Badge :content="5" :standalone="false"><Avatar /></Badge>
  <Badge type="dot" :standalone="false"><Avatar /></Badge>
  <Badge type="text" content="NEW" variant="primary" />
</template>
```

---

## Tag 标签

```vue
<template>
  <Tag>Default</Tag>
  <Tag variant="primary">Primary</Tag>
  <Tag size="lg" variant="success">Large</Tag>
  <Tag closable @close="handleClose">Closable</Tag>
  <Tag closable closeAriaLabel="移除标签">自定义 aria-label</Tag>
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

> 完整用法见 [layout.md](layout.md#divider-分割线)

---

## Image 图片

```vue
<script setup>
import { Image } from '@expcat/tigercat-vue'
</script>

<template>
  <!-- 基本用法 -->
  <Image src="/photo.jpg" alt="Photo" />

  <!-- 适配模式 -->
  <Image src="/photo.jpg" fit="contain" :width="200" :height="200" />

  <!-- 懒加载 -->
  <Image src="/photo.jpg" lazy />

  <!-- 点击预览 -->
  <Image src="/photo.jpg" preview />

  <!-- 回退图片 -->
  <Image src="/broken.jpg" fallback-src="/fallback.jpg" />

  <!-- 自定义错误/加载插槽 -->
  <Image src="/broken.jpg">
    <template #error><span>加载失败</span></template>
    <template #placeholder><span>加载中...</span></template>
  </Image>
</template>
```

---

## ImagePreview 图片预览

```vue
<script setup>
import { ref } from 'vue'
import { ImagePreview } from '@expcat/tigercat-vue'

const show = ref(false)
const images = ['/a.jpg', '/b.jpg', '/c.jpg']
</script>

<template>
  <button @click="show = true">预览</button>

  <!-- 单张预览 -->
  <ImagePreview v-model:open="show" :images="['/photo.jpg']" />

  <!-- 多张预览 -->
  <ImagePreview v-model:open="show" :images="images" :currentIndex="0" />
</template>
```

---

## ImageGroup 图片组

```vue
<script setup>
import { Image, ImageGroup } from '@expcat/tigercat-vue'
</script>

<template>
  <ImageGroup>
    <Image src="/a.jpg" preview />
    <Image src="/b.jpg" preview />
    <Image src="/c.jpg" preview />
  </ImageGroup>
</template>
```

---

## ImageCropper 图片裁剪

```vue
<script setup>
import { ref } from 'vue'
import { ImageCropper } from '@expcat/tigercat-vue'

const cropperRef = ref()

async function handleCrop() {
  const result = await cropperRef.value.getCropResult()
  console.log(result.dataURL, result.blob)
}
</script>

<template>
  <ImageCropper
    ref="cropperRef"
    src="/photo.jpg"
    :aspectRatio="16 / 9"
    guides
    @crop-change="(rect) => console.log(rect)"
    @ready="() => console.log('ready')" />
  <button @click="handleCrop">裁剪</button>
</template>
```

---

## Empty 空状态

```vue
<script setup>
import { Empty, Button } from '@expcat/tigercat-vue'
</script>

<template>
  <!-- 默认空状态 -->
  <Empty description="暂无数据" />

  <!-- 预设类型 -->
  <Empty preset="no-data" description="没有找到数据" />
  <Empty preset="no-results" description="搜索无结果" />
  <Empty preset="error" description="加载失败" />

  <!-- 带操作按钮 -->
  <Empty description="暂无内容">
    <template #extra>
      <Button variant="primary">立即创建</Button>
    </template>
  </Empty>

  <!-- 隐藏图片 -->
  <Empty description="无数据" :show-image="false" />
</template>
```

---

## Result 结果页

```vue
<script setup>
import { Result, Button } from '@expcat/tigercat-vue'
</script>

<template>
  <!-- 成功 -->
  <Result status="success" title="操作成功" sub-title="订单已提交">
    <template #extra>
      <Button variant="primary">返回首页</Button>
    </template>
  </Result>

  <!-- 错误 -->
  <Result status="error" title="提交失败" sub-title="请检查输入内容" />

  <!-- 404 -->
  <Result status="404" title="404" sub-title="页面不存在" />

  <!-- 自定义图标 -->
  <Result status="info" title="提示">
    <template #icon>
      <span>💡</span>
    </template>
  </Result>
</template>
```

---

## QRCode 二维码

```vue
<script setup>
import { QRCode } from '@expcat/tigercat-vue'
</script>

<template>
  <!-- 基本用法 -->
  <QRCode value="https://example.com" />

  <!-- 自定义尺寸与颜色 -->
  <QRCode value="hello" :size="200" color="#1677ff" />

  <!-- 过期状态 + 刷新 -->
  <QRCode value="expired" status="expired" @refresh="handleRefresh" />
</template>
```

---

## Statistic 统计数值

```vue
<script setup>
import { Statistic } from '@expcat/tigercat-vue'
</script>

<template>
  <!-- 基本用法 -->
  <Statistic title="活跃用户" :value="112893" />

  <!-- 千分位 + 精度 -->
  <Statistic title="账户余额" :value="112893.12" :precision="2" group-separator prefix="￥" />

  <!-- 数值动画 -->
  <Statistic title="总订单" :value="9280" animated :animation-duration="2000" />

  <!-- 尺寸 -->
  <Statistic title="小号" :value="99" size="sm" />
  <Statistic title="大号" :value="99" size="lg" />
</template>
```

---

## Rate 评分

```vue
<script setup>
import { ref } from 'vue'
import { Rate } from '@expcat/tigercat-vue'

const score = ref(3)
</script>

<template>
  <!-- 基本用法 -->
  <Rate v-model="score" />

  <!-- 半选 -->
  <Rate v-model="score" allow-half />

  <!-- 自定义字符 -->
  <Rate v-model="score" character="❤" />

  <!-- 尺寸 -->
  <Rate v-model="score" size="lg" />

  <!-- 禁用 -->
  <Rate :model-value="4" disabled />

  <!-- 事件 -->
  <Rate v-model="score" @change="handleChange" @hover-change="handleHover" />
</template>
```

---

## Segmented 分段控制

```vue
<script setup>
import { ref } from 'vue'
import { Segmented } from '@expcat/tigercat-vue'

const selected = ref('daily')
const options = [
  { value: 'daily', label: '日' },
  { value: 'weekly', label: '周' },
  { value: 'monthly', label: '月' }
]
</script>

<template>
  <!-- 基本用法 -->
  <Segmented v-model="selected" :options="options" />

  <!-- 尺寸 -->
  <Segmented v-model="selected" :options="options" size="sm" />

  <!-- 撑满容器 -->
  <Segmented v-model="selected" :options="options" block />

  <!-- 禁用 -->
  <Segmented v-model="selected" :options="options" disabled />
</template>
```

---

## Watermark 水印

```vue
<script setup>
import { Watermark } from '@expcat/tigercat-vue'
</script>

<template>
  <!-- 文字水印 -->
  <Watermark content="Tigercat">
    <div style="height: 300px">内容区域</div>
  </Watermark>

  <!-- 多行文字 -->
  <Watermark :content="['Tigercat', '2026-05-06']">
    <div style="height: 300px">内容区域</div>
  </Watermark>

  <!-- 图片水印 -->
  <Watermark image="/logo.png" :width="80" :height="40">
    <div style="height: 300px">内容区域</div>
  </Watermark>

  <!-- 自定义字体 -->
  <Watermark content="Confidential" :font="{ fontSize: 20, color: 'rgba(255,0,0,0.1)' }">
    <div style="height: 300px">内容区域</div>
  </Watermark>
</template>
```

---

## ImageViewer 图片查看器

```vue
<script setup>
import { ref } from 'vue'
import { ImageViewer, Button } from '@expcat/tigercat-vue'

const visible = ref(false)
const images = ['/a.jpg', '/b.jpg', '/c.jpg']
</script>

<template>
  <Button @click="visible = true">打开查看器</Button>

  <!-- 基本用法 -->
  <ImageViewer v-model:open="visible" :images="images" @close="visible = false" />

  <!-- 禁用旋转 -->
  <ImageViewer v-model:open="visible" :images="images" :rotatable="false" />

  <!-- 自定义缩放范围 -->
  <ImageViewer v-model:open="visible" :images="images" :min-zoom="0.2" :max-zoom="5" />
</template>
```
