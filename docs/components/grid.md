# Grid 栅格

24 栅格系统，支持响应式布局和自定义分栏。

## 基本用法

栅格系统基于 24 分栏设计。使用 `Row` 和 `Col` 组件创建基础网格布局。

### Vue 3

```vue
<script setup>
import { Row, Col } from '@tigercat/vue'
</script>

<template>
  <Row>
    <Col :span="24">
      <div class="bg-blue-500 text-white p-4">col-24</div>
    </Col>
  </Row>
  <Row>
    <Col :span="12">
      <div class="bg-blue-400 text-white p-4">col-12</div>
    </Col>
    <Col :span="12">
      <div class="bg-blue-600 text-white p-4">col-12</div>
    </Col>
  </Row>
  <Row>
    <Col :span="8">
      <div class="bg-blue-400 text-white p-4">col-8</div>
    </Col>
    <Col :span="8">
      <div class="bg-blue-500 text-white p-4">col-8</div>
    </Col>
    <Col :span="8">
      <div class="bg-blue-600 text-white p-4">col-8</div>
    </Col>
  </Row>
  <Row>
    <Col :span="6">
      <div class="bg-blue-400 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-600 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-400 text-white p-4">col-6</div>
    </Col>
  </Row>
</template>
```

### React

```tsx
import { Row, Col } from '@tigercat/react'

function App() {
  return (
    <>
      <Row>
        <Col span={24}>
          <div className="bg-blue-500 text-white p-4">col-24</div>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <div className="bg-blue-400 text-white p-4">col-12</div>
        </Col>
        <Col span={12}>
          <div className="bg-blue-600 text-white p-4">col-12</div>
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <div className="bg-blue-400 text-white p-4">col-8</div>
        </Col>
        <Col span={8}>
          <div className="bg-blue-500 text-white p-4">col-8</div>
        </Col>
        <Col span={8}>
          <div className="bg-blue-600 text-white p-4">col-8</div>
        </Col>
      </Row>
      <Row>
        <Col span={6}>
          <div className="bg-blue-400 text-white p-4">col-6</div>
        </Col>
        <Col span={6}>
          <div className="bg-blue-500 text-white p-4">col-6</div>
        </Col>
        <Col span={6}>
          <div className="bg-blue-600 text-white p-4">col-6</div>
        </Col>
        <Col span={6}>
          <div className="bg-blue-400 text-white p-4">col-6</div>
        </Col>
      </Row>
    </>
  )
}
```

## 区块间隔 (Gutter)

通过 `gutter` 属性设置栅格间隔，支持水平间隔或同时设置水平和垂直间隔。

### Vue 3

```vue
<template>
  <!-- 水平间隔 16px -->
  <Row :gutter="16">
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
  </Row>

  <!-- 水平间隔 16px，垂直间隔 24px -->
  <Row :gutter="[16, 24]">
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
  </Row>
</template>
```

### React

```tsx
{
  /* 水平间隔 16px */
}
;<Row gutter={16}>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
</Row>

{
  /* 水平间隔 16px，垂直间隔 24px */
}
;<Row gutter={[16, 24]}>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
</Row>
```

## 偏移 (Offset)

使用 `offset` 属性可以向右偏移列。

### Vue 3

```vue
<template>
  <Row>
    <Col :span="8">
      <div class="bg-blue-500 text-white p-4">col-8</div>
    </Col>
    <Col :span="8" :offset="8">
      <div class="bg-blue-500 text-white p-4">col-8 offset-8</div>
    </Col>
  </Row>
  <Row>
    <Col :span="6" :offset="6">
      <div class="bg-blue-500 text-white p-4">col-6 offset-6</div>
    </Col>
    <Col :span="6" :offset="6">
      <div class="bg-blue-500 text-white p-4">col-6 offset-6</div>
    </Col>
  </Row>
  <Row>
    <Col :span="12" :offset="6">
      <div class="bg-blue-500 text-white p-4">col-12 offset-6</div>
    </Col>
  </Row>
</template>
```

### React

```tsx
<Row>
  <Col span={8}>
    <div className="bg-blue-500 text-white p-4">col-8</div>
  </Col>
  <Col span={8} offset={8}>
    <div className="bg-blue-500 text-white p-4">col-8 offset-8</div>
  </Col>
</Row>
<Row>
  <Col span={6} offset={6}>
    <div className="bg-blue-500 text-white p-4">col-6 offset-6</div>
  </Col>
  <Col span={6} offset={6}>
    <div className="bg-blue-500 text-white p-4">col-6 offset-6</div>
  </Col>
</Row>
<Row>
  <Col span={12} offset={6}>
    <div className="bg-blue-500 text-white p-4">col-12 offset-6</div>
  </Col>
</Row>
```

## 排序 (Order)

通过 `order` 属性改变列的顺序。

### Vue 3

```vue
<template>
  <Row>
    <Col :span="6" :order="4">
      <div class="bg-blue-500 text-white p-4">1 order-4</div>
    </Col>
    <Col :span="6" :order="3">
      <div class="bg-blue-500 text-white p-4">2 order-3</div>
    </Col>
    <Col :span="6" :order="2">
      <div class="bg-blue-500 text-white p-4">3 order-2</div>
    </Col>
    <Col :span="6" :order="1">
      <div class="bg-blue-500 text-white p-4">4 order-1</div>
    </Col>
  </Row>
</template>
```

### React

```tsx
<Row>
  <Col span={6} order={4}>
    <div className="bg-blue-500 text-white p-4">1 order-4</div>
  </Col>
  <Col span={6} order={3}>
    <div className="bg-blue-500 text-white p-4">2 order-3</div>
  </Col>
  <Col span={6} order={2}>
    <div className="bg-blue-500 text-white p-4">3 order-2</div>
  </Col>
  <Col span={6} order={1}>
    <div className="bg-blue-500 text-white p-4">4 order-1</div>
  </Col>
</Row>
```

## 对齐方式

通过 `align` 和 `justify` 属性设置垂直和水平对齐方式。

### Vue 3

```vue
<template>
  <!-- 顶部对齐 -->
  <Row align="top" :gutter="16">
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4 h-24">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
  </Row>

  <!-- 居中对齐 -->
  <Row align="middle" :gutter="16">
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4 h-24">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
  </Row>

  <!-- 底部对齐 -->
  <Row align="bottom" :gutter="16">
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4 h-24">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
  </Row>

  <!-- 水平居中 -->
  <Row justify="center" :gutter="16">
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
  </Row>

  <!-- 两端对齐 -->
  <Row justify="space-between" :gutter="16">
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
    <Col :span="6">
      <div class="bg-blue-500 text-white p-4">col-6</div>
    </Col>
  </Row>
</template>
```

### React

```tsx
{
  /* 顶部对齐 */
}
;<Row align="top" gutter={16}>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4 h-24">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
</Row>

{
  /* 居中对齐 */
}
;<Row align="middle" gutter={16}>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4 h-24">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
</Row>

{
  /* 底部对齐 */
}
;<Row align="bottom" gutter={16}>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4 h-24">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
</Row>

{
  /* 水平居中 */
}
;<Row justify="center" gutter={16}>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
</Row>

{
  /* 两端对齐 */
}
;<Row justify="space-between" gutter={16}>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
  <Col span={6}>
    <div className="bg-blue-500 text-white p-4">col-6</div>
  </Col>
</Row>
```

## 响应式布局

支持根据不同屏幕尺寸显示不同的列宽。

断点说明：

- `xs`: < 640px
- `sm`: ≥ 640px
- `md`: ≥ 768px
- `lg`: ≥ 1024px
- `xl`: ≥ 1280px
- `2xl`: ≥ 1536px

### Vue 3

```vue
<template>
  <Row :gutter="16">
    <Col :span="{ xs: 24, sm: 12, md: 8, lg: 6 }">
      <div class="bg-blue-500 text-white p-4">Responsive Col</div>
    </Col>
    <Col :span="{ xs: 24, sm: 12, md: 8, lg: 6 }">
      <div class="bg-blue-500 text-white p-4">Responsive Col</div>
    </Col>
    <Col :span="{ xs: 24, sm: 12, md: 8, lg: 6 }">
      <div class="bg-blue-500 text-white p-4">Responsive Col</div>
    </Col>
    <Col :span="{ xs: 24, sm: 12, md: 8, lg: 6 }">
      <div class="bg-blue-500 text-white p-4">Responsive Col</div>
    </Col>
  </Row>
</template>
```

### React

```tsx
<Row gutter={16}>
  <Col span={{ xs: 24, sm: 12, md: 8, lg: 6 }}>
    <div className="bg-blue-500 text-white p-4">Responsive Col</div>
  </Col>
  <Col span={{ xs: 24, sm: 12, md: 8, lg: 6 }}>
    <div className="bg-blue-500 text-white p-4">Responsive Col</div>
  </Col>
  <Col span={{ xs: 24, sm: 12, md: 8, lg: 6 }}>
    <div className="bg-blue-500 text-white p-4">Responsive Col</div>
  </Col>
  <Col span={{ xs: 24, sm: 12, md: 8, lg: 6 }}>
    <div className="bg-blue-500 text-white p-4">Responsive Col</div>
  </Col>
</Row>
```

## Flex 布局

通过 `flex` 属性设置列的 flex 值。

### Vue 3

```vue
<template>
  <Row :gutter="16">
    <Col flex="1">
      <div class="bg-blue-500 text-white p-4">flex: 1</div>
    </Col>
    <Col flex="2">
      <div class="bg-blue-500 text-white p-4">flex: 2</div>
    </Col>
    <Col flex="1">
      <div class="bg-blue-500 text-white p-4">flex: 1</div>
    </Col>
  </Row>
  <Row :gutter="16">
    <Col flex="100px">
      <div class="bg-blue-500 text-white p-4">flex: 100px</div>
    </Col>
    <Col flex="auto">
      <div class="bg-blue-500 text-white p-4">flex: auto</div>
    </Col>
  </Row>
</template>
```

### React

```tsx
<Row gutter={16}>
  <Col flex={1}>
    <div className="bg-blue-500 text-white p-4">flex: 1</div>
  </Col>
  <Col flex={2}>
    <div className="bg-blue-500 text-white p-4">flex: 2</div>
  </Col>
  <Col flex={1}>
    <div className="bg-blue-500 text-white p-4">flex: 1</div>
  </Col>
</Row>
<Row gutter={16}>
  <Col flex="100px">
    <div className="bg-blue-500 text-white p-4">flex: 100px</div>
  </Col>
  <Col flex="auto">
    <div className="bg-blue-500 text-white p-4">flex: auto</div>
  </Col>
</Row>
```

## API

### Row Props / 属性

| 属性    | 说明                                        | 类型                         | 默认值    | 可选值                                                                                          |
| ------- | ------------------------------------------- | ---------------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| gutter  | 栅格间隔，可以是数字或 [水平间隔, 垂直间隔] | `number \| [number, number]` | `0`       | -                                                                                               |
| align   | 垂直对齐方式                                | `Align`                      | `'top'`   | `'top'` \| `'middle'` \| `'bottom'` \| `'stretch'`                                              |
| justify | 水平排列方式                                | `Justify`                    | `'start'` | `'start'` \| `'end'` \| `'center'` \| `'space-around'` \| `'space-between'` \| `'space-evenly'` |
| wrap    | 是否自动换行                                | `boolean`                    | `true`    | `true` \| `false`                                                                               |

> 提示：Vue/React 版本都会把未声明的原生属性透传到根 `div`（例如 `id`、`data-*`、`aria-*`）。

#### React 额外属性

| 属性      | 说明            | 类型                  | 默认值 |
| --------- | --------------- | --------------------- | ------ |
| className | 额外的 CSS 类名 | `string`              | -      |
| style     | 额外的内联样式  | `React.CSSProperties` | -      |
| children  | 行内容          | `React.ReactNode`     | -      |

### Col Props / 属性

| 属性   | 说明                             | 类型                         | 默认值 | 可选值        |
| ------ | -------------------------------- | ---------------------------- | ------ | ------------- |
| span   | 栅格占位格数，或响应式对象       | `number \| ResponsiveObject` | `24`   | `1-24` 或对象 |
| offset | 栅格左侧的间隔格数，或响应式对象 | `number \| ResponsiveObject` | `0`    | `0-24` 或对象 |
| order  | 栅格顺序，或响应式对象           | `number \| ResponsiveObject` | -      | -             |
| flex   | flex 布局属性                    | `string \| number`           | -      | -             |

#### React 额外属性

| 属性      | 说明            | 类型                  | 默认值 |
| --------- | --------------- | --------------------- | ------ |
| className | 额外的 CSS 类名 | `string`              | -      |
| style     | 额外的内联样式  | `React.CSSProperties` | -      |
| children  | 列内容          | `React.ReactNode`     | -      |

### Slots / 插槽 (Vue)

#### Row Slots

| 插槽名  | 说明   |
| ------- | ------ |
| default | 行内容 |

#### Col Slots

| 插槽名  | 说明   |
| ------- | ------ |
| default | 列内容 |

## TypeScript 支持

Grid 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
// 从 core 导入类型
import type {
  RowProps,
  ColProps,
  Breakpoint,
  GutterSize,
  ColSpan,
  Align,
  Justify
} from '@tigercat/core'

// Vue
import { Row, Col } from '@tigercat/vue'
import type { VueRowProps, VueColProps } from '@tigercat/vue'

// React
import type {
  Row,
  Col,
  RowProps as ReactRowProps,
  ColProps as ReactColProps
} from '@tigercat/react'
```

## 无障碍 (Accessibility)

- Grid 组件使用语义化的 HTML 结构
- 支持键盘导航
- 响应式布局确保在不同设备上的可访问性

## 示例

### 典型布局

#### Vue 3

```vue
<template>
  <div class="layout">
    <!-- Header -->
    <Row>
      <Col :span="24">
        <div class="bg-gray-800 text-white p-4">Header</div>
      </Col>
    </Row>

    <!-- Content with Sidebar -->
    <Row :gutter="16">
      <Col :span="6">
        <div class="bg-gray-200 p-4 min-h-[400px]">Sidebar</div>
      </Col>
      <Col :span="18">
        <div class="bg-white p-4 min-h-[400px]">Content</div>
      </Col>
    </Row>

    <!-- Footer -->
    <Row>
      <Col :span="24">
        <div class="bg-gray-800 text-white p-4">Footer</div>
      </Col>
    </Row>
  </div>
</template>
```

#### React

```tsx
import { Row, Col } from '@tigercat/react'

function Layout() {
  return (
    <div className="layout">
      {/* Header */}
      <Row>
        <Col span={24}>
          <div className="bg-gray-800 text-white p-4">Header</div>
        </Col>
      </Row>

      {/* Content with Sidebar */}
      <Row gutter={16}>
        <Col span={6}>
          <div className="bg-gray-200 p-4 min-h-[400px]">Sidebar</div>
        </Col>
        <Col span={18}>
          <div className="bg-white p-4 min-h-[400px]">Content</div>
        </Col>
      </Row>

      {/* Footer */}
      <Row>
        <Col span={24}>
          <div className="bg-gray-800 text-white p-4">Footer</div>
        </Col>
      </Row>
    </div>
  )
}
```

### 响应式卡片网格

#### Vue 3

```vue
<template>
  <Row :gutter="[16, 16]">
    <Col v-for="i in 8" :key="i" :span="{ xs: 24, sm: 12, md: 8, lg: 6 }">
      <div class="bg-white border rounded-lg p-4 shadow">
        <h3 class="text-lg font-semibold mb-2">Card {{ i }}</h3>
        <p class="text-gray-600">Card content here</p>
      </div>
    </Col>
  </Row>
</template>
```

#### React

```tsx
import { Row, Col } from '@tigercat/react'

function CardGrid() {
  return (
    <Row gutter={[16, 16]}>
      {Array.from({ length: 8 }, (_, i) => (
        <Col key={i} span={{ xs: 24, sm: 12, md: 8, lg: 6 }}>
          <div className="bg-white border rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold mb-2">Card {i + 1}</h3>
            <p className="text-gray-600">Card content here</p>
          </div>
        </Col>
      ))}
    </Row>
  )
}
```
