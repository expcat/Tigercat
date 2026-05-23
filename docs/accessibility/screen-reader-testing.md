# 屏幕阅读器手工测试清单

本文档用于补充 `jest-axe` 和组件单测无法覆盖的真实辅助技术体验。每次新增复杂交互组件、修改焦点管理、调整 aria 属性或发布重要版本前，至少抽样验证相关组件。

## 测试环境

| 平台    | 屏幕阅读器 | 浏览器        | 优先级       |
| ------- | ---------- | ------------- | ------------ |
| Windows | NVDA       | Firefox       | 必测         |
| Windows | NVDA       | Chrome / Edge | 建议         |
| macOS   | VoiceOver  | Safari        | 必测         |
| macOS   | VoiceOver  | Chrome        | 建议         |
| iOS     | VoiceOver  | Safari        | 触控组件必测 |

记录测试结果时写明操作系统、浏览器、屏幕阅读器版本和组件状态。

## 通用流程

1. 打开对应 Example 页面或最小复现页面。
2. 只使用键盘完成主要流程：`Tab`、`Shift+Tab`、方向键、`Enter`、`Space`、`Esc`。
3. 开启屏幕阅读器，重复同一流程，确认朗读内容、角色、状态和焦点顺序。
4. 切换暗色模式、禁用态、加载态、错误态和空态，确认状态变化可感知。
5. 用浏览器缩放到 200%，确认焦点指示和可读文本仍可用。
6. 记录阻塞问题、可接受差异和后续自动化测试建议。

## 全局检查项

- 页面标题和主要区域能被屏幕阅读器定位。
- 交互控件有可理解的 accessible name。
- 控件 role 与视觉语义一致，例如按钮读作 button，输入框读作 edit/textbox。
- 当前状态会被朗读，例如 expanded、selected、checked、disabled、busy、invalid。
- 焦点顺序与视觉阅读顺序一致。
- 焦点不会被困在非模态区域，也不会从打开的模态内容中逃逸。
- `Esc`、关闭按钮或取消按钮能退出弹层并把焦点还给触发元素。
- 动态提示、通知或校验错误会被宣布，且不会反复刷屏。
- 图标按钮有 `aria-label` 或等价文本。
- 纯装饰图标不会被重复朗读。

## 组件类别清单

### 表单组件

适用：Input、Textarea、Select、DatePicker、TimePicker、Checkbox、Radio、Switch、Slider、Upload、Form。

- label 与控件正确关联。
- required、disabled、readonly、invalid 状态会被朗读。
- 错误信息在焦点进入控件或提交失败后可感知。
- 组合输入的前缀、后缀和清除按钮不会打断主控件名称。
- 下拉、日期和时间面板打开后，焦点进入可操作区域。
- 方向键、`Enter`、`Space` 和 `Esc` 行为符合控件习惯。

### 弹层和反馈组件

适用：Modal、Drawer、Popover、Popconfirm、Tooltip、Dropdown、Message、Notification、Tour。

- 打开后朗读标题、用途或当前步骤。
- Modal / Drawer 打开时背景内容不会被键盘访问。
- 关闭后焦点回到触发控件。
- Tooltip 不承载必须完成任务的唯一信息。
- Message / Notification 的重要内容可被宣布，但不会抢走焦点。
- Tour 步骤变化会朗读步骤标题、内容和可用操作。

### 导航组件

适用：Menu、Tabs、Pagination、Breadcrumb、Steps、Anchor、Tree。

- 当前项、选中项和展开状态会被朗读。
- 方向键或 Tab 行为符合组件模式。
- Tabs 切换后面板内容可被访问。
- Tree 节点层级、展开状态和选择状态清晰。
- Pagination 能朗读当前页、总页数、上一页和下一页。

### 数据展示组件

适用：Table、Calendar、Timeline、Collapse、Descriptions、List、Statistic。

- 表格表头与单元格关系清晰。
- 排序、筛选和展开行状态会被朗读。
- Collapse 展开/收起状态准确。
- Calendar 当前日期、选中日期和不可选日期可区分。
- 空状态和加载状态有可理解文本。

### 图表和可视化组件

适用：AreaChart、BarChart、LineChart、PieChart、RadarChart、ScatterChart、HeatmapChart 等。

- 图表容器有简短名称或说明。
- 图例、tooltip 或数据点交互可通过键盘访问，或有等价数据说明。
- 颜色不是唯一的信息来源。
- 图表导出、缩放或 brush 等交互有明确按钮名称。

### 高级和复合组件

适用：CodeEditor、RichTextEditor、FileManager、Kanban、TaskBoard、VirtualList、VirtualTable、ChatWindow。

- 复杂区域有明确 role、标题或说明。
- 拖拽排序提供键盘替代路径或明确的当前限制说明。
- 虚拟滚动内容不会造成朗读顺序混乱。
- 编辑器工具栏按钮有名称、状态和快捷键提示。
- 聊天消息按时间顺序朗读，新消息通知不会打断正在阅读的内容。

## 结果记录模板

```md
## Component / Scenario

- Date:
- Tester:
- OS / Browser:
- Screen reader:
- Example / reproduction:

### Result

- [ ] Pass
- [ ] Pass with notes
- [ ] Fail

### Notes

- Focus order:
- Announced role/name/state:
- Keyboard behavior:
- Issues:
- Follow-up tests:
```

## PR 评审提示

当 PR 修改以下内容时，需要附上手工测试记录或说明未测试原因：

- 新增复杂交互组件。
- 修改弹层、焦点管理或键盘导航。
- 修改 `aria-*`、role、label 或 live region。
- 修改表单校验、错误提示或动态通知。
- 修改虚拟滚动、拖拽、图表交互或编辑器工具栏。
