# Tigercat 组件总览（Vue 3）

<!-- LLM-INDEX: framework=Vue3; package=@expcat/tigercat-vue; import-from=@expcat/tigercat-vue; event-style=kebab-case; v-model=supported -->

面向快速理解与使用的简版组件清单，适合 AI/搜索场景。

## LLM 组件索引

**基础组件 (Layout/Basic):** Button | Icon | Text | Code | Link | Tag | Badge | Avatar | Divider  
**布局 (Layout):** Container | Grid | Layout | Space | Card | List | Descriptions | Skeleton  
**表单 (Form):** Form | FormItem | Input | Textarea | Select | Checkbox | CheckboxGroup | Radio | RadioGroup | Switch | Slider | DatePicker | TimePicker | Upload  
**导航 (Navigation):** Breadcrumb | Menu | Tabs | Pagination | Steps | Tree  
**反馈/浮层 (Feedback/Overlay):** Alert | Message | Notification | Modal | Drawer | Popover | Popconfirm | Tooltip | Dropdown | Loading | Progress  
**数据展示 (Data):** Table | Timeline | ChartCanvas | ChartAxis | ChartGrid | ChartSeries | BarChart | ScatterChart | PieChart

**快速查找：** 所有组件从 `@expcat/tigercat-vue` 导入，事件使用 kebab-case (@click, @change)，支持 v-model。

## 快速使用

```vue
<script setup>
import { Button, ConfigProvider } from '@expcat/tigercat-vue'
</script>

<template>
  <ConfigProvider>
    <Button variant="solid">开始使用</Button>
  </ConfigProvider>
</template>
```

- 组件名使用 PascalCase（如 `Button`、`DatePicker`）
- 事件采用 kebab-case（如 `@click`、`@change`）
- 支持 v-model 双向绑定

> 样式配置请参考 [README.md](../README.md#llm-quick-start)

## 组件清单（Props / Events 速览）

### 基础

- Button：Props: variant(外观)/size(尺寸)/disabled(禁用)/loading(加载)/block(块级)/type(原生类型)/class(样式类)/style(内联样式)；Events: @click(点击)；Slots: default(内容)/loading-icon(加载图标)
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
- Input：Props: modelValue(值)/placeholder(占位)/disabled(禁用)/clearable(可清除)/prefix(前缀)/suffix(后缀)/status(状态)/errorMessage(错误信息)；Events: @update:modelValue(改值) @change(变更) @blur(失焦)；Slots: prefix(前缀)/suffix(后缀)；Other: Error status triggers shake animation
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
- ChartCanvas：Props: width(宽度)/height(高度)/padding(内边距)
- ChartAxis：Props: orientation(方向)/scale(比例尺)/ticks(刻度数)/tickValues(刻度值)/label(标题)
- ChartGrid：Props: xScale/yScale(比例尺)/show(网格)/xTicks/yTicks(刻度数)/lineStyle(样式)
- ChartSeries：Props: data(数据)/name(名称)/color(颜色)/type(类型)
- BarChart：Props: data(数据)/width(宽度)/height(高度)/barColor(颜色)/showGrid(网格)
- ScatterChart：Props: data(数据)/width(宽度)/height(高度)/pointSize(点大小)/showGrid(网格)
- PieChart：Props: data(数据)/width(宽度)/height(高度)/innerRadius(内半径)/showLabels(标签)

## 常见陷阱 / FAQ

1. **样式未生效：** 确保 Tailwind 配置的 `content` 包含 `./node_modules/@expcat/tigercat-*/dist/**/*.{js,mjs}`
2. **主题变量无效：** 必须在 `plugins` 中添加 `tigercatPlugin`
3. **v-model 不响应：** 检查是否同时使用了 `:value` 和 `@update:modelValue`（应只用 `v-model`）
4. **事件名称错误：** Vue 事件使用 kebab-case（`@click` 而非 `@onClick`）
5. **组件未注册：** 确认已从 `@expcat/tigercat-vue` 导入并在 template 中使用 PascalCase

更多详情见各组件文档：`docs/components/[component-name].md`（TODO: 待补全） 或源码：`packages/vue/src/components/`
