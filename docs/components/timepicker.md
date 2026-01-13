# TimePicker 时间选择器

用于选择时间的组件。

## 基本用法

### Vue 3

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TimePicker } from "@tigercat/vue";

const selectedTime = ref<string | null>(null);
</script>

<template>
  <TimePicker v-model="selectedTime" placeholder="Select a time" />
</template>
```

### React

```tsx
import React, { useState } from "react";
import { TimePicker } from "@tigercat/react";

function App() {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  return (
    <TimePicker
      value={selectedTime}
      onChange={setSelectedTime}
      placeholder="Select a time"
    />
  );
}
```

## 语言/地区

使用 `locale` 属性切换 UI 文案与选项的 aria-label。

### Vue 3

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TimePicker } from "@tigercat/vue";

const time = ref<string | null>(null);
const locale = ref<"zh-CN" | "en-US">("zh-CN");
</script>

<template>
  <TimePicker v-model="time" :locale="locale" />
</template>
```

### React

```tsx
import React, { useState } from "react";
import { TimePicker } from "@tigercat/react";

function App() {
  const [time, setTime] = useState<string | null>(null);
  const [locale, setLocale] = useState<"zh-CN" | "en-US">("zh-CN");

  return (
    <>
      <button
        type="button"
        onClick={() => setLocale(locale === "zh-CN" ? "en-US" : "zh-CN")}
      >
        Toggle locale
      </button>
      <TimePicker value={time} onChange={setTime} locale={locale} />
    </>
  );
}
```

## 时间段选择

启用 `range` 后可选择开始/结束时间，value 形如 `[start, end]`。

### Vue 3

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TimePicker } from "@tigercat/vue";

const timeRange = ref<[string | null, string | null]>([null, null]);
</script>

<template>
  <TimePicker
    v-model="timeRange"
    :range="true"
    placeholder="Select a time range"
  />
</template>
```

### React

```tsx
import React, { useState } from "react";
import { TimePicker } from "@tigercat/react";

function App() {
  const [timeRange, setTimeRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  return <TimePicker range value={timeRange} onChange={setTimeRange} />;
}
```

## 不同尺寸

TimePicker 组件支持三种尺寸：`sm`、`md`、`lg`。

### Vue 3

```vue
<template>
  <TimePicker size="sm" placeholder="Small" />
  <TimePicker size="md" placeholder="Medium (default)" />
  <TimePicker size="lg" placeholder="Large" />
</template>
```

### React

```tsx
<TimePicker size="sm" placeholder="Small" />
<TimePicker size="md" placeholder="Medium (default)" />
<TimePicker size="lg" placeholder="Large" />
```

## 时间格式

支持 12 小时制和 24 小时制。

### Vue 3

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TimePicker } from "@tigercat/vue";

const time = ref("14:30");
</script>

<template>
  <TimePicker v-model="time" format="24" />
  <TimePicker v-model="time" format="12" />
</template>
```

### React

```tsx
import React, { useState } from "react";
import { TimePicker } from "@tigercat/react";

function App() {
  const [time, setTime] = useState("14:30");

  return (
    <>
      <TimePicker value={time} onChange={setTime} format="24" />
      <TimePicker value={time} onChange={setTime} format="12" />
    </>
  );
}
```

## 显示秒

使用 `showSeconds` 属性控制是否显示秒。

### Vue 3

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TimePicker } from "@tigercat/vue";

const time = ref<string | null>(null);
</script>

<template>
  <TimePicker v-model="time" :show-seconds="true" />
</template>
```

### React

```tsx
import React, { useState } from "react";
import { TimePicker } from "@tigercat/react";

function App() {
  const [time, setTime] = useState<string | null>(null);

  return <TimePicker value={time} onChange={setTime} showSeconds={true} />;
}
```

## 时间步长

使用 `hourStep`、`minuteStep`、`secondStep` 属性控制时间选择的步长。

### Vue 3

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TimePicker } from "@tigercat/vue";

const time = ref<string | null>(null);
</script>

<template>
  <TimePicker v-model="time" :hour-step="2" :minute-step="15" />
</template>
```

### React

```tsx
import React, { useState } from "react";
import { TimePicker } from "@tigercat/react";

function App() {
  const [time, setTime] = useState<string | null>(null);

  return (
    <TimePicker value={time} onChange={setTime} hourStep={2} minuteStep={15} />
  );
}
```

## 时间范围限制

使用 `minTime` 和 `maxTime` 属性限制可选择的时间范围。

### Vue 3

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TimePicker } from "@tigercat/vue";

const time = ref<string | null>(null);
</script>

<template>
  <TimePicker
    v-model="time"
    min-time="09:00"
    max-time="18:00"
    placeholder="Select time between 9:00 - 18:00"
  />
</template>
```

### React

```tsx
import React, { useState } from "react";
import { TimePicker } from "@tigercat/react";

function App() {
  const [time, setTime] = useState<string | null>(null);

  return (
    <TimePicker
      value={time}
      onChange={setTime}
      minTime="09:00"
      maxTime="18:00"
      placeholder="Select time between 9:00 - 18:00"
    />
  );
}
```

## 禁用和只读

### Vue 3

```vue
<template>
  <TimePicker disabled placeholder="Disabled" />
  <TimePicker readonly :model-value="'14:30'" placeholder="Readonly" />
</template>
```

### React

```tsx
<TimePicker disabled placeholder="Disabled" />
<TimePicker readonly value="14:30" placeholder="Readonly" />
```

## 清除按钮

使用 `clearable` 属性控制是否显示清除按钮。

### Vue 3

```vue
<script setup lang="ts">
import { ref } from "vue";
import { TimePicker } from "@tigercat/vue";

const time = ref("14:30");
</script>

<template>
  <TimePicker v-model="time" :clearable="true" />
  <TimePicker v-model="time" :clearable="false" />
</template>
```

### React

```tsx
import React, { useState } from "react";
import { TimePicker } from "@tigercat/react";

function App() {
  const [time, setTime] = useState("14:30");

  return (
    <>
      <TimePicker value={time} onChange={setTime} clearable={true} />
      <TimePicker value={time} onChange={setTime} clearable={false} />
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
import { TimePicker } from "@tigercat/react";

function App() {
  return (
    <TimePicker defaultValue="14:30" placeholder="Uncontrolled timepicker" />
  );
}
```

## API

### Props

| 属性                             | 说明                                                           | 类型                                                 | 默认值          | Vue | React |
| -------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------- | --------------- | --- | ----- |
| value (React) / modelValue (Vue) | 选中的时间（受控模式）；`range=true` 时为 `[start, end]`       | `string \| null \| [string \| null, string \| null]` | `null`          | ✓   | ✓     |
| defaultValue                     | 默认选中的时间（非受控模式）；`range=true` 时为 `[start, end]` | `string \| null \| [string \| null, string \| null]` | `null`          | -   | ✓     |
| range                            | 是否启用时间段选择（开始/结束）                                | `boolean`                                            | `false`         | ✓   | ✓     |
| locale                           | 语言/地区（用于 UI 文案与展示）                                | `string`                                             | -               | ✓   | ✓     |
| size                             | 尺寸                                                           | `'sm' \| 'md' \| 'lg'`                               | `'md'`          | ✓   | ✓     |
| format                           | 时间格式                                                       | `'12' \| '24'`                                       | `'24'`          | ✓   | ✓     |
| showSeconds                      | 是否显示秒                                                     | `boolean`                                            | `false`         | ✓   | ✓     |
| hourStep                         | 小时步长                                                       | `number`                                             | `1`             | ✓   | ✓     |
| minuteStep                       | 分钟步长                                                       | `number`                                             | `1`             | ✓   | ✓     |
| secondStep                       | 秒步长                                                         | `number`                                             | `1`             | ✓   | ✓     |
| placeholder                      | 占位符文本                                                     | `string`                                             | `'Select time'` | ✓   | ✓     |
| disabled                         | 是否禁用                                                       | `boolean`                                            | `false`         | ✓   | ✓     |
| readonly                         | 是否只读                                                       | `boolean`                                            | `false`         | ✓   | ✓     |
| required                         | 是否必填                                                       | `boolean`                                            | `false`         | ✓   | ✓     |
| minTime                          | 最小可选时间（HH:mm 格式）                                     | `string \| null`                                     | `null`          | ✓   | ✓     |
| maxTime                          | 最大可选时间（HH:mm 格式）                                     | `string \| null`                                     | `null`          | ✓   | ✓     |
| clearable                        | 是否显示清除按钮                                               | `boolean`                                            | `true`          | ✓   | ✓     |
| name                             | 表单字段名                                                     | `string`                                             | -               | ✓   | ✓     |
| id                               | 元素 ID                                                        | `string`                                             | -               | ✓   | ✓     |
| className                        | 自定义 CSS 类                                                  | `string`                                             | -               | ✓   | ✓     |
| style                            | 自定义内联样式                                                 | `Record<string, string \| number>`                   | -               | ✓   | ✓     |

### Events (Vue)

| 事件名            | 说明           | 回调参数                                                              |
| ----------------- | -------------- | --------------------------------------------------------------------- |
| update:modelValue | 时间改变时触发 | `(value: string \| null \| [string \| null, string \| null]) => void` |
| change            | 时间改变时触发 | `(value: string \| null \| [string \| null, string \| null]) => void` |
| clear             | 清除时间时触发 | `() => void`                                                          |

### Event Handlers (React)

| 属性     | 说明                                                         | 类型                                                                                   |
| -------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| onChange | 时间改变时的回调（`range=true` 时回调参数为 `[start, end]`） | `(time: string \| null) => void` \| `(time: [string \| null, string \| null]) => void` |
| onClear  | 清除时间时的回调                                             | `() => void`                                                                           |

## 主题定制

TimePicker 组件支持通过 CSS 变量进行主题定制。

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
    <TimePicker v-model="time" />
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

TimePicker 组件遵循 WAI-ARIA 规范，支持：

- **键盘导航**：
  - 使用 Tab 键在输入框、清除按钮、打开按钮与面板内各选项间导航
  - 面板内：ArrowUp/ArrowDown 在同一列选项间移动焦点，Home/End 跳到首/尾
  - Enter/Space 选择当前聚焦选项，Escape 关闭面板并恢复焦点到输入框
- **ARIA 属性**：正确的 `role`、`aria-label`、`aria-selected` 等属性
- **屏幕阅读器**：所有交互元素都有适当的标签
- **焦点管理**：打开面板时自动聚焦，关闭时恢复焦点

### 辅助功能最佳实践

1. 为 TimePicker 提供有意义的 `placeholder` 或 `aria-label`
2. 在表单中使用时，配合 FormItem 组件使用，提供清晰的标签
3. 对于必填字段，设置 `required` 属性
4. 提供合理的时间范围限制，帮助用户避免选择无效时间

## 注意事项

1. **时间格式**：时间值格式为 `HH:mm` 或 `HH:mm:ss`（当 `showSeconds` 为 `true` 时）
2. **步长设置**：步长值必须能整除 60（如 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30）
3. **时间范围**：`minTime` 和 `maxTime` 会禁用超出范围的时间选项
4. **12 小时制**：在 12 小时制下，小时范围为 1-12，并显示 AM/PM 选择器
5. **浏览器兼容性**：支持所有现代浏览器，建议使用 ES2020+ 和支持 CSS 变量的浏览器

## TypeScript 支持

组件提供完整的 TypeScript 类型定义。

```typescript
import type { TimePickerSize, TimeFormat } from "@tigercat/core";
import type { TimePickerProps } from "@tigercat/vue"; // or '@tigercat/react'

// 使用类型
const size: TimePickerSize = "md";
const format: TimeFormat = "24";
```
