# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: pending development roadmap and post-audit optimization tasks
verified-date: 2026-06-21
source: current repository audit and roadmap review (former ROADMAP_CHECK.md, merged 2026-06-21)
-->

本文只记录仍需推进的任务和长期守护规则。已经完成的阶段、组件和发布准备事项不再保留在 Roadmap 中，回溯以 [CHANGELOG.md](../CHANGELOG.md)、发布记录和对应文档为准。

## 文档职责边界

- Roadmap 只记录当前待办、持续守护项和短期发布状态。
- [CHANGELOG.md](../CHANGELOG.md) 记录已交付且影响用户、贡献者或发布流程的变更。
- [scripts/README.md](../scripts/README.md) 维护命令入口和脚本职责。
- 组件 API、示例、主题、i18n、SSR 和发布流程以 `skills/tigercat/references/` 为准。

## 当前基线

| 项目     | 状态                                                             |
| -------- | ---------------------------------------------------------------- |
| 组件库   | Vue 3 + React 双端组件库，核心逻辑沉淀在 `@expcat/tigercat-core` |
| 包管理   | pnpm workspace，统一 catalog 管理核心工具链版本                  |
| 样式体系 | Tailwind CSS v4 + CSS Variables + Tigercat Tailwind plugin       |
| 发布版本 | v1.3.4 发布准备中                                                |
| 质量门禁 | Vitest、Playwright、a11y、size-limit、API/test validate          |

> **版本规划（暂定）**：v1.3.4 为当前补丁线发布，仅交付非破坏性工作。`## Unreleased` 中累积的破坏性变更（A-4 / A-5 / D-3 等，详见 [CHANGELOG.md](../CHANGELOG.md) 与 [MIGRATION.md](MIGRATION.md)）随「下一个允许破坏的版本」交付，即当前文档计划全部完成后的发布版本，**暂定为 v1.4.0（minor）**。实际版本号仍以发布时 CI `sync-version` / release 决策为准。

## 当前待办

- [ ] v1.3.4 发布执行：运行 `pnpm quality:release`、`pnpm build`，发布后执行 `pnpm smoke:published`。
  - 体积预算阻塞已解除（size 预算按实测重设并扩展覆盖，`pnpm size` 转绿，详见 [CHANGELOG.md](../CHANGELOG.md)）；`release:check` 仍需在发布时把 `v1.3.4` 写入 CHANGELOG / 迁移指南 / release.md 版本标题（属发布执行动作）。
- [ ] 发布后归档：确认 `CHANGELOG.md`、迁移指南、发布记录和 Roadmap 状态与实际发布结果一致。

## 优化任务

全项目优化扫描（任务 A–G，2026-06-19 ～ 06-21）已完成并归档，已交付项按惯例移交 [CHANGELOG.md](../CHANGELOG.md) `## Unreleased`，扫描框架与已交付明细不在本文保留。

本节是对已交付项做**独立复审**（路线图审查，2026-06-21）后筛出的**仍需推进项**。复审确认任务 C / D / E / F **零返工**；任务 A / B 各有一处需修；任务 G 有一处**基础设施级反转**需调和，且连带架空三道已交付门禁。下列条目按优先级（P0 阻塞 / P1 重要 / P2 改进 / P3 可选）组织，每条注明来源、证据位置与建议方案；全部回填后方可勾除。

### P1 — 质量门禁基础设施一致性（源自任务 G 复审）

- [x] **G-R1 调和「dependabot / CI 自动触发被反转」与文档的矛盾**（已按「如实改述」收口：保留 dependabot 停用 + CI 手动 `workflow_dispatch`，修订 `security.yml` 注释与 `CHANGELOG.md` 去掉 dependabot 自动收敛 / 随 PR 自动生效的失效承诺。）
  - 来源 / 维度：任务 G 复审（依赖·CVE / 门禁触发）。
  - 问题：commit `345274f8`（2026-06-20 16:51）把同日 `cfabd219` 交付的两项门禁基础设施**有意反转**——`.github/dependabot.yml` 重命名为 `.disabled`、`.github/workflows/ci.yml` 删除 `push` / `pull_request(main)` 触发仅留 `workflow_dispatch`。当前仓库状态已与文档矛盾，并留下悬挂引用：
    - `security.yml`（注释 `:3-4,11`）仍写「Remediation is driven by Dependabot (see .github/dependabot.yml)」，指向已禁用文件 → 报告式 `pnpm audit` 失去补救兜底（每周出报告、无自动修复承接）。
    - `CHANGELOG.md` `## Unreleased` 仍写 dependabot「作为依赖升级 / 安全补丁的实际收敛机制」与「`ci.yml` 增 `push` / `pull_request`（main）触发…随 PR / 合并自动生效」。
  - 影响：P1，基础设施级——质量门禁的触发与补救机制本身与文档不一致。
  - 建议（二选一，且无论哪种都应修 `security.yml` 悬挂引用）：
    - **重启**：`git mv .github/dependabot.yml.disabled .github/dependabot.yml`（内容完整，含 npm / github-actions 周更两段），并给 `ci.yml` 加回 `push` / `pull_request(main)` 触发；或
    - **如实改述**：修订 `CHANGELOG.md` `## Unreleased` 与 `security.yml:3-4,11` 注释，去掉「dependabot 实际收敛 / Dependabot fixes it」「随 PR / 合并自动生效」，改写为「audit 报告式可见性、当前无自动补救（dependabot 已停用）」「CI 维持手动 `workflow_dispatch`（控 Actions 成本）」。

- [x] **G-R2 将覆盖率 / API 基线 / references 三道闸纳入本地可达路径**（已收口：`quality:release` 补 `test:coverage` + 新增 `api:baseline:check` / `docs:api:check` 两道漂移闸，`release:check` 的必含步骤校验同步登记三项固化为红门禁。）
  - 来源 / 维度：任务 G 复审（连带影响）。
  - 问题：G-1（覆盖率阈值）/ G-3（公共 API 基线漂移）/ G-4（references 漂移）三道已交付门禁**只接到 `ci.yml`、不在 `quality:release` 链内**——`quality:release` → `quality:quick` 跑的是 `test:core`（非 `test:coverage`），全链无 `api:baseline` + diff、无 `docs:api` + references diff。CI 退回手动触发后（见 G-R1），这三道闸只在有人手动 dispatch CI 时才跑，既不随 PR / push 自动生效，也无法经本地 `pnpm quality:release` 走到。
  - 影响：P1，三道已交付门禁被一并架空（与 G-R1 的 CI 决策解耦——无论 CI 是否恢复自动触发，本地门禁都应可达）。
  - 建议：在 `quality:release` 中以 `test:coverage` 替换 / 补充 `quality:quick` 的 `test:core`（强制覆盖率阈值），并新增 `api:baseline` + `git diff --exit-code api-reports`、`docs:api` + `git diff --exit-code skills/tigercat/references` 两步漂移校验。

### P2 — i18n 本地化补全（源自任务 B / C 复审）

- [ ] **I18N-1 修复 Vue Cascader 空态未本地化（确凿缺陷）**
  - 来源 / 维度：任务 B 复审（i18n / 跨端对称）。
  - 问题：Vue `Cascader.ts:391` 空态**直接渲染 `props.notFoundText`**，未经 `resolveLocaleText`、无 locale 候选；且 `notFoundText` 默认值（`:116`）仍硬编码 `'No results found'`。两重成因叠加 → `<ConfigProvider :locale="zhCN">` 下空态仍渲染英文。React `Cascader.tsx:297-300` 已正确本地化（跨端漏改为 **Vue 独有**），与 CHANGELOG `## Unreleased`「双端 Cascader `notFoundText` 回退 `common.*`」承诺矛盾。
  - 影响：P2，单组件单点本地化 bug + 与已发布说明不一致。
  - 建议：`Cascader.ts:391` 改 `resolveLocaleText('No results found', props.notFoundText, mergedLocale.value?.common?.emptyText)`，`notFoundText` 默认值（`:116`）改 `undefined`，与 React 对齐；补一条 `<ConfigProvider :locale="zhCN">` 下空态渲染中文的断言用例。验证 `pnpm test:vue` 窄范围。

- [ ] **I18N-2 收敛跨端未本地化残留**
  - 来源 / 维度：任务 B 复审 §4 + 任务 C 复审 §4（跨端同源，未在 B-2 / C-2 声称清单内）。
  - 问题：以下英文默认值仍被直接渲染、绕过 locale：双端 `Select` 的 `noOptionsText` / `noDataText`（`'No options found'` / `'No options available'`）、双端 `FileManager` 的 `emptyText`（`'Empty folder'`）、Vue `InfiniteScroll.ts:150` 的 `endText`（`'No more data'`）。
  - 影响：P2（跨端）。
  - 建议：统一接入 `resolveLocaleText(..., mergedLocale.common.*)` 并把默认值改 `undefined`，双端同批改；`common` 无对应 key 者在 `TigerLocaleCommon` + en-US / zh-CN locale 文件新增 key。`Select` / `Cascader` / `TreeSelect` 的主 `placeholder`（`'Select an option'` / `'Please select'`）属 C-2 明示的刻意延后——可与本项一并评估是否新增 `common` key，亦可继续延后。

### P3 — 守卫一致性与长期跟踪（源自任务 A / F 复审）

- [ ] **SSR-1 统一 core 内 browser-only 命令式助手的 `isBrowser()` 守卫**
  - 来源 / 维度：任务 A 复审（SSR）。
  - 问题：`packages/core/src` 共约 **97 处直接 `document.` / `window.` 成员访问、分布 22 文件**，其中若干**导出的浏览器端命令式助手未加 `isBrowser()` 守卫**：`utils/a11y-utils.ts`（`createFocusTrap` / `announceToScreenReader` / live-region）、`utils/anchor-utils.ts`（`getAnchorTargetElement` 等）、`utils/chart-export-utils.ts`、`utils/table-export-utils.ts`、`utils/focus-utils.ts`、`utils/image-utils.ts`、`utils/rich-text-editor-utils.ts`。无 SSR 崩溃风险（仅浏览器运行时调用），但守卫写法不统一。A-0 原「core 已统一 `isBrowser()`」「移交任务 B / C」表述不准确——B / C 目标路径不含 `packages/core/src`，该残留实则无人接管，须在本任务内承接。
  - 影响：P3，一致性 / 防御性（非崩溃）。
  - 建议：统一加 `isBrowser()` 早退守卫或显式 browser-only 标注。验证 `pnpm --filter @expcat/tigercat-core build` + `pnpm test:core`。

- [ ] **I18N-3 TimePicker / Upload 深层 i18n 集成（可选）**
  - 来源 / 维度：任务 A 复审 §4 旁注。
  - 问题：(a) TimePicker 标签未并入 `TigerLocale` 类型——`types/locale.ts` 的 `TigerLocale` 无 `timePicker` 区块，标签经 `getTimePickerLabels()`（locale 串 + overrides）单独解析，不走主 locale 配置体系；(b) Upload 在 `locale-utils` 无 zh-CN 默认值（仅 `DEFAULT_UPLOAD_LABELS` 英文，无 `ZH_CN_UPLOAD_LABELS`），en-US / zh-CN locale 文件也无 `upload` 区块。
  - 影响：P3，i18n 集成深度（可选）。
  - 建议：视需要把 TimePicker 标签并入 `TigerLocale`、补 `ZH_CN_UPLOAD_LABELS` 与 locale 文件 `upload` 区块。

- [ ] **BENCH-1 评估周度 bench 的 baseline 回归阈值（可选）**
  - 来源 / 维度：任务 F 复审（运行时性能）。
  - 问题：`bench.yml` 已闭合「基准未接入 CI」缺口（周度 + 手动 + `upload-artifact`），但「无基线回归阈值 / 自动 baseline-diff」是 `bench.yml`（注释 `:6-8`）与 CHANGELOG 均明示的有意延后（micro-bench 在共享 runner 抖动大、硬阈值易误红），仍是运行时性能维度的一个显式开放面。
  - 影响：P3，显式 scope-out（避免随时间被遗忘）。
  - 建议：评估周度 bench 结果的人工 / 半自动 baseline 对比阈值，再决定是否纳入门禁。

- [ ] **DOC-1 跨端 API 命名可见性补注（可选）**
  - 来源 / 维度：任务 D 复审 §5（陈述精度）。
  - 问题：CommentThread 跨端回调命名为已文档化的有意非对称——Vue `update:expandedKeys` ↔ React `onExpandedChange`（`validate-api.mjs:264-265` 显式登记 + CHANGELOG 已记），但对组件消费者不够显眼。
  - 影响：P3，可选文档可见性。
  - 建议：在 skill reference / MIGRATION 补一句「CommentThread 的 React 回调为 `onExpandedChange`（对应 Vue `update:expandedKeys`）」。

## 持续守护

### Tailwind v4

- workspace catalog、CLI 模板版本、core peer dependency 和 example 依赖继续保持 Tailwind v4 对齐。
- 示例与 CLI 模板继续使用 `@tailwindcss/vite` + CSS `@plugin "@expcat/tigercat-core/tailwind/modern"` 接入。
- core package 必须继续暴露 `./tailwind`、`./tailwind/modern`、`./tokens.css` 和 `./figma-variables.json`。
- Tailwind 相关改动需覆盖 doctor、CLI 模板、example build 和必要 package build。

### 发布门禁

- 公共 API 冻结检查使用 `pnpm release:check`、`pnpm types:check` 和 `pnpm api:validate`。
- SSR 与 hydration 矩阵使用 `pnpm quality:ssr` 覆盖 Nuxt 与 Next.js。
- 主题与 token 变更后运行 `pnpm tokens:build`，并确认生成物只包含预期变化。
- Breaking change 必须同步到 [docs/MIGRATION.md](MIGRATION.md) 和 [CHANGELOG.md](../CHANGELOG.md)。

### 跨端一致性约定

- **新增受控组件 / 受控量**：须同步在 `scripts/validate-api.mjs` 的 `CONTROLLED_PARITY` 表登记，否则其双端 `update:<prop>` ↔ `on<Prop>Change` 不对称会静默逃逸 `api:validate` 的 parity 校验（护栏有意仅守卫登记项，可逐步扩充）。
- **新增模板工具链依赖**：须同步登记 `packages/cli/src/constants.ts` 的 `TEMPLATE_VERSIONS` 与 `pnpm-workspace.yaml` catalog——二者为双份权威（`TEMPLATE_VERSIONS` 服务 CLI 模板发布、catalog 服务 workspace / example），由 `tests/core/cli.spec.ts` 对齐测试锁步防漂移。

### 组件 Definition of Done

新增或显著修改组件默认满足：

1. `packages/core/src/types/` 定义共享 Props 类型。
2. `packages/core/src/utils/` 抽取框架无关逻辑。
3. `packages/vue/src/components/` 与 `packages/react/src/components/` 双端实现。
4. `packages/*/src/index.*` 与必要子路径完成导出。
5. 测试覆盖正常路径、边界条件、a11y、键盘交互和 SSR 守卫。
6. `skills/tigercat/references/` 与 Example 同步 API 文档和使用场景。
7. 涉及文案时接入 i18n；涉及动画时响应 `prefers-reduced-motion`。

## 验证策略

按改动范围选择最小验证集：

| 改动类型                   | 推荐验证                                                                       |
| -------------------------- | ------------------------------------------------------------------------------ |
| Roadmap / docs only        | `pnpm exec prettier --check docs/ROADMAP.md`                                   |
| CLI 模板 / Tailwind v4     | CLI 模板单测、`pnpm --filter @expcat/tigercat-cli build`、`pnpm example:build` |
| core 工具 / token / plugin | `pnpm --filter @expcat/tigercat-core build`、`pnpm test:core`                  |
| Vue/React 组件             | 对应组件单测、`pnpm test:vue` / `pnpm test:react` 的窄范围                     |
| 复杂交互或移动端           | 相关 Playwright spec，必要时补视觉回归                                         |
| 发布链路                   | `pnpm quality:release`、`pnpm build`、发布后 smoke                             |
