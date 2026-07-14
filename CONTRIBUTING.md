# Contributing to Tigercat

感谢你参与 Tigercat。这个仓库是基于 pnpm workspace 的跨框架 UI 组件库，核心原则是：共享逻辑放在 `packages/core`，Vue 和 React 层保持薄渲染适配。

## 开始之前

- 阅读 [README.md](README.md) 了解包结构、兼容性和常用命令。
- 阅读 [docs/ROADMAP.md](docs/ROADMAP.md) 确认当前优先级与文档职责边界，避免重复实现已经规划或完成的工作。
- 组件 API、示例、主题、i18n 和术语以 [skills/tigercat/SKILL.md](skills/tigercat/SKILL.md) 为准。
- 大改动先开 issue 讨论；新组件请使用 Component Proposal 模板。

## 本地环境

要求：

- Node.js >= 22.13.0
- pnpm >= 11.9.0

初始化：

```bash
pnpm setup
```

如果只需要手动安装和构建：

```bash
pnpm install
pnpm build
```

运行示例：

```bash
pnpm example:vue
pnpm example:react
```

## 分支和提交

- 从 `main` 创建功能分支，例如 `feat/table-editing`、`fix/date-picker-locale`、`docs/contributing-guide`。
- 保持改动聚焦，一次 PR 只解决一个问题或一个 Roadmap 任务。
- 不提交构建产物、报告目录或无关格式化变更。
- 如果修改公共 API，请同步更新测试、示例、文档和 Roadmap 状态。

## 代码组织

- 框架无关类型放在 `packages/core/src/types/`。
- 框架无关工具、计算、格式化和样式逻辑放在 `packages/core/src/utils/`。
- Vue 组件放在 `packages/vue/src/components/`。
- React 组件放在 `packages/react/src/components/`。
- 对外导出需要同步检查 `packages/*/src/index.*`。
- 组件文档和示例需要同步检查 `skills/tigercat/references/` 与 `examples/example/`。

## 根因修复与架构约束

- 修复缺陷前必须在 issue 或 PR 中说明根因、应承担修复责任的层，以及仓库中全部同类消费者；不得只描述出现问题的单个组件。
- 跨组件、跨框架的问题必须在 `packages/core` 或共享框架适配层解决，并在同一改动中审计、迁移全部同类消费者。React 与 Vue 的契约和行为必须对称。
- 禁止用组件专属 CSS 覆盖、Modal/Drawer 特判、复制全局事件监听、业务侧文档规避或新旧双轨实现代替根因修复。
- 迁移完成后必须删除被替代的定位、挂载、dismiss 和兼容路径；不得以“暂时保留”方式让两套架构并行。
- 共享算法在 core 一次性测试；React/Vue 只验证生命周期绑定。跨层问题还必须通过两端真实浏览器组合场景验收，包括嵌套层、滚动、视口碰撞、响应式形态和焦点边界。

锚点浮层是这一原则的强制示例：组件只能使用共享 anchored-overlay adapter，不得直接调用 Portal/Teleport、Floating UI、低层 dismiss API，或自行绑定全局关闭事件。Modal 与 Drawer 只提供 layer boundary，不允许消费者判断自己是否位于 Modal/Drawer。

## 组件改动清单

新增组件或显著功能变更通常需要完成：

- Core 共享 Props 类型和必要工具。
- Vue 3 与 React 双端实现。
- 包入口导出。
- 单测覆盖正常路径、边界场景和无障碍检查。
- Example 页面或示例片段。
- `skills/tigercat/references/` 中对应分类文档。
- 有用户可见文案时同步 i18n label。

## 测试和验证

按改动范围选择验证命令，不需要为文档-only 改动运行完整测试。常用命令：

```bash
pnpm lint
pnpm build
pnpm test
pnpm test:vue
pnpm test:react
pnpm test:validate
pnpm size
pnpm example:build
npx playwright test
```

测试约定见 [tests/README.md](tests/README.md)。组件测试应覆盖渲染、props、事件、状态、主题、无障碍和主要交互回归；浏览器测试使用功能断言，不新增图片对比基线。

## PR 要求

提交 PR 前请确认：

- PR 描述说明了问题、方案和影响范围。
- 验证命令已在 PR 模板中勾选或说明未运行原因。
- 改动没有回退他人的未合并工作。
- 新增或修改 API 时，Vue/React、Core、测试、示例和文档保持一致。
- 根因已经消除，不存在平行旧实现或组件专属补丁。
- React / Vue 绑定保持对称，并已审计全部同类消费者。
- Roadmap 中对应任务状态已经同步更新；已经交付且影响用户、贡献者或发布流程的变更记录到 `CHANGELOG.md` 或发布记录。

## Issue 使用

- Bug Report：用于可复现的问题，尽量提供最小复现和环境版本。
- Feature Request：用于现有组件、工具或文档增强。
- Component Proposal：用于新增组件，需要说明分类、主要用例、API、交互和可访问性。
