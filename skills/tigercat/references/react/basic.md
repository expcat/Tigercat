---
name: tigercat-react-basic
description: React basic components usage - Alert, Avatar, Badge, Button, Code, Divider, Empty, Icon, Image, ImagePreview, ImageGroup, ImageCropper, ImageViewer, Link, QRCode, Rate, Result, Segmented, Statistic, Tag, Text, Watermark
---

# Basic Components (React)

基础组件：Alert, Avatar, Badge, Button, Code, Divider, Empty, Icon, Image, ImagePreview, ImageGroup, ImageCropper, ImageViewer, Link, QRCode, Rate, Result, Segmented, Statistic, Tag, Text, Watermark

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
{/* 基本类型 */}
<Alert type="success" title="Success" description="Operation completed" />
<Alert type="warning" title="Warning" />
<Alert type="error" title="Error" />
<Alert type="info" title="Info" />

{/* 尺寸 */}
<Alert size="sm" title="Small" />
<Alert size="lg" title="Large" description="Detailed text" />

{/* 隐藏图标 */}
<Alert title="No icon" showIcon={false} />

{/* 可关闭 + 自定义无障碍标签 */}
<Alert title="Closable" closable closeAriaLabel="关闭" onClose={handleClose} />

{/* 自定义内容 */}
<Alert
  type="info"
  titleSlot={<strong>Custom title</strong>}
  descriptionSlot={<em>Custom description</em>}
/>

{/* children 默认内容 */}
<Alert type="warning">Simple text content</Alert>
```

---

## Avatar & Badge

```tsx
{/* 图片头像 */}
<Avatar src="/avatar.jpg" alt="User Name" size="lg" />
{/* 文字头像 */}
<Avatar text="AB" shape="square" />
{/* 图标头像 */}
<Avatar aria-label="用户">
  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="..." /></svg>
</Avatar>
{/* 自定义颜色 */}
<Avatar text="U" bgColor="bg-[var(--tiger-primary,#2563eb)]" textColor="text-white" />
{/* 图片加载失败回退到文字 */}
<Avatar src="/broken.jpg" text="Fallback" alt="Fallback" />

{/* 搭配 Badge */}
<Badge content={5} standalone={false}><Avatar /></Badge>
<Badge type="dot" standalone={false}><Avatar /></Badge>
<Badge type="text" content="NEW" variant="primary" />
```

---

## Tag 标签

```tsx
<Tag>Default</Tag>
<Tag variant="primary">Primary</Tag>
<Tag size="lg" variant="success">Large</Tag>
<Tag closable onClose={handleClose}>Closable</Tag>
<Tag closable closeAriaLabel="移除标签">自定义 aria-label</Tag>
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
<Text tag="h2" size="2xl" weight="bold">Heading</Text>
<Text color="primary">Primary color</Text>
<Text truncate>Very long text that will be truncated...</Text>
<Text italic underline>Styled text</Text>
```

---

## Code 代码

```tsx
import { Code } from '@expcat/tigercat-react'

{
  /* 基础用法（默认显示复制按钮） */
}
;<Code code="const x = 1" />

{
  /* 自定义按钮文案 */
}
;<Code code="npm install" copyLabel="复制代码" copiedLabel="已复制" />

{
  /* 禁用复制 */
}
;<Code code="readonly" copyable={false} />

{
  /* 监听复制事件 */
}
;<Code code="npm install" onCopy={(code) => console.log(code)} />
```

---

## Link 链接

```tsx
{/* 变体 */}
<Link href="/about">Primary（默认）</Link>
<Link href="/about" variant="secondary">Secondary</Link>
<Link href="/about" variant="default">Default</Link>

{/* 尺寸 */}
<Link href="#" size="sm">Small</Link>
<Link href="#" size="lg">Large</Link>

{/* 禁用 */}
<Link href="/no" disabled>Disabled</Link>

{/* 隐藏下划线 */}
<Link href="#" underline={false}>No underline</Link>

{/* 外部链接（自动 rel） */}
<Link href="https://github.com" target="_blank">GitHub</Link>

{/* 点击事件 */}
<Link href="#" onClick={handleClick}>Click me</Link>
```

---

## Divider 分割线

> 完整用法见 [layout.md](layout.md#divider-分割线)

---

## Image 图片

```tsx
import { Image } from '@expcat/tigercat-react'

{
  /* 基本用法 */
}
;<Image src="/photo.jpg" alt="Photo" />

{
  /* 适配模式 */
}
;<Image src="/photo.jpg" fit="contain" width={200} height={200} />

{
  /* 懒加载 */
}
;<Image src="/photo.jpg" lazy />

{
  /* 点击预览 */
}
;<Image src="/photo.jpg" preview />

{
  /* 回退图片 */
}
;<Image src="/broken.jpg" fallback="/fallback.jpg" />

{
  /* 自定义错误/加载渲染 */
}
;<Image
  src="/broken.jpg"
  errorRender={<span>加载失败</span>}
  placeholderRender={<span>加载中...</span>}
/>
```

---

## ImagePreview 图片预览

```tsx
import { useState } from 'react'
import { ImagePreview } from '@expcat/tigercat-react'

const [show, setShow] = useState(false)
const images = ['/a.jpg', '/b.jpg', '/c.jpg']

<button onClick={() => setShow(true)}>预览</button>

{/* 单张预览 */}
<ImagePreview open={show} images={['/photo.jpg']} onOpenChange={setShow} />

{/* 多张预览 */}
<ImagePreview open={show} images={images} currentIndex={0} onOpenChange={setShow} />
```

---

## ImageGroup 图片组

```tsx
import { Image, ImageGroup } from '@expcat/tigercat-react'
;<ImageGroup>
  <Image src="/a.jpg" preview />
  <Image src="/b.jpg" preview />
  <Image src="/c.jpg" preview />
</ImageGroup>
```

---

## ImageCropper 图片裁剪

```tsx
import { useRef } from 'react'
import { ImageCropper } from '@expcat/tigercat-react'
import type { ImageCropperRef } from '@expcat/tigercat-react'

const cropperRef = useRef<ImageCropperRef>(null)

async function handleCrop() {
  const result = await cropperRef.current?.getCropResult()
  console.log(result?.dataURL, result?.blob)
}

<ImageCropper
  ref={cropperRef}
  src="/photo.jpg"
  aspectRatio={16 / 9}
  guides
  onCropChange={(rect) => console.log(rect)}
  onReady={() => console.log('ready')}
/>
<button onClick={handleCrop}>裁剪</button>
```

---

## Empty 空状态

```tsx
import { Empty, Button } from '@expcat/tigercat-react'

{/* 默认空状态 */}
<Empty description="暂无数据" />

{/* 预设类型 */}
<Empty preset="no-data" description="没有找到数据" />
<Empty preset="no-results" description="搜索无结果" />
<Empty preset="error" description="加载失败" />

{/* 带操作按钮 */}
<Empty description="暂无内容" extra={<Button variant="primary">立即创建</Button>} />

{/* 隐藏图片 */}
<Empty description="无数据" showImage={false} />
```

---

## Result 结果页

```tsx
import { Result, Button } from '@expcat/tigercat-react'

{/* 成功 */}
<Result
  status="success"
  title="操作成功"
  subTitle="订单已提交"
  extra={<Button variant="primary">返回首页</Button>}
/>

{/* 错误 */}
<Result status="error" title="提交失败" subTitle="请检查输入内容" />

{/* 404 */}
<Result status="404" title="404" subTitle="页面不存在" />

{/* 自定义图标 */}
<Result status="info" title="提示" icon={<span>💡</span>} />
```

---

## QRCode 二维码

```tsx
import { QRCode } from '@expcat/tigercat-react'

{/* 基本用法 */}
<QRCode value="https://example.com" />

{/* 自定义尺寸与颜色 */}
<QRCode value="hello" size={200} color="#1677ff" />

{/* 过期状态 + 刷新 */}
<QRCode value="expired" status="expired" onRefresh={handleRefresh} />
```

---

## Statistic 统计数值

```tsx
import { Statistic } from '@expcat/tigercat-react'

{/* 基本用法 */}
<Statistic title="活跃用户" value={112893} />

{/* 千分位 + 精度 */}
<Statistic title="账户余额" value={112893.12} precision={2} groupSeparator prefix="￥" />

{/* 数值动画 */}
<Statistic title="总订单" value={9280} animated animationDuration={2000} />

{/* 尺寸 */}
<Statistic title="小号" value={99} size="sm" />
<Statistic title="大号" value={99} size="lg" />
```

---

## Rate 评分

```tsx
import { useState } from 'react'
import { Rate } from '@expcat/tigercat-react'

const [score, setScore] = useState(3)

{/* 基本用法 */}
<Rate value={score} onChange={setScore} />

{/* 半选 */}
<Rate value={score} onChange={setScore} allowHalf />

{/* 自定义字符 */}
<Rate value={score} onChange={setScore} character="❤" />

{/* 尺寸 */}
<Rate value={score} onChange={setScore} size="lg" />

{/* 禁用 */}
<Rate value={4} disabled />

{/* 事件 */}
<Rate value={score} onChange={setScore} onHoverChange={handleHover} />
```

---

## Segmented 分段控制

```tsx
import { useState } from 'react'
import { Segmented } from '@expcat/tigercat-react'

const [selected, setSelected] = useState<string | number>('daily')
const options = [
  { value: 'daily', label: '日' },
  { value: 'weekly', label: '周' },
  { value: 'monthly', label: '月' }
]

{/* 基本用法 */}
<Segmented value={selected} onChange={setSelected} options={options} />

{/* 尺寸 */}
<Segmented value={selected} onChange={setSelected} options={options} size="sm" />

{/* 撑满容器 */}
<Segmented value={selected} onChange={setSelected} options={options} block />

{/* 禁用 */}
<Segmented value={selected} onChange={setSelected} options={options} disabled />
```

---

## Watermark 水印

```tsx
import { Watermark } from '@expcat/tigercat-react'

{/* 文字水印 */}
<Watermark content="Tigercat">
  <div style={{ height: 300 }}>内容区域</div>
</Watermark>

{/* 多行文字 */}
<Watermark content={['Tigercat', '2026-05-06']}>
  <div style={{ height: 300 }}>内容区域</div>
</Watermark>

{/* 图片水印 */}
<Watermark image="/logo.png" width={80} height={40}>
  <div style={{ height: 300 }}>内容区域</div>
</Watermark>

{/* 自定义字体 */}
<Watermark content="Confidential" font={{ fontSize: 20, color: 'rgba(255,0,0,0.1)' }}>
  <div style={{ height: 300 }}>内容区域</div>
</Watermark>
```

---

## ImageViewer 图片查看器

```tsx
import { useState } from 'react'
import { ImageViewer, Button } from '@expcat/tigercat-react'

const [visible, setVisible] = useState(false)
const images = ['/a.jpg', '/b.jpg', '/c.jpg']

<Button onClick={() => setVisible(true)}>打开查看器</Button>

{/* 基本用法 */}
<ImageViewer open={visible} images={images} onClose={() => setVisible(false)} />

{/* 禁用旋转 */}
<ImageViewer open={visible} images={images} rotatable={false} onClose={() => setVisible(false)} />

{/* 自定义缩放范围 */}
<ImageViewer open={visible} images={images} minZoom={0.2} maxZoom={5} onClose={() => setVisible(false)} />
```
