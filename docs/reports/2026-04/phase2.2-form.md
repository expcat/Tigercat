# Phase 2.2 — Form 组件审查 (2026-04)

> 范围：22 个组件 — AutoComplete, Cascader, Checkbox, CheckboxGroup, ColorPicker, DatePicker, Form, FormItem, Input, InputGroup, InputNumber, Mentions, Radio, RadioGroup, Rate, Select, Slider, Stepper, Switch, Textarea, TimePicker, Transfer, TreeSelect, Upload
> 共享 utils：`form-validation.ts`、`form-dependency-utils.ts`、`form-history-utils.ts`、`input-styles.ts`、`select-utils.ts`、`cascader-utils.ts`、`auto-complete-utils.ts`、`tree-select-utils.ts`、`transfer-utils.ts`、`color-picker-utils.ts`、`mentions-utils.ts`、`rate-utils.ts`、`stepper-utils.ts`、`input-number-utils.ts`、`input-group-utils.ts`、`textarea-auto-resize.ts`、`upload-utils.ts`、`upload-labels.ts`、`datepicker-i18n.ts`、`datepicker-styles.ts`、`timepicker-utils.ts`

## 1. 体积现状

| 组件                    | Vue dts | 备注                             |
| ----------------------- | ------- | -------------------------------- |
| **DatePicker**          | 7.3 KB  | 自实现日期面板？需查是否依赖外部 |
| **TimePicker**          | 8.2 KB  | 同上                             |
| **Upload**              | 7.6 KB  | 拖拽 + 预览 + 进度               |
| **Cascader**            | 中      | 多级联动                         |
| **TreeSelect**          | 中      | 与 Tree 共逻辑                   |
| **Form** + **FormItem** | 中      | 校验体系                         |
| **Mentions**            | 2.3 KB  | 触发字符 + 弹层                  |

DatePicker + TimePicker 合计 ~15 KB dts，是 form 类**最大体积来源**，且只有需要的用户才用。

## 2. 代码层优化

| #   | 优化项                                                                                                                                                                                                 | 优先级 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| F1  | **DatePicker / TimePicker**：是否复用 `date-utils.ts` + `composite-time-utils.ts`？检查 vue/react 内是否各写了一份格式化 / parse 逻辑                                                                  | **P0** |
| F2  | **DatePicker locale**：`datepicker-i18n.ts` 应改为按需 import（`@expcat/tigercat-core/i18n/datepicker/zh-CN`）                                                                                         | P1     |
| F3  | **Upload**：拖拽逻辑应复用 `core/utils/drag.ts`，避免重复实现                                                                                                                                          | P1     |
| F4  | **Form**：检查 form 实例的响应式是否有 O(N²) 收集（每次 itemValidate 触发全量遍历）                                                                                                                    | P1     |
| F5  | **Select / Cascader / TreeSelect / AutoComplete / Transfer**：5 个均为弹层 + 选项过滤 + 键盘导航。共享层应抽 `picker-utils.ts`（已部分有），覆盖：键盘 Up/Down/Home/End/Enter/Esc + ARIA combobox 模式 | P1     |
| F6  | **Mentions**：触发器位置定位用 `floating-popup-utils`，确认未自实现 getBoundingClientRect 偏移                                                                                                         | P1     |
| F7  | **InputNumber / Stepper**：长按 +/- 应使用 `requestAnimationFrame` 节流（避免 setInterval 漂移）                                                                                                       | P1     |
| F8  | **Textarea**：auto-resize 已抽到 `textarea-auto-resize.ts` ✅；检查是否在 unmount 正确释放 ResizeObserver                                                                                              | P1     |
| F9  | **ColorPicker**：颜色转换（hex/rgb/hsv/oklch）应统一到 `color-picker-utils.ts`，避免 vue/react 各写一份                                                                                                | P1     |
| F10 | **Slider**：拖拽用 `useDrag` hook（已有），确认替换完成                                                                                                                                                | P1     |
| F11 | **Form**：history (undo/redo) 在 `form-history-utils.ts` 已抽离，确认两端共用                                                                                                                          | P1     |
| F12 | **Switch**：尺寸 / 颜色 / 文本三套样式建议靠 `composeComponentClasses` 统一                                                                                                                            | P2     |
| F13 | **Radio / Checkbox**：默认 SVG icon 应使用 CSS mask 而非 inline SVG，节省体积                                                                                                                          | P2     |
| F14 | **Form**：建议提供 `useFormController` (React) / `useTigerForm` (Vue) 命令式 API                                                                                                                       | P2     |

## 3. 样式现代化清单

| 组件                                               | 现代化方案                                                                                                                                                          |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input / Textarea / InputNumber                     | 圆角升 `--tiger-radius-md`；focus 状态用双层阴影（外 ring + 内描边亮色）；`hover` 时背景微提亮 `color-mix(in oklab, var(--tiger-surface), var(--tiger-primary) 4%)` |
| Select / Cascader / AutoComplete / TreeSelect 弹层 | 表面叠玻璃（`--tiger-shadow-glass` + `backdrop-blur`）；选项 hover 改用 `--tiger-radius-sm` 微圆角块状                                                              |
| DatePicker / TimePicker 面板                       | 玻璃面板 + cell 圆角 `pill`；today 用渐变描边                                                                                                                       |
| Switch                                             | 滑块过渡用 `spring` easing；on 状态用 `--tiger-gradient-primary`；提供 `pill / squircle` 两种形态                                                                   |
| Checkbox / Radio                                   | 选中时 spring 缩放 + 渐变填充                                                                                                                                       |
| Form 错误态                                        | 红色 ring 增加 4px halo（`box-shadow: 0 0 0 4px color-mix(in oklab, var(--tiger-error), transparent 80%)`）                                                         |
| Slider                                             | track 使用 `--tiger-gradient-primary`；handle 玻璃化（白底+内描边）                                                                                                 |
| ColorPicker 弹层                                   | 玻璃 + 圆角 `--tiger-radius-lg`                                                                                                                                     |
| Upload dropzone                                    | 默认虚线边框；hover 转实色 + 内层渐变背景（`color-mix(in oklab, var(--tiger-primary), transparent 90%)`）                                                           |
| Rate                                               | star 切换时 spring scale 1.0 → 1.2 → 1.0；hover 路径上的星单独 emphasized easing                                                                                    |
| Stepper                                            | 同 InputNumber，按钮 hover 玻璃化                                                                                                                                   |
| Tag (in form 多选)                                 | filled 形态升渐变背景                                                                                                                                               |

## 4. 演示案例改进

### 缺失 / 可强化

- **FormDemo**：增加"复杂联动 + 异步校验 + 多步表单"端到端示例（目前只有基础校验）
- **DatePickerDemo / TimePickerDemo**：增加"国际化切换"实时演示，对接 ConfigProvider
- **CascaderDemo**：增加异步加载子级
- **TransferDemo**：增加搜索 + 排序 + 自定义渲染
- **TreeSelectDemo**：增加 checkable + showSearch
- **UploadDemo**：增加分片上传 / 进度 / 失败重试 演示（当前估计偏简单）
- **MentionsDemo**：增加多触发字符 (`@` + `#`) 演示
- **ColorPickerDemo**：增加 OKLCH 模式（现代色域）演示
- **FormWizardDemo**（Composite 已有，但建议在 Form demo 顶部加跳转链接）

### Vue3 / React 一致性

- 同名 demo 应使用对称 layout，便于截图对比

## 5. 风险与依赖

- F1 是 P0：必须先确认 DatePicker/TimePicker 没有 vue/react 各一份 1k+ 代码的格式化逻辑
- F5 picker 共享层是 P1，影响 5 个组件，工作量最大但收益高（估计可砍 5–8 KB）
- 现代化样式依赖 Phase 1C；Form 的 ring halo 需要先注入新 shadow token
