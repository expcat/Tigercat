# Select 下拉选择

下拉选择组件，支持基础选择、分组、可搜索、多选、空值处理等功能。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Select } from "@tigercat/vue";

const selectedValue = ref("");
const options = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3" },
];
</script>

<template>
  <Select v-model="selectedValue" :options="options" />
</template>
```

### React

```tsx
import { useState } from "react";
import { Select } from "@tigercat/react";

function App() {
  const [selectedValue, setSelectedValue] = useState("");
  const options = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
  ];

  return (
    <Select
      value={selectedValue}
      onChange={setSelectedValue}
      options={options}
    />
  );
}
```

## 尺寸 (Sizes)

Select 组件支持 3 种不同的尺寸：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸

### Vue 3

```vue
<template>
  <Select v-model="value" :options="options" size="sm" />
  <Select v-model="value" :options="options" size="md" />
  <Select v-model="value" :options="options" size="lg" />
</template>
```

### React

```tsx
<Select value={value} onChange={setValue} options={options} size="sm" />
<Select value={value} onChange={setValue} options={options} size="md" />
<Select value={value} onChange={setValue} options={options} size="lg" />
```

## 禁用状态 (Disabled)

通过 `disabled` 属性禁用选择器。

### Vue 3

```vue
<template>
  <Select v-model="value" :options="options" disabled />
</template>
```

### React

```tsx
<Select value={value} onChange={setValue} options={options} disabled />
```

## 禁用选项 (Disabled Options)

可以禁用单个选项。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Select } from "@tigercat/vue";

const value = ref("");
const options = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2", disabled: true },
  { value: "3", label: "Option 3" },
];
</script>

<template>
  <Select v-model="value" :options="options" />
</template>
```

### React

```tsx
import { useState } from "react";
import { Select } from "@tigercat/react";

function App() {
  const [value, setValue] = useState("");
  const options = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2", disabled: true },
    { value: "3", label: "Option 3" },
  ];

  return <Select value={value} onChange={setValue} options={options} />;
}
```

## 可清空 (Clearable)

通过 `clearable` 属性允许清空已选择的值。默认为 `true`。

### Vue 3

```vue
<template>
  <Select v-model="value" :options="options" clearable />
  <!-- 或禁用清空功能 -->
  <Select v-model="value" :options="options" :clearable="false" />
</template>
```

### React

```tsx
<Select value={value} onChange={setValue} options={options} clearable />;
{
  /* 或禁用清空功能 */
}
<Select
  value={value}
  onChange={setValue}
  options={options}
  clearable={false}
/>;
```

## 可搜索 (Searchable)

通过 `searchable` 属性启用搜索/过滤功能。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Select } from "@tigercat/vue";

const value = ref("");
const options = [
  { value: "1", label: "Apple" },
  { value: "2", label: "Banana" },
  { value: "3", label: "Cherry" },
  { value: "4", label: "Date" },
  { value: "5", label: "Elderberry" },
];

const handleSearch = (query) => {
  console.log("Searching:", query);
};
</script>

<template>
  <Select
    v-model="value"
    :options="options"
    searchable
    @search="handleSearch"
  />
</template>
```

### React

```tsx
import { useState } from "react";
import { Select } from "@tigercat/react";

function App() {
  const [value, setValue] = useState("");
  const options = [
    { value: "1", label: "Apple" },
    { value: "2", label: "Banana" },
    { value: "3", label: "Cherry" },
    { value: "4", label: "Date" },
    { value: "5", label: "Elderberry" },
  ];

  const handleSearch = (query) => {
    console.log("Searching:", query);
  };

  return (
    <Select
      value={value}
      onChange={setValue}
      options={options}
      searchable
      onSearch={handleSearch}
    />
  );
}
```

## 多选 (Multiple)

通过 `multiple` 属性启用多选模式。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Select } from "@tigercat/vue";

const selectedValues = ref([]);
const options = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3" },
  { value: "4", label: "Option 4" },
];
</script>

<template>
  <Select v-model="selectedValues" :options="options" multiple />
  <p>Selected: {{ selectedValues }}</p>
</template>
```

### React

```tsx
import { useState } from "react";
import { Select } from "@tigercat/react";

function App() {
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>([]);
  const options = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
    { value: "4", label: "Option 4" },
  ];

  return (
    <>
      <Select
        value={selectedValues}
        onChange={setSelectedValues}
        options={options}
        multiple
      />
      <p>Selected: {selectedValues.join(", ")}</p>
    </>
  );
}
```

## 分组选项 (Option Groups)

使用 `SelectOptionGroup` 类型对选项进行分组。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Select } from "@tigercat/vue";

const value = ref("");
const groupedOptions = [
  {
    label: "Fruits",
    options: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
      { value: "cherry", label: "Cherry" },
    ],
  },
  {
    label: "Vegetables",
    options: [
      { value: "carrot", label: "Carrot" },
      { value: "potato", label: "Potato" },
      { value: "tomato", label: "Tomato" },
    ],
  },
];
</script>

<template>
  <Select v-model="value" :options="groupedOptions" />
</template>
```

### React

```tsx
import { useState } from "react";
import { Select } from "@tigercat/react";

function App() {
  const [value, setValue] = useState("");
  const groupedOptions = [
    {
      label: "Fruits",
      options: [
        { value: "apple", label: "Apple" },
        { value: "banana", label: "Banana" },
        { value: "cherry", label: "Cherry" },
      ],
    },
    {
      label: "Vegetables",
      options: [
        { value: "carrot", label: "Carrot" },
        { value: "potato", label: "Potato" },
        { value: "tomato", label: "Tomato" },
      ],
    },
  ];

  return <Select value={value} onChange={setValue} options={groupedOptions} />;
}
```

## 空值处理 (Empty States)

Select 组件提供两种空状态处理：

1. 当 `options` 为空时，显示 `noDataText`
2. 当搜索无结果时，显示 `noOptionsText`

### Vue 3

```vue
<template>
  <!-- 无数据 -->
  <Select v-model="value" :options="[]" no-data-text="暂无数据" />

  <!-- 搜索无结果 -->
  <Select
    v-model="value"
    :options="options"
    searchable
    no-options-text="未找到匹配项"
  />
</template>
```

### React

```tsx
{
  /* 无数据 */
}
<Select value={value} onChange={setValue} options={[]} noDataText="暂无数据" />;

{
  /* 搜索无结果 */
}
<Select
  value={value}
  onChange={setValue}
  options={options}
  searchable
  noOptionsText="未找到匹配项"
/>;
```

## 自定义占位符 (Custom Placeholder)

### Vue 3

```vue
<template>
  <Select v-model="value" :options="options" placeholder="请选择一个选项" />
</template>
```

### React

```tsx
<Select
  value={value}
  onChange={setValue}
  options={options}
  placeholder="请选择一个选项"
/>
```

## 综合示例 (Complete Example)

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Select } from "@tigercat/vue";

const value = ref("");
const groupedOptions = [
  {
    label: "水果",
    options: [
      { value: "apple", label: "苹果" },
      { value: "banana", label: "香蕉" },
      { value: "cherry", label: "樱桃", disabled: true },
    ],
  },
  {
    label: "蔬菜",
    options: [
      { value: "carrot", label: "胡萝卜" },
      { value: "potato", label: "土豆" },
    ],
  },
];

const handleChange = (newValue) => {
  console.log("Selected:", newValue);
};

const handleSearch = (query) => {
  console.log("Search query:", query);
};
</script>

<template>
  <Select
    v-model="value"
    :options="groupedOptions"
    size="md"
    placeholder="请选择食物"
    searchable
    clearable
    no-options-text="未找到匹配的食物"
    no-data-text="暂无食物选项"
    @change="handleChange"
    @search="handleSearch"
  />
</template>
```

### React

```tsx
import { useState } from "react";
import { Select } from "@tigercat/react";

function App() {
  const [value, setValue] = useState("");
  const groupedOptions = [
    {
      label: "水果",
      options: [
        { value: "apple", label: "苹果" },
        { value: "banana", label: "香蕉" },
        { value: "cherry", label: "樱桃", disabled: true },
      ],
    },
    {
      label: "蔬菜",
      options: [
        { value: "carrot", label: "胡萝卜" },
        { value: "potato", label: "土豆" },
      ],
    },
  ];

  const handleChange = (newValue) => {
    console.log("Selected:", newValue);
    setValue(newValue);
  };

  const handleSearch = (query) => {
    console.log("Search query:", query);
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      options={groupedOptions}
      size="md"
      placeholder="请选择食物"
      searchable
      clearable
      noOptionsText="未找到匹配的食物"
      noDataText="暂无食物选项"
      onSearch={handleSearch}
    />
  );
}
```

## API

### Props / 属性

| 属性          | 说明                   | 类型            | 默认值                   | 可选值                     |
| ------------- | ---------------------- | --------------- | ------------------------ | -------------------------- |
| size          | 选择器尺寸             | `SelectSize`    | `'md'`                   | `'sm'` \| `'md'` \| `'lg'` |
| disabled      | 是否禁用               | `boolean`       | `false`                  | `true` \| `false`          |
| placeholder   | 占位提示文字           | `string`        | `'Select an option'`     | -                          |
| searchable    | 是否可搜索             | `boolean`       | `false`                  | `true` \| `false`          |
| multiple      | 是否多选               | `boolean`       | `false`                  | `true` \| `false`          |
| clearable     | 是否可清空             | `boolean`       | `true`                   | `true` \| `false`          |
| options       | 选项数据               | `SelectOptions` | `[]`                     | -                          |
| noOptionsText | 搜索无结果时的提示文字 | `string`        | `'No options found'`     | -                          |
| noDataText    | 无数据时的提示文字     | `string`        | `'No options available'` | -                          |

#### Vue 专属属性

| 属性                 | 说明                    | 类型               | 默认值 |
| -------------------- | ----------------------- | ------------------ | ------ |
| modelValue (v-model) | 当前选中值（单选/多选） | `SelectModelValue` | -      |

#### React 专属属性

| 属性      | 说明                                                                   | 类型                                           | 默认值 |
| --------- | ---------------------------------------------------------------------- | ---------------------------------------------- | ------ |
| value     | 当前选中值（单选为 `string \| number`，多选为 `(string \| number)[]`） | `string` \| `number` \| `(string \| number)[]` | -      |
| onChange  | 值变化时的回调（`multiple=false`）                                     | `(value: SelectValue \| undefined) => void`    | -      |
| onChange  | 值变化时的回调（`multiple=true`）                                      | `(value: SelectValues) => void`                | -      |
| onSearch  | 搜索时的回调                                                           | `(query: string) => void`                      | -      |
| className | 额外的 CSS 类名                                                        | `string`                                       | -      |

### Events / 事件 (Vue)

| 事件名            | 说明                                             | 回调参数                                                         |
| ----------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| update:modelValue | 值变化时触发                                     | `(value: string \| number \| (string \| number)[] \| undefined)` |
| change            | 值变化时触发                                     | `(value: string \| number \| (string \| number)[] \| undefined)` |
| search            | 搜索输入时触发（仅在 `searchable` 为 `true` 时） | `(query: string)`                                                |

### Types / 类型定义

#### SelectOption

```typescript
interface SelectOption {
  value: SelectValue;
  label: string;
  disabled?: boolean;
}
```

#### SelectOptionGroup

````typescript
interface SelectOptionGroup {
  label: string
  options: SelectOption[]
}

#### SelectOptions

```typescript
type SelectOptions = Array<SelectOption | SelectOptionGroup>
````

#### SelectValue / SelectValues

```typescript
type SelectValue = string | number;
type SelectValues = SelectValue[];
```

````

#### SelectSize

```typescript
type SelectSize = 'sm' | 'md' | 'lg'
````

## 样式定制

Select 组件使用 Tailwind CSS 构建，支持通过 CSS 变量进行主题配置。

### 主题颜色配置

Select 组件会复用以下“全局通用”CSS 变量（多数组件共享）：

```css
:root {
  --tiger-primary: #2563eb;
  --tiger-surface: #ffffff;
  --tiger-surface-muted: #f3f4f6;
  --tiger-border: #e5e7eb;
  --tiger-text: #111827;
  --tiger-text-muted: #6b7280;
  --tiger-outline-bg-hover: #eff6ff;
}
```

同时也支持 Select 组件的“细粒度覆盖变量”（按需覆盖即可）：

```css
:root {
  --tiger-select-trigger-bg: var(--tiger-surface);
  --tiger-select-trigger-border: var(--tiger-border);
  --tiger-select-trigger-text: var(--tiger-text);
  --tiger-select-placeholder: var(--tiger-text-muted);

  --tiger-select-dropdown-bg: var(--tiger-surface);
  --tiger-select-dropdown-border: var(--tiger-border);

  --tiger-select-option-bg-hover: var(--tiger-outline-bg-hover);
  --tiger-select-option-bg-selected: var(--tiger-outline-bg-hover);
  --tiger-select-option-text-selected: var(--tiger-primary);

  --tiger-select-icon: var(--tiger-text-muted);
  --tiger-select-check-icon: var(--tiger-primary);
}
```

可以通过 JavaScript API 动态修改主题：

**Vue 3:**

```vue
<script setup>
import { Select, setThemeColors } from "@tigercat/vue";

const switchTheme = () => {
  setThemeColors({
    primary: "#10b981",
    outlineBgHover: "#d1fae5",
  });
};
</script>
```

**React:**

```tsx
import { Select, setThemeColors } from "@tigercat/react";

const switchTheme = () => {
  setThemeColors({
    primary: "#10b981",
    outlineBgHover: "#d1fae5",
  });
};
```

### React 额外样式

React 版本的 Select 组件支持 `className` 属性：

```tsx
<Select className="mb-4" value={value} onChange={setValue} options={options} />
```

## 无障碍 (Accessibility)

- 选择器在禁用状态下会自动设置 `disabled` 属性
- 下拉列表使用 `role="listbox"`，选项使用 `role="option"`，并通过 `aria-selected/aria-disabled` 表达状态
- 支持键盘导航与清晰焦点（`focus:ring`）
- 禁用选项无法被选择
- 点击外部区域会自动关闭下拉菜单

### 键盘操作

- 在触发按钮（Trigger）上：
  - `ArrowDown` / `ArrowUp`：打开下拉并移动到可选项
  - `Enter` / `Space`：打开下拉；打开后可选择当前高亮项
  - `Escape`：关闭下拉
- 在下拉列表打开时：
  - `ArrowDown` / `ArrowUp`：移动高亮项（跳过 disabled）
  - `Home` / `End`：跳到首/尾可选项
  - `Enter` / `Space`：选择当前高亮项
  - `Escape`：关闭并回到 Trigger
  - `Tab`：关闭下拉并继续页面 tab 流
- 在搜索输入框（searchable）中：
  - `ArrowDown` / `ArrowUp`：将焦点切换到选项列表
  - `Enter`：选择当前高亮项（若存在）
  - `Escape`：关闭并回到 Trigger

## TypeScript 支持

Select 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type {
  SelectProps,
  SelectOptions,
  SelectModelValue,
  SelectValue,
  SelectValues,
  SelectOption,
  SelectOptionGroup,
  SelectSize,
} from "@tigercat/core";

// Vue
import type { Select } from "@tigercat/vue";

// React
import type { Select, SelectProps as ReactSelectProps } from "@tigercat/react";
```

## 最佳实践

1. **搜索优化**：对于大量选项，启用 `searchable` 可以提升用户体验
2. **分组管理**：使用 `SelectOptionGroup` 对相关选项进行分组
3. **禁用选项**：对不可用的选项设置 `disabled: true`
4. **多选模式**：在多选模式下，确保 `value` 类型为数组
5. **空状态**：自定义 `noOptionsText` 和 `noDataText` 提供更好的用户反馈
6. **清空功能**：根据业务需求决定是否启用 `clearable`
