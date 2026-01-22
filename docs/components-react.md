# Tigercat 组件总览（React）

<!-- LLM-INDEX: framework=React; package=@expcat/tigercat-react; import-from=@expcat/tigercat-react; event-style=camelCase; controlled=supported -->

面向快速理解与使用的简版组件清单，适合 AI/搜索场景。

## LLM 组件索引

**基础组件 (Layout/Basic):** Button | Icon | Text | Code | Link | Tag | Badge | Avatar | Divider  
**布局 (Layout):** Container | Grid | Layout | Space | Card | List | Descriptions | Skeleton  
**表单 (Form):** Form | FormItem | Input | Textarea | Select | Checkbox | CheckboxGroup | Radio | RadioGroup | Switch | Slider | DatePicker | TimePicker | Upload  
**导航 (Navigation):** Breadcrumb | Menu | Tabs | Pagination | Steps | Tree  
**反馈/浮层 (Feedback/Overlay):** Alert | Message | Notification | Modal | Drawer | Popover | Popconfirm | Tooltip | Dropdown | Loading | Progress  
**数据展示 (Data):** Table | Timeline

**快速查找：** 所有组件从 `@expcat/tigercat-react` 导入，事件使用 camelCase (onClick, onChange)，支持受控/非受控模式。

## 快速使用

```tsx
import { Button, ConfigProvider } from '@expcat/tigercat-react'

export function App() {
  return (
    <ConfigProvider>
      <Button variant="solid">开始使用</Button>
    </ConfigProvider>
  )
}
```

- 组件名使用 PascalCase（如 `Button`、`DatePicker`）
- 事件使用 camelCase（如 `onClick`、`onChange`）
- 支持受控/非受控模式

> 样式配置请参考 [README.md](../README.md#llm-quick-start)

## 组件清单（Props / Events 速览）

### 基础

- Button：Props: variant(外观)/size(尺寸)/disabled(禁用)/loading(加载)/loadingIcon(加载图标)/block(块级)/type(原生类型)/className(样式类)/style(内联样式)；Events: onClick(点击)
- Icon：Props: name(图标名)/size(尺寸)/color(颜色)/rotate(旋转)
- Text：Props: size(字号)/weight(字重)/color(颜色)/ellipsis(省略)
- Code：Props: value(内容)/lang(语言)/copyable(可复制)
- Link：Props: href(地址)/disabled(禁用)/variant(外观)；Events: onClick(点击)
- Tag：Props: color(颜色)/size(尺寸)/closable(可关闭)；Events: onClose(关闭)
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
- FormItem：Props: name(字段)/label(标签)/error(错误)
- Input：Props: value(值)/placeholder(占位)/disabled(禁用)/clearable(可清除)/prefix(前缀)/suffix(后缀)/status(状态)/errorMessage(错误信息)；Events: onChange(变更)/onBlur(失焦)；Other: Error status triggers shake animation
- Textarea：Props: value(值)/rows(行数)/autosize(自适应)；Events: onChange(变更)
- Select：Props: value(值)/options(选项)/multiple(多选)/clearable(可清除)；Events: onChange(变更)
- Checkbox：Props: checked(选中)/disabled(禁用)/indeterminate(半选)；Events: onChange(变更)
- CheckboxGroup：Props: value(值集合)/options(选项)；Events: onChange(变更)
- Radio：Props: checked(选中)/value(选项值)/disabled(禁用)；Events: onChange(变更)
- RadioGroup：Props: value(当前值)/options(选项)；Events: onChange(变更)
- Switch：Props: checked(开关值)/disabled(禁用)/size(尺寸)；Events: onChange(变更)
- Slider：Props: value(值)/min(最小)/max(最大)/step(步长)；Events: onChange(变更)
- DatePicker：Props: value(值)/format(格式)/disabled(禁用)/range(范围)；Events: onChange(变更)
- TimePicker：Props: value(值)/format(格式)/disabled(禁用)；Events: onChange(变更)
- Upload：Props: fileList(文件列表)/action(上传地址)/limit(数量上限)/accept(类型)；Events: onChange(变更)/onSuccess(成功)/onError(失败)

### 导航

- Breadcrumb：Props: items(层级)/separator(分隔符)
- Menu：Props: items(数据)/activeKey(选中)/collapsed(折叠)；Events: onSelect(选择)
- Tabs：Props: value(当前值)/items(标签)/closable(可关闭)；Events: onChange(切换)/onClose(关闭)
- Pagination：Props: total(总数)/page(当前页)/pageSize(页大小)；Events: onChange(翻页)/onPageSizeChange(改页大小)
- Steps：Props: current(当前步)/status(状态)/direction(方向)
- Tree：Props: data(节点)/expandedKeys(展开)/checkedKeys(选中)；Events: onExpand(展开)/onCheck(勾选)/onSelect(选择)

### 反馈 / 浮层

- Alert：Props: type(类型)/closable(可关闭)/title(标题)/description(描述)；Events: onClose(关闭)
- Message：Props: type(类型)/duration(时长)
- Notification：Props: type(类型)/title(标题)/duration(时长)
- Modal：Props: open(显示)/title(标题)/okText(确定文案)/cancelText(取消文案)；Events: onOk(确认)/onCancel(取消)
- Drawer：Props: open(显示)/title(标题)/placement(方向)；Events: onClose(关闭)
- Popover：Props: content(内容)/trigger(触发)/placement(位置)
- Popconfirm：Props: title(标题)/okText(确定文案)/cancelText(取消文案)；Events: onConfirm(确认)/onCancel(取消)
- Tooltip：Props: content(内容)/trigger(触发)/placement(位置)
- Dropdown：Props: items(菜单)/trigger(触发)；Events: onSelect(选择)
- Loading：Props: spinning(加载态)/text(文案)
- Progress：Props: value(进度)/status(状态)/showText(显示文本)

### 数据展示

- Table：Props: columns(列)/data(数据)/rowKey(行键)；Events: onRowClick(行点击)
- Timeline：Props: items(节点)/placement(位置)

## 常见陷阱 / FAQ

1. **样式未生效：** 确保 Tailwind 配置的 `content` 包含 `./node_modules/@expcat/tigercat-*/dist/**/*.{js,mjs}`
2. **主题变量无效：** 必须在 `plugins` 中添加 `tigercatPlugin`
3. **受控组件报错：** 不要在同一组件混用 `value` (受控) 和 `defaultValue` (非受控)
4. **事件名称错误：** React 事件使用 camelCase（`onClick` 而非 `@click`）
5. **类型导入：** 组件 props 类型也从 `@expcat/tigercat-react` 导出（如 `ButtonProps`）

更多详情见各组件文档：`docs/components/[component-name].md`（TODO: 待补全） 或源码：`packages/react/src/components/`
