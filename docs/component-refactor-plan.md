# Tigercat 组件优化/重构计划（可逐步拆解）

> 目标：用最小的破坏面，把所有组件在 **一致性、可访问性(a11y)、类型正确性、跨框架复用、可测试性、可维护性** 上拉齐到同一水位。
>
> 范围：`packages/vue/src/components/*`、`packages/react/src/components/*`、必要时 `packages/core/src/{utils,types,theme}/*`、配套 `tests/*` 与 `docs/components/*`。

---

## 当前任务 / 状态板（每次只更新这里 + 对应组件小节状态）

- 上一步：✅ `Slider` Step1 API/主题/a11y 基线对齐（2026-01-12）
- 当前组件：`待定`
- 当前步骤：等待下一条指令
- 状态：`not-started`
- 目标 PR 粒度：一次只做一个 Step（必要时拆更小子步）
- 完成后要做的事：
  - 更新本区块为下一步任务
  - 在对应组件小节追加一条“状态：✅ StepX ...（YYYY-MM-DD）”记录
  - 然后停下来等待下一条指令

---

## 1. 总体原则（“强大脑”决策规则）

1. **先对齐模式再动手**：每次重构前先对照同类组件（Button/Input/Form）现有写法，保持一致。

2. **跨框架逻辑下沉 core**：

- 可复用逻辑：校验、格式化、数据处理、class 生成、主题变量 → 放 `@tigercat/core`。
- 框架特有：Vue slots/attrs/emits、React hooks/refs/context → 留在各自包。

3. **先稳定 API，再优化实现**：对外 props/events 语义与默认值先统一，避免“实现变好了但 API 漏洞更多”。

4. **以 DoD 驱动收敛**：每个组件的重构必须能交付（导出/类型/测试/文档齐）。

---

## 2. 每个组件重构的 DoD（完成标准）

对“任何 Medium/High 重构”至少满足：

- **API 一致性**：Vue emits kebab-case；React handler camelCase；默认值与 docs 同步。
- **Theme 支持**：颜色相关全部走 CSS vars（带 fallback），不硬编码纯色。
- **A11y 基线**：可交互元素有正确 role/aria 属性；键盘可用；焦点可见。
- **类型**：strict 下无 `any`（必要时 `unknown` + narrow）；公共类型优先放 core。
- **测试**：至少 1 组关键路径测试；复杂交互组件补键盘/边界。
- **文档**：`docs/components/*.md` 与真实 props/events 对齐；提供一个最小示例。

> 轻量组件（标记为“无需优化”）也建议做一次 **a11y/主题/类型** 的例行检查，但不强制改动。

---

## 3. 分阶段执行策略（适合逐步拆解任务）

### Phase 0：基建与统一约束（先做一次即可）

- [ ] 建立「组件重构任务模板」(见下方第 4 节) 并约定优先级标签：P0/P1/P2/P3。
- [ ] 统一跨组件的通用能力（按需在 core 增加 utils/types）：
  - [ ] a11y：focus management、keyboard helpers、aria id 生成
  - [ ] overlay：click-outside、ESC 关闭、focus trap（React/Vue 各自包封装，core 只放无框架算法）
  - [ ] i18n：常用文案（empty/loading/ok/cancel）以 props/locale 方式注入（默认英文/中文）
  - [ ] consistent classes：所有组件 class 生成尽量走 core 的 `*-utils.ts` / `*-styles.ts`

> 说明：Phase 0 不强制一次性做完；当某类组件开始重构时再补齐对应基建。

### Phase 1：低风险“水位线对齐”（P2/P3 优先）

先处理简单展示类组件，快速建立一致性：

- Divider / Space / Text / Badge / Tag / Card / Container / Icon

### Phase 2：表单与输入（P1）

- Input / Textarea / Checkbox / Radio / Select / Switch / Slider / Form / FormItem

### Phase 3：Overlay 与反馈（P0/P1）

- Modal / Drawer / Popover / Tooltip / Popconfirm / Dropdown
- Message / Notification / Loading / Alert

### Phase 4：复杂数据与导航（P0/P1）

- Table / DatePicker / TimePicker / Upload
- Menu / Tabs / Pagination / Breadcrumb / Steps / Tree

---

## 4. 组件重构任务模板（复制后逐步拆解）

每个组件建议按下面拆分成可独立 PR 的小任务：

1. **API 对齐**：props/events/defaults 与 docs 对齐；补缺失的类型导出。
2. **核心逻辑抽取**：把框架无关逻辑移动到 core utils（如过滤/排序/日期处理/校验）。
3. **交互与 a11y**：键盘路径、ARIA、focus、disabled/readOnly 行为。
4. **测试补齐**：关键路径 + 边界 +（必要时）a11y。
5. **文档更新**：API 表、示例、主题定制点、注意事项。

> 复杂组件（Select/DatePicker/Table/Menu）通常会拆出 2~4 个 PR：先 API/类型，再交互/a11y，再性能/扩展能力。

---

## 5. 组件清单（按类别分组）

> 说明：
>
> - 「无需优化」= 当前预估为简单组件，仅建议例行检查（a11y/主题/类型/导出）。
> - 「建议优化」= 有明显交互/状态/性能/一致性空间；会给出可拆分任务。
> - 子组件（如 `BreadcrumbItem`、`TabPane`）通常跟随父组件一起重构。

### A. 基础展示（Basic）

#### Button（P1，建议优化）

- 思路：统一 Vue/React 的 disabled/loading 行为与事件透传；loading 时可选 aria-busy。
- 可拆分：API 对齐 → a11y/focus → 样式/主题变量检查 → tests/docs。

#### Icon（P2，建议优化）

- 思路：统一 aria-hidden/aria-label 约定；可选 size/color props 与 CSS vars。
- 可拆分：a11y 约定 → 类型收敛 → docs 示例。
- 状态：✅ Step1 a11y/类型/实现一致性（2026-01-11）：Vue/React Icon 统一用容器元素承载尺寸与 a11y（默认 decorative `aria-hidden`，提供 `aria-label` 时自动 `role="img"`）；支持 attrs/原生属性透传；SVG/第三方图标子节点统一 `w-full h-full` 随容器缩放；同步更新 Vue/React 单测与文档。

#### Link（P2，建议优化）

- 思路：disabled 行为（阻止导航/aria-disabled）；外链 rel="noreferrer" 安全默认值。
- 可拆分：API/默认值 → a11y → tests。
- 状态：✅ Step1 API/默认值对齐（2026-01-11）：Vue 版补齐 attrs 透传与 class 合并；Vue/React 在 `target="_blank"` 时会合并补齐 `rel` 的 `noopener noreferrer`（即使传了自定义 rel）；同步更新 Vue/React Link 单测与文档说明。

#### Text（P3，无需优化）

- 例行检查：语义标签选择、颜色主题变量、docs 一致性。
- 状态：✅ 已例行检查（2026-01-11）：Vue 版支持 attrs 透传与 class 合并；Text 颜色改为 CSS vars（带 fallback：`--tiger-text`/`--tiger-text-muted`/`--tiger-success`/`--tiger-warning`/`--tiger-danger`）；补充 Vue 单测覆盖 attrs 透传。

#### Badge（P3，无需优化）

- 例行检查：颜色使用 CSS vars、尺寸/variant 一致。
- 状态：✅ 已例行检查（2026-01-11）：Badge 默认 variant 配色改为 CSS vars（带 fallback：`--tiger-secondary`/`--tiger-primary`/`--tiger-success`/`--tiger-warning`/`--tiger-danger`/`--tiger-info`）；同步更新 Vue/React 快照测试。

#### Tag（P3，无需优化）

- 例行检查：可关闭 tag（若支持）应有按钮语义与 aria-label。
- 状态：✅ 已例行检查（2026-01-11）：Tag 变体配色改为 CSS vars（含 fallback，支持 `--tiger-tag-*-bg/text/border/close-hover-bg`）；Vue 版补齐 attrs 透传与 class 合并；React 关闭图标补 `aria-hidden`；同步更新 Tag 快照测试。

#### Avatar（P2，建议优化）

- 思路：img 的 alt/fallback；加载失败占位；可选 shape/size 统一。
- 可拆分：a11y/alt → fallback 逻辑抽到 core utils → tests。
- 状态：✅ Step1 a11y/alt/fallback 基线对齐（2026-01-11）：默认无可访问名称时视为装饰元素（`aria-hidden`）；提供 `alt`/`text`/`aria-label` 时自动 `role="img"` 并使用其作为读屏名称；图片加载失败后回退到 text/slot；`src` 变更会重置错误状态；同步更新 Vue/React 单测与 Avatar 文档。

#### Card（P3，无需优化）

- 例行检查：header/footer slot/children 行为与 docs 对齐。
- 状态：✅ 已例行检查（2026-01-11）：Card 边框/背景颜色改为 CSS vars（带 fallback：`--tiger-border`/`--tiger-border-strong`/`--tiger-card-bg`）；Vue 版补齐 attrs 透传与 class 合并；同步更新 Vue/React 快照测试并补充 Vue attrs 单测。

#### Container（P3，无需优化）

- 例行检查：响应式 class 与 docs 对齐。
- 状态：✅ 已例行检查（2026-01-11）：Vue/React props 与文档一致（`maxWidth`/`center`/`padding`）；Vue 支持 attrs 透传与 `class` 合并（string/array/object）；Vue/React 单测覆盖默认行为与快照。

#### Divider（P3，无需优化）

- 例行检查：role="separator"/aria-orientation（如果是语义分隔）。
- 状态：✅ 已例行检查（2026-01-10）：默认颜色改为 `--tiger-border`（带 fallback），a11y role/aria 维持不变。

#### Space（P3，无需优化）

- 例行检查：间距/方向 props 与 docs 对齐。
- 状态：✅ 已例行检查（2026-01-10）：修正测试用例的 size 范围与文档一致（sm/md/lg/number），并在 core 对非法 size 做了运行时回退。

### B. 布局（Layout）

#### Layout / Header / Sidebar / Content / Footer（P2，建议优化）

- 思路：统一布局类组件的 class 生成与响应式；Sidebar collapsed 状态与 Menu 联动（如有）。
- 可拆分：API 统一 → 样式抽取到 core → tests（最小渲染）。

#### Grid：Row / Col（P2，建议优化）

- 思路：gutter/align/justify 的类型与实现一致；将网格计算逻辑集中到 core（如果未集中）。
- 可拆分：core grid util 对齐 → 组件 props 对齐 → tests。

### C. 表单与输入（Form）

#### Input（P1，建议优化）

- 思路：受控/非受控一致；clearable/前后缀 slot/children；aria-invalid/aria-describedby。
- 可拆分：API → a11y → core input-styles 对齐 → tests。

#### Textarea（P1，建议优化）

- 思路：autoSize（如支持）边界；maxlength 计数；aria。

#### Checkbox / CheckboxGroup（P1，建议优化）

- 思路：组内 name/value、indeterminate、键盘操作；将组选中计算抽 core。

#### Radio / RadioGroup（P1，建议优化）

- 思路：roving tabindex、aria-checked；组内受控/默认值一致。

#### Select（P0，建议优化）

- 思路：键盘导航（上下/回车/esc）、aria-combobox/listbox；多选展示与清除；点击外部关闭；搜索输入焦点管理。
- 可拆分：

  1. API/类型对齐（value 类型、option group 类型）
  2. 键盘/aria/focus
  3. 视觉与主题（状态色全部 CSS vars）
  4. tests（键盘 + 选中 + 清空 + 搜索）

- 状态：✅ Step1 API/类型对齐（2026-01-11）：修正 `@tigercat/core` 的 `SelectOptions` 为 `(SelectOption | SelectOptionGroup)[]`（支持 option 与 group 混合数组），并同步 Vue 组件 props 与文档类型说明。
- 状态：✅ Step2 键盘/ARIA/focus（2026-01-11）：补齐 Vue/React 的 `combobox/listbox/option` 语义与 `aria-activedescendant`；支持 `↑/↓/Enter/Escape/Home/End` 键盘导航与选择（跳过 disabled）；Esc 关闭并回焦触发器；增加 active option 高亮与滚动可见。
- 状态：✅ Step3 视觉与主题（2026-01-11）：Select 样式从 Tailwind 固定色收敛到 CSS vars（带 fallback），覆盖 trigger/dropdown/group/search/empty/disabled 等；Vue 版图标与 placeholder 文案颜色同步改为 CSS vars。

#### Switch（P2，建议优化）

- 思路：role="switch" + aria-checked；禁用/加载（若有）统一。

- 状态：✅ Step1 a11y/主题/API 基线对齐（2026-01-12）：Switch 默认配色收敛到 CSS vars（off 使用 `--tiger-border`，thumb 使用 `--tiger-surface`）；Vue 增加 `className/style` 与 attrs 透传并合并 `class/style`，且不会被外部 `@click/@keydown` 覆盖内部切换逻辑；React 支持 `button` 原生属性透传并避免 `{...props}` 覆盖内部 `onClick/onKeyDown`；同步更新 Vue/React 快照与 Switch 文档。

#### Slider（P1，建议优化）

- 思路：键盘操作（左右/上下/Home/End）；aria-valuemin/max/now；范围 slider（如支持）。

- 状态：✅ Step1 API/主题/a11y 基线对齐（2026-01-12）：Slider 默认颜色从 Tailwind 固定色收敛到 CSS vars（含 fallback：`--tiger-border/--tiger-surface/--tiger-text/--tiger-text-muted`）；Vue/React 支持 `aria-label/aria-labelledby/aria-describedby` 传给 thumb 并补齐 `aria-orientation`；Vue 增加 `className/style` props 且导出 `VueSliderProps`；React 支持 `div` 原生属性透传并避免覆盖内部 `value/defaultValue/onChange`；同步更新 Slider 文档与快照。

#### Form / FormItem（P0，建议优化）

- 观察：React Form 里存在动态 `import('@tigercat/core')` 的校验调用，可考虑收敛到静态依赖并统一错误时序。
- 思路：
  - 校验逻辑：统一放 core（已有 validateForm/validateField 则对齐用法）
  - 错误展示：aria-describedby 指向 error 文本
  - 状态一致：submit 时 errors 使用最新结果（避免闭包旧值）
- 可拆分：API/校验路径收敛 → a11y → tests。
- 状态：✅ Step1 API/校验路径收敛（2026-01-11）：Vue/React Form 移除动态 `import('@tigercat/core')`（`validateField` 改静态依赖）；React 提交时使用最新校验结果（避免 `errors` 闭包旧值）；补齐 Vue/React 提交事件测试覆盖。

### D. 导航（Navigation）

#### Menu / MenuItem / SubMenu / MenuItemGroup（P0，建议优化）

- 思路：键盘导航（上下/左右/Enter/Esc）；aria-menu/menuitem；openKeys/selectedKeys 受控/非受控一致；collapsed 模式。
- 可拆分：受控模型与事件语义 → 键盘/a11y → 子组件联动 → tests。
- 状态：✅ Step1 API/类型对齐（2026-01-11）：Vue 版 Menu 系列补齐 attrs 透传与 class 合并；MenuItem/SubMenu/MenuItemGroup 支持 `className`；修复 Menu provide 的 selected/open keys 响应式问题（点击选中样式可更新）；补充 Vue 回归测试覆盖。

#### Tabs / TabPane（P0，建议优化）

- 思路：roving tabindex、aria-controls/aria-labelledby；键盘左右切换；受控/默认值。
- 状态：✅ Step1 API/类型对齐（2026-01-11）：Vue 版补齐 `Tabs`/`TabPane` 的 `style` prop 并透传到根容器/面板（与 React 与文档对齐）；补充 Vue 单测覆盖 `style` 透传。

#### Breadcrumb / BreadcrumbItem（P2，建议优化）

- 思路：nav 语义与 aria-current；separator 可定制。

#### Steps / StepsItem（P2，建议优化）

- 思路：当前/完成/禁用状态语义；可点击 step 的 a11y。

#### Pagination（P1，建议优化）

- 思路：aria-label（上一页/下一页）；pageSize changer；受控/非受控。
- 状态：✅ Step1 API/类型对齐（2026-01-11）：Vue 版 Pagination 补齐 `style` prop，并修复 attrs 透传时 `class/style` 覆盖问题（改为合并）；同步修正文档中 React `onChange` 示例用法；补充 Vue 回归测试覆盖 `class/style` 透传。

#### Dropdown / DropdownMenu / DropdownItem（P1，建议优化）

- 思路：overlay 行为（click-outside/esc）、focus 管理、aria-menu；定位（如需 portal）。
- 可拆分：overlay 行为基建 → a11y → tests。
- 状态：✅ Step1 API/类型对齐（2026-01-11）：Vue 版 Dropdown/DropdownMenu 增加 `style` prop 并与 `attrs.style` 合并；Dropdown/DropdownMenu/DropdownItem 统一 `attrs` 透传与 `class` 合并；React 版 Dropdown/DropdownMenu 修正 `style` 类型为 `React.CSSProperties`（覆盖 core 的跨框架类型）。

### E. 数据展示（Data Display）

#### Table（P0，建议优化）

- 思路：
  - 受控/非受控：sort/filter/pagination/selection 的状态源一致
  - a11y：表头排序 aria-sort；空态/加载语义
  - 性能：大数据时可选虚拟滚动/减少重渲染（后置）
- 可拆分：状态模型/API → a11y → 性能与扩展（可选）→ tests。

- 状态：✅ Step1 API/类型对齐（2026-01-11）：Vue Table 补齐 `className` + `attrs`（`class/style`）透传与合并，并导出 `VueTableProps`；Table 文档补齐 `className` 属性；补充 Vue 回归测试覆盖类名合并。

#### List（P2，建议优化）

- 思路：空态/加载 slot；列表项语义；分页（若支持）一致。

#### Descriptions（P2，建议优化）

- 思路：dl/dt/dd 语义；响应式列数；对齐 core utils。

#### Timeline（P2，建议优化）

- 思路：语义结构；可访问性（标记点/内容关联）。

#### Tree（P0/P1，建议优化）

- 思路：aria-tree/treeitem；键盘展开/选择；受控状态（expandedKeys/selectedKeys）。

- 状态：✅ Step1 API/类型对齐（2026-01-11）：修复 `selectionMode/showIcon/showLine` 在 Vue/React 中“声明了但未生效”的问题；修正受控空数组的优先级（`selectedKeys/checkedKeys`）与 Vue `defaultExpandAll` 初始化；Vue 版补齐 `className` + attrs（`class/style`）透传与合并并导出 `VueTreeProps`；同步更新 Tree 文档与 Vue/React 单测。

#### Progress（P2，建议优化）

- 思路：role="progressbar" + aria-valuenow/min/max；颜色主题变量。
- 状态：✅ Step1 a11y/主题对齐（2026-01-11）：Progress 颜色/track 从 Tailwind 固定色收敛到 CSS vars（含 fallback：`--tiger-border/secondary/primary/success/warning/danger/info`）；Vue/React 支持通过 `aria-label/aria-labelledby/aria-describedby/aria-valuetext` 覆盖默认读屏文案；圆形进度条将 progressbar 语义挂到 `svg`；同步更新单测快照。

#### Skeleton（P3，无需优化）

- 例行检查：aria-busy/aria-live（如有）；避免影响布局。
- 状态：✅ Step1 例行检查（2026-01-11）：默认样式从 Tailwind 固定灰色收敛到 CSS vars（含 fallback，新增 `--tiger-skeleton-bg/--tiger-skeleton-bg-strong`）；Vue/React 统一支持原生属性/attrs 透传与 style 合并；Skeleton 默认 `aria-hidden` 避免读屏噪音；同步更新 Vue/React 单测与快照，并补充文档 a11y/主题说明。

### F. 反馈（Feedback）

#### Alert（P2，建议优化）

- 思路：role="alert"/"status"；可关闭按钮 aria-label；主题色。
- 状态：✅ Step1 a11y/主题对齐（2026-01-11）：Alert 默认按类型使用 `status/alert`（并设置 `aria-live` + `aria-atomic`）；默认配色从 Tailwind 固定色收敛到 CSS vars（带 fallback）；Vue 增加 `className/style` + `attrs` 透传并合并 `class/style`；React props 扩展为 `HTMLAttributes` 以支持 `aria-*` 等原生属性；同步更新单测与快照。

#### Message（P1，建议优化）

- 思路：全局容器的 portal/stack；aria-live；自动关闭与可暂停（hover）。
- 状态：✅ Step1 a11y/主题对齐（2026-01-11）：Message 默认按类型使用 `status/alert`（并设置 `aria-live` + `aria-atomic`）；默认配色与关闭按钮 hover/focus 从 Tailwind 固定色收敛到 CSS vars（带 fallback）；Vue/React 图标补 `aria-hidden`；同步更新 Vue/React 单测覆盖。

#### Notification（P1，建议优化）

- 思路：与 Message 类似，增加位置/堆叠策略一致；a11y。
- 状态：✅ Step1 a11y/主题对齐（2026-01-11）：Notification 按类型使用 `status/alert`（并设置 `aria-live` + `aria-atomic`）；图标补 `aria-hidden` + `focusable=false`；默认配色/背景/关闭按钮 hover/focus 从 Tailwind 固定色收敛到 CSS vars（带 fallback）；Vue 关闭按钮点击阻止冒泡（避免误触 `onClick`）；同步更新 Vue/React 单测与文档说明。

#### Loading（P2，建议优化）

- 思路：aria-busy；覆盖层的可聚焦性与 scroll lock（如是全屏）。
- 状态：✅ Step1 a11y/主题对齐（2026-01-11）：Loading 颜色从 Tailwind 固定色收敛到 CSS vars（含 fallback：`--tiger-primary/secondary/success/warning/danger/info/text-muted`）；默认全屏背景改为 `--tiger-surface`（带 fallback）；Vue 增加 `style` prop 并补齐 `attrs` 透传与 `class/style` 合并；React 合并 `style`（避免覆盖全屏背景/自定义色），并补齐 `aria-busy` 与装饰元素 `aria-hidden`；同步更新 Vue/React 单测覆盖。

### G. 弹层（Overlay）

#### Modal（P0，建议优化）

- 思路：focus trap、ESC 关闭、点击遮罩关闭可配；aria-modal/role="dialog"；scroll lock。
- 状态：✅ Step1 API/类型对齐（2026-01-11）：修复 React 版 `onClose` 在初始挂载时误触发；补齐 Vue/React 的 footer actions（`ok/cancel/close`）以让 `ok/cancel` API 可用；同步更新 Modal 文档与单测。
- 状态：✅ Step2 交互/a11y（2026-01-11）：新增 focus trap（Tab 焦点不逃逸）、`Escape` 关闭、打开后初始聚焦与关闭后回焦触发元素；同步补齐 Vue/React 回归测试。

#### Drawer（P0，建议优化）

- 思路：同 Modal，补从侧边进入的焦点与 aria。
- 状态：✅ Step1 API/类型对齐（2026-01-11）：Vue/React 统一 `aria-labelledby` 行为（title/header 均可作为可访问性标签来源），并修复 Vue `aria-labelledby` 指向缺失 id 的问题；补齐对应回归测试。
- 状态：✅ Step2 交互/a11y（2026-01-11）：新增 focus trap（Tab 焦点不逃逸）、`Escape` 关闭、打开后初始聚焦与关闭后回焦触发元素；同步补齐 Vue/React 回归测试。

#### Popover（P1，建议优化）

- 思路：触发方式（hover/click/focus）；定位；aria-describedby。
- 状态：✅ Step1 API/类型对齐（2026-01-11）：Vue/React 补齐 `style` 支持；Vue 增加 `attrs` 透传并合并 `class/style`；同步更新 Popover 文档与回归测试。

#### Tooltip（P1，建议优化）

- 思路：aria-describedby + 延时；hover/focus 一致。

- 状态：✅ Step1 a11y/API 对齐（2026-01-11）：Vue 修复 `visible` 受控检测（避免 Boolean prop 缺省被当作 `false`）、focus trigger 改为 `focusin/focusout`；Vue/React 增加 `role="tooltip"` 与触发器 `aria-describedby` 关联，支持 `Escape` 关闭；补齐 `style` 与 `attrs`/`class` 合并；同步更新 Tooltip 单测与快照。

#### Popconfirm（P1，建议优化）

- 思路：确认/取消按钮语义；键盘可用；与 Popover/Tooltip 复用 overlay 基建。

- 状态：✅ Step1 a11y/API 对齐（2026-01-11）：Vue/React 增加 `style` 支持；Vue 增加 `attrs` 透传并合并 `class/style`；Vue 修复 description slot 无 prop 时不渲染；Vue/React 增加 `role="alertdialog"` 与 `aria-labelledby/aria-describedby`、trigger `aria-controls/aria-expanded` 关联，支持 `Escape` 关闭与基础 focus 管理；Popconfirm 样式从 Tailwind 固定色收敛到 CSS vars（含 fallback：`--tiger-surface/--tiger-border/--tiger-text/--tiger-text-muted/--tiger-muted-bg/--tiger-danger`）。

### H. 日期/时间/上传（Complex Inputs）

#### DatePicker（P0，建议优化）

- 观察：实现中已有中英文 labels 分支，建议抽成可配置文案/locale；并补 a11y 日历语义。
- 思路：
  - a11y：日历 grid、可用日期禁用语义、键盘选择
  - 受控/非受控：range/single 模式的类型与行为一致
  - i18n：labels/月份/星期统一入口
- 可拆分：API/类型 → i18n 文案注入 → a11y/键盘 → tests。

- 状态：✅ Step1 API/类型对齐（2026-01-11）：文档补齐 `range` 与正确的 value/defaultValue/onChange 类型；Vue DatePicker 增加 `className` + attrs 透传并导出 `VueDatePickerProps`；React 导出 `ReactDatePickerProps` 供 TS 使用。

#### TimePicker（P0/P1，建议优化）

- 思路：键盘/aria；范围（若支持）；解析/格式化逻辑下沉 core。

- 状态：✅ Step1 API/类型对齐（2026-01-11）：Vue TimePicker 增加 `className/style` 并补齐 `attrs` 透传与 `class/style` 合并，导出 `VueTimePickerProps`/`VueTimePickerModelValue`；React TimePickerProps 支持 `div` 原生属性透传（`aria-*`/`data-*`/`style` 等）且避免与 `onChange/value/defaultValue` 冲突；同步更新 TimePicker 文档与回归测试。

#### Upload（P0/P1，建议优化）

- 思路：文件校验/大小/类型逻辑下沉 core；拖拽 a11y；进度/失败重试。

---

## 6. 建议的优先级队列（第一轮）

> 以“风险最高 + 收益最大”为先。

- P0：Select、Form/FormItem、Modal、Drawer、Table、Menu、Tabs、DatePicker、Tree
- P1：Pagination、Dropdown、Tooltip、Popover、Popconfirm、Upload、TimePicker、Slider
- P2：Input/Textarea、Checkbox/Radio 系列、Alert/Message/Notification、Layout/Grid
- P3：Divider/Space/Text/Badge/Tag/Card/Container/Skeleton（仅例行检查）

---

## 7. 追踪方式（推荐）

- 每个组件建一个小节 TODO（可在后续把本文件拆成多个 issue/任务卡）。
- 每个 PR 标题建议：`refactor(<component>): <theme|a11y|api|core|tests>`。
