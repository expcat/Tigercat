# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: pending development roadmap only
verified-date: 2026-05-25
source: current repository audit and planning
-->

本文只保留未完成任务与持续守护项。已经交付的历史清单不再保留在 Roadmap 中，后续回溯以 `CHANGELOG.md`、发布记录和对应文档为准。

## 文档职责边界

- Roadmap 只记录当前优先级、待办任务、持续守护项和短期完成状态；阶段归档或发布后，已完成条目应移入 `CHANGELOG.md` 或发布记录。
- `CHANGELOG.md` 记录已经交付且影响用户、贡献者或发布流程的变更，包括 Breaking change、迁移说明、新功能、修复和基础设施门禁变化。
- `scripts/README.md` 只维护命令入口和脚本职责；组件 API、示例、主题、i18n、SSR 规则继续以 `skills/tigercat/references/` 与正式文档为准。
- 完成 Roadmap 任务时先同步勾选状态；若变更会进入发布说明，再补充 `CHANGELOG.md`，避免把完成历史长期堆回 Roadmap。

## 当前基线

| 项目       | 状态                                                             |
| ---------- | ---------------------------------------------------------------- |
| 组件库     | Vue 3 + React 双端组件库，核心逻辑沉淀在 `@expcat/tigercat-core` |
| 包管理     | pnpm workspace，统一 catalog 管理核心工具链版本                  |
| 样式体系   | Tailwind CSS v4 + CSS Variables + Tigercat Tailwind plugin       |
| 文档与示例 | VitePress 文档、Vue/React 示例、CLI create 模板                  |
| 质量门禁   | Vitest、Playwright、a11y、size-limit、API/test validate          |

## Tailwind v4 构建基线

当前仓库只使用 Tailwind CSS v4 构建，不保留其他 Tailwind 构建路径：

- `pnpm-workspace.yaml` catalog 使用 `tailwindcss: ^4.2.4` 与 `@tailwindcss/vite: ^4.2.4`。
- `packages/core/package.json` peer dependency 要求 `tailwindcss: ^4.0.0`，并导出 `./tailwind` 与 `./tailwind/modern` v4 `@plugin` 入口。
- CLI 模板版本使用 Tailwind v4，生成项目通过 `@tailwindcss/vite` 和 `@plugin "@expcat/tigercat-core/tailwind/modern"` 接入。
- Example 项目已使用 `@import "tailwindcss"`、`@tailwindcss/vite` 和 Tigercat plugin。
- `tigercat doctor` 将 `tailwindcss` 4+ 与 `@tailwindcss/vite` 4+ 作为硬性要求；旧版、缺失插件或无法识别的版本都会失败。

后续 Tailwind 相关改动按以下顺序处理：

1. 保持 workspace catalog 与 CLI `TEMPLATE_VERSIONS` 使用同一组 Tailwind v4 版本。
2. 将示例与 CLI 模板统一到 `@tailwindcss/vite` + CSS `@plugin` 入口。
3. 确认 core package 继续暴露 Tailwind v4 plugin 子路径和类型声明。
4. 补充或修复 doctor、CLI 模板、example build 的回归测试。
5. 运行 `pnpm lint`、CLI 模板单测、`pnpm example:build` 和必要的 package build。

## 优先级规划

### P0：基线守护

- [x] 增加 Tailwind v4-only 检查：校验 workspace catalog、CLI 模板版本、core peer dependency、example package 版本保持一致。
- [x] 将发布前验证拆成可复用门禁：快速门禁覆盖 lint、类型/API 校验、核心单测，size 与示例构建作为独立层执行。
- [x] 收敛当前 size-limit 基线：React full 限制调整为 253 kB，Vue Button subpath 限制调整为 16 kB，并保留独立 `pnpm quality:size` 门禁。
- [x] 梳理 Roadmap 与 docs/changelog 的职责边界，避免完成历史再次堆回 Roadmap。

### P1：v1.3-v1.5 近期组件

近期目标以低到中等复杂度组件为主，优先补齐高频业务场景，并保持 Vue/React API 对齐。

| 组件           | 类别       | 目标                                               | 优先级 |
| -------------- | ---------- | -------------------------------------------------- | ------ |
| Spotlight      | Navigation | 命令面板，支持模糊搜索、分组结果、键盘导航         | 已完成 |
| Signature      | Form       | 手写签名画板，支持颜色、线宽、清空、导出 PNG/SVG   | 已完成 |
| NumberKeyboard | Form       | 移动端数字键盘，支持金额、手机号、身份证输入模式   | 已完成 |
| ScrollSpy      | Navigation | 滚动监听并自动高亮 Anchor/导航项                   | 已完成 |
| Countdown      | Data       | 倒计时展示，支持格式化、结束事件、服务端安全初始值 | 已完成 |

执行步骤：

1. 先完成组件 RFC：API、无障碍行为、键盘交互、移动端行为、i18n 文案。
2. 在 `packages/core/` 抽出共享类型、计算逻辑和样式 token 映射。
3. 实现 Vue 与 React 组件，保持 prop/event/slot/children 语义对齐。
4. 补齐单测：正常路径、边界条件、a11y、键盘交互、SSR 安全访问。
5. 更新导出、Example、文档、skills reference，并补充必要的 Playwright 用例。

### P2：v1.6-v2.0 中期组件

中期目标集中在复杂数据展示和高级输入，必须先完成核心抽象设计，避免 Vue/React 两端重复实现业务逻辑。

| 组件            | 类别     | 目标                                                      | 复杂度 |
| --------------- | -------- | --------------------------------------------------------- | ------ |
| Gantt           | Charts   | 甘特图，复用 SVG chart 基础设施，支持时间轴、依赖线、缩放 | 高     |
| OrgChart        | Charts   | 组织结构图，复用 Tree 数据结构与 SVG 连线布局             | 高     |
| MarkdownEditor  | Advanced | Markdown 编辑、预览、工具栏、可插拔扩展点                 | 高     |
| ImageAnnotation | Advanced | 图片标注，支持矩形、圆形、多边形、自由画笔                | 中     |
| CronEditor      | Form     | Cron 表达式可视化编辑与校验                               | 中     |
| ColorSwatch     | Form     | 色板选择器，支持预设色组与自定义色组                      | 低     |

执行步骤：

1. 为 Gantt、OrgChart、MarkdownEditor 先做技术 spike，明确是否引入成熟解析/布局库。
2. 对复杂组件建立核心状态机或数据模型，再接 Vue/React 渲染层。
3. 先落最小可用版本，再增量扩展拖拽、缩放、导出、插件能力。
4. 对高复杂组件补充性能基准与大数据场景测试。
5. 发布前补齐迁移说明、API 文档、Example 和可访问性说明。

### P3：v2.0 发布准备

- [ ] 公共 API 冻结审查：核对所有 package exports、Props 类型、事件命名、子路径导入。
- [ ] Breaking change 清单：将不兼容变化集中到迁移指南和 changelog。
- [ ] SSR 与 hydration 回归矩阵：覆盖 Nuxt、Next.js、Vue/React 示例构建。
- [ ] 主题与 token 稳定性审查：确保 CSS 变量命名、Tailwind plugin entry、Figma token 输出可长期维护。
- [ ] Release Candidate 流程：预发布、安装验证、文档构建、发布后 smoke test 全链路演练。

## 新组件 Definition of Done

每个新组件默认满足以下条件，除非 RFC 明确裁剪范围：

1. `packages/core/src/types/` 定义共享 Props 类型。
2. `packages/core/src/utils/` 抽取框架无关逻辑。
3. `packages/vue/src/components/` 与 `packages/react/src/components/` 双端实现。
4. `packages/*/src/index.*` 与必要子路径完成导出。
5. 测试不少于 20 cases，覆盖 a11y、edge case、键盘交互和 SSR 守卫。
6. `skills/tigercat/references/` 与 `docs/reference/` 同步 API 文档。
7. Example 页面提供最小示例和一个真实使用场景。
8. 涉及文案时接入 i18n；涉及动画时响应 `prefers-reduced-motion`。

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
