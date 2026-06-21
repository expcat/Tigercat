# Changelog

本文档记录 Tigercat UI 组件库的所有版本变更。

## Unreleased

### Added

- **Table** 新增列显隐控制：`hiddenColumnKeys`（受控）/ `defaultHiddenColumnKeys`（非受控），React 端提供 `onHiddenColumnKeysChange` 回调，Vue 端支持 `v-model:hidden-column-keys` 与 `hidden-column-keys-change` 事件；`TableColumn` 新增 `hideable`（默认 `true`，`false` 时列设置面板中不可隐藏）。固定列偏移、卡片字段、导出与列拖拽均只作用于可见列；隐藏列上已生效的筛选仍会继续过滤数据。
- **DataTableWithToolbar** 工具栏新增列设置入口：`toolbar.showColumnSettings` 开启内置 Popover + Checkbox 面板，`toolbar.columnSettings.lockedColumnKeys` 可锁定不可隐藏的列，面板标题支持 `toolbar.columnSettings.title` 与 locale（`table.columnSettingsText` / `columnSettingsAriaLabel`，13 种语言预设已补齐）。
- core 新增 `filterHiddenColumns` 工具函数与 `FLOATING_OVERLAY_Z_INDEX`（1000）常量。
- 新增 **MarkdownEditor** 高级组件：支持 Markdown 编辑、编辑/分屏/预览模式、内置工具栏、快捷键、预览渲染与自定义 renderer 扩展点，并提供 Vue/React 双端实现、示例与测试。
- **Form** 内置校验消息支持本地化：新增 core `TigerLocaleFormValidation` 类型、`getFormValidationLabels` 与 `DEFAULT_FORM_VALIDATION_LABELS` / `ZH_CN_FORM_VALIDATION_LABELS`，`TigerLocale` 新增 `formValidation` 段（en-US / zh-CN 预设已补齐）。Vue/React `Form` 新增可选 `locale` prop 并接入 ConfigProvider locale，`<ConfigProvider :locale="zhCN">` 下必填/类型/范围等内置报错自动显示中文；单条规则 `message` 仍为最高优先级，默认英文行为不变。`validateRule` / `validateField` / `validateForm` / `validateFormFields` 新增可选 `messages` 末参（向后兼容）。
- **i18n** 组件内置搜索/加载/关闭/清除文案接入 ConfigProvider locale：`TigerLocaleCommon` 新增 `searchPlaceholder` / `clearText`（en-US / zh-CN 预设已补齐）。Vue `Select` / `Tree` / `TreeSelect` / `Transfer` / `Cascader` / `FileManager` / `VirtualTable` / `QRCode` / `Timeline` / `Loading` / `ImageViewer` / `AutoComplete` 与 React `Select` / `Tree` / `TreeSelect` / `Transfer` / `Cascader` / `FileManager` 不再把 `'Search...'` / `'Loading...'` / `'Close'` / `'Clear'` 硬编码在渲染中，改读 `mergeTigerLocale(ConfigProvider locale, props.locale)` 并新增可选 `locale` prop 作最高优先级覆盖。`<ConfigProvider :locale="zhCN">` 下这些文案自动本地化；未包裹 ConfigProvider 时默认英文渲染不变。
- **i18n** 空态 / 加载 / 清除等带英文默认值的文案 prop 不再绕过全局 locale：双端 `List` / `Tree` / `TreeSelect` / `Transfer` / `VirtualTable`（`emptyText` / `notFoundText`）、`InfiniteScroll`（`loadingText`）、`Signature`（`clearText`）、`Spotlight`（`placeholder` / `emptyText`）、`Cascader`（`notFoundText`）、`Tour`（`nextText` / `prevText` / `finishText` → `formWizard`）、`NumberKeyboard`（`confirmText` → `common.okText`）与 React `Loading`（aria 回退 → `common.loadingText`）的默认值改为「未传时回退 `mergeTigerLocale(ConfigProvider locale, props.locale)` 的 `common.*` / `formWizard.*`」，显式 prop 仍为最高优先级。`List` / `InfiniteScroll` / `Signature` / `Spotlight` / `Tour` / `NumberKeyboard`（含 React `VirtualTable`）新增可选 `locale` prop（`SignatureProps` / `SpotlightProps` / `TourProps` / `NumberKeyboardProps` 类型新增 `locale` 字段）。`<ConfigProvider :locale="zhCN">` 下空态/加载/清除等默认文案自动本地化；未配置时默认英文渲染不变，无需逐实例传文案。
- core `date-utils` 新增不可变日期算术 `addDays` / `addMonths` / `addYears`（`addMonths` / `addYears` 按目标月长度裁剪日期，如 1 月 31 日 +1 月 → 2 月 28/29 日），供双端 DatePicker 与后续跨端键盘导航复用。
- React **Signature** 新增 `onClear` 回调：清除（工具栏按钮或 ref `clear()`）时触发，与 Vue 端 `clear` 事件对齐。
- core 新增命令式实例 id 计数器工厂 `createInstanceCounter`（`imperative-api`，每个实例从 1 起单调自增、互相隔离）与 InputNumber 显示/解析工具 `formatInputNumberDisplay` / `parseInputNumberValue`（`input-number-utils`，`formatter` / `precision` / `parser` 以参数注入），供双端命令式 API 与 InputNumber 复用。

### Changed

- TimePicker 与 Upload 的默认文案表收敛到 `locale-utils` 单一来源（新增 `DEFAULT_TIME_PICKER_LABELS` / `ZH_CN_TIME_PICKER_LABELS` / `DEFAULT_UPLOAD_LABELS`），消除标签分散；公共 `getTimePickerLabels` / `getUploadLabels` 签名不变。
- `shouldLoadMore` 撤销 `@deprecated` 标记：它是 InfiniteScroll 在 IntersectionObserver 不可用时的有意滚动回退路径，并非待移除的废弃 API。
- **Dropdown 行为变更**：菜单默认渲染到 `document.body`（React portal / Vue Teleport，zIndex 1000），解决表格固定列（sticky）遮挡与 overflow 容器裁剪问题；新增 `portal` prop（默认 `true`），设置 `portal: false` 可恢复原位渲染的旧 DOM 结构。菜单包装层新增 `data-tiger-dropdown-menu` 属性便于查询，依赖原 DOM 层级的样式选择器或测试需要相应调整（详见 [迁移指南](docs/MIGRATION.md)）。
- core 内部 `src/theme/` 目录重命名为 `src/theme-runtime/`，与命名预设主题目录 `src/themes/`（预设 + `ThemeManager` + modern token）区分；`THEME_CSS_VARS` / `setThemeColors` / `getThemeColor` 及各 `*Classes` 仍经主入口 `@expcat/tigercat-core` 导出，公共 API 与导出符号不变。
- 双端 **DatePicker** 的内联日期算术下沉到 core：移除各自实现的 `addDays`、手写月/年步进 wraparound，改用 `date-utils` 的 `addDays` / `addMonths`，键盘导航与翻月行为不变。
- 跨端键盘导航纯逻辑下沉 core（行为不变）：core 新增 `getTreeKeyboardAction` / `getFirstVisibleChildKey`（`tree-utils`）、`getCyclicIndex`（`picker-utils`）、`focusTimePickerOption` / `TimePickerFocusUnit` / `TimePickerFocusAction`（`timepicker-utils`）、`getMenuNavigationKeys`（`menu-utils`）。双端 **Tree** 的键盘动作决策（方向键/Home/End 走查与展开/收起/聚焦父子/选择/勾选语义）、**Mentions** 的环绕（cyclic）列表导航、**TimePicker** 的列内 roving 焦点（query + clamp + focus）、**Menu** 的方向键映射（horizontal root ↔ ArrowLeft/Right）改为调用同一份 core 实现，消除 Vue/React 各自内联的重复键盘逻辑；a11y 键盘行为保持不变，公共组件 API 与 props 不变。
- 统一 Vue 组件的 SSR 守卫写法：`ConfigProvider` / `Signature` / `ImageAnnotation` 中的内联 `typeof window/document === 'undefined'` 改用 core `isBrowser()`（`ImageAnnotation` 保留 `window.Image` 特性检测）；生命周期/事件作用域内的访问保持原样，无行为变更。
- 收窄双端组件中冗余 / 脆弱的非空断言（`!`）：去除 `Image` / `QRCode` / `Mentions` / `Alert` 等带默认值 prop 的断言，`Tree` / `CommentThread` / `Menu` 在守卫分支内改用局部 const 收窄 `node.children`，类型更安全，无行为变更。
- 下沉双端命令式 API 与 InputNumber 的重复纯逻辑到 core（行为不变）：**Message** / **Notification** 的实例自增 id 计数器（原各自内联 `let instanceIdCounter` + `getNextInstanceId`，双端共 4 份）改用 `createInstanceCounter()`；**InputNumber** 的显示格式化与字符串解析改调 `formatInputNumberDisplay` / `parseInputNumberValue`，消除跨端重复实现。core 保留 `createInstanceIdGenerator` / `parseInputNumberInput` 兼容别名；`normalizeOptions` 早已是 core `normalizeStringOption` 的薄包装，无需改动。
- 统一 React **ImagePreview** 的门户 SSR 守卫：门户挂载改用 `utils/overlay` 的 `renderBodyPortal`（内含 `isBrowser()` 守卫）替代直接 `createPortal(…, document.body)`，与 Tour / FloatButton / ChartTooltip 等门户组件写法一致；浏览器端渲染行为不变。配套将测试基建 `tests/setup.ts` 的 `matchMedia` mock 加 `typeof window` 守卫，使 node 环境（SSR）spec 可共用同一 setup。

- 收敛 React 受控/非受控样板：升级版 `useControlledState`（合并 `onChange`、稳定 setter、支持 updater 形式）接入 `Checkbox` / `Input` / `InputNumber` / `Radio` / `RadioGroup` / `CheckboxGroup` / `Textarea` / `MarkdownEditor` / `RichTextEditor` / `Upload` / `Spotlight`，移除各组件手写的 `const isControlled = value !== undefined` + `if (!isControlled) setInternal(...)` + `onChange?.()` 样板（`RichTextEditor` 借此移除自管的 `onChangeRef` / `setInternalValueRef` / `isControlledRef`）；公共组件 API 与行为不变。新增 hook 单测覆盖受控 / 非受控 / updater / extra-args / 稳定 setter identity。`ScrollSpy`（`isControlled` 兼作 effect 模式开关）与 `NumberKeyboard`（受控值读取时归一化）因不属纯样板暂不迁移。
- 按 `Table/` 子模块范式拆分 React **Select** / **DatePicker** / **TimePicker** 单文件巨石（C-5 部分，行为不变）：各组件保留 `<Comp>.tsx` 作为瘦 wrapper（公共导出与 props 类型不变），状态逻辑收敛到 `<Comp>/state.ts`（`useSelectState` / `useDatePickerState` / `useTimePickerState`），渲染拆为 `render-*`（Select `render-option`；DatePicker `render-calendar` / `render-mobile`；TimePicker `render-desktop` / `render-mobile`），图标抽到 `icons`，类型集中到 `types.ts`；框架无关纯逻辑（日期/时间计算、选项过滤、键盘导航）继续调 core，无新增 core 抽取。**DatePicker** / **TimePicker** 的内部受控/非受控值接入 `useControlledState`——在 hook 边界把受控值/默认值解析到与 `onChange` 一致的值空间（属上条 `useControlledState` 升级中标注的「值空间对齐」情形），消除手写 `const isControlled = value !== undefined` 分支；**Select** 本即全受控（无 `defaultValue` / 内部值状态），仅做结构拆分。公共组件 API、props 与渲染行为不变，公共 API 基线快照（`api-reports`）无变化。
- 按 `Table/` 子模块范式拆分 React **Menu** / **Tree** 单文件巨石（C-5 收尾，行为不变）：**Menu**（909 行）拆为 `Menu/`——根状态收敛到 `state.ts` 的 `useMenuRootState`，共享 `MenuContext` / `useMenuContext` 移至 `context.ts`，`MenuItem` / `SubMenu` / `MenuItemGroup` 三个子组件各成文件，`ExpandIcon` 抽到 `icons`、类型集中到 `types.ts`；wrapper `Menu.tsx` 定义 `Menu` 根组件并原样 re-export 上述三个子组件、`useMenuContext` 与全部 props 类型。**Tree**（845 行）拆为 `Tree/`——状态/受控/键盘逻辑收敛到 `state.ts` 的 `useTreeState`，渲染拆为 `render-row` / `render-node`，图标抽到 `icons`、类型集中到 `types.ts`。键盘导航、过滤、复选框级联、节点 flatten 等框架无关逻辑继续调 core，无新增 core 抽取；公共导出、props 类型与渲染 / a11y 行为不变，公共 API 基线快照（`api-reports`）无变化。至此 C-5 与优化扫描任务 A–G 全部交付完毕。
- **Breaking · React hook**：公共 hook `useControlledState` 升级为回调透传版——返回值由 `[value, setValue, isControlled]` 收敛为 `[value, setValue]`，新增可选第三参 `onChange`；`setValue(next, ...args)` 在非受控时写内部 state 并在两种模式下始终调用 `onChange?.(next, ...args)`，受控模式不再写内部 state，且支持 updater 形式与稳定 identity。仅消费 `value` 与 setter 者无需改动；此前读取第三个返回值 `isControlled` 或手写受控样板者请见 [迁移指南](docs/MIGRATION.md)。
- **Breaking**：移除废弃别名 `kanbanAddCardClasses`（core）。自 v0.9.0 起它仅作为 `taskBoardAddCardClasses` 的向后兼容别名，现已删除；请改用 `taskBoardAddCardClasses`（详见 [迁移指南](docs/MIGRATION.md)）。
- **Breaking · 跨端 API 对称**：统一受控量 / 事件回调的双端命名（详见 [迁移指南](docs/MIGRATION.md)）。
  - **ImageViewer (React)**：`onIndexChange` 重命名为 `onCurrentIndexChange`，与受控 prop `currentIndex` 及 Vue `update:currentIndex` 对齐。
  - **CommentThread (Vue)**：展开事件由 `expand-change` 改为 `update:expandedKeys`（支持 `v-model:expanded-keys`），与受控 prop `expandedKeys` 及 React `onExpandedChange` 对齐。
  - **Spotlight (Vue)**：移除冗余的 `close` 事件，统一改用 `open-change`（`open-change(false)` 即关闭），与 React `onOpenChange` 对齐。
- **CLI** 命令参数校验更严格、反馈更可预测：`tigercat create` 对非法 npm 包名（含大写 / 空格 / 非法字符）直接报错退出并给出建议名（不再原样写入 `package.json.name`）；`create` / `playground` 对非法 `--template` 立即失败并列出可选值（不再静默落入交互 prompt）；`add` 对显式非法 `--framework` 立即失败（不再静默回退自动检测）；`create` 非空目录确认文案改为「Overwrite conflicting template files? (other files are kept)」以诚实反映「仅覆盖同名模板文件、保留其它文件」的行为。新增内部工具 `cli/src/utils/validate.ts`。
- **CLI** `tigercat doctor` 诊断更深：`Version compatibility matrix` 由静态展示升级为对已检测 framework 的 peer 主版本实际校验（Vue `^3`、React 与 react-dom `^19`，过旧即失败）；新增 `Core exports` 检查——当 `@expcat/tigercat-core` 已安装且可解析时，校验其 `exports` 是否暴露 `.` / `./tailwind` / `./tailwind/modern` / `./tokens.css` / `./figma-variables.json`，缺失则失败（未安装/不可解析则跳过，待 build 阶段暴露）。

### Fixed

- 修复 React **Alert** 自动关闭时强制伪造 `MouseEvent` 的不安全类型转换：`onClose` 事件参数改为可选，自动关闭时不再传入伪造事件对象。
- 修复 React **Notification** 入场动画 `setTimeout` 缺少清理函数的问题，组件在动画前卸载不再触发对已卸载组件的状态更新。
- 修复 React **Splitter** 拖拽时分隔条高亮失效的问题：拖拽状态改用 state 追踪（与 Vue 端及 React Resizable 保持一致），按下分隔条即可正确显示拖拽高亮。
- 修复 **VirtualList** 固定高度列表在 `itemHeight` 为 0（或非正值）时可见范围计算产生 `Infinity`/`NaN` 的问题：`getFixedVirtualRange` 现对非正项高与空数据返回安全的空范围，避免一次性渲染全部项导致卡顿。
- 修复 **CLI** `tigercat generate test` / `generate doc-template` 在目标文件已存在时因 `logWarn` 未导入而抛 `ReferenceError` 崩溃的问题：现正确告警并跳过已存在文件；同时将 CLI 源级 `tsc --noEmit` 类型检查纳入验证，避免仅靠 tsup 转译漏掉此类未定义引用。
- 修复 React 示例 `UseControlledStateDemo.tsx` 仍按旧 3-tuple 解构 `useControlledState`（C-4 已将其收敛为 `[value, setValue]`）导致 `pnpm example:build`（属 `quality:release` 闸）类型报错的问题：demo 与展示 snippet 改用新签名 `useControlledState(value, defaultValue, onChange)`，受控态由 `value !== undefined` 派生，恢复 example 构建绿。

### Infrastructure

- 新增 Tailwind v4-only 基线检查，覆盖 workspace catalog、CLI 模板版本、core peer dependency 与示例项目依赖入口。
- 新增分层质量门禁：`pnpm quality:quick`、`pnpm quality:size`、`pnpm quality:examples`、`pnpm quality:release`。
- 新增发布准备检查：`pnpm release:check` 校验包版本、运行时 `version` 导出、公开 package exports、Changesets fixed group 与发布文档入口。
- 新增 SSR 发布门禁：`pnpm quality:ssr` 覆盖 Nuxt 与 Next.js 示例构建，并纳入 `pnpm quality:release`。
- 新增 [迁移指南](docs/MIGRATION.md) 作为 Breaking change 与迁移路径集中入口。
- 重设 size-limit 基线并扩展覆盖：随 MarkdownEditor、Table 列显隐与多组件 i18n 接入等新功能，full bundle 体积自然增长（已核对增量来自新功能源码而非依赖膨胀，运行时依赖仅 `@floating-ui/dom`），按实测 +~10% 余量上调三个主入口与 Button 子路径预算（Core 118 kB、Vue 284 kB、React 320 kB、Vue Button 22 kB、React Button 20 kB）；新增重组件子路径（Menu/DatePicker/Table/Tree/TimePicker 双端）与 core 子路径（`tailwind/modern`、`locales/zh-CN`、`icons/common`）的体积回归护栏，避免单组件膨胀绕过门禁。
- 明确 Roadmap、CHANGELOG、脚本文档和 API 文档的职责边界，避免完成历史长期堆回 Roadmap。
- 清理 Vue 包内 7 个未使用的内部 composable（`usePopup` / `useDateNavigation` / `useDateSelection` / `useTimeSelection` / `useTimePanelKeyboard` / `useSelectOptions` / `useSelectKeyboard`，约 1,529 LOC）及其 barrel `composables/index.ts`：均无组件使用、未从公共入口导出、无测试，属死代码移除；公共 composable `useChartInteraction` / `useFormController` / `useDrag` 不受影响。
- 收敛 `@expcat/tigercat-core` 包导出与字段一致性：移除失效且冗余的 `./types` / `./theme` 子路径导出（二者目标文件从未由 tsup 产出、内容已由主入口 `@expcat/tigercat-core` 导出且无内部/外部消费者），并将 `module` 字段由不存在的 `./dist/index.mjs` 修正为实际 ESM 产物 `./dist/index.js`；`release:check` 的必需 core 导出清单同步移除上述两项。公共 API 与主入口导出符号不变。
- 修复 LLM skill references 漂移护栏：`generate-api-docs.mjs` 的 `formatMarkdown` 此前以 prettier 默认配置（`printWidth` 80）格式化，与仓库 `.prettierrc.json`（`printWidth` 100，经 `pnpm format` 应用）不一致，导致生成物与提交版漂移；现改为经 `prettier.resolveConfig` 加载仓库配置，生成物即 prettier-clean 且幂等。CI 漂移闸由仅 `git diff` 校验 `shared/api-summary.md` 单文件扩展为校验整个 `skills/tigercat/references` 目录，覆盖此前可静默漂移的 component-index / props / examples / 双端 index 等生成物；同步重生成此前漂移的 `examples/composite.md`。
- 修正 `@expcat/tigercat-cli` 发布文件清单：`files` 移除不存在的 `templates` 目录（实际模板为 `src/templates/*.ts`，由 tsup 内联打包进 `dist/index.js`），发布包稳定提供 bin/root 入口（`dist` + `package.json` + `README`）；测试经 Vitest alias 直接 import 源码子路径，属内部测试机制，不构成发布契约。
- `validate-api.mjs` 新增「受控量双端对称（controlled-parity）」护栏：把原 `open → update:open / onOpenChange` overlay 规则推广为一张显式受控量 parity 表（`currentIndex` / `expandedKeys` / `query` / `hiddenColumnKeys` …），校验 Vue `update:<prop>` 与 React `on<Prop>Change` 成对且命名一致（命名按 prop 名派生，可按条目覆盖并以白名单登记有意非对称），读取主文件 + `<Comp>/` 子目录以兼容拆分组件（如 Table）。不做全自动派生以规避 `modelValue↔onChange`、主 `onChange`、`x-change` 普通事件等框架惯用差异的误报。
- vue / react 包 `sideEffects` 由保守 allowlist（`dist/chunk-*` / `dist/components/*`）收敛为 `false`，与 `@expcat/tigercat-core` 一致：两端 `src` 无任何 CSS / 副作用 import，组件为 headless（Tailwind class，无运行时样式注入）。改后 `pnpm size` 全部体积预算仍全绿、`pnpm example:build` 双端构建无回归；barrel import 时未使用的 splitting chunk 现可被打包器剔除（此前 allowlist 强制保留）。
- 接入测试覆盖率门禁：`vitest.config.ts` 新增 `coverage.thresholds`（lines 85 / statements 83 / functions 84 / branches 76，取实测基线 90.3 / 88.5 / 89.8 / 81.9 略低值，留漂移余量同时拦截删测或大段未测代码）；`test:coverage` 改为 `vitest run --coverage` 避免进入 watch；CI 测试步骤改跑 `pnpm test:coverage`，使阈值在门禁内强制。
- 新增依赖 / CVE 扫描：`.github/workflows/security.yml`（周度 + 手动触发，`pnpm audit --audit-level=high`）。发布包运行时仅依赖 `@floating-ui/dom`，现存 high 级告警均来自 example/dev 工具链（Nuxt / Vite / Playwright 等，不随产物分发），故 audit 取报告式（`continue-on-error` + step summary），暴露当前告警集供人工分诊，避免对不影响产物的传递依赖设永久红门禁。配套的 `.github/dependabot.yml` 自动升级当前已停用（保留为 `.github/dependabot.yml.disabled`，控 GitHub Actions / PR 成本），故现阶段无自动补救机制，依赖升级走人工。
- 新增公共 API 基线快照护栏：`scripts/generate-api-baseline.mjs`（`pnpm api:baseline`）产出确定性的 `api-reports/public-api-baseline.json`（156 个 `*Props` 接口的 props / extends、core 导出名、双端公开组件与命名导出），CI 经「生成 + `git diff --exit-code api-reports`」捕捉删除导出 / 删 prop / 改名 / 改 extends 等版本间破坏性变更——与 `validate-api.mjs`（当下双端一致性）层次互补，本护栏防的是与上一提交版相比的回归。
- 新增运行时基准工作流 `.github/workflows/bench.yml`（周度 + 手动触发，`pnpm bench --run --outputJson` 并上传结果 JSON 产物供人工对比）；刻意非 PR 门禁、无硬回归阈值（micro-bench 在共享 runner 上抖动大，硬阈值易误红）。
- 质量门禁触发与发布前置闸：`ci.yml` 维持手动 `workflow_dispatch` 触发（控 GitHub Actions 成本），全量门禁经本地 `pnpm quality:release` 可达；`publish.yml` 与 `publish-on-tag.yml` 在发布前插入 `pnpm release:check`，发布不再绕过版本 / 导出 / 发布文档一致性校验。
- 三道门禁纳入本地发布链：覆盖率阈值（`test:coverage`）、公共 API 基线漂移（`api:baseline:check` = `api:baseline` + `git diff --exit-code api-reports`）、references 漂移（`docs:api:check` = `docs:api` + `git diff --exit-code skills/tigercat/references`）此前仅接在 `ci.yml`，现一并纳入 `pnpm quality:release`，使其经本地发布链可达（与 CI 改回手动 `workflow_dispatch` 的决策解耦）；`release:check` 的 `quality:release` 必含步骤校验同步登记此三项，固化为发布前红门禁防回归。
- CLI 模板版本单一来源化：workspace catalog 补 `@vitejs/plugin-react` / `@vue/tsconfig` / `vue-tsc` 三项，example 项目对应依赖改用 `catalog:`，使 catalog 成为全部模板 toolchain 依赖的单一来源；`tests/core/cli.spec.ts` 的 Tailwind 对齐用例扩展为「全部 13 个可 catalog 化的 `TEMPLATE_VERSIONS` ↔ workspace catalog 对齐表」并新增 example `catalog:` 断言，把模板版本漂移由人工同步变为红色测试（CLI 模板已 `import TEMPLATE_VERSIONS`，`tigercat` 版本仍由 `release:check` 守护）。
- 修复手维护 skill 指南漂移：`references/cli.md` 命令表此前因选项内未转义的 `|`（`--template vue3 | react` 等）产生幻列、分隔行多列、渲染错位，现转义为 `\|` 并还原为 Command / Purpose / Key options 三列；`references/performance.md` 补充运行时基准段（`pnpm bench` / `benchmarks/` 8 个 `.bench.ts` / `bench.yml`），与 F-6 已落地的基准设施及 frontmatter 的 “performance validation” 声明对齐。

## v1.2.0 — Breaking Changes

### Removed

- **ImagePreview**: 移除已废弃的 `visible` prop，请使用 `open`。
- **Image (Vue)**: 移除已废弃的 `preview-visible-change` 事件，请使用 `preview-open-change`。
- **Image (React)**: 移除已废弃的 `onPreviewVisibleChange` prop，请使用 `onPreviewOpenChange`。

## v1.0.0 — 正式发布 🎉

Tigercat 首个正式版本，标志着从实验阶段进入稳定阶段。从 v1.0.0 起遵循 SemVer 语义化版本：
patch — Bug 修复；minor — 新特性/新组件；major — 破坏性变更。

### 亮点

- **133+ 组件** — Vue 3 + React 双端完整实现
- **4619+ 测试** — 237 test files，覆盖单元/集成/a11y
- **WCAG 2.1 AA** — 全组件无障碍达标
- **8 语言国际化** — zh-CN/en-US/zh-TW/ja/ko/th/vi/id
- **5 套预设主题** — Default/Vibrant/Professional/Minimal/Natural + 暗色模式
- **纯 SVG 图表** — 12 种图表类型，零第三方依赖
- **CLI 脚手架** — `@expcat/tigercat-cli` 项目初始化/组件生成
- **E2E 浏览器测试** — Playwright 覆盖 Chrome/Firefox/Safari
- **Bundle Size 监控** — size-limit CI 集成，核心 < 100KB gzip
- **CI/CD 完善** — lint/build/test/size-limit/e2e 全自动化

### 自 v0.8.0 以来的变更

#### 视觉样式升级

- **圆角体系升级** — 控件级 `rounded-md→rounded-lg` (4px→8px)，容器级 `rounded-lg→rounded-xl` (8px→12px)，Modal `rounded-2xl`
- **交互动效优化** — 过渡时长 150ms→200ms，新增 `ease-out` 缓动，slide 动画距离缩短 (translate-y-4→2)
- **Focus Ring 柔化** — 聚焦环从硬色改为 `/40` 半透明，视觉更柔和
- **叠加层模糊** — Modal/Drawer 遮罩新增 `backdrop-blur-[2px]` 毛玻璃效果
- **Card 悬浮** — hover 效果从 `scale-[1.02]` 改为 `-translate-y-1 + shadow-lg`，更自然
- **Token 同步** — tokens.ts / tokens.css / 5 套主题预设圆角值全部对齐
- **新增缓动常量** — `EASING_SPRING` (弹性) / `EASING_SMOOTH` (平滑) + 对应 CSS 变量
- 涉及 40+ 组件工具文件，所有 4619 测试通过

#### 新增组件

- **InputGroup** — 输入框组合容器，支持前后缀、嵌套 Input/Select/Button
- **PrintLayout** — 打印布局组件，支持纸张尺寸、页眉/页脚、分页控制
- **ImageViewer** — 全功能图片查看器，支持缩放/旋转/翻页/键盘导航

#### 组件增强

- **Alert** — 新增 `banner` 模式、`action` 插槽/prop
- **Steps** — 新增 `labelPlacement`、`progressDot` 属性
- **Breadcrumb** — 新增 `maxItems` 折叠显示、自定义分隔符

#### API 一致性改进

- **ImagePreview**: `visible` → `open`（向后兼容，`visible` 标记为 `@deprecated`）
- **Image**: `preview-visible-change` → `preview-open-change`（Vue，向后兼容）
- **Image**: `onPreviewVisibleChange` → `onPreviewOpenChange`（React，向后兼容）
- **Calendar**: `panelChange` → `panel-change`（Vue，**不向后兼容**）
- **Rate**: `hoverChange` → `hover-change`（Vue，**不向后兼容**）

#### a11y 改进

- 新增 `createFocusTrap()` — 焦点陷阱工具，支持 Tab/Shift+Tab 循环、Escape 回调
- 新增 `announceToScreenReader()` — 屏幕阅读器公告工具（aria-live region）
- 新增 `manageLiveRegion()` — 可管理的 live region 实例
- 所有新组件通过 axe-core a11y 自动化测试

#### 测试

- 测试总量: 4619 tests / 237 test files
- 新增 ButtonGroup Vue/React 测试（23 tests）
- 增强 Dropdown Vue/React 测试（+8 tests）
- 增强 Tag Vue/React 测试（+8 tests）
- 新增 a11y-utils 测试（11 new tests）

#### 基础设施

- **E2E 测试** — Playwright 跨浏览器测试（Chromium/Firefox/WebKit）
- **Bundle Size 监控** — size-limit 集成，CI 自动检查
- **性能基准** — Vitest bench 模式，关键组件渲染性能基线
- **CI/CD** — 新增 ci.yml（PR 自动检查）、e2e.yml（浏览器测试）
- **API 一致性扫描器** `scripts/validate-api.mjs` — 全量组件 API 命名检查
- **CLI 脚手架** `@expcat/tigercat-cli` v1.0.0 — 项目初始化、组件生成

#### 文档

- 迁移说明合并到 Changelog，减少根目录历史文档数量
- 文档站升级：客户端搜索、主题切换预览
- 更新 Skills 文档（shared/props、vue/react 代码示例）

### 迁移摘要

从 v0.8.0 升级到 v1.0.0 时，Vue 侧需要注意两个事件名变更：

```diff
- <Calendar @panelChange="handler" />
+ <Calendar @panel-change="handler" />

- <Rate @hoverChange="handler" />
+ <Rate @hover-change="handler" />
```

以下 API 仍可用但已标记为弃用，建议改用 `open` 命名：

```diff
- <ImagePreview :visible="show" />
+ <ImagePreview :open="show" />

- <Image @preview-visible-change="handler" />
+ <Image @preview-open-change="handler" />
```

v0.5.0 的早期破坏性变更仍需留意：弹出层组件统一使用 `open` / `update:open`，Button 原生按钮类型使用 `htmlType` 而不是 `type`。

---

## v0.8.0 — 高级交互与业务组件

新增统一拖拽系统、Splitter、Resizable、CodeEditor、RichTextEditor、Kanban、VirtualTable、InfiniteScroll、FileManager，以及 CLI 脚手架能力；该版本主要为增量功能，无破坏性变更。

## v0.5.0 — 架构筑基

统一弹出层可见性 API（`visible` → `open`），Button 原生类型 API（`type` → `htmlType`），并引入泛型类型、类型安全事件/插槽、设计 Token 与菜单键盘导航等基础能力。
