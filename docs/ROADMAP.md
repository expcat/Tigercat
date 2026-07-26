# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: v2.1.0 planning + current executable work
verified-date: 2026-07-19
source: current repository state + competitor benchmark (2026-07-19)
-->

本文记录竞品缺口结论、v2.1.0 开发计划与任务边界,不保存完成历史或一次性审查记录。

- 版本变更与完成历史见 [CHANGELOG.md](../CHANGELOG.md)。
- breaking change 与迁移路径见 [MIGRATION.md](MIGRATION.md)。
- 组件 API、示例与维护规则见 [Tigercat Skill](../skills/tigercat/SKILL.md)。
- 命令输出、浏览器审查和中间计划由 Git 历史追溯。

## 竞品基准与缺口结论

2026-07-19 核查。对比对象:Ant Design、Element Plus、Naive UI、PrimeVue、Mantine、shadcn/ui、HeroUI。核查时基线为 v2.0.19 的 149 个公共组件入口;批次 1 落地后当前为 152(权威清单见 `skills/tigercat/references/component-index.md`,生成物)。

### 缺口组件

均为 Tigercat 无、主流竞品有的组件;「竞品覆盖」为出现该组件的竞品数。

| 组件                                 | 竞品覆盖                         | 归类       | Test Group   |
| ------------------------------------ | -------------------------------- | ---------- | ------------ |
| InputOTP 验证码/PIN 输入             | 6 家                             | Form       | `form`       |
| TagsInput 标签输入                   | 4 家                             | Form       | `form`       |
| MaskInput 掩码输入                   | 2 家                             | Form       | `form`       |
| ScrollArea 自定义滚动容器            | 5 家                             | Layout     | `layout`     |
| Masonry 瀑布流布局                   | 1 家(AntD 5 新增)                | Layout     | `layout`     |
| AspectRatio 宽高比容器               | 3 家                             | Layout     | `layout`     |
| ContextMenu 右键菜单                 | 4 家                             | Navigation | `navigation` |
| NavigationMenu 站点导航(含 MegaMenu) | 3 家                             | Navigation | `navigation` |
| PageHeader 页头                      | 2 家                             | Navigation | `navigation` |
| LoadingBar 顶部加载条                | 1 家(Naive,nprogress 类通用需求) | Feedback   | `feedback`   |
| Kbd 按键标识                         | 3 家                             | Basic      | `basic`      |
| Highlight 文本高亮                   | 2 家                             | Basic      | `basic`      |
| SplitButton 分裂按钮                 | 2 家                             | Basic      | `basic`      |
| Marquee 跑马灯                       | 2 家                             | Basic      | `basic`      |
| ImageCompare 图片对比滑块            | 1 家(PrimeVue,与 Image 家族互补) | Basic      | `basic`      |

### 缺少的功能

- Cascader 与 TreeSelect 缺少大数据量虚拟化(Element Plus 提供 virtualized 变体;Select/Tree 已支持 virtual,可复用其模式)。
- Dropdown 无 contextmenu 触发方式,由独立 ContextMenu 组件覆盖(批次 3)。

### 已验证非缺口

以下能力已存在,竞品对比时易误判为缺失,登记任务前先核对:DatePicker/TimePicker 范围选择、Select 多选与虚拟化、Tree 虚拟化、Progress 环形(circle/ring)、Text ellipsis、Input password、Statistic 数字动画、Table 树形/可展开/可编辑、命令面板(Spotlight)、Tour、Watermark、QRCode、Signature、CronEditor、NumberKeyboard、RTL(ar-SA + dir 同步)、13 套内置 locale、7 套内置主题、SSR、a11y 门禁。下游 Tigercat_Admin 的 3 条上游建议(Notification `actions`、BackTop `position`、FloatButton `floating`/`placement`/`offset`)已全部实现。

## 当前任务(v2.1.0 开发计划)

发布口径:以下批次全部完成并通过完整门禁后,以 v2.1.0 minor 发布(手动 sync-version、手写 CHANGELOG、push tag)。批次可独立合并,批次内组件可拆分为独立 PR;每个 PR 只解决一个组件或一个根因。

新组件任务共用边界(引用 AGENTS.md 组件交付管线):

- 允许修改范围:`packages/core/src/types|utils` 及导出、`packages/vue` 与 `packages/react` 组件实现及入口导出、`tests/` 正常/a11y/边界测试、复杂交互补 `e2e/`、`examples/` 示例。
- 回写范围:`CHANGELOG.md`「未发布」、API baseline(`pnpm api:baseline`)、`.size-limit.json` 新子路径预算;`skills/tigercat/references/*` 与 component-index 由 `pnpm docs:api` 重建,不手改生成物。
- 验证命令:开发期跑对应 `pnpm test:group:{group}`,合并前完整门禁 `pnpm quality:release` 与 `pnpm e2e` 只在最终跑一次。

### 批次 1 表单输入(P0)

- [x] InputOTP:分格输入、粘贴分发、自动聚焦推进、掩码模式。
- [x] TagsInput:输入创建、退格删除、去重、最大数量,受控与非受控。
- [x] MaskInput:模板掩码(日期/电话/自定义 token),原始值与格式化值双输出。
- 验证:`pnpm test:group:form`;粘贴、IME、键盘导航交互补 E2E。

### 批次 2 滚动与布局(P0)

- [ ] ScrollArea:样式化滚动条、横/纵向、滚动阴影、暴露 scrollTo;为组件内部滚动提供统一收口。
- [ ] Masonry:列数/间距响应式、动态插入重排。
- [ ] AspectRatio:宽高比容器。
- 验证:`pnpm test:group:layout`。

### 批次 3 导航与站点(P1)

- [ ] ContextMenu:contextmenu 触发、坐标定位、嵌套子菜单、键盘导航;复用 Dropdown/Menu 的菜单渲染与 floating-ui 定位。
- [ ] NavigationMenu:水平导航 + 下拉/MegaMenu 面板、hover/focus 展开、menubar 语义 a11y。
- [ ] PageHeader:返回、面包屑/标题/操作区插槽。
- 验证:`pnpm test:group:navigation`;ContextMenu/NavigationMenu 键盘交互补 E2E。

### 批次 4 展示与反馈(P1)

- [ ] Kbd(Basic):按键标识。
- [ ] Highlight(Basic):关键词/正则高亮。
- [ ] SplitButton(Basic):主操作 + 下拉扩展,复用 Button/Dropdown。
- [ ] Marquee(Basic):循环滚动、hover 暂停、遵循 prefers-reduced-motion。
- [ ] ImageCompare(Basic):对比滑块,与 Image 家族共用类型。
- [ ] LoadingBar(Feedback):discrete API(start/finish/error),容器机制与 Message/Notification 保持一致。
- 验证:`pnpm test:group:basic` 与 `pnpm test:group:feedback`。

### 批次 5 既有组件功能增强(P1)

- [ ] Cascader 虚拟化:大数据量列渲染复用 Select 的 virtual 模式。
- [ ] TreeSelect 虚拟化:复用 Tree 已有 virtual 能力。
- 允许修改范围限于 cascader/tree-select 相关 core utils、双框架实现与测试;公共 API 仅新增可选 props,不做 breaking change。
- 验证:`pnpm test:group:form`;受影响的 `benchmarks/` 套件需复跑。

### v2.0.19 发布记录缺失(2026-07-26 发现,P1)

`pnpm release:check` 在 v2.0.19 上是红的。其中公开 `version` 常量漂移(三个包的 `export const version` 停在 `'2.0.0'`)已随本轮修复:跑了 `pnpm sync:version`,并让 `.github/workflows/create-release-tags.yml` 把三个 `src/index` 一并 `git add`,防止再次漂移。

剩余三条仍未处理,都是 v2.0.19 打了 tag 但没写发布文档:

- [ ] `CHANGELOG.md` 缺 v2.0.19 条目。
- [ ] `docs/MIGRATION.md` 缺 v2.0.19(若该版本无 breaking change,需要确认门禁是否应放行无 breaking 的补丁版本)。
- [ ] `skills/tigercat/references/release.md` 缺 v2.0.19。

未代写:发布说明必须由实际发布内容决定,不能从 git log 反推杜撰。

### 测试执行成本(2026-07-26 实测,P2)

基线 `pnpm test`:397 个 spec 文件 / 6952 个测试。切换到 threads pool 前墙钟 73.7s,切换后 54.2s(-26%)。分阶段累计 worker 时间显示编译只占 5.9%、断言执行只占 9.7%,其余 84% 是框架空转(import 43.0% / setup 24.5% / environment 17.0%)。子路径导入已落地(见下),剩余一项仍未做:

- [ ] 消除跨文件状态污染,使 `--no-isolate` 可用。2026-07-26 复测修正了原先的判断,原条目记的「5 个文件、全部是测试独立性缺陷」两点都不准确。

  复现口径:`npx vitest run --no-isolate --maxWorkers=1` 才是确定性的(13 个文件 / 79 条失败);并行跑因 worker 调度不同,每次失败集合都不一样(实测 8 个文件 / 17~39 条),不能作为基线。墙钟 12.4s vs 基线 54.2s。

  已归因的根因:
  - **`packages/core/src/utils/copy-text.ts` 的生产缺陷(本轮已改)**:`document.body.removeChild(textarea)` 写在 `try` 内、跟在会抛的 `select()` / `setSelectionRange()` / `execCommand()` 之后,一旦抛异常就把一个隐藏 textarea 永久留在文档里。这不只是测试问题——真实浏览器里每次降级复制失败都会往 DOM 里塞一个可聚焦的 textbox,污染无障碍树。79 条失败里有 66 条是它引起的:残留 textarea 让后续文件的 `getByRole('textbox')` 报 "Found multiple elements"。已补 `tests/core/copy-text.spec.ts`(此前该 util 零覆盖)。
  - **`devWarn` 去重缓存**:原条目说「加 reset 钩子会把测试专用 API 带进生产代码」——该结论已过期,`resetDevWarnCache()` 早就存在且已在 `api-reports/public-api-baseline.json` 里,是已发布的公开导出。本轮按 `tests/core/dev-warn.spec.ts` 的既有写法,在 Button/Tag 的 React 与 Vue 四个 spec 里调用它。
  - **`vi.mock` 与共享模块注册表冲突(新发现,原条目没有)**:`--no-isolate` 下同一 worker 共享模块注册表,先加载过的模块不会再走 mock 工厂。`tests/react/ButtonSpinnerLazy.spec.tsx`、`tests/react/overlay-positioning.spec.tsx`、`tests/vue/overlay-positioning.spec.ts` 三个文件(全仓库用 `vi.mock` 的就这三个)因此必然失败。这不是测试独立性缺陷,写法本身没问题,靠改 spec 修不掉;要么给它们单开一个 `isolate: true` 的 project(与 `FORK_ONLY_SPECS` 同一套登记方式),要么在文件内 `vi.resetModules()`。**这一条决定了 `--no-isolate` 能不能全绿,应先定方案再动其余。**

  尚未归因/未修的残留(探针实测):`document.documentElement` 的 inline style 与 class 残留(`setThemeVariables` 有 16 个调用方,`clearThemeVariables` 靠调用方自觉),拖累 `tests/core/modern-theme-interaction.spec.ts`;portal / teleport 容器空 div 持续累积;`tests/react|vue/BackTop`、`tests/react/Avatar`、`tests/*/Spotlight`、`tests/vue/Image` 的失败尚未逐一定位,其中 Spotlight 的 a11y 违规很可能是残留 textarea 的连带,需在 copy-text 修复后复测。

- [x] 组件 spec 从根 barrel 改为按组件子路径导入(2026-07-26 完成)。253 个 spec 里 259 条根入口导入语句拆成 391 条 `@expcat/tigercat-vue/Button` 形式的子路径导入,原先靠 barrel `export *` 间接拿到的 core 符号改为直接从 `@expcat/tigercat-core` 导入。`vitest.config.ts` 从 `scripts/lib/public-components.mjs` 生成子路径 alias(与 `pnpm exports:check` 同一份事实源,spec 只能指向真实已发布的子路径),必须排在根包 alias 之前——Vite 的字符串 alias 按前缀匹配且首个命中生效。

  实测(398 文件 / 6957 测试,前后一致):墙钟 54.8s→48.6s(-11%,改后 3 次 48.2/48.7/48.9),累计 worker import 168.3s→118.3s(-30%)、transform 29.1s→24.2s。低于原条目 20 spec 对照实验预估的 -30%,因为全量跑里 setup / environment / tests 三段不随导入收窄而下降。

  未改的例外:`Message` / `notification` 出自 `MessageRoot` / `NotificationRoot`,`useDrag` / `useFormController` / `useChartInteraction` 出自 hooks / composables 目录,都没有对应的已发布子路径,仍走根 barrel。`tests/core/cli.spec.ts` 里断言 CLI 生成代码的字符串字面量必须保持根 barrel 写法——那是脚手架产物的期望值,不是本仓库的导入。

## 长期观察项(不绑定版本)

- headless/unstyled 模式:架构级方向,需先评估与 Tailwind 插件、token 体系的关系。
- React peer 依赖下探(`^18`)评估:收益与测试矩阵成本权衡。
- 低频候选组件:TimeSelect、Inplace 就地编辑、CopyButton、Dock;出现真实下游需求时再登记。

## 发布与验证边界

- `.github/workflows/` 只保留打 tag、发布 npm 包和部署 Pages 所需流程;测试在本地执行。
- E2E 只验证跨浏览器功能行为,不维护图片对比基线。
- 发布前本地执行 `pnpm quality:release` 与 `pnpm e2e`。按改动范围可先运行 focused/group checks,最终只运行一次完整门禁。
- public API、shared contract、props、events、methods、type aliases 或 helper exports 发生变化时,同步更新 `CHANGELOG.md`、`docs/MIGRATION.md`、API baseline、generated Skill references、examples 与对应测试。
- 生成产物只能通过事实源或生成器重建,不得手改 `skills/tigercat/references/*` 或 `api-reports/*` 掩盖漂移。

## 任务登记规则

- 只登记有复现路径、影响范围和验收条件的新事实,不恢复已完成批次或旧审查清单。
- P0/P1 拆成独立或小批任务;P2/P3 仅在同一根因和同一验证范围内合并。
- 每项任务必须写明允许修改范围、本地验证命令和完成后的文档/生成物回写范围。
