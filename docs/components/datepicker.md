# DatePicker 日期选择器

用于选择日期的组件。

## 基本用法

### Vue 3

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DatePicker } from "@tigercat/vue";

const selectedDate = ref<Date | null>(null);
</script>

<template>
  <DatePicker v-model="selectedDate" placeholder="Select a date" />
</template>
```

### React

```tsx
import React, { useState } from "react";
import { DatePicker } from "@tigercat/react";

function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <DatePicker
      value={selectedDate}
      onChange={setSelectedDate}
      placeholder="Select a date"
    />
  );
}
```

## 不同尺寸

DatePicker 组件支持三种尺寸：`sm`、`md`、`lg`。

### Vue 3

```vue
<template>
  <DatePicker size="sm" placeholder="Small" />
  <DatePicker size="md" placeholder="Medium (default)" />
  <DatePicker size="lg" placeholder="Large" />
</template>
```

### React

```tsx
<DatePicker size="sm" placeholder="Small" />
<DatePicker size="md" placeholder="Medium (default)" />
<DatePicker size="lg" placeholder="Large" />
```

## 日期格式

支持多种日期格式。

### Vue 3

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DatePicker } from "@tigercat/vue";

const date = ref(new Date("2024-01-15"));
</script>

<template>
  <DatePicker v-model="date" format="yyyy-MM-dd" />
  <DatePicker v-model="date" format="MM/dd/yyyy" />
  <DatePicker v-model="date" format="dd/MM/yyyy" />
  <DatePicker v-model="date" format="yyyy/MM/dd" />
</template>
```

### React

```tsx
import React, { useState } from "react";
import { DatePicker } from "@tigercat/react";

function App() {
  const [date, setDate] = useState(new Date("2024-01-15"));

  return (
    <>
      <DatePicker value={date} onChange={setDate} format="yyyy-MM-dd" />
      <DatePicker value={date} onChange={setDate} format="MM/dd/yyyy" />
      <DatePicker value={date} onChange={setDate} format="dd/MM/yyyy" />
      <DatePicker value={date} onChange={setDate} format="yyyy/MM/dd" />
    </>
  );
}
```

## 日期范围限制

使用 `minDate` 和 `maxDate` 属性限制可选择的日期范围。

### Vue 3

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DatePicker } from "@tigercat/vue";

const date = ref<Date | null>(null);
const minDate = new Date("2024-01-01");
const maxDate = new Date("2024-12-31");
</script>

<template>
  <DatePicker
    v-model="date"
    :min-date="minDate"
    :max-date="maxDate"
    placeholder="Select a date in 2024"
  />
</template>
```

### React

```tsx
import React, { useState } from "react";
import { DatePicker } from "@tigercat/react";

function App() {
  const [date, setDate] = useState<Date | null>(null);
  const minDate = new Date("2024-01-01");
  const maxDate = new Date("2024-12-31");

  return (
    <DatePicker
      value={date}
      onChange={setDate}
      minDate={minDate}
      maxDate={maxDate}
      placeholder="Select a date in 2024"
    />
  );
}
```

## 禁用和只读

### Vue 3

```vue
<template>
  <DatePicker disabled placeholder="Disabled" />
  <DatePicker readonly :model-value="new Date()" placeholder="Readonly" />
</template>
```

### React

```tsx
<DatePicker disabled placeholder="Disabled" />
<DatePicker readonly value={new Date()} placeholder="Readonly" />
```

## 清除按钮

使用 `clearable` 属性控制是否显示清除按钮。

### Vue 3

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DatePicker } from "@tigercat/vue";

const date = ref(new Date());
</script>

<template>
  <DatePicker v-model="date" :clearable="true" />
  <DatePicker v-model="date" :clearable="false" />
</template>
```

### React

```tsx
import React, { useState } from "react";
import { DatePicker } from "@tigercat/react";

function App() {
  const [date, setDate] = useState(new Date());

  return (
    <>
      <DatePicker value={date} onChange={setDate} clearable={true} />
      <DatePicker value={date} onChange={setDate} clearable={false} />
    </>
  );
}
```

## 非受控模式

### Vue 3

Vue 组件使用 `v-model` 进行双向绑定，本质上是受控组件。

### React

React 支持非受控模式，使用 `defaultValue` 属性。

```tsx
import React from "react";
import { DatePicker } from "@tigercat/react";

function App() {
  return (
    <DatePicker
      defaultValue={new Date("2024-01-15")}
      placeholder="Uncontrolled datepicker"
    />
  );
}
```

## API

### Props

| 属性                             | 说明                                                       | 类型                                                                         | 默认值                                                 | Vue | React |
| -------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------ | --- | ----- |
| range                            | 是否启用范围选择（start/end）                              | `boolean`                                                                    | `false`                                                | ✓   | ✓     |
| locale                           | Intl locale（影响月份/星期显示；也用于默认文案选择）       | `string`                                                                     | -                                                      | ✓   | ✓     |
| labels                           | i18n 文案覆盖（与 locale 默认值合并）                      | `Partial<DatePickerLabels>`                                                  | -                                                      | ✓   | ✓     |
| value (React) / modelValue (Vue) | 选中的日期（受控模式）                                     | `Date \| string \| null \| [Date \| string \| null, Date \| string \| null]` | `null`                                                 | ✓   | ✓     |
| defaultValue (React)             | 默认选中的日期（非受控模式）                               | `Date \| string \| null \| [Date \| string \| null, Date \| string \| null]` | `null`                                                 | -   | ✓     |
| size                             | 尺寸                                                       | `'sm' \| 'md' \| 'lg'`                                                       | `'md'`                                                 | ✓   | ✓     |
| format                           | 日期格式                                                   | `'yyyy-MM-dd' \| 'MM/dd/yyyy' \| 'dd/MM/yyyy' \| 'yyyy/MM/dd'`               | `'yyyy-MM-dd'`                                         | ✓   | ✓     |
| placeholder                      | 占位符文本                                                 | `string`                                                                     | single: `'Select date'` / range: `'Select date range'` | ✓   | ✓     |
| disabled                         | 是否禁用                                                   | `boolean`                                                                    | `false`                                                | ✓   | ✓     |
| readonly                         | 是否只读                                                   | `boolean`                                                                    | `false`                                                | ✓   | ✓     |
| required                         | 是否必填                                                   | `boolean`                                                                    | `false`                                                | ✓   | ✓     |
| minDate                          | 最小可选日期                                               | `Date \| string \| null`                                                     | `null`                                                 | ✓   | ✓     |
| maxDate                          | 最大可选日期                                               | `Date \| string \| null`                                                     | `null`                                                 | ✓   | ✓     |
| clearable                        | 是否显示清除按钮                                           | `boolean`                                                                    | `true`                                                 | ✓   | ✓     |
| name                             | 表单字段名                                                 | `string`                                                                     | -                                                      | ✓   | ✓     |
| id                               | 元素 ID                                                    | `string`                                                                     | -                                                      | ✓   | ✓     |
| className                        | 自定义 CSS 类（与 Vue `class`/React `className` 都可叠加） | `string`                                                                     | -                                                      | ✓   | ✓     |
| style                            | 自定义样式（与 Vue `style`/React `style` 都可叠加）        | `Record<string, unknown>`                                                    | -                                                      | ✓   | ✓     |

### Events (Vue)

| 事件名            | 说明           | 回调参数                                                                                      |
| ----------------- | -------------- | --------------------------------------------------------------------------------------------- |
| update:modelValue | 日期改变时触发 | `(value: Date \| string \| null \| [Date \| string \| null, Date \| string \| null]) => void` |
| change            | 日期改变时触发 | `(value: Date \| string \| null \| [Date \| string \| null, Date \| string \| null]) => void` |
| clear             | 清除日期时触发 | `() => void`                                                                                  |

### Event Handlers (React)

| 属性     | 说明             | 类型                                                                                            |
| -------- | ---------------- | ----------------------------------------------------------------------------------------------- |
| onChange | 日期改变时的回调 | single: `(date: Date \| null) => void` / range: `(range: [Date \| null, Date \| null]) => void` |
| onClear  | 清除日期时的回调 | `() => void`                                                                                    |

## 主题定制

DatePicker 组件支持通过 CSS 变量进行主题定制。

### CSS 变量

```css
:root {
  --tiger-primary: #2563eb; /* 主色 */
  --tiger-primary-hover: #1d4ed8; /* 主色悬停 */
  --tiger-primary-disabled: #93c5fd; /* 主色禁用 */
}
```

### 使用示例

```css
/* 自定义主题 */
.custom-theme {
  --tiger-primary: #10b981;
  --tiger-primary-hover: #059669;
  --tiger-primary-disabled: #6ee7b7;
}
```

```vue
<template>
  <div class="custom-theme">
    <DatePicker v-model="date" />
  </div>
</template>
```

### 使用 setThemeColors 工具函数

```typescript
import { setThemeColors } from "@tigercat/core";

setThemeColors({
  primary: "#10b981",
  primaryHover: "#059669",
  primaryDisabled: "#6ee7b7",
});
```

## 无障碍支持

DatePicker 组件遵循 WAI-ARIA 规范，支持：

- **键盘导航**：
  - `Tab`：在输入框/按钮与弹层内元素间移动
  - `Escape`：关闭日历弹层并将焦点返回触发元素
  - `ArrowUp/Down/Left/Right`：在日期网格中移动焦点
  - `Enter`/`Space`：选择当前聚焦日期（range 模式下不会自动关闭；需点 `OK`）
- **ARIA 属性**：正确的 `role`、`aria-label`、`aria-haspopup`、`aria-expanded` 等属性
- **屏幕阅读器**：所有交互元素都有适当的标签
- **焦点管理**：打开日历时自动聚焦，关闭时恢复焦点

### 辅助功能最佳实践

1. 为 DatePicker 提供有意义的 `placeholder` 或 `aria-label`
2. 在表单中使用时，配合 FormItem 组件使用，提供清晰的标签
3. 对于必填字段，设置 `required` 属性
4. 提供合理的日期范围限制，帮助用户避免选择无效日期

## 注意事项

1. **日期对象标准化**：组件内部会将所有日期标准化为午夜时间（00:00:00.000），避免时区问题
2. **字符串日期格式**：传入字符串时，请确保格式正确，建议使用 ISO 8601 格式（如 `"2024-01-15"`）
3. **日期范围**：`minDate` 和 `maxDate` 会禁用超出范围的日期，但不会阻止用户手动输入
4. **性能**：日历渲染了 42 个日期单元格（6 周 × 7 天），对于大多数场景性能足够
5. **浏览器兼容性**：支持所有现代浏览器，建议使用 ES2020+ 和支持 CSS 变量的浏览器

## TypeScript 支持

组件提供完整的 TypeScript 类型定义。

```typescript
import type { DatePickerSize, DateFormat } from "@tigercat/core";
import type { DatePickerProps } from "@tigercat/vue"; // or '@tigercat/react'

// 使用类型
const size: DatePickerSize = "md";
const format: DateFormat = "yyyy-MM-dd";
```
