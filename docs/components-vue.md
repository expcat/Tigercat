# Tigercat 组件总览（Vue 3）

面向快速理解与使用的简版组件清单，适合 AI/搜索场景。

## 快速使用

```vue
<script setup>
import { Button } from '@expcat/tigercat-vue'
</script>

<template>
  <Button>Button</Button>
</template>
```

- 组件名使用 PascalCase（如 `Button`、`DatePicker`）。
- 事件采用 kebab-case（如 `@click`、`@change`）。

## 组件清单（Props / Events 速览）

### 基础

- Button：Props: variant(外观)/size(尺寸)/disabled(禁用)/loading(加载)/block(块级)/type(原生类型)/class(样式类)/style(内联样式)；Events: @click(点击)
- Icon：Props: name(图标名)/size(尺寸)/color(颜色)/rotate(旋转)
- Text：Props: size(字号)/weight(字重)/color(颜色)/ellipsis(省略)
- Code：Props: value(内容)/lang(语言)/copyable(可复制)
- Link：Props: href(地址)/disabled(禁用)/variant(外观)；Events: @click(点击)
- Tag：Props: color(颜色)/size(尺寸)/closable(可关闭)；Events: @close(关闭)
- Badge：Props: value(数值)/max(上限)/dot(小红点)
- Avatar：Props: src(图片)/size(尺寸)/shape(形状)/text(文字)
- Divider：Props: direction(方向)/align(对齐)/text(文本)

### 布局

- Container：Props: width(宽度)/padding(内边距)
- Grid：Props: cols(列数)/gap(间距)/breakpoints(响应式)
- Layout：Props: mode(布局模式)/fixed(固定区)
- Space：Props: direction(方向)/size(间距)/wrap(换行)
- Card：Props: title(标题)/bordered(边框)/shadow(阴影)；Slots: header(头部)/extra(操作区)
- List：Props: items(数据)/rowKey(行键)/split(分割线)
- Descriptions：Props: columns(列数)/layout(布局)/labelStyle(标签样式)
- Skeleton：Props: rows(行数)/shape(形状)/animated(动画)

### 表单

- Form：Props: model(数据)/rules(校验)/labelWidth(标签宽度)
- FormItem：Props: prop(字段)/label(标签)/error(错误)
- Input：Props: modelValue(值)/placeholder(占位)/disabled(禁用)/clearable(可清除)；Events: @update:modelValue(改值) @change(变更) @blur(失焦)
- Textarea：Props: modelValue(值)/rows(行数)/autosize(自适应)；Events: @update:modelValue(改值)
- Select：Props: modelValue(值)/options(选项)/multiple(多选)/clearable(可清除)；Events: @update:modelValue(改值)
- Checkbox：Props: modelValue(选中)/disabled(禁用)/indeterminate(半选)；Events: @update:modelValue(改值)
- CheckboxGroup：Props: modelValue(值集合)/options(选项)；Events: @update:modelValue(改值)
- Radio：Props: modelValue(当前值)/value(选项值)/disabled(禁用)；Events: @update:modelValue(改值)
- RadioGroup：Props: modelValue(当前值)/options(选项)；Events: @update:modelValue(改值)
- Switch：Props: modelValue(开关值)/disabled(禁用)/size(尺寸)；Events: @update:modelValue(改值)
- Slider：Props: modelValue(值)/min(最小)/max(最大)/step(步长)；Events: @update:modelValue(改值)
- DatePicker：Props: modelValue(值)/format(格式)/disabled(禁用)/range(范围)；Events: @update:modelValue(改值)
- TimePicker：Props: modelValue(值)/format(格式)/disabled(禁用)；Events: @update:modelValue(改值)
- Upload：Props: fileList(文件列表)/action(上传地址)/limit(数量上限)/accept(类型)；Events: @change(变更) @success(成功) @error(失败)

### 导航

- Breadcrumb：Props: items(层级)/separator(分隔符)
- Menu：Props: items(数据)/activeKey(选中)/collapsed(折叠)；Events: @select(选择)
- Tabs：Props: modelValue(当前值)/items(标签)/closable(可关闭)；Events: @update:modelValue(改值) @close(关闭)
- Pagination：Props: total(总数)/page(当前页)/pageSize(页大小)；Events: @update:page(翻页) @update:pageSize(改页大小)
- Steps：Props: current(当前步)/status(状态)/direction(方向)
- Tree：Props: data(节点)/expandedKeys(展开)/checkedKeys(选中)；Events: @expand(展开) @check(勾选) @select(选择)

### 反馈 / 浮层

- Alert：Props: type(类型)/closable(可关闭)/title(标题)/description(描述)；Events: @close(关闭)
- Message：Props: type(类型)/duration(时长)
- Notification：Props: type(类型)/title(标题)/duration(时长)
- Modal：Props: modelValue(显示)/title(标题)/okText(确定文案)/cancelText(取消文案)；Events: @update:modelValue(显隐) @ok(确认) @cancel(取消)
- Drawer：Props: modelValue(显示)/title(标题)/placement(方向)；Events: @update:modelValue(显隐) @close(关闭)
- Popover：Props: content(内容)/trigger(触发)/placement(位置)
- Popconfirm：Props: title(标题)/okText(确定文案)/cancelText(取消文案)；Events: @confirm(确认) @cancel(取消)
- Tooltip：Props: content(内容)/trigger(触发)/placement(位置)
- Dropdown：Props: items(菜单)/trigger(触发)；Events: @select(选择)
- Loading：Props: spinning(加载态)/text(文案)
- Progress：Props: value(进度)/status(状态)/showText(显示文本)

### 数据展示

- Table：Props: columns(列)/data(数据)/rowKey(行键)；Events: @rowClick(行点击)
- Timeline：Props: items(节点)/placement(位置)
