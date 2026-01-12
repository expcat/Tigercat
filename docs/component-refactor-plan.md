# Tigercat 组件优化/重构计划（可逐步拆解）

> 目标：用最小的破坏面，把所有组件在 **一致性、可访问性(a11y)、类型正确性、跨框架复用、可测试性、可维护性** 上拉齐到同一水位。
>
> 范围：`packages/vue/src/components/*`、`packages/react/src/components/*`、必要时 `packages/core/src/{utils,types,theme}/*`、配套 `tests/*` 与 `docs/components/*`。

---

## 当前任务 / 状态板（每次只更新这里 + 对应组件小节状态）

- 上一步：✅ `Popover` Step1 主题/透传/a11y/类型导出/测试精简/文档同步（2026-01-13）
- 旁路修复：✅ 修复 `pnpm build`（React d.ts 类型陷阱：Popconfirm/Tooltip）（2026-01-13）
- 当前组件：`Message`
- 当前步骤：Step1 主题/透传/a11y/类型导出/测试精简/文档同步
- 状态：`not-started`
- 已优化组件数/需优化组件数：24/38
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

5. **React 类型“同名属性冲突”优先排雷**：当组件 props 使用了与 `React.HTMLAttributes` 同名的字段（常见：`title`/`content` 等），必须在 `Omit<React.HTMLAttributes<...>, ...>` 中显式剔除同名字段；否则会在 d.ts 中形成类似 `string & ReactNode` 的交叉类型，导致 Demo/用户侧在传入 JSX 时出现 `TS2322`。

6. **React cloneElement 必须先收窄 props**：对 `children` 做 `cloneElement` 时，`React.isValidElement()` 默认把 props 视为 `unknown`；需要用 `React.isValidElement<YourChildProps>(children)` 先收窄，再传入 `className/onClick/...`，同时避免无脑展开 `children.props`（可能把 `unknown` 扩散进 d.ts）。

> 可用 `pnpm check:react-dts-guards` 做一次快速静态扫描，提前拦住上述两类 d.ts 隐患。

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
- 状态：未开始

#### Icon（P2，建议优化）

- 思路：统一 aria-hidden/aria-label 约定；可选 size/color props 与 CSS vars。
- 可拆分：a11y 约定 → 类型收敛 → docs 示例。
- 状态：✅ Step1 去冗余/透传/a11y 默认对齐（2026-01-12）：Vue/React Icon 统一使用外层 `span` 承载透传属性与样式，默认装饰性图标 `aria-hidden=true`，有 `aria-label/aria-labelledby` 时默认 `role=img`；`color` 通过容器 `style.color` 生效，SVG 默认 `stroke=currentColor`（可被显式属性覆盖）；移除 React 不必要的 memo 与 Vue 仅处理首个 SVG 的限制；精简 Vue/React Icon 测试并移除快照；Vue 新增并导出 `VueIconProps`；同步更新 Icon 文档（Demo 无需修改）。

#### Link（P2，建议优化）

- 思路：disabled 行为（阻止导航/aria-disabled）；外链 rel="noreferrer" 安全默认值。
- 可拆分：API/默认值 → a11y → tests。
- 状态：✅ Step1 去冗余/透传/disabled a11y 对齐（2026-01-12）：下沉 core 的 `link-utils`（classes + `getSecureRel`），Vue/React Link 合并 class/style 并透传原生属性；disabled 强化为移除 href + `tabindex=-1` + 阻止 Enter/Space；精简测试并移除快照；同步更新文档与 Demo 文案。

#### Text（P3，无需优化）

- 例行检查：语义标签选择、颜色主题变量、docs 一致性。
- 状态：✅ Step1 例行检查/主题变量化/透传与测试精简（2026-01-12）：Text 颜色类从固定色收敛为 CSS vars（含 fallback：`--tiger-text/--tiger-primary/--tiger-secondary/--tiger-success/--tiger-warning/--tiger-error/--tiger-text-muted`）；React Text 去掉不必要的 memo 并补齐原生属性透传类型（避开 `color` 冲突）；Vue Text 合并 `attrs.class` 并透传原生属性，导出 `VueTextProps`；移除快照与冗余枚举测试，补跑 `tests/react/Text.spec.tsx` 与 `tests/vue/Text.spec.ts` 全绿；同步更新 Text 文档颜色说明。

#### Badge（P3，无需优化）

- 例行检查：颜色使用 CSS vars、尺寸/variant 一致。
- 状态：✅ Step1 主题/透传/测试精简（2026-01-12）：Badge 变体颜色从硬编码 Tailwind 色收敛为 CSS vars（含 fallback：`--tiger-text-muted/--tiger-primary/--tiger-success/--tiger-warning/--tiger-error/--tiger-info`）；React Badge 去掉不必要的 memo 并补齐 `span` 原生属性透传类型；Vue Badge 增加 `inheritAttrs: false` 并将 attrs 透传到 badge 元素，新增并导出 `VueBadgeProps`（含 `className/style`）；精简 Vue/React Badge 测试并移除快照；同步更新 Badge 文档主题变量与 props/a11y 说明。

#### Tag（P3，无需优化）

- 例行检查：可关闭 tag（若支持）应有按钮语义与 aria-label。
- 状态：✅ Step1 主题/透传/测试精简（2026-01-12）：Tag 变体颜色从固定 Tailwind 色收敛为 CSS vars（含 fallback，并新增 `--tiger-tag-*-*` 细粒度变量）；React Tag 去掉不必要的 memo/callback 并补齐 `span` 原生属性透传类型；Vue Tag 增加 `inheritAttrs: false`，将 attrs 透传到根元素并合并 `class/style`，新增并导出 `VueTagProps`（含 `className/style`）；精简 Vue/React Tag 测试并移除快照；同步更新 Tag 文档主题变量说明。

#### Avatar（P2，建议优化）

- 思路：img 的 alt/fallback；加载失败占位；可选 shape/size 统一。
- 可拆分：a11y/alt → fallback 逻辑抽到 core utils → tests。
- 状态：✅ Step1 主题/透传/a11y 默认对齐（2026-01-12）：core Avatar 默认背景/文字颜色收敛为 CSS vars（含 fallback：`--tiger-avatar-bg/--tiger-avatar-text`），并将 `generateAvatarColor()` 色盘改为可主题覆盖的 `--tiger-avatar-color-*`；Vue Avatar 增加 `inheritAttrs: false`，合并 `attrs.class/style` 并新增导出 `VueAvatarProps`（含 `style`）；React Avatar 去掉不必要的 memo，补齐 `HTMLAttributes` 透传类型；a11y 默认调整为“无可访问名称时视为装饰性内容（aria-hidden=true）”，有 `text/alt/aria-label/aria-labelledby` 时提供 `role=img`；精简 Vue/React Avatar 测试并移除过度覆盖；同步更新 Avatar 文档（Demo 无需修改）。

#### Card（P3，无需优化）

- 例行检查：header/footer slot/children 行为与 docs 对齐。
- 状态：✅ Step1 主题/透传/测试精简（2026-01-12）：core Card 默认背景/边框/分隔线从固定 Tailwind 色收敛为 CSS vars（含 fallback：`--tiger-surface/--tiger-border`）；React Card 去掉不必要的 memo，并补齐 `div` 原生属性透传类型；Vue Card 增加 `inheritAttrs: false`，合并 `attrs.class/style` 并新增导出 `VueCardProps`（含 `className/style`）；移除快照并精简 Vue/React Card 测试；同步更新 Card 文档的主题变量与 API 说明。

#### Container（P3，无需优化）

- 例行检查：响应式 class 与 docs 对齐。
- 状态：✅ Step1 去冗余/透传/测试精简（2026-01-12）：Vue Container 增加 `inheritAttrs: false` 并交给 Vue 原生 class 合并（移除 `attrs.class` 手动解析）；React Container 去掉不必要的 `useMemo` 并补齐 `HTMLAttributes` 原生属性透传类型；移除 Vue/React Container 快照与冗余用例，保留关键路径与 a11y 基线。

#### Divider（P3，无需优化）

- 例行检查：role="separator"/aria-orientation（如果是语义分隔）。
- 状态：✅ Step1 主题/a11y/测试精简对齐（2026-01-12）：core Divider 默认边框色收敛到 `--tiger-border`（含 fallback）；React 调整 props 透传顺序避免覆盖 `role/aria-*`；移除快照并精简 Vue/React Divider 测试。

#### Space（P3，无需优化）

- 例行检查：间距/方向 props 与 docs 对齐。
- 状态：✅ Step1 去冗余/透传/测试精简（2026-01-12）：React Space 去掉不必要的 memo 并补齐 `div` 原生属性透传类型；Vue Space 简化计算并导出 `VueSpaceProps`；移除快照、精简 Vue/React Space 测试并同步文档。

### B. 布局（Layout）

#### Layout / Header / Sidebar / Content / Footer（P2，建议优化）

- 思路：统一布局类组件的 class 生成与响应式；Sidebar collapsed 状态与 Menu 联动（如有）。
- 可拆分：API 统一 → 样式抽取到 core → tests（最小渲染）。
- 状态：✅ Step1 主题/透传/类型/测试精简（2026-01-12）：下沉 core 的 `layout-utils`（默认样式改为 CSS vars：`--tiger-surface/--tiger-border/--tiger-layout-content-bg`）；React 移除多余 `useMemo` 并补齐 `HTMLAttributes` 透传类型（含 style 合并）；Vue 增加 `inheritAttrs: false`，合并 `attrs.class/style` 并导出 `VueLayoutProps/VueHeaderProps/VueSidebarProps/VueContentProps/VueFooterProps`；移除 LayoutSections 快照并精简 Vue/React 测试；同步更新 Layout 文档（新增主题变量说明）。

#### Grid：Row / Col（P2，建议优化）

- 思路：gutter/align/justify 的类型与实现一致；将网格计算逻辑集中到 core（如果未集中）。
- 可拆分：core grid util 对齐 → 组件 props 对齐 → tests。
- 状态：✅ Step1 透传/响应性/类型导出/测试精简（2026-01-12）：React Row/Col 移除不必要的 memo 并补齐 `HTMLAttributes` 透传；Vue Row/Col 修复 gutter 响应性（props 变化可更新行/列间距）并导出 `VueRowProps/VueColProps`；移除 Vue/React Grid 快照与过度用例，保留默认行为、gutter 传递、span/offset 与基础 a11y；同步更新 Grid 文档的 TS 类型示例与“原生属性透传”说明。

### C. 表单与输入（Form）

#### Input（P1，建议优化）

- 思路：受控/非受控一致；clearable/前后缀 slot/children；aria-invalid/aria-describedby。
- 可拆分：API → a11y → core input-styles 对齐 → tests。
- 状态：✅ Step1 主题/透传/类型导出/测试精简（2026-01-12）：core `input-styles` 改为 CSS vars（`--tiger-border/--tiger-surface/--tiger-text/--tiger-text-muted/--tiger-surface-muted` + `--tiger-primary`）；React Input 支持原生 `input` 属性透传并精简内部逻辑（保留受控/非受控与 number 解析）；Vue Input 修复 `attrs.class` 覆盖问题并合并 `class/style`，新增并导出 `VueInputProps`；移除 Input 快照与过度 edge cases，保留关键路径与 a11y 基线；同步修正文档示例与主题变量说明（Demo 无需修改）。

#### Textarea（P1，建议优化）

- 思路：autoSize（如支持）边界；maxlength 计数；aria。
- 状态：✅ Step1 主题/透传/类型导出/测试精简（2026-01-12）：下沉 core 的 `textarea-auto-resize`（统一 autoResize 高度计算），并补齐 core `TextareaProps` 的受控/非受控与常用原生属性（`value/defaultValue/required/minLength/name/id/autoComplete/autoFocus`）；React Textarea 复用 core `getInputClasses` + 去除多余 memo/callback/imperative handle；Vue Textarea 增加 `inheritAttrs: false`，合并 `attrs.class/style` 并导出 `VueTextareaProps`；移除 Textarea 快照并精简 Vue/React 测试；同步更新 Textarea 文档主题变量与 TS 类型示例（Demo 无需修改）。

#### Checkbox / CheckboxGroup（P1，建议优化）

- 思路：组内 name/value、indeterminate、键盘操作；将组选中计算抽 core。
- 状态：✅ Step1 主题/透传/类型导出/测试精简（2026-01-12）：core 补齐 `CheckboxValue/CheckboxGroupValue` 并将 disabled 视觉收敛为 CSS vars；React Checkbox/CheckboxGroup 精简冗余 memo 并补齐原生属性透传类型；Vue Checkbox/CheckboxGroup 增加 `inheritAttrs: false`、class/style 合并透传并导出 `VueCheckboxProps/VueCheckboxGroupProps`；移除快照并精简 Vue/React Checkbox 测试，补齐 group 关键路径；同步修正文档示例。

#### Radio / RadioGroup（P1，建议优化）

- 思路：roving tabindex、aria-checked；组内受控/默认值一致。
- 状态：✅ Step1 主题/透传/类型导出/测试精简（2026-01-12）：core Radio 颜色从固定 Tailwind 灰色收敛为 CSS vars（含 fallback：`--tiger-border/--tiger-surface/--tiger-surface-muted/--tiger-text/--tiger-text-muted/--tiger-primary`）；core `RadioProps` 补齐 `defaultChecked`；Vue Radio/RadioGroup 增加 `inheritAttrs: false` 并合并 `class/style`，改为 Symbol + reactive provide/inject（避免 groupName/groupDisabled 不响应），新增并导出 `VueRadioProps/VueRadioGroupProps`；React Radio/RadioGroup 精简冗余 memo/callback，并补齐原生属性透传（focus/aria 等），支持 `Enter` 选中；移除 Vue/React Radio 快照并精简测试，补齐 RadioGroup 非受控切换关键路径；同步更新 Radio/RadioGroup 文档（Demo 无需修改）。

#### Select（P0，建议优化）

- 思路：键盘导航（上下/回车/esc）、aria-combobox/listbox；多选展示与清除；点击外部关闭；搜索输入焦点管理。
- 可拆分：

  1. API/类型对齐（value 类型、option group 类型）
  2. 键盘/aria/focus
  3. 视觉与主题（状态色全部 CSS vars）
  4. tests（键盘 + 选中 + 清空 + 搜索）

- 状态：未开始

#### Switch（P2，建议优化）

- 思路：role="switch" + aria-checked；禁用/加载（若有）统一。

- 状态：✅ Step1 主题/透传/a11y/类型导出/测试精简（2026-01-12）：core Switch 背景从硬编码灰色收敛到 CSS vars（off 走 `--tiger-border`，thumb 走 `--tiger-surface`，均含 fallback）并改用 `classNames` 简化 class 拼接；Vue Switch 增加 `inheritAttrs: false`、合并 `attrs.class/style` 并补齐 `className/style` props，新增并导出 `VueSwitchProps`；React Switch 移除多余 `useMemo/useCallback`，支持 `button` 原生属性透传并保留内部 a11y 语义；移除快照并精简 Vue/React Switch 测试，补齐 Space 键切换断言；同步更新 Switch 文档主题变量与 TS 类型示例（Demo 无需修改）。

#### Slider（P1，建议优化）

- 思路：键盘操作（左右/上下/Home/End）；aria-valuemin/max/now；范围 slider（如支持）。

- 状态：✅ Step1 API/主题/a11y 基线对齐（2026-01-12）：Slider 默认颜色从 Tailwind 固定色收敛到 CSS vars（含 fallback：`--tiger-border/--tiger-surface/--tiger-text/--tiger-text-muted`）；Vue/React 支持 `aria-label/aria-labelledby/aria-describedby` 传给 thumb 并补齐 `aria-orientation`；Vue 增加 `className/style` props 且导出 `VueSliderProps`；React 支持 `div` 原生属性透传并避免覆盖内部 `value/defaultValue/onChange`；同步更新 Slider 文档与快照；补跑 `tests/react/Slider.spec.tsx` 与 `tests/vue/Slider.spec.ts` 全绿。

#### Form / FormItem（P0，建议优化）

- 观察：React Form 里存在动态 `import('@tigercat/core')` 的校验调用，可考虑收敛到静态依赖并统一错误时序。
- 思路：
  - 校验逻辑：统一放 core（已有 validateForm/validateField 则对齐用法）
  - 错误展示：aria-describedby 指向 error 文本
  - 状态一致：submit 时 errors 使用最新结果（避免闭包旧值）
- 可拆分：API/校验路径收敛 → a11y → tests。
- 状态：未开始

### D. 导航（Navigation）

#### Menu / MenuItem / SubMenu / MenuItemGroup（P0，建议优化）

- 思路：键盘导航（上下/左右/Enter/Esc）；aria-menu/menuitem；openKeys/selectedKeys 受控/非受控一致；collapsed 模式。
- 可拆分：受控模型与事件语义 → 键盘/a11y → 子组件联动 → tests。
- 状态：未开始

#### Tabs / TabPane（P0，建议优化）

- 思路：roving tabindex、aria-controls/aria-labelledby；键盘左右切换；受控/默认值。
- 状态：未开始

#### Breadcrumb / BreadcrumbItem（P2，建议优化）

- 思路：nav 语义与 aria-current；separator 可定制。

- 状态：✅ Step1 API/类型/a11y 基线对齐（2026-01-12）：Vue 修复 `attrs.class/style` 覆盖（改为合并）并导出 `VueBreadcrumbProps`/`VueBreadcrumbItemProps`；React `Breadcrumb/BreadcrumbItem` 支持原生属性透传，且 `style` 改为 `React.CSSProperties`；补充 Vue 单测覆盖 class 合并与 style。

#### Steps / StepsItem（P2，建议优化）

- 思路：当前/完成/禁用状态语义；可点击 step 的 a11y。
- 状态：✅ Step1 主题/透传/a11y/类型导出/测试精简/文档同步（2026-01-12）：core Steps 样式灰色/错误态收敛到 CSS vars（含 fallback）；Vue/React Steps 改为语义化 `ol/li` 并在 `clickable` 时使用 `button`（支持键盘 Enter/Space），当前项标记 `aria-current="step"`；Vue 合并 `attrs.class/style` 并导出 `VueStepsProps/VueStepsItemProps`；精简 Vue/React Steps 测试并移除快照；同步更新 Steps 文档（Demo 无需修改）。

#### Pagination（P1，建议优化）

- 思路：aria-label（上一页/下一页）；pageSize changer；受控/非受控。
- 状态：✅ Step1 主题/透传/a11y/类型导出/测试精简/文档同步（2026-01-12）：core Pagination 中性样式（border/surface/text/text-muted）收敛为 CSS vars（含 fallback）；Vue Pagination 增加 `inheritAttrs: false` 并合并 `attrs.class/style` 与 `className/style`，新增并导出 `VuePaginationProps`；React Pagination 复用 core `PaginationProps` 类型并避免与原生 `onChange/style` 冲突，同时支持覆盖 `aria-label`；精简 Vue/React Pagination 测试并移除过度用例；同步更新 Pagination 文档主题变量说明（Demo 无需修改）。

#### Dropdown / DropdownMenu / DropdownItem（P1，建议优化）

- 思路：overlay 行为（click-outside/esc）、focus 管理、aria-menu；定位（如需 portal）。
- 可拆分：overlay 行为基建 → a11y → tests。
- 状态：✅ Step1 主题/透传/a11y/类型导出/测试精简/文档同步（2026-01-12）：core 下拉菜单样式从固定色收敛为 CSS vars（含 fallback：`--tiger-surface/--tiger-border/--tiger-text/--tiger-surface-muted/--tiger-primary`）；Vue/React Dropdown 支持 attrs/原生属性透传并合并 class/style，补齐 ESC 关闭与 click-outside 行为，且 disabled 仅阻止打开但允许关闭；DropdownItem 改为 button 以获得键盘与焦点能力；Vue 补齐并导出 `VueDropdownProps/VueDropdownMenuProps/VueDropdownItemProps`；移除 Vue/React Dropdown 快照与冗余测试，仅保留关键路径；同步更新 Dropdown 文档主题变量与 a11y 说明（Demo 无需修改）。

### E. 数据展示（Data Display）

#### Table（P0，建议优化）

- 思路：
  - 受控/非受控：sort/filter/pagination/selection 的状态源一致
  - a11y：表头排序 aria-sort；空态/加载语义
  - 性能：大数据时可选虚拟滚动/减少重渲染（后置）
- 可拆分：状态模型/API → a11y → 性能与扩展（可选）→ tests。

- 状态：未开始

#### List（P2，建议优化）

- 思路：空态/加载 slot；列表项语义；分页（若支持）一致。
- 状态：✅ Step1 主题/透传/a11y/类型导出/测试精简（2026-01-12）：core List 默认色值收敛为 CSS vars（含 fallback：`--tiger-surface/--tiger-surface-muted/--tiger-border/--tiger-text/--tiger-text-muted/--tiger-primary`），并修正 core `ListItem.avatar` 类型以支持跨框架节点；React List 支持 `div` 原生属性透传、补齐 `role=list/listitem` + `aria-busy`，仅在可点击时启用 Enter/Space 键盘触发；Vue List 增加 `inheritAttrs: false`、合并 `attrs.class/style` 并导出 `VueListProps`，同样对齐 a11y 与键盘路径；Vue/React List 测试移除冗余用例，保留关键路径与 a11y 基线；同步更新 List 文档主题变量与无障碍说明（Demo 无需修改）。

#### Descriptions（P2，建议优化）

- 思路：dl/dt/dd 语义；响应式列数；对齐 core utils。
- 状态：✅ Step1 主题/透传/a11y/类型导出/测试精简（2026-01-12）：core Descriptions 默认色值从固定 Tailwind 色收敛为 CSS vars（含 fallback：`--tiger-surface/--tiger-surface-muted/--tiger-border/--tiger-text/--tiger-text-muted`）；React Descriptions 补齐 `div` 原生属性透传并简化渲染逻辑；Vue Descriptions 增加 `inheritAttrs: false`、合并 `attrs.class/style`，补齐并导出 `VueDescriptionsProps`（含 `className/style/extra`）；垂直无边框布局改为 `dl/dt/dd` 语义；移除快照并精简 Vue/React Descriptions 测试；同步更新 Descriptions 文档主题变量与 a11y 说明（Demo 无需修改）。

#### Timeline（P2，建议优化）

- 思路：语义结构；可访问性（标记点/内容关联）。
- 状态：✅ Step1 主题/透传/a11y/类型导出/测试精简/文档同步（2026-01-12）：core `timeline-utils` 默认灰色样式收敛为 CSS vars（含 fallback：`--tiger-border/--tiger-timeline-dot/--tiger-surface/--tiger-text-muted/--tiger-text/--tiger-primary`）；Vue Timeline 增加 `inheritAttrs: false` 并合并 `className/style` 与 `attrs.class/style`，新增并导出 `VueTimelineProps`，同时在 pending 时设置 `aria-busy`；React Timeline 支持 `ul` 原生属性透传并移除多余 `useMemo`，同样在 pending 时设置 `aria-busy`；精简 Vue/React Timeline 测试并移除过度 edge cases；同步更新 Timeline 文档的主题变量与 a11y 说明（Demo 无需修改）。

#### Tree（P0/P1，建议优化）

- 思路：aria-tree/treeitem；键盘展开/选择；受控状态（expandedKeys/selectedKeys）。

- 状态：✅ 调整 selectionMode 内部状态管理（2026-01-12）：改进 Tree 在不同 selection 模式下的内部状态更新一致性。

#### Progress（P2，建议优化）

- 思路：role="progressbar" + aria-valuenow/min/max；颜色主题变量。
- 状态：✅ Step1 主题/透传/a11y/测试精简（2026-01-12）：core Progress 变体颜色与 track/text 从固定 Tailwind 色/hex 收敛为 CSS vars（含 fallback：`--tiger-primary/--tiger-success/--tiger-warning/--tiger-error/--tiger-info/--tiger-border/--tiger-text/--tiger-text-muted`）；React Progress 移除多余 `useMemo`，修复 `style`/`width` 合并并将 `aria-label/aria-labelledby/aria-describedby` 作用到实际 `progressbar` 元素；Vue Progress 增加 `inheritAttrs: false`，补齐 `className/style` 并导出 `VueProgressProps`，修复 `height` 动态 class 为 inline style，同时转发 `aria-*`；移除快照并精简 Vue/React Progress 测试；同步更新 Progress 文档主题变量与 API。

#### Skeleton（P3，无需优化）

- 例行检查：aria-busy/aria-live（如有）；避免影响布局。
- 状态：✅ Step1 例行检查/主题/透传/a11y/测试精简（2026-01-12）：core Skeleton 背景色从固定 Tailwind 色收敛为 CSS vars（含 fallback：`--tiger-skeleton-bg/--tiger-skeleton-bg-alt`）；React Skeleton 去掉不必要的 `useMemo`，补齐 `HTMLAttributes` 透传类型并默认 `aria-hidden=true`（提供可通过 `aria-label/aria-labelledby/aria-hidden` 覆盖）；Vue Skeleton 增加 `inheritAttrs: false`，合并 `attrs.class/style` 并新增导出 `VueSkeletonProps`，同时默认 `aria-hidden=true`；移除 Vue/React Skeleton 快照并精简测试；同步更新 Skeleton 文档主题变量与 a11y 说明。

### F. 反馈（Feedback）

#### Alert（P2，建议优化）

- 思路：role="alert"/"status"；可关闭按钮 aria-label；主题色。
- 状态：✅ Step1 主题/透传/a11y/测试精简（2026-01-12）：core Alert 颜色从固定 Tailwind 色收敛为 CSS vars（含 fallback，新增 `--tiger-alert-<type>-*` 变量组）；Vue Alert 增加 `inheritAttrs: false` 并合并 `attrs.class/style`，补齐 `className/style/closeAriaLabel` props 且导出 `VueAlertProps`；React Alert 去掉多余 `useMemo` 并补齐 `HTMLAttributes` 透传类型，关闭行为支持 `event.preventDefault()` 阻止自动隐藏；移除快照并精简 Vue/React Alert 测试；同步更新 Alert 文档主题变量与 API。

#### Message（P1，建议优化）

- 思路：全局容器的 portal/stack；aria-live；自动关闭与可暂停（hover）。
- 状态：未开始

#### Notification（P1，建议优化）

- 思路：与 Message 类似，增加位置/堆叠策略一致；a11y。
- 状态：未开始

#### Loading（P2，建议优化）

- 思路：aria-busy；覆盖层的可聚焦性与 scroll lock（如是全屏）。
- 状态：未开始

### G. 弹层（Overlay）

#### Modal（P0，建议优化）

- 思路：focus trap、ESC 关闭、点击遮罩关闭可配；aria-modal/role="dialog"；scroll lock。
- 状态：未开始

#### Drawer（P0，建议优化）

- 思路：同 Modal，补从侧边进入的焦点与 aria。
- 状态：未开始

#### Popover（P1，建议优化）

- 思路：触发方式（hover/click/focus）；定位；aria-describedby。
- 状态：✅ Step1 主题/透传/a11y/类型导出/测试精简/文档同步（2026-01-13）：core Popover 默认色值改为 CSS vars（`--tiger-surface/--tiger-border/--tiger-text/--tiger-text-muted`，含 fallback）；Vue Popover 增加 `inheritAttrs: false` 并合并 `attrs.class/style`，新增导出 `VuePopoverProps`，并修复 `focus` 触发（focusin/focusout）；React Popover 支持 `div` 原生属性透传与 `style`，弹层内容补齐 `role=dialog` + `aria-labelledby/aria-describedby` 关联，非 `manual` 支持 ESC 关闭，click trigger 支持 click-outside；移除 Vue/React Popover 快照与过度用例，仅保留关键路径与 a11y 基线；同步更新 Popover 文档主题变量与无障碍说明（Demo 无需修改）。

#### Tooltip（P1，建议优化）

- 思路：aria-describedby + 延时；hover/focus 一致。

- 状态：✅ Step1 主题/透传/a11y/类型导出/测试精简/文档同步（2026-01-12）

#### Popconfirm（P1，建议优化）

- 思路：确认/取消按钮语义；键盘可用；与 Popover/Tooltip 复用 overlay 基建。

- 状态：✅ Step1 主题/透传/a11y/类型导出/测试精简/文档同步（2026-01-12）

### H. 日期/时间/上传（Complex Inputs）

#### DatePicker（P0，建议优化）

- 观察：实现中已有中英文 labels 分支，建议抽成可配置文案/locale；并补 a11y 日历语义。
- 思路：
  - a11y：日历 grid、可用日期禁用语义、键盘选择
  - 受控/非受控：range/single 模式的类型与行为一致
  - i18n：labels/月份/星期统一入口
- 可拆分：API/类型 → i18n 文案注入 → a11y/键盘 → tests。

- 状态：未开始

#### TimePicker（P0/P1，建议优化）

- 思路：键盘/aria；范围（若支持）；解析/格式化逻辑下沉 core。

- 状态：未开始

#### Upload（P0/P1，建议优化）

- 思路：文件校验/大小/类型逻辑下沉 core；拖拽 a11y；进度/失败重试。
- 状态：未开始

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
